import React, { useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";

const ReviewForm = ({ booking, onClose, onSuccess }) => {
  const [ratingHost, setRatingHost] = useState(0);
  const [ratingExperience, setRatingExperience] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ratingHost === 0 && ratingExperience === 0) {
      setError("Dê pelo menos uma classificação (anfitrião ou experiência).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Primeiro, avaliar anfitrião (se nota >0)
      if (ratingHost > 0) {
        await axios.post("/reviews", {
          bookingId: booking._id,
          ratingHost,
          comment: comment || undefined,
          type: "host",
        });
      }
      // Depois, avaliar experiência (se nota >0)
      if (ratingExperience > 0) {
        await axios.post("/reviews", {
          bookingId: booking._id,
          ratingExperience,
          comment: comment || undefined,
          type: "experience",
        });
      }
      alert("Avaliação enviada com sucesso!");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao enviar avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">Avaliar experiência</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block font-semibold">Avaliação do anfitrião</label>
            <StarRating value={ratingHost} onChange={setRatingHost} size={7} />
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-semibold">Avaliação da experiência</label>
            <StarRating value={ratingExperience} onChange={setRatingExperience} size={7} />
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-semibold">Comentário (opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 p-2"
              placeholder="Partilhe a sua experiência..."
            />
          </div>
          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary-400 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "A enviar..." : "Enviar avaliação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;