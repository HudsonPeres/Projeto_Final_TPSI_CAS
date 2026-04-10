import React from "react";

export const Item = () => {
  return (
    <a href="/" className="flex max-w-xs flex-col gap-3">
      <img
        src="https://i.ytimg.com/vi/1f3-U-oCc28/maxresdefault.jpg"
        alt="colheita de azeitonas"
        className="aspect-square rounded-2xl object-cover"
      />
      <div>
        <h3 className="text-xl font-semibold">Covilhã</h3>
        <p className="truncate text-gray-600">
          Participe de uma colheita de azeitonas e conheça o modo de preparo
          artesanal de azeite regional
        </p>
      </div>
      <p>
        <span className="font-semibold">100€</span> por experiência
      </p>
    </a>
  );
};
