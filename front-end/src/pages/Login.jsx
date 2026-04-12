import React from "react";
import { Link } from "react-router-dom";

export const Login = () => {
  return (
    <section className="flex items-center">
      <div className="mx-auto flex w-full max-w-96 flex-col items-center gap-4 p-8">
        <h1 className="text-3xl font-bold">Faça seu Login </h1>

        <form className="flex w-full flex-col gap-2">
          <input
            type="email"
            className="w-full rounded-full border border-gray-300 px-4 py-2"
            placeholder="Digite seu email"
          />
          <input
            type="text"
            className="w-full rounded-full border border-gray-300 px-4 py-2"
            placeholder="Digite sua senha"
          />
          <button className="bg-primary-400 w-full cursor-pointer rounded-full border border-gray-300 px-4 py-2 font-bold text-white">
            Login
          </button>
        </form>
        <p>
          Ainda não tem conta?{" "}
          <Link to="/register" className="font-semibold underline">
            Registe-se aqui
          </Link>
        </p>
      </div>
    </section>
  );
};
