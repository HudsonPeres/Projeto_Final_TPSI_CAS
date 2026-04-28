import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Booking from "./Booking";
import ReviewForm from "./ReviewForm";

const AccBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    const { data } = await axios.get("/bookings/owner");
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const canReview = (booking) => {
    if (booking.status !== "confirmed") return false;
    const checkoutDate = new Date(booking.checkout);
    const now = new Date();
    const diffDays = (now - checkoutDate) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  const canCancel = (booking) => {
    return booking.status === "confirmed";
  };

  const isWithin48Hours = (booking) => {
    const checkin = new Date(booking.checkin);
    const now = new Date();
    const hoursDiff = (checkin - now) / (1000 * 60 * 60);
    return hoursDiff < 48;
  };

  const handleCancel = async (booking) => {
    if (isWithin48Hours(booking)) {
      const wantSupport = window.confirm(
        "Não é possível cancelar com menos de 48h de antecedência. Deseja contactar o suporte para solicitar o cancelamento?",
      );
      if (wantSupport) {
        navigate("/help");
      }
      return;
    }

    if (window.confirm("Tem a certeza que deseja cancelar esta reserva?")) {
      try {
        await axios.patch(`/bookings/${booking._id}/cancel/self`);
        alert("Reserva cancelada com sucesso.");
        fetchBookings();
      } catch (error) {
        const msg =
          error.response?.data?.message || "Erro ao cancelar reserva.";
        alert(msg);
        if (error.response?.data?.contactSupport) {
          const goToSupport = window.confirm("Deseja contactar o suporte?");
          if (goToSupport) navigate("/help");
        }
      }
    }
  };

  return (
    <div className="flex w-full max-w-7xl flex-col gap-8">
      {bookings.map((booking) => (
        <div key={booking._id} className="relative">
          <Booking booking={booking} />
          <div className="absolute top-1/2 right-8 flex -translate-y-1/2 gap-2">
            {canCancel(booking) && (
              <button
                onClick={() => handleCancel(booking)}
                className="rounded-xl bg-red-500 px-6 py-6 text-white transition hover:bg-red-600"
              >
                Cancelar reserva
              </button>
            )}
            {canReview(booking) && (
              <button
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowReviewForm(true);
                }}
                className="rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
              >
                Avaliar
              </button>
            )}
          </div>
        </div>
      ))}
      {showReviewForm && selectedBooking && (
        <ReviewForm
          booking={selectedBooking}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default AccBookings;
