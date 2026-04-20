import React from "react";
import Perk from "./Perk";

const Perks = ({ perks, setPerks }) => {
  const handleClick = (target) => {
    const newPerks = target.checked
      ? [...perks, target.value]
      : [...perks.filter((perk) => perk !== target.value)];

    setPerks(newPerks);
  };
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      <label
        htmlFor="wifi"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-3"
      >
        <input
          type="checkbox"
          id="wifi"
          value={"wifi"}
          checked={perks.includes("wifi")}
          onChange={(e) => handleClick(e.target)}
        />
        <Perk perk="wifi" />
      </label>

      <label
        htmlFor="parking"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-3"
      >
        <input
          type="checkbox"
          id="parking"
          value={"parking"}
          checked={perks.includes("parking")}
          onChange={(e) => handleClick(e.target)}
        />
        <Perk perk="parking" />
      </label>

      <label
        htmlFor="tv"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-3"
      >
        <input
          type="checkbox"
          id="tv"
          value={"tv"}
          checked={perks.includes("tv")}
          onChange={(e) => handleClick(e.target)}
        />
        <Perk perk="tv" />
      </label>

      <label
        htmlFor="pets"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-3"
      >
        <input
          type="checkbox"
          id="pets"
          value={"pets"}
          checked={perks.includes("pets")}
          onChange={(e) => handleClick(e.target)}
        />
        <Perk perk="pets" />
      </label>
      <label
        htmlFor="accessible"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-3"
      >
        <input
          type="checkbox"
          id="accessible"
          value={"accessible"}
          checked={perks.includes("accessible")}
          onChange={(e) => handleClick(e.target)}
        />
        <Perk perk="accessible" />
      </label>
    </div>
  );
};

export default Perks;
