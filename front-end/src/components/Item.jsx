import React from "react";
import { Link } from "react-router-dom";

export const Item = ({ place }) => {
  const {
    _id,
    title,
    address,
    // description,
    price,
    guests,
    isMultiDay,
    photos,
  } = place;

  const priceLabel = isMultiDay ? "por diária" : "por atividade";
  const maxGuestsText = `Nº máximo de participantes: ${guests}`;

  return (
    <Link to={`/place/${_id}`} className="group flex max-w-xs flex-col gap-1">
      <div className="mb-2 overflow-hidden rounded-2xl">
        <img
          src={photos?.[0] || "https://via.placeholder.com/400"}
          alt={title || "Imagem do anúncio"}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <h2 className="truncate text-base font-bold text-gray-900">{title}</h2>

      <p className="truncate text-sm text-gray-500">{address}</p>

      <div className="mt-1">
        <p className="text-gray-900">
          <span className="font-bold">{price} €</span>
          <span className="text-sm"> {priceLabel}</span>
        </p>
        <p className="text-[10px] tracking-wider text-gray-400 uppercase">
          {maxGuestsText}
        </p>
      </div>
    </Link>
  );
};
