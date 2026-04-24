import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../contexts/UserContext";

export const AccProfile = () => {
  const { user, setUser } = useUserContext();
  const [redirect, setRedirect] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    phoneCode: "+351",
    birthDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- Novos Estados ---
  const [emailStep, setEmailStep] = useState("idle"); // idle, verify
  const [emailOtp, setEmailOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const [pwStep, setPwStep] = useState("idle"); // idle, verify
  const [pwOtp, setPwOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        address: user.address || "",
        phone: user.phone || "",
        phoneCode: user.phoneCode || "+351",
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await axios.put("/users/profile", formData);
      setUser(data);
      setMessage("Perfil actualizado com sucesso!");
    } catch (error) {
      setMessage("Erro ao actualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  // --- Funções para Alterar Email ---
  const requestEmailChange = async () => {
    setEmailMessage("");
    try {
      await axios.post("/auth/request-otp", {
        email: user.email,
        type: "change_email",
      });
      setEmailStep("verify");
      setEmailMessage("Código enviado para o seu email actual.");
    } catch (error) {
      setEmailMessage(
        error.response?.data?.message || "Erro ao solicitar código.",
      );
    }
  };

  const confirmEmailChange = async () => {
    setEmailMessage("");
    try {
      await axios.post("/auth/verify-otp", {
        email: user.email,
        otp: emailOtp,
        type: "change_email",
        newEmail,
      });
      alert("Email alterado com sucesso! Faça login novamente.");
      window.location.href = "/login";
    } catch (error) {
      setEmailMessage(
        error.response?.data?.message || "Erro ao alterar email.",
      );
    }
  };

  // --- Funções para Alterar Palavra-passe ---
  const validatePassword = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return hasUpper && hasSpecial && hasNumber;
  };

  const requestPasswordChange = async () => {
    setPwMessage("");
    try {
      await axios.post("/auth/request-otp", {
        email: user.email,
        type: "change_password",
      });
      setPwStep("verify");
      setPwMessage("Código enviado para o seu email.");
    } catch (error) {
      setPwMessage(
        error.response?.data?.message || "Erro ao solicitar código.",
      );
    }
  };

  const confirmPasswordChange = async () => {
    setPwMessage("");
    if (!validatePassword(newPassword)) {
      setPwMessage("A nova senha não atende os requisitos.");
      return;
    }
    try {
      await axios.post("/auth/verify-otp", {
        email: user.email,
        otp: pwOtp,
        type: "change_password",
        newPassword,
      });
      alert("Palavra-passe alterada com sucesso! Faça login novamente.");
      window.location.href = "/login";
    } catch (error) {
      setPwMessage(error.response?.data?.message || "Erro ao alterar senha.");
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "superadmin":
        return "Super Administrador";
      case "admin":
        return "Administrador";
      case "support":
        return "Suporte";
      default:
        return "Utilizador";
    }
  };

  const logout = async () => {
    try {
      await axios.post("/users/logout");
      setUser(null);
      setRedirect(true);
    } catch (error) {
      alert(JSON.stringify(error));
    }
  };

  if (redirect) return <Navigate to="/" />;
  if (!user) return <></>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-2xl bg-gray-100 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Meu Perfil</h2>
        <p className="text-sm text-gray-500">
          Gerencie suas informações pessoais e segurança
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">Nome completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="focus:ring-primary-400 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:ring-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-gray-500"
          />
          <p className="text-sm text-gray-500">
            Para alterar o email desça até: Segurança - Alterar email.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">
            Endereço completo
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="focus:ring-primary-400 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:ring-2"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex w-1/3 flex-col gap-1">
            <label className="font-semibold text-gray-700">Código</label>
            <select
              name="phoneCode"
              value={formData.phoneCode}
              onChange={handleChange}
              className="focus:ring-primary-400 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:ring-2"
            >
              <option value="+351">+351</option>
              <option value="+55">+55</option>
              <option value="+1">+1</option>
            </select>
          </div>
          <div className="flex w-2/3 flex-col gap-1">
            <label className="font-semibold text-gray-700">Contacto</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="focus:ring-primary-400 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:ring-2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">
            Data de nascimento
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="focus:ring-primary-400 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary-400 hover:bg-secondary-400 mt-2 rounded-full px-4 py-2 text-white transition disabled:opacity-50"
        >
          {loading ? "A guardar..." : "Guardar alterações"}
        </button>
      </form>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-lg font-semibold text-gray-800">Segurança</p>

        {/* Alterar email */}
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
          {emailStep === "idle" && (
            <button
              onClick={requestEmailChange}
              className="bg-primary-400 hover:bg-secondary-400 mx-auto rounded-full border border-gray-200 px-4 px-6 py-2 py-3 text-white transition"
            >
              Alterar email
            </button>
          )}
          {emailStep === "verify" && (
            <div className="flex flex-col gap-2">
              <p className="text-primary-400 text-sm font-medium">
                {emailMessage}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Código OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-2"
                  maxLength={6}
                />
                <input
                  type="email"
                  placeholder="Novo email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-grow rounded-xl border border-gray-200 px-4 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={confirmEmailChange}
                  className="bg-primary-400 hover:bg-secondary-400 rounded-full px-4 py-2 text-white transition"
                >
                  Confirmar alteração
                </button>
                <button
                  onClick={() => setEmailStep("idle")}
                  className="text-sm text-gray-500 underline"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alterar palavra-passe */}
        <div className="flex flex-col gap-2 pt-2">
          {pwStep === "idle" && (
            <button
              onClick={requestPasswordChange}
              className="bg-primary-400 hover:bg-secondary-400 mx-auto rounded-full border border-gray-200 px-4 px-6 py-2 py-3 text-white transition"
            >
              Alterar palavra-passe
            </button>
          )}
          {pwStep === "verify" && (
            <div className="flex flex-col gap-2">
              <p className="text-primary-400 text-sm font-medium">
                {pwMessage}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="Código OTP"
                  value={pwOtp}
                  onChange={(e) => setPwOtp(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-2"
                  maxLength={6}
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-grow rounded-xl border border-gray-200 px-4 py-2"
                />
              </div>
              <p className="text-xs text-gray-500">
                A senha deve ter uma maiúscula, um carácter especial e um
                número.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmPasswordChange}
                  className="bg-primary-400 hover:bg-secondary-400 rounded-full px-4 py-2 text-white transition"
                >
                  Confirmar alteração
                </button>
                <button
                  onClick={() => setPwStep("idle")}
                  className="text-sm text-gray-500 underline"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Seu perfil é:{" "}
        <strong className="text-primary-400">{getRoleLabel()}</strong>
      </div>

      <button
        onClick={logout}
        className="bg-primary-400 hover:bg-secondary-400 w-full rounded-full px-4 py-2 text-white transition"
      >
        Encerrar sessão
      </button>

      {message && <p className="text-center text-green-600">{message}</p>}
    </div>
  );
};

export default AccProfile;
