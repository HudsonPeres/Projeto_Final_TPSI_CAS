import { useState } from "react";
import Perks from "./Perks";

const NewPlace = () => {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState("");
  const [description, setDescription] = useState("");
  const [extras, setExtras] = useState("");
  const [price, setPrice] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 px-8">
      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Título</h2>
        <input
          type="text"
          placeholder="Digite o Título do anúncio"
          className="rounded-full border border-gray-300 py-2 pr-4 pl-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Endereço</h2>
        <input
          type="text"
          placeholder="Digite o endereço"
          className="rounded-full border border-gray-300 py-2 pr-4 pl-6"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Fotos</h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Insira fotos pelo link"
            className="grow rounded-full border border-gray-300 py-2 pr-4 pl-6"
            id="photos"
            value={photos}
            onChange={(e) => setPhotos(e.target.value)}
          />
          <button className="bg-primary-400 hover:bg-accent-400 cursor-pointer rounded-full px-4 py-2 text-white transition">
            Enviar foto
          </button>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-4">
          <label
            htmlFor="file"
            className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-700 text-gray-700 hover:bg-gray-100"
          >
            <input type="file" id="file" className="hidden" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            Fazer upload
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Descrição</h2>
        <textarea
          placeholder="Descreva a experiência"
          className="h-56 resize-none rounded-2xl border border-gray-300 py-2 pr-4 pl-6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Comodidades</h2>
        <Perks />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Informações adicionais</h2>
        <textarea
          placeholder="O que mais há para saber"
          className="h-40 resize-none rounded-2xl border border-gray-300 py-2 pr-4 pl-6"
          value={extras}
          onChange={(e) => setExtras(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="ml-2 text-2xl font-bold">Restrições e preços</h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="price">
              Preço
            </label>
            <input
              type="number"
              placeholder="500"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="checkin">
              Check-in
            </label>
            <input
              type="text"
              placeholder="12:00"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="price"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="checkout">
              Check-out
            </label>
            <input
              type="number"
              placeholder="20:00"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="checkout"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="ml-2 text-xl font-bold" htmlFor="guests">
              Nº Participantes
            </label>
            <input
              type="number"
              placeholder="4"
              className="rounded-full border border-gray-300 px-4 py-2"
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>
        </div>
      </div>
      <button className="bg-primary-400 hover:bg-accent-400 cursor-pointer gap-2 rounded-full px-4 py-2 text-white transition">
        Salvar Informações
      </button>
    </form>
  );
};

export default NewPlace;
