import React, { useEffect, useState } from "react";
import axios from "axios";

const AuditPanel = () => {
  const [tab, setTab] = useState("places");
  const [deletedPlaces, setDeletedPlaces] = useState([]);
  const [deletedBookings, setDeletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeleted = async () => {
      try {
        const [placesRes, bookingsRes] = await Promise.all([
          axios.get("/places/deleted/all"),
          axios.get("/bookings/deleted/all"),
        ]);
        setDeletedPlaces(placesRes.data);
        setDeletedBookings(bookingsRes.data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar auditoria");
      } finally {
        setLoading(false);
      }
    };
    fetchDeleted();
  }, []);

  const permanentlyDelete = async (type, id) => {
    if (
      !window.confirm(
        "Apagar permanentemente este registo? Esta ação é irreversível.",
      )
    )
      return;
    try {
      if (type === "place") {
        await axios.delete(`/places/deleted/${id}`);
        setDeletedPlaces(deletedPlaces.filter((p) => p._id !== id));
      } else {
        await axios.delete(`/bookings/deleted/${id}`);
        setDeletedBookings(deletedBookings.filter((b) => b._id !== id));
      }
      alert("Registo apagado permanentemente");
    } catch (error) {
      alert("Erro ao apagar");
    }
  };

  if (loading) return <p className="text-center">Carregando auditoria...</p>;

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "places"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("places")}
        >
          Anúncios apagados
        </button>
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "bookings"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("bookings")}
        >
          Reservas apagadas
        </button>
      </div>

      {tab === "places" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Apagado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Data de exclusão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {deletedPlaces.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum anúncio apagado encontrado.
                  </td>
                </tr>
              ) : (
                deletedPlaces.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {item.data?.title || "Sem título"}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {item.deletedBy?.name ||
                        item.deletedBy?.email ||
                        "Desconhecido"}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {item.reason || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => permanentlyDelete("place", item._id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                      >
                        Apagar definitivamente
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "bookings" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Anúncio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Apagado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Data de exclusão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {deletedBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhuma reserva apagada encontrada.
                  </td>
                </tr>
              ) : (
                deletedBookings.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {item.data?.place?.title || "Anúncio não disponível"}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {item.deletedBy?.name ||
                        item.deletedBy?.email ||
                        "Desconhecido"}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {item.reason || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => permanentlyDelete("booking", item._id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                      >
                        Apagar definitivamente
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditPanel;
