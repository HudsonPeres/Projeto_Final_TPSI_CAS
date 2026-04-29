import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";
import Perk from "../components/Perk";
import Booking from "../components/Booking";
import BookingCalendar from "../components/BookingCalendar";
import StarRating from "../components/StarRating";

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

  // Estado para avaliações da experiência
  const [placeRatings, setPlaceRatings] = useState({
    avg: 0,
    total: 0,
    reviews: [],
  });
  // Estado para avaliações do anfitrião
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
        setBooking(
          data.filter((booking) => {
            return booking.place._id === place._id;
          })[0],
        );
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

  // Buscar avaliações da experiência
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

  // Buscar avaliações do anfitrião
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
    e.preventDefault();
    if (checkin && checkout && guests) {
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
      try {
        await axios.post("/bookings", objBooking);
        alert("Reservado com sucesso");
        setRedirect(true);
      } catch (error) {
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
        {/* titulos */}
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

          {/* Exibição da média da experiência */}
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

        {/* mostra se tem ou não reserva */}
        {booking ? <Booking booking={booking} place={true} /> : ""}

        {/* grade */}
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
          {/* Coluna esquerda (2/3 da largura) */}
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

            {/* Comentários dos hóspedes */}
            {placeRatings.reviews.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold">Comentários dos hóspedes</h3>
                {placeRatings.reviews.map((review) => (
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
          </div>

          {/* Coluna direita (1/3 da largura) – Formulário de reserva */}
          {!booking && (
            <div className="md:col-span-1">
              <form className="order-1 flex flex-col gap-4 self-center justify-self-center rounded-2xl border border-gray-300 px-4 py-3 text-2xl sm:px-8 sm:py-4 md:order-0">
                <p className="text-center text-2xl font-bold">
                  Preço: {place.price}{" "}
                  {place.isMultiDay ? "€ / diária" : "€ / atividade"}
                </p>
                <p className="text-center text-sm text-gray-500">
                  Nº máximo de participantes: {place.guests}
                </p>
                <BookingCalendar
                  placeId={id}
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
                  {user ? (
                    <button
                      onClick={handleBooking}
                      className="bg-primary-400 hover:bg-secondary-400 mt-2 w-full cursor-pointer rounded-full px-4 py-2 text-center font-bold text-white"
                    >
                      Reservar
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="bg-primary-400 hover:bg-secondary-400 mt-2 w-full cursor-pointer rounded-full px-4 py-2 text-center font-bold text-white"
                    >
                      Faça Login para reservar
                    </Link>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

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

        {/* extras */}
        <div className="gap-2 rounded-2xl bg-gray-100 p-4">
          <p className="text-2xl font-bold">Informações Extras</p>
          <p>{place.extras}</p>
        </div>

        {/* overlay */}
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
