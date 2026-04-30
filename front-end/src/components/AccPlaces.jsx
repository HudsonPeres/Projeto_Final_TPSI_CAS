import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import NewPlace from "./NewPlace";
import axios from "axios";

const AccPlaces = () => {
  const { action } = useParams();
  const [places, setPlaces] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minGuests, setMinGuests] = useState("");
  const [maxGuests, setMaxGuests] = useState("");

  useEffect(() => {
    const axiosGet = async () => {
      const { data } = await axios.get("/places/owner");
      setPlaces(data);
      setCurrentPage(1);
    };
    axiosGet();
  }, [action]);

  const handleDeletePlace = async (placeId, placeTitle) => {
    const reason = window.prompt("Motivo da exclusão (opcional):");
    if (reason === null) return;
    const confirmMsg = `Tem certeza que deseja apagar o anúncio "${placeTitle}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.delete(`/places/${placeId}`, {
        data: { reason: reason || "" },
      });
      setPlaces(places.filter((p) => p._id !== placeId));
      alert("Anúncio apagado com sucesso.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Erro ao apagar anúncio");
    }
  };

  const filteredPlaces = places.filter((place) => {
    if (
      locationFilter &&
      !place.title.toLowerCase().includes(locationFilter.toLowerCase()) &&
      !place.address.toLowerCase().includes(locationFilter.toLowerCase())
    ) {
      return false;
    }
    if (minPrice && place.price < Number(minPrice)) return false;
    if (maxPrice && place.price > Number(maxPrice)) return false;
    if (minGuests && place.guests < Number(minGuests)) return false;
    if (maxGuests && place.guests > Number(maxGuests)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlaces = filteredPlaces.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setLocationFilter("");
    setMinGuests("");
    setMaxGuests("");
    setCurrentPage(1);
  };

  return (
    <div className="flex w-full max-w-7xl flex-col items-center">
      {action !== "new" ? (
        <div className="flex flex-col items-center gap-8">
          <Link
            to="/account/places/new"
            className="bg-primary-400 hover:bg-accent-400 flex cursor-pointer gap-2 rounded-full px-4 py-2 text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Adicionar Lugar
          </Link>

          {/* Barra dos filtros */}
          <div className="flex w-full flex-wrap gap-4 rounded-2xl bg-gray-100 p-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Preço min (€)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="rounded-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Preço max (€)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="500"
                className="rounded-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">
                Local (cidade/endereço)
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Ex: Covilhã"
                className="rounded-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Participantes min</label>
              <input
                type="number"
                value={minGuests}
                onChange={(e) => setMinGuests(e.target.value)}
                placeholder="1"
                className="rounded-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Participantes max</label>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                placeholder="10"
                className="rounded-full border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="bg-primary-400 hover:bg-secondary-400 rounded-full px-4 py-2 text-white transition"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          {/* Lista de anúncios - card com 15% de redução */}
          {paginatedPlaces.length === 0 ? (
            <p className="text-center text-gray-500">
              Nenhum anúncio encontrado com os filtros aplicados.
            </p>
          ) : (
            <>
              {paginatedPlaces.map((place) => (
                <div
                  key={place._id}
                  className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-100 p-5"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <img
                      className="aspect-square max-w-48 rounded-2xl object-cover"
                      src={place.photos[0]}
                      alt="Foto da Acomodação"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-medium">{place.title}</p>
                      <p className="line-clamp-2 text-gray-600">
                        {place.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Preço: {place.price}€ | Máx participantes:{" "}
                        {place.guests}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/account/places/new/${place._id}`}
                        className="bg-primary-400 hover:bg-secondary-400 rounded-xl px-4 py-2 text-center text-white transition"
                      >
                        Editar anúncio
                      </Link>
                      <Link
                        to={`/account/place-bookings/${place._id}`}
                        className="bg-primary-400 hover:bg-secondary-400 rounded-xl px-4 py-2 text-center text-white transition"
                      >
                        Ver Reservas
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDeletePlace(place._id, place.title)}
                      className="mt-12 rounded-xl bg-red-500 px-4 py-2 text-center text-white transition hover:bg-yellow-300"
                    >
                      Apagar anúncio
                    </button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <NewPlace />
      )}
    </div>
  );
};

export default AccPlaces;
