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

  if (loading) return <p className="text-center">Carregando...</p>;

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Reservas deste anúncio
      </h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Participantes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Nenhuma reserva encontrada.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {booking.user?.name || booking.user?.email}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {new Date(booking.checkin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {new Date(booking.checkout).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {booking.guests}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    €{booking.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {booking.status === "confirmed"
                        ? "Confirmada"
                        : "Cancelada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    {booking.status === "confirmed" ? (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="rounded-md bg-yellow-500 px-3 py-1 text-white transition hover:bg-yellow-600"
                      >
                        Cancelar
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteBooking(booking._id)}
                        className="rounded-md bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
                      >
                        Apagar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlaceBookingsManager;
