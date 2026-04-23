import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PlaceBookingsManager = () => {
  const { placeId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(`/bookings/place/${placeId}/owner`);
        setBookings(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar reservas");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [placeId]);

  const cancelBooking = async (id) => {
    if (window.confirm("Cancelar esta reserva?")) {
      try {
        await axios.patch(`/bookings/${id}/cancel/owner`);
        setBookings(
          bookings.map((b) =>
            b._id === id ? { ...b, status: "cancelled" } : b,
          ),
        );
        alert("Reserva cancelada");
      } catch (error) {
        alert("Erro ao cancelar");
      }
    }
  };

  const deleteBooking = async (id) => {
    if (
      window.confirm(
        "Apagar permanentemente esta reserva? (apenas se já cancelada)",
      )
    ) {
      try {
        await axios.delete(`/bookings/${id}/delete/owner`);
        setBookings(bookings.filter((b) => b._id !== id));
        alert("Reserva apagada");
      } catch (error) {
        alert(error.response?.data?.message || "Erro ao apagar");
      }
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Reservas deste anúncio</h2>
      {bookings.length === 0 && <p>Nenhuma reserva encontrada.</p>}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Usuário</th>
            <th className="p-2">Check-in</th>
            <th className="p-2">Check-out</th>
            <th className="p-2">Participantes</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id} className="border-t">
              <td className="p-2">
                {booking.user?.name || booking.user?.email}
              </td>
              <td className="p-2">
                {new Date(booking.checkin).toLocaleDateString()}
              </td>
              <td className="p-2">
                {new Date(booking.checkout).toLocaleDateString()}
              </td>
              <td className="p-2">{booking.guests}</td>
              <td className="p-2">€{booking.total}</td>
              <td className="p-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${booking.status === "confirmed" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                >
                  {booking.status === "confirmed" ? "Confirmada" : "Cancelada"}
                </span>
              </td>
              <td className="space-x-2 p-2">
                {booking.status === "confirmed" ? (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    onClick={() => deleteBooking(booking._id)}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    Apagar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlaceBookingsManager;
