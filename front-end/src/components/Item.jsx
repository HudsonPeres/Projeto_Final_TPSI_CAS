import React from "react";
import { Link } from "react-router-dom";

export const Item = ({ place }) => {
  const {
    _id,
    title,
    address,
    description,
    price,
    guests,
    isMultiDay,
    photos,
  } = place;
  const priceLabel = isMultiDay ? "por diária" : "por atividade";
  const maxGuestsText = `Nº máximo de participantes: ${guests}`;

  return (
    <Link to={`/place/${_id}`} className="flex max-w-xs flex-col gap-3">
      <img
        src={photos?.[0] || "https://via.placeholder.com/400"}
        alt={title || "Imagem do anúncio"}
        className="aspect-square rounded-2xl object-cover"
      />
      <div>
        <h3 className="text-xl font-semibold">{address || title}</h3>
        <p className="truncate text-gray-600">{description}</p>
      </div>
      <div>
        <p>
          <span className="font-semibold">{price} €</span> {priceLabel}
        </p>
        <p className="text-xs text-gray-500">{maxGuestsText}</p>
      </div>
    </Link>
  );
};
