import React from "react";

export const Item = ({ place }) => {
  return (
    <a href="/" className="flex max-w-xs flex-col gap-3">
      <img
        src={place.photos[0]}
        alt="colheita de azeitonas"
        className="aspect-square rounded-2xl object-cover"
      />
      <div>
        <h3 className="text-xl font-semibold">{place.address}</h3>
        <p className="truncate text-gray-600">{place.description}</p>
      </div>
      <p>
        <span className="font-semibold">{place.price} €</span> por experiência
      </p>
    </a>
  );
};
