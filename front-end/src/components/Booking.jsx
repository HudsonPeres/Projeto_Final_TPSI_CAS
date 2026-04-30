import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReviewForm from "./ReviewForm";

const Booking = ({ booking, place = false, refresh }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const getStatusText = () => {
    if (booking.status === "cancelled") {
      if (booking.cancelledBy === "host") return "Cancelada pelo Anfitrião";
      if (booking.cancelledBy === "admin")
        return "Cancelada pelo Administrador";
      if (booking.cancelledBy === "user") return "Cancelada por si";
      return "Cancelada";
    }
    if (booking.status === "confirmed") return "Confirmada";
    if (booking.status === "checked_in") return "Check-in realizado";
    if (booking.status === "completed") return "Concluída";
    return "Status desconhecido";
  };

  const handleReviewClick = (e) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    if (refresh) refresh();
    setShowReviewForm(false);
  };

  return (
    <>
      <Link
        key={booking.place._id}
        to={`/place/${booking.place._id}`}
        className={`flex items-center gap-3 rounded-2xl bg-gray-100 p-4 ${place ? "cursor-auto" : ""}`}
      >
        {!place && (
          <img
            className="aspect-square max-w-40 rounded-2xl object-center"
            src={booking.place.photos[0]}
            alt="Foto da Acomodação"
          />
        )}
        <div className="flex flex-col gap-1">
          {place ? (
            <p className="text-xl font-medium">
              Você já tem uma reserva para esta experiência:
            </p>
          ) : (
            <p className="text-xl font-medium">{booking.place.title}</p>
          )}

          <div className="text-sm">
            <p>
              <span className="font-semibold">Código:</span>{" "}
              {booking.bookingCode}
            </p>
            <p>
              <span className="font-semibold">Checkin:</span>{" "}
              {new Date(booking.checkin).toLocaleDateString("PT-pt")} às{" "}
              {booking.place.checkin}
            </p>
            <p>
              <span className="font-semibold">Checkout:</span>{" "}
              {new Date(booking.checkout).toLocaleDateString("PT-pt")} às{" "}
              {booking.place.checkout}
            </p>
            <p>
              <span className="font-semibold">Noites:</span> {booking.nights}
            </p>
            <p>
              <span className="font-semibold">Participantes:</span>{" "}
              {booking.guests}
            </p>
            <p>
              <span className="font-semibold">Preço total:</span>{" "}
              {booking.total.toLocaleString("PT-pt")} €
            </p>
            <p>
              <span className="font-semibold">Status:</span> {getStatusText()}
            </p>
          </div>
        </div>
      </Link>

      {!place && booking.status === "completed" && !booking.hasReviewed && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2">
          <button
            onClick={handleReviewClick}
            className="rounded-xl bg-red-500 px-3 py-1 text-sm text-white transition hover:bg-green-600"
          >
            Avaliar
          </button>
        </div>
      )}

      {showReviewForm && selectedBooking && (
        <ReviewForm
          booking={selectedBooking}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
};

export default Booking;
