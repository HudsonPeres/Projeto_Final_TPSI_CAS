import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minGuests, setMinGuests] = useState("");
  const [maxGuests, setMaxGuests] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (minGuests) params.append("minGuests", minGuests);
    if (maxGuests) params.append("maxGuests", maxGuests);
    navigate(`/?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute top-20 left-1/2 w-full max-w-2xl -translate-x-1/2 rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold">Onde queres ir?</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Cidade ou região"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="focus:ring-secondary-400 w-full rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Preço min (€)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="focus:ring-secondary-400 w-1/2 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Preço max (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="focus:ring-secondary-400 w-1/2 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min participantes"
              value={minGuests}
              onChange={(e) => setMinGuests(e.target.value)}
              className="focus:ring-secondary-400 w-1/2 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max participantes"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              className="focus:ring-secondary-400 w-1/2 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-400 hover:bg-primary-500 mt-2 rounded-full py-2 font-semibold text-white transition"
          >
            Pesquisar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
