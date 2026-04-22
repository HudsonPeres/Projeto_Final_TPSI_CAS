import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaces = async () => {
    try {
      const { data } = await axios.get("/places/admin/all");
      setPlaces(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const toggleActive = async (id, currentStatus) => {
    if (
      window.confirm(
        `Deseja ${currentStatus ? "pausar" : "ativar"} este anúncio?`,
      )
    ) {
      try {
        await axios.patch(`/places/admin/${id}/toggle`);
        fetchPlaces();
        alert(currentStatus ? "Anúncio pausado" : "Anúncio ativado");
      } catch (error) {
        alert("Erro ao alterar status");
      }
    }
  };

  const deletePlace = async (id) => {
    if (
      window.confirm(
        "Tem certeza que deseja APAGAR este anúncio? Esta ação é irreversível.",
      )
    ) {
      try {
        await axios.delete(`/places/admin/${id}`);
        fetchPlaces();
        alert("Anúncio removido e registrado em auditoria");
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
          {places.map((place) => (
            <tr key={place._id}>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {place.title}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {place.owner?.name || place.owner?.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                    place.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {place.isActive ? "Ativo" : "Pausado"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                <button
                  onClick={() => toggleActive(place._id, place.isActive)}
                  className="mr-2 rounded-md bg-green-600 px-3 py-1 text-white transition hover:bg-red-600"
                >
                  {place.isActive ? "Pausar" : "Ativar"}
                </button>
                <button
                  onClick={() => deletePlace(place._id)}
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

export default AdminPlaces;
