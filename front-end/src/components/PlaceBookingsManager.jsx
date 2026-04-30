import React, { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";

const PlaceBookingsManager = ({ placeId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o modal de avaliação do hóspede
  const [showGuestReviewForm, setShowGuestReviewForm] = useState(false);
  const [selectedBookingForGuestReview, setSelectedBookingForGuestReview] =
    useState(null);
  const [guestRating, setGuestRating] = useState(0);
  const [guestComment, setGuestComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!placeId) {
      setLoading(false);
      return;
    }
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

  const handleCheckin = async (booking) => {
    const code = prompt("Introduza o código da reserva (ex: RES-XXXXX)");
    if (!code) return;
    try {
      await axios.patch(`/bookings/${booking._id}/checkin`, { code });
      alert("Check-in realizado com sucesso!");
      const { data } = await axios.get(`/bookings/place/${placeId}/owner`);
      setBookings(data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Erro no check-in. Código inválido ou reserva não confirmada.",
      );
    }
  };

  const handleCheckout = async (booking) => {
    if (
      window.confirm(
        "Confirmar check-out? O hóspede receberá um lembrete para avaliar.",
      )
    ) {
      try {
        await axios.patch(`/bookings/${booking._id}/checkout`);
        alert("Check-out realizado! O hóspede será notificado para avaliar.");
        const { data } = await axios.get(`/bookings/place/${placeId}/owner`);
        setBookings(data);
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Erro no check-out. Apenas reservas com check-in podem fazer checkout.",
        );
      }
    }
  };

  const submitGuestReview = async () => {
    if (guestRating === 0) {
      alert("Por favor, dê uma classificação (1 a 5 estrelas).");
      return;
    }
    setReviewLoading(true);
    try {
      await axios.post("/reviews", {
        bookingId: selectedBookingForGuestReview._id,
        ratingHost: guestRating,
        comment: guestComment || undefined,
        type: "guest",
      });
      alert("Avaliação do hóspede enviada com sucesso!");
      setShowGuestReviewForm(false);
      setGuestRating(0);
      setGuestComment("");
      const { data } = await axios.get(`/bookings/place/${placeId}/owner`);
      setBookings(data);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao enviar avaliação.";
      alert(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <p className="text-center">Carregando...</p>;
  if (!placeId)
    return <div className="p-4 text-red-500">ID do anúncio inválido.</div>;

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <h2 className="mb-4 text-2xl font-bold text-black">
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
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
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
                        : booking.status === "checked_in"
                          ? "Check-in realizado"
                          : booking.status === "completed"
                            ? "Concluída"
                            : "Cancelada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleCheckin(booking)}
                          className="rounded-md bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
                        >
                          Check-in
                        </button>
                      )}
                      {booking.status === "checked_in" && (
                        <button
                          onClick={() => handleCheckout(booking)}
                          className="rounded-md bg-yellow-600 px-3 py-1 text-white transition hover:bg-yellow-700"
                        >
                          Check-out
                        </button>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="rounded-md bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
                        >
                          Cancelar
                        </button>
                      )}
                      {(booking.status === "completed" ||
                        booking.status === "checked_in") &&
                        !booking.guestReviewed && (
                          <button
                            onClick={() => {
                              setSelectedBookingForGuestReview(booking);
                              setShowGuestReviewForm(true);
                            }}
                            className="rounded-md bg-blue-500 px-3 py-1 text-white transition hover:bg-blue-600"
                          >
                            Avaliar Hóspede
                          </button>
                        )}
                      {booking.status === "cancelled" && (
                        <button
                          onClick={() => deleteBooking(booking._id)}
                          className="rounded-md bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
                        >
                          Apagar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para avaliar o hóspede */}
      {showGuestReviewForm && selectedBookingForGuestReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">Avaliar Hóspede</h3>
            <p className="mb-2">
              <strong>Hóspede:</strong>{" "}
              {selectedBookingForGuestReview.user?.name ||
                selectedBookingForGuestReview.user?.email}
            </p>
            <div className="mb-4">
              <label className="mb-1 block font-semibold">
                Classificação (1 a 5)
              </label>
              <StarRating
                value={guestRating}
                onChange={setGuestRating}
                size={8}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block font-semibold">
                Comentário (opcional)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-gray-300 p-2"
                value={guestComment}
                onChange={(e) => setGuestComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowGuestReviewForm(false);
                  setGuestRating(0);
                  setGuestComment("");
                }}
                className="rounded-full border border-gray-300 px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={submitGuestReview}
                disabled={reviewLoading}
                className="bg-primary-400 hover:bg-primary-500 rounded-full px-4 py-2 text-white transition disabled:opacity-50"
              >
                {reviewLoading ? "A enviar..." : "Enviar avaliação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceBookingsManager;
