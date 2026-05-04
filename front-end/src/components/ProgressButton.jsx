import { useState } from "react";

const ProgressButton = ({ text, onClick, isLoading, isSuccess, progress }) => {
  const [internalProgress, setInternalProgress] = useState(0);

  if (isSuccess) {
    return (
      <button className="bg-secondary-400 flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-white transition-all">
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
        Salvo!
      </button>
    );
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="bg-primary-400 flex cursor-not-allowed items-center justify-center gap-2 rounded-full px-4 py-2 text-white transition-all"
      >
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {progress !== undefined ? `${progress}%` : "Enviando..."}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="bg-primary-400 hover:bg-secondary-400 cursor-pointer rounded-full px-4 py-2 text-white transition"
    >
      {text}
    </button>
  );
};

export default ProgressButton;
