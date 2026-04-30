import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Booking from "./Booking";

const AccBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPlace, setFilterPlace] = useState("");

  const fetchBookings = async () => {
    const { data } = await axios.get("/bookings/owner");
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const checkin = booking.checkin;
    if (startDate && checkin < startDate) return false;
    if (endDate && checkin > endDate) return false;
    if (
      filterPlace &&
      !booking.place.title.toLowerCase().includes(filterPlace.toLowerCase())
    )
      return false;
    return true;
  });

  // Ordenação
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const getPriority = (status) => {
      if (status === "confirmed" || status === "checked_in") return 1;
      if (status === "completed") return 2;
      return 3; // cancelled e outros
    };
    const priorityA = getPriority(a.status);
    const priorityB = getPriority(b.status);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return new Date(b.checkin) - new Date(a.checkin);
  });

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
      {/* Barra do filtro */}
      <div className="flex flex-wrap gap-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Data inicial</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-full border border-gray-300 px-4 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Data final</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-full border border-gray-300 px-4 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Filtrar por local</label>
          <input
            type="text"
            value={filterPlace}
            onChange={(e) => setFilterPlace(e.target.value)}
            placeholder="Nome do anúncio"
            className="rounded-full border border-gray-300 px-4 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setFilterPlace("");
            }}
            className="bg-primary-400 hover:bg-secondary-400 rounded-full px-4 py-2 text-white transition"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Lista de reservas ordenadas */}
      {sortedBookings.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma reserva encontrada.</p>
      ) : (
        sortedBookings.map((booking) => (
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
        ))
      )}
    </div>
  );
};

export default AccBookings;
