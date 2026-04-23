import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/users/forgot-password", { email });
      alert(data.message);
      setStep("reset");
    } catch (error) {
      alert("Erro ao solicitar recuperação.");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/users/reset-password", {
        email,
        token,
        newPassword,
      });
      alert(data.message);
    } catch (error) {
      alert("Erro ao redefinir senha.");
    }
  };

  return (
    <section className="flex items-center">
      <div className="mx-auto flex w-full max-w-96 flex-col items-center gap-4 p-8">
        <h1 className="text-3xl font-bold">Recuperar senha</h1>

        {step === "request" && (
          <form className="flex w-full flex-col gap-2" onSubmit={handleRequest}>
            <input
              type="email"
              placeholder="Digite seu email"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white">
              Enviar código
            </button>
          </form>
        )}

        {step === "reset" && (
          <form className="flex w-full flex-col gap-2" onSubmit={handleReset}>
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
            />
            <input
              type="text"
              placeholder="Código recebido"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white">
              Redefinir senha
            </button>
          </form>
        )}

        <p className="text-center">
          <Link to="/login" className="font-semibold underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
