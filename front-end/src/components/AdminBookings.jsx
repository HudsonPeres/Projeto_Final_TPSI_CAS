import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/bookings/admin/all");
      setBookings(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (window.confirm("Cancelar esta reserva?")) {
      try {
        await axios.patch(`/bookings/admin/${id}/cancel`);
        fetchBookings();
        alert("Reserva cancelada");
      } catch (error) {
        alert("Erro ao cancelar");
      }
    }
  };

  const reactivateBooking = async (id) => {
    if (window.confirm("Reativar esta reserva?")) {
      try {
        await axios.patch(`/bookings/admin/${id}/reactivate`);
        fetchBookings();
        alert("Reserva reativada");
      } catch (error) {
        alert("Erro ao reativar");
      }
    }
  };

  const deleteBooking = async (id) => {
    if (
      window.confirm(
        "Apagar permanentemente esta reserva? (irá para auditoria)",
      )
    ) {
      try {
        await axios.delete(`/bookings/admin/${id}`);
        fetchBookings();
        alert("Reserva removida");
      } catch (error) {
        alert("Erro ao deletar");
      }
    }
  };

  if (loading) return <p className="text-center">Carregando...</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Anúncio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Usuário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Checkin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Checkout
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
        <tbody className="divide-y divide-gray-200 bg-white">
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {booking.place?.title || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {booking.user?.name || booking.user?.email}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {new Date(booking.checkin).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {new Date(booking.checkout).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                €{booking.total}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {booking.status === "confirmed" ? "Confirmada" : "Cancelada"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                {booking.status === "confirmed" ? (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="mr-2 rounded-md bg-green-600 px-3 py-1 text-white transition hover:bg-red-600"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    onClick={() => reactivateBooking(booking._id)}
                    className="mr-2 rounded-md bg-green-600 px-3 py-1 text-white transition hover:bg-red-600"
                  >
                    Reativar
                  </button>
                )}
                <button
                  onClick={() => deleteBooking(booking._id)}
                  className="rounded-md bg-green-600 px-3 py-1 text-white transition hover:bg-red-600"
                >
                  Apagar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
