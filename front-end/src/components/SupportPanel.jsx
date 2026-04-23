import React, { useState, useEffect } from "react";
import axios from "axios";

const SupportPanel = () => {
  const [tab, setTab] = useState("ads");
  const [ads, setAds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [openDemands, setOpenDemands] = useState([]);
  const [resolvedDemands, setResolvedDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    const { data } = await axios.get("/places/support/all");
    setAds(data);
  };
  const fetchBookings = async () => {
    const { data } = await axios.get("/bookings/support/all");
    setBookings(data);
  };
  const fetchDemands = async () => {
    const [open, resolved] = await Promise.all([
      axios.get("/demands?status=open"),
      axios.get("/demands?status=resolved"),
    ]);
    setOpenDemands(open.data);
    setResolvedDemands(resolved.data);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (tab === "ads") await fetchAds();
      if (tab === "bookings") await fetchBookings();
      if (tab === "demands") await fetchDemands();
      setLoading(false);
    };
    loadData();
  }, [tab]);

  const toggleAdActive = async (id, current) => {
    if (
      window.confirm(`Deseja ${current ? "pausar" : "reativar"} este anúncio?`)
    ) {
      await axios.patch(`/places/admin/${id}/toggle`);
      fetchAds();
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm("Cancelar esta reserva?")) {
      await axios.patch(`/bookings/admin/${id}/cancel`);
      fetchBookings();
    }
  };

  const resolveDemand = async (id) => {
    if (window.confirm("Marcar esta demanda como resolvida?")) {
      await axios.put(`/demands/${id}/resolve`);
      fetchDemands();
    }
  };

  if (loading) return <p className="text-center">Carregando...</p>;

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      {/* Abas */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "ads"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("ads")}
        >
          Anúncios
        </button>
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "bookings"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("bookings")}
        >
          Reservas
        </button>
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "demands"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("demands")}
        >
          Demandas
        </button>
      </div>

      {/* Anúncios */}
      {tab === "ads" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Proprietário
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
              {ads.map((ad) => (
                <tr key={ad._id}>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {ad.title}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {ad.owner?.name || ad.owner?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                        ad.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ad.isActive ? "Ativo" : "Pausado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => toggleAdActive(ad._id, ad.isActive)}
                      className="rounded-md bg-yellow-500 px-3 py-1 text-white transition hover:bg-yellow-600"
                    >
                      {ad.isActive ? "Pausar" : "Reativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservas */}
      {tab === "bookings" && (
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
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {b.place?.title}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {b.user?.name || b.user?.email}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {new Date(b.checkin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {new Date(b.checkout).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    €{b.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                        b.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {b.status === "confirmed" ? "Confirmada" : "Cancelada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => cancelBooking(b._id)}
                        className="rounded-md bg-yellow-500 px-3 py-1 text-white transition hover:bg-yellow-600"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Demandas */}
      {tab === "demands" && (
        <div className="space-y-8">
          {/* Em aberto */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-800">Em aberto</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openDemands.map((d) => (
                <div
                  key={d._id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow"
                >
                  <p className="text-sm text-gray-500">
                    De: {d.user?.name || d.user?.email}
                  </p>
                  <p className="mt-1 font-semibold">{d.subject}</p>
                  <p className="mt-2 text-sm text-gray-600">{d.message}</p>
                  <button
                    onClick={() => resolveDemand(d._id)}
                    className="mt-3 rounded-md bg-green-600 px-3 py-1 text-white transition hover:bg-green-700"
                  >
                    Marcar resolvida
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resolvidas */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-800">Resolvidas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resolvedDemands.map((d) => (
                <div
                  key={d._id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-sm text-gray-500">
                    De: {d.user?.name || d.user?.email}
                  </p>
                  <p className="mt-1 font-semibold">{d.subject}</p>
                  <p className="mt-2 text-sm text-gray-600">{d.message}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    Resolvida em {new Date(d.resolvedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPanel;
