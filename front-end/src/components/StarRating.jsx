import React from "react";

const StarRating = ({ value, onChange, readonly = false, size = 6 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange(star)}
          className={`focus:outline-none ${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={star <= value ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`size-${size} ${
              star <= value ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
