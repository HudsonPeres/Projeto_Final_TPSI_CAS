import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import Perk from "../components/Perk";
import Booking from "../components/Booking";
import BookingCalendar from "../components/BookingCalendar";
import StarRating from "../components/StarRating";
import ReservationButton from "../components/ReservationButton";

// ✅ NOVO – Mapa
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Corrigir ícones (necessário para Vite + react-leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Place = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");
  const [booking, setBooking] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingProgress, setBookingProgress] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [placeRatings, setPlaceRatings] = useState({
    avg: 0,
    total: 0,
    reviews: [],
  });
  const [hostRatings, setHostRatings] = useState({ avgHost: 0, totalHost: 0 });

  const numberofDays = (date1, date2) => {
    const dateCheckin = new Date(date1);
    const dateCheckout = new Date(date2);
    return (
      (dateCheckout.getTime() - dateCheckin.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  useEffect(() => {
    if (place) {
      const axiosGet = async () => {
        const { data } = await axios.get("/bookings/owner");
        const activeBooking = data.find(
          (booking) =>
            booking.place._id === place._id &&
            (booking.status === "confirmed" || booking.status === "checked_in"),
        );
        setBooking(activeBooking);
      };
      axiosGet();
    }
  }, [place]);

  useEffect(() => {
    if (id) {
      const axiosGet = async () => {
        const { data } = await axios.get(`/places/${id}`);
        setPlace(data);
      };
      axiosGet();
    }
  }, [id]);

  useEffect(() => {
    const fetchPlaceRatings = async () => {
      try {
        const { data } = await axios.get(`/reviews/place/${id}`);
        setPlaceRatings(data);
      } catch (err) {
        console.error("Erro ao carregar avaliações do lugar:", err);
      }
    };
    if (id) fetchPlaceRatings();
  }, [id]);

  useEffect(() => {
    if (place?.owner?._id) {
      axios
        .get(`/reviews/user/${place.owner._id}`)
        .then(({ data }) => {
          setHostRatings({
            avgHost: data.avgHost,
            totalHost: data.totalHost,
          });
        })
        .catch((err) =>
          console.error("Erro ao carregar avaliações do host:", err),
        );
    }
  }, [place]);

  useEffect(() => {
    overlay
      ? document.body.classList.add("overflow-hidden")
      : document.body.classList.remove("overflow-hidden");
  }, [overlay]);

  const handleBooking = async (e) => {
    // ... (mantido igual ao original, sem alterações)
    e.preventDefault();
    if (checkin && checkout && guests) {
      setBookingLoading(true);
      setBookingProgress(0);
      const nights = numberofDays(checkin, checkout);
      const objBooking = {
        place: id,
        user: user._id,
        price: place.price,
        total: place.price * nights,
        checkin,
        checkout,
        guests,
        nights,
      };
      const interval = setInterval(() => {
        setBookingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      try {
        await axios.post("/bookings", objBooking);
        clearInterval(interval);
        setBookingProgress(100);
        setBookingSuccess(true);
        setTimeout(() => {
          setRedirect(true);
        }, 1500);
      } catch (error) {
        clearInterval(interval);
        setBookingLoading(false);
        setBookingProgress(0);
        if (error.response) {
          const { status, data } = error.response;
          if (status === 400)
            alert(data.message || "Número de participantes excede o limite.");
          else if (status === 409)
            alert(data.message || "Data não disponível ou já reservada.");
          else alert("Erro ao reservar. Tente novamente.");
        } else {
          alert("Erro de conexão com o servidor.");
        }
      }
    } else {
      alert("Preencha todas as informações para fazer a reserva");
    }
  };

  const handleContactHost = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user._id === place.owner?._id) {
      alert("Você é o anfitrião deste anúncio.");
      return;
    }
    try {
      const { data } = await axios.post("/chat/conversations/start", {
        otherUserId: place.owner._id,
        placeId: place._id,
      });
      navigate(`/account/inbox?conversation=${data._id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar conversa. Tente novamente.");
    }
  };

  if (redirect) return <Navigate to="/account/bookings" />;
  if (!place) return <></>;

  return (
    <section>
      <div className="mx-auto flex grid max-w-7xl flex-col gap-4 p-4 sm:gap-6 sm:p-8">
        <div className="flex flex-col sm:gap-1">
          <div className="text-2xl font-bold sm:text-3xl">{place.title}</div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <p>{place.address}</p>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating
              value={Math.round(placeRatings.avg)}
              readonly
              size={5}
            />
            <span className="text-sm text-gray-600">
              ({placeRatings.total} avaliações)
            </span>
          </div>
        </div>

        {booking ? <Booking booking={booking} place={true} /> : ""}

        {/* grade de imagens */}
        <div className="relative grid aspect-[3/2] gap-4 overflow-hidden rounded-2xl sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
          {place.photos
            .filter((photo, index) => index < 3)
            .map((photo, index) => (
              <img
                key={photo}
                className={`${index === 0 ? "row-span-2 h-full" : ""} aspect-square w-full cursor-pointer object-cover transition hover:opacity-75`}
                src={photo}
                alt="imagem do local"
                onClick={() => setOverlay(true)}
              />
            ))}
          <div
            className="absolute right-2 bottom-2 flex cursor-pointer gap-2 rounded-2xl border border-black bg-white px-4 py-2 transition hover:scale-105"
            onClick={() => setOverlay(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            <p>Mostrar mais imagens</p>
          </div>
        </div>

        {/* colunas */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            {/* Card do Host */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-sm">Experiência proporcionada por</p>
                <p className="text-xl font-bold">
                  {place.owner?.name || "Anfitrião"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm">Nível do Anfitrião</p>
                <div className="flex items-center gap-2">
                  <StarRating
                    value={Math.round(hostRatings.avgHost)}
                    readonly
                    size={5}
                  />
                  <span className="text-xs text-gray-500">
                    ({hostRatings.totalHost} avaliações)
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm">Classificação da experiência</p>
                <div className="flex items-center gap-2">
                  <StarRating
                    value={Math.round(placeRatings.avg)}
                    readonly
                    size={5}
                  />
                  <span className="text-xs text-gray-500">
                    ({placeRatings.total} avaliações)
                  </span>
                </div>
              </div>
              {user && user._id !== place.owner?._id && (
                <button
                  onClick={handleContactHost}
                  className="bg-primary-400 hover:bg-secondary-400 mt-4 w-full rounded-full py-2 text-white transition"
                >
                  Dúvidas? Me contacte
                </button>
              )}
            </div>

            {/* Descrição */}
            <div className="mt-6">
              <p className="text-2xl font-bold">Descrição</p>
              <p className="mt-2">{place.description}</p>
            </div>
          </div>

          {/* Formulário de reserva / Botão de login */}
          {!booking && (
            <>
              {!user ? (
                <div className="md:col-span-1">
                  <div className="rounded-2xl border border-gray-300 bg-white p-6 text-center shadow-sm">
                    <p className="mb-4 text-gray-600">
                      Faça login para reservar esta experiência.
                    </p>
                    <Link
                      to="/login"
                      className="bg-primary-400 hover:bg-secondary-400 inline-block rounded-full px-6 py-2 text-white transition"
                    >
                      Entrar / Registar
                    </Link>
                  </div>
                </div>
              ) : user._id !== place.owner?._id ? (
                <div className="md:col-span-1">
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="order-1 flex flex-col gap-4 self-center justify-self-center rounded-2xl border border-gray-300 px-4 py-3 text-2xl sm:px-8 sm:py-4 md:order-0"
                  >
                    <p className="text-center text-2xl font-bold">
                      Preço: {place.price}{" "}
                      {place.isMultiDay ? "€ / diária" : "€ / atividade"}
                    </p>
                    <p className="text-center text-sm text-gray-500">
                      Nº máximo de participantes: {place.guests}
                    </p>
                    <BookingCalendar
                      placeId={id}
                      isMultiDay={place.isMultiDay}
                      onDateChange={(range) => {
                        setCheckin(
                          range.startDate?.toISOString().split("T")[0] || "",
                        );
                        setCheckout(
                          range.endDate?.toISOString().split("T")[0] || "",
                        );
                      }}
                    />
                    <div className="flex flex-col rounded-2xl border border-gray-300 px-4 py-2">
                      <p className="font-bold">Nº de Participantes</p>
                      <input
                        className="rounded-2xl border border-gray-300 px-4 py-2"
                        placeholder={`Nº máximo: ${place.guests}`}
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      />
                      <ReservationButton
                        onClick={handleBooking}
                        loading={bookingLoading}
                        progress={bookingProgress}
                        isSuccess={bookingSuccess}
                      />
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-300 bg-gray-50 p-6 text-center md:col-span-1">
                  <p className="text-gray-600">
                    Você é o anfitrião deste anúncio e não pode reservar a sua
                    própria experiência.
                  </p>
                  <Link
                    to="/account/places"
                    className="text-primary-400 mt-2 inline-block underline"
                  >
                    Gerir os seus anúncios
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Horários e restrições */}
        <div className="gap flex flex-col gap-5 p-4">
          <p className="text-2xl font-bold">Horários e restrições</p>
          <div>
            <p>
              <strong>Checkin:</strong> {place.checkin}
            </p>
            <p>
              <strong>Checkout:</strong> {place.checkout}
            </p>
            <p>
              <strong>Nº de participantes:</strong> {place.guests}
            </p>
          </div>
        </div>

        {/* Comodidades */}
        <div className="flex flex-col gap-5 p-4">
          <p className="text-2xl font-bold">Comodidades</p>
          <div className="flex flex-col gap-2">
            {place.perks.map((perk) => (
              <div className="flex gap-2" key={perk}>
                <Perk perk={perk} />
              </div>
            ))}
          </div>
        </div>

        {/* ✅ SECÇÃO NOVA – Localização no mapa */}
        {place.location && place.location.coordinates && (
          <div className="p-4">
            <p className="text-2xl font-bold">Localização</p>
            <div className="mt-2 h-64 w-full overflow-hidden rounded-2xl border border-gray-300">
              <MapContainer
                center={[
                  place.location.coordinates[1],
                  place.location.coordinates[0],
                ]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[
                    place.location.coordinates[1],
                    place.location.coordinates[0],
                  ]}
                />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Informações Extras */}
        <div className="gap-2 rounded-2xl bg-gray-100 p-4">
          <p className="text-2xl font-bold">Informações Extras</p>
          <p>{place.extras}</p>
        </div>

        {/* Comentários dos hóspedes */}
        {placeRatings.reviews.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold">Comentários dos hóspedes</h3>
            {[...placeRatings.reviews]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3)
              .map((review) => (
                <div key={review._id} className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {review.reviewer?.name}
                    </span>
                    <StarRating
                      value={review.ratingExperience}
                      readonly
                      size={4}
                    />
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}
          </div>
        )}

        {/* overlay de imagens */}
        <div
          className={`${overlay ? "flex" : "hidden"} fixed inset-0 items-start overflow-y-auto bg-black text-white`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-8 p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {place.photos.map((photo) => (
                <img
                  key={photo}
                  className="aspect-square w-full object-cover"
                  src={photo}
                  alt="imagem do local"
                />
              ))}
            </div>
          </div>
          <button
            className="absolute top-2 right-2 aspect-square w-8 rounded-full bg-white font-bold text-black hover:scale-105"
            onClick={() => setOverlay(false)}
          >
            X
          </button>
        </div>
      </div>
    </section>
  );
};

export default Place;
