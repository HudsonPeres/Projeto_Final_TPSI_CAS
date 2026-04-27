import { Router } from "express";
import Place from "./models.js";
import { JWTVerify } from "../../utils/jwt.js";
import { connectDB } from "../../config/db.js";
import { __dirname } from "../../server.js";
import { sendtoS3, downloadImage, uploadImage } from "./controller.js";
import { resolve } from "url";
import { isAdmin } from "../../utils/adminMiddleware.js";
import DeletedPlace from "./deletedModel.js";
import Booking from "../bookings/models.js";
import { isSuperAdmin } from "../../utils/adminMiddleware.js";
import { isSupport } from "../../utils/adminMiddleware.js";

const router = Router();

router.get("/", async (req, res) => {
  connectDB();
  try {
    const placeDocs = await Place.find({ isActive: true });
    res.json(placeDocs);
  } catch (error) {
    res.status(500).json("Erro ao encontrar as acomodações");
  }
});

router.get("/owner", async (req, res) => {
  connectDB();
  try {
    const { _id: owner } = await JWTVerify(req);
    const placeDocs = await Place.find({ owner });
    res.json(placeDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json("Erro ao encontrar lugares do usuário");
  }
});

router.get("/search", async (req, res) => {
  connectDB();
  const { q } = req.query;
  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Parâmetro de busca ausente" });
  }

  try {
    const searchTerm = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(searchTerm, "i");
    const places = await Place.find({
      isActive: true,
      $or: [{ title: regex }, { description: regex }, { address: regex }],
    }).limit(6);
    res.json(places);
  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({ message: "Erro interno na busca" });
  }
});

router.get("/:id", async (req, res) => {
  connectDB();
  const { id: _id } = req.params;
  try {
    const placeDoc = await Place.findOne({ _id }).populate(
      "owner",
      "name email",
    );
    res.json(placeDoc);
  } catch (error) {
    res.status(500).json("Erro ao encontrar a acomodação");
  }
});

router.put("/:id", async (req, res) => {
  connectDB();

  const { id: _id } = req.params;
  const {
    title,
    address,
    photos,
    description,
    extras,
    perks,
    price,
    checkin,
    checkout,
    guests,
    availableDates,
    isMultiDay,
  } = req.body;

  try {
    const updatedPlaceDoc = await Place.findOneAndUpdate(
      { _id },
      {
        title,
        address,
        photos,
        description,
        extras,
        perks,
        price,
        checkin,
        checkout,
        guests,
        availableDates,
        isMultiDay,
      },
      { new: true },
    );

    res.json(updatedPlaceDoc);
  } catch (error) {
    res.status(500).json("Erro ao atualizar");
  }
});

router.post("/", async (req, res) => {
  connectDB();
  const {
    title,
    address,
    photos,
    description,
    extras,
    perks,
    price,
    checkin,
    checkout,
    guests,
    availableDates,
    isMultiDay,
  } = req.body;

  try {
    const { _id: owner } = await JWTVerify(req);
    const newPlaceDoc = await Place.create({
      owner,
      title,
      address,
      photos,
      description,
      extras,
      perks,
      price,
      checkin,
      checkout,
      guests,
      availableDates,
      isMultiDay,
    });

    res.json(newPlaceDoc);
  } catch (error) {
    res.status(500).json("Erro ao criar");
  }
});

router.post("/upload/link", async (req, res) => {
  const { link } = req.body;
  const path = `${__dirname}/tmp/`;
  try {
    const { filename, fullPath, mimeType } = await downloadImage(link);

    const fileURL = await sendtoS3(filename, fullPath, mimeType);

    res.json({ filename: fileURL });
  } catch (error) {
    console.error("Erro route:", error);
    res.status(500).json("Erro ao baixar imagem");
  }
});

router.post("/upload", uploadImage().array("files", 10), async (req, res) => {
  const { files } = req;

  const filesPromise = new Promise((resolve, reject) => {
    const fileURLArray = [];

    files.forEach(async (file, index) => {
      const { filename, path, mimetype } = file;

      try {
        const fileURL = await sendtoS3(filename, path, mimetype);

        fileURLArray.push(fileURL);
      } catch (error) {
        console.error("Erro ao subir para o S3");
        reject(error);
      }
    });
    const idInterval = setInterval(() => {
      if (files.length === fileURLArray.length) {
        clearInterval(idInterval);
        resolve(fileURLArray);
      }
    }, 100);
  });

  const fileURLArrayResolved = await filesPromise;

  const path = `${__dirname}/tmp/`;

  res.json(fileURLArrayResolved);
});

/* Listar todos os lugares (somente admin) */
router.get("/admin/all", isAdmin, async (req, res) => {
  connectDB();
  try {
    const places = await Place.find().populate("owner", "name email");
    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar lugares" });
  }
});

/* Deletar qualquer lugar (somente admin) */
router.delete("/admin/:id", isAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const place = await Place.findById(id);
    if (!place)
      return res.status(404).json({ message: "Lugar não encontrado" });

    const admin = req.user;

    // Salva no histórico de exclusão
    await DeletedPlace.create({
      originalId: place._id,
      data: place.toObject(),
      deletedBy: admin._id,
      reason: reason || "Removido por administrador",
    });

    await Place.deleteOne({ _id: id });
    res.json({ message: "Lugar removido e registrado em auditoria" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar lugar" });
  }
});

// Pausar/Ativar anúncio (soemnte admin)
router.patch("/admin/:id/toggle", isAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    const place = await Place.findById(id);
    if (!place)
      return res.status(404).json({ message: "Lugar não encontrado" });
    place.isActive = !place.isActive;
    await place.save();
    res.json({
      message: `Lugar ${place.isActive ? "ativado" : "pausado"}`,
      isActive: place.isActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao alterar status" });
  }
});

router.get("/:id/availability", async (req, res) => {
  const { id } = req.params;
  const place = await Place.findById(id);
  if (!place) return res.status(404).json({ message: "Lugar não encontrado" });
  const bookings = await Booking.find({ place: id, status: "confirmed" });
  const bookedDates = [];
  bookings.forEach((b) => {
    let d = new Date(b.checkin);
    while (d <= new Date(b.checkout)) {
      bookedDates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
  });
  res.json({
    availableDates: place.availableDates.map(
      (d) => d.toISOString().split("T")[0],
    ),
    bookedDates: [...new Set(bookedDates)],
  });
});

//superadmin
// GET /places/deleted/all - listar todos os anúncios deletados (apenas superadmin)
router.get("/deleted/all", isSuperAdmin, async (req, res) => {
  connectDB();
  try {
    const deleted = await DeletedPlace.find().populate(
      "deletedBy",
      "name email",
    );
    res.json(deleted);
  } catch (error) {
    res.status(500).json("Erro ao buscar registros deletados");
  }
});

// DELETE /places/deleted/:id - apagar permanentemente um registro de auditoria (apenas superadmin)
router.delete("/deleted/:id", isSuperAdmin, async (req, res) => {
  connectDB();
  const { id } = req.params;
  try {
    await DeletedPlace.findByIdAndDelete(id);
    res.json({ message: "Registro apagado permanentemente" });
  } catch (error) {
    res.status(500).json("Erro ao apagar registro");
  }
});

router.get("/support/all", isSupport, async (req, res) => {
  connectDB();
  try {
    const places = await Place.find().populate("owner", "name email");
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar lugares" });
  }
});

export default router;
