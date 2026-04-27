import { Router } from "express";
import UserRoutes from "../domains/users/routes.js";
import PlaceRoutes from "../domains/places/routes.js";
import BookingRoutes from "../domains/bookings/routes.js";
import demandRoutes from "../domains/demands/routes.js";
import authRoutes from "../domains/auth/routes.js";
import chatRoutes from "../domains/chat/routes.js";
import reviewRoutes from "../domains/reviews/routes.js";

const router = Router();

router.use("/users", UserRoutes);
router.use("/places", PlaceRoutes);
router.use("/bookings", BookingRoutes);
router.use("/demands", demandRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/reviews", reviewRoutes);

export default router;
