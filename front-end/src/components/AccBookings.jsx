import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Booking from "./Booking";

const AccBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const { data } = await axios.get("/bookings/owner");
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Verificar se faltam menos de 48h para o check-in
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
      if (wantSupport) navigate("/help");
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
          <Booking booking={booking} refresh={fetchBookings} />
          <div className="absolute top-1/2 right-8 flex -translate-y-1/2 gap-2">
            {booking.status === "confirmed" && (
              <button
                onClick={() => handleCancel(booking)}
                className="rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
              >
                Cancelar reserva
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccBookings;
