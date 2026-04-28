import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../contexts/UserContext";

const Register = () => {
  const { setUser } = useUserContext();
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validatePassword = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return hasUpper && hasSpecial && hasNumber;
  };

  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    setPasswordValid(validatePassword(newPwd));
    setPasswordTouched(true);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    // Validação local antes de enviar requisição
    if (!passwordValid) {
      setMessage("A senha não atende os requisitos mínimos.");
      return;
    }

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
              onChange={handlePasswordChange}
              required
            />
            <p className="text-xs text-gray-500">
              A senha deve conter pelo menos uma letra maiúscula, um caractere
              especial e um número.
            </p>
            {passwordTouched && !passwordValid && (
              <p className="text-xs text-red-500">
                A senha não atende os requisitos.
              </p>
            )}
            <button
              type="submit"
              disabled={loading || (step === "form" && !passwordValid)}
              className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white transition disabled:opacity-50"
            >
              {loading ? "A enviar..." : "Registar"}
            </button>

            {/* Botão Entrar com Google */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </div>
            <a
              href="http://localhost:3000/auth/google"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Entrar com Google</span>
            </a>
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
