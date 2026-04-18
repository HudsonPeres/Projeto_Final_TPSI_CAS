import React from "react";

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M1.371 8.143c5.858-5.857 15.356-5.857 21.213 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.06 0c-4.98-4.979-13.053-4.979-18.032 0a.75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.182 3.182c4.1-4.1 10.749-4.1 14.85 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.062 0 8.25 8.25 0 0 0-11.667 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.204 3.182a6 6 0 0 1 8.486 0 .75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.061 0 3.75 3.75 0 0 0-5.304 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.182 3.182a1.5 1.5 0 0 1 2.122 0 .75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.061 0l-.53-.53a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
        Wifi
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
          <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
          <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
        </svg>
        Estacionamento gratuito
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
            d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
        TV
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 6h-2l-1.2-1.6A1 1 0 0 0 17 4h-3.42C12.53 2 11 2 11 2v7H6C4.18 9 4.01 7.47 4 7V6H2v1c0 1.17.57 2.73 2 3.51V21c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-3h3v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7.29c1.76-.65 3.38-1.68 4.71-3.01a1 1 0 0 0 .29-.71v-3c0-.55-.45-1-1-1Zm-7 14v-3c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v3H6v-9h5.61A5.53 5.53 0 0 0 15 13.79V20zm6-10.43a11 11 0 0 1-4 2.37 3.49 3.49 0 0 1-2.99-3.45v-2.5h3.5l1.2 1.6a1 1 0 0 0 .8.4h1.5v1.57Z"></path>
          <path d="M15.88 7.26a.87.87 0 1 0 0 1.74.87.87 0 1 0 0-1.74"></path>
        </svg>
        Pets
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 2a2 2 0 1 0 0 4 2 2 0 1 0 0-4m-1.33 10.21-3.56.59 2.85-2.85c.52-.52.78-1.23.72-1.96s-.43-1.4-1.02-1.83l-3.39-2.47c-.8-.58-1.89-.5-2.59.2l-3.4 3.4L8.69 8.7l3.4-3.4 1.84 1.34-3.53 3.53c-.45-.11-.92-.17-1.41-.17-1.29 0-2.49.42-3.47 1.12l1.45 1.45c.59-.35 1.28-.57 2.02-.57 2.21 0 4 1.79 4 4 0 .74-.22 1.42-.57 2.02l1.45 1.45a5.96 5.96 0 0 0 .98-4.77l3.14-.52V20h2v-5.82c0-.59-.26-1.15-.71-1.53s-1.04-.55-1.62-.45ZM9 20c-2.21 0-4-1.79-4-4 0-.74.22-1.42.57-2.02l-1.45-1.45C3.42 13.51 3 14.71 3 16c0 3.31 2.69 6 6 6 1.29 0 2.49-.42 3.47-1.12l-1.45-1.45c-.59.35-1.28.57-2.02.57"></path>
        </svg>
        Local acessível
      </label>
    </div>
  );
};

export default Perks;
