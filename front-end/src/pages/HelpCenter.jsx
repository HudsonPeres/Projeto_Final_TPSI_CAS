import React, { useState } from "react";
import axios from "axios";
import { useUserContext } from "../contexts/UserContext";
import { Navigate } from "react-router-dom";

const HelpCenter = () => {
  const { user } = useUserContext();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    relatedBooking: "",
    relatedPlace: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/demands", formData);
      setSuccess(true);
      setFormData({
        subject: "",
        message: "",
        relatedBooking: "",
        relatedPlace: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erro ao enviar pedido. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-gray-100 p-6 shadow-md">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Centro de Ajuda
        </h1>
        <p className="mb-6 text-gray-600">
          Preencha o formulário abaixo para solicitar apoio. A nossa equipa de
          suporte responderá o mais breve possível.
        </p>

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            Pedido enviado com sucesso! Aguarde o contacto do suporte.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              Assunto *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="focus:ring-secondary-400 w-full rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-gray-700">
              Mensagem *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="focus:ring-secondary-400 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="gap-4">
            <div>
              <label className="mb-1 block font-semibold text-gray-700">
                Nº da reserva *
              </label>
              <input
                type="text"
                name="relatedBooking"
                value={formData.relatedBooking}
                onChange={handleChange}
                className="focus:ring-secondary-400 w-full rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary-400 hover:bg-secondary-400 mt-2 rounded-full px-6 py-2 font-semibold text-white transition disabled:opacity-50"
          >
            {loading ? "A enviar..." : "Enviar pedido"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default HelpCenter;
