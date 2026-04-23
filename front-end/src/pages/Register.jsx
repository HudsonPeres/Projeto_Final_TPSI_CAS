import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../contexts/UserContext";

const Register = () => {
  const { setUser } = useUserContext();
  const [step, setStep] = useState("form"); // "form" ou "verify"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("/auth/request-otp", { email, type: "register" });
      setMessage(
        `Código enviado para ${email}. Verifique a sua caixa de entrada.`,
      );
      setStep("verify");
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao solicitar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.post("/auth/verify-otp", {
        email,
        otp,
        type: "register",
        name,
        password,
      });
      setUser(data);
      setRedirect(true);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Código inválido ou expirado.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (redirect) return <Navigate to="/" />;

  return (
    <section className="flex items-center">
      <div className="mx-auto flex w-full max-w-96 flex-col items-center gap-4 p-8">
        <h1 className="text-3xl font-bold">Faça seu Registro</h1>

        {step === "form" && (
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={handleRequestOtp}
          >
            <input
              type="text"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white transition"
            >
              {loading ? "A enviar..." : "Registar"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={handleVerifyOtp}
          >
            <p className="text-center text-sm text-gray-600">
              Enviámos um código de 6 dígitos para <strong>{email}</strong>.
            </p>
            <input
              type="text"
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-center text-2xl tracking-widest"
              placeholder="Código"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white transition"
            >
              {loading ? "A verificar..." : "Verificar código"}
            </button>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-sm text-gray-500 underline"
            >
              Voltar
            </button>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-red-500">{message}</p>
        )}

        <p>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold underline">
            Logue-se aqui
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
