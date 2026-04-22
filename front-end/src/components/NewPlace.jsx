import { useEffect, useState } from "react";
import Perks from "./Perks";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext.jsx";
import PhotoUploader from "./PhotoUploader.jsx";
import ProgressButton from "./ProgressButton.jsx";
import AvailabilityCalendar from "./AvailabilityCalendar";

const NewPlace = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState([]);
  const [perks, setPerks] = useState([]);
  const [description, setDescription] = useState("");
  const [extras, setExtras] = useState("");
  const [price, setPrice] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [photolink, setPhotolink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingType, setBookingType] = useState("single");
  useEffect(() => {
    if (id) {
      const axiosGet = async () => {
        const { data } = await axios.get(`/places/${id}`);

        console.log(data);
        setTitle(data.title);
        setAddress(data.address);
        setPhotos(data.photos);
        setPerks(data.perks);
        setDescription(data.description);
        setExtras(data.extras);
        setPrice(data.price);
        setCheckin(data.checkin);
        setCheckout(data.checkout);
        setGuests(data.guests);
        setAvailableDates(data.availableDates || []);
        setBookingType(data.bookingType || "single");
      };
      axiosGet();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      title &&
      address &&
      description &&
      photos.length > 0 &&
      price &&
      checkin &&
      checkout &&
      guests
    ) {
      setIsLoading(true);
      setIsSuccess(false);
      setUploadProgress(0);

      try {
        if (id) {
          await axios.put(
            `/places/${id}`,
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
              bookingType,
            },
            {
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadProgress(percent);
              },
            },
          );
        } else {
          await axios.post(
            "/places",
            {
              owner: user._id,
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
              bookingType,
            },
            {
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadProgress(percent);
              },
            },
          );
        }
        setIsSuccess(true);
        setTimeout(() => {
          setRedirect(true);
        }, 1000);
      } catch (error) {
        console.error(JSON.stringify(error));
        alert("Erro ao tentar salvar");
        setIsLoading(false);
        setUploadProgress(0);
      }
    } else {
      alert("Preencha todas as informações necessárias antes de enviar");
    }
  };

  if (redirect) return <Navigate to="/account/places" />;

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 px-8">
      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Título</h2>
        <input
          type="text"
          placeholder="Digite o Título do anúncio"
          className="rounded-full border border-gray-300 py-2 pr-4 pl-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Endereço</h2>
        <input
          type="text"
          placeholder="Digite o endereço"
          className="rounded-full border border-gray-300 py-2 pr-4 pl-6"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <PhotoUploader {...{ photolink, setPhotolink, setPhotos, photos }} />

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Descrição</h2>
        <textarea
          placeholder="Descreva a experiência"
          className="h-56 resize-none rounded-2xl border border-gray-300 py-2 pr-4 pl-6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Comodidades</h2>

        <Perks {...{ perks, setPerks }} />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Informações adicionais</h2>
        <textarea
          placeholder="O que mais há para saber"
          className="h-40 resize-none rounded-2xl border border-gray-300 py-2 pr-4 pl-6"
          value={extras}
          onChange={(e) => setExtras(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Restrições e preços</h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="price">
              Preço
            </label>
            <input
              type="number"
              placeholder="500"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="checkin">
              Check-in
            </label>
            <input
              type="text"
              placeholder="12:00"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="price"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="checkout">
              Check-out
            </label>
            <input
              type="text"
              placeholder="20:00"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="checkout"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="guests">
              Nº Participantes
            </label>
            <input
              type="number"
              placeholder="4"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xl font-bold">Tipo de reserva</label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2">
            <input
              type="radio"
              name="bookingType"
              value="single"
              checked={bookingType === "single"}
              onChange={() => setBookingType("single")}
            />
            <span>Um dia (experiência pontual)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-2">
            <input
              type="radio"
              name="bookingType"
              value="multi"
              checked={bookingType === "multi"}
              onChange={() => setBookingType("multi")}
            />
            <span>Vários dias consecutivos</span>
          </label>
        </div>
      </div>
      <AvailabilityCalendar
        selectedDates={availableDates}
        setSelectedDates={setAvailableDates}
      />
      <ProgressButton
        text="Salvar Informações"
        onClick={handleSubmit}
        isLoading={isLoading}
        isSuccess={isSuccess}
        progress={uploadProgress}
      />
    </form>
  );
};

export default NewPlace;
