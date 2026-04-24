import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [step, setStep] = useState("request"); // "request" ou "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [newPasswordValid, setNewPasswordValid] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);

  const validateNewPassword = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return hasUpper && hasSpecial && hasNumber;
  };

  const handleNewPasswordChange = (e) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);
    setNewPasswordValid(validateNewPassword(newPwd));
    setNewPasswordTouched(true);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("/auth/forgot-password", { email });
      setMessage(
        `Código enviado para ${email}. Verifique a sua caixa de entrada.`,
      );
      setStep("reset");
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao solicitar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validação adicional antes de enviar
    if (!newPasswordValid) {
      setMessage("A nova senha não atende os requisitos mínimos.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await axios.post("/auth/reset-password", { email, otp, newPassword });
      alert("Palavra-passe alterada com sucesso. Faça login.");
      setRedirect(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  if (redirect) return <Navigate to="/login" />;

  return (
    <section className="flex items-center">
      <div className="mx-auto flex w-full max-w-96 flex-col items-center gap-4 p-8">
        <h1 className="text-3xl font-bold">Recuperar senha</h1>

        {step === "request" && (
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={handleRequestOtp}
          >
            <input
              type="email"
              placeholder="Digite seu email"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white transition"
            >
              {loading ? "A enviar..." : "Enviar código"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form
            className="flex w-full flex-col gap-2"
            onSubmit={handleResetPassword}
          >
            <p className="text-center text-sm text-gray-600">
              Enviámos um código para <strong>{email}</strong>. Insira‑o abaixo
              e defina a nova senha.
            </p>
            <input
              type="text"
              placeholder="Código de verificação"
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-center text-2xl tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full rounded-full border border-gray-300 px-4 py-2"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
            />
            <p className="text-xs text-gray-500">
              A senha deve conter pelo menos uma letra maiúscula, um caractere
              especial e um número.
            </p>
            {newPasswordTouched && !newPasswordValid && (
              <p className="text-xs text-red-500">
                A senha não atende os requisitos.
              </p>
            )}
            <button
              type="submit"
              disabled={loading || (step === "reset" && !newPasswordValid)}
              className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white transition disabled:opacity-50"
            >
              {loading ? "A alterar..." : "Redefinir senha"}
            </button>
            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-sm text-gray-500 underline"
            >
              Voltar
            </button>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-red-500">{message}</p>
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
