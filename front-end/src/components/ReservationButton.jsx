import React, { useState } from "react";

const ReservationButton = ({ onClick, loading, progress, isSuccess }) => {
  // Se já estiver concluído (reserva bem‑sucedida), mostra apenas o check (verde)
  if (isSuccess) {
    return (
      <button
        disabled
        className="bg-secondary-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 font-bold text-white transition"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Reservado!
      </button>
    );
  }

  // Se estiver a processar a reserva (loading), mostra o percentual
  if (loading) {
    return (
      <button
        disabled
        className="bg-primary-400 flex w-full cursor-not-allowed items-center justify-center rounded-full px-4 py-2 font-bold text-white transition-all"
        style={{
          backgroundImage: `linear-gradient(to top, #e53935 ${progress}%, #085dc9 ${progress}%)`,
          transition: "all 0.3s ease",
        }}
      >
        <span className="text-lg">{progress}%</span>
      </button>
    );
  }

  // Estado normal – botão vermelho com hover verde
  return (
    <button
      onClick={onClick}
      className="bg-primary-400 hover:bg-secondary-400 mt-2 w-full cursor-pointer rounded-full px-4 py-2 text-center font-bold text-white transition"
    >
      Reservar
    </button>
  );
};

export default ReservationButton;
