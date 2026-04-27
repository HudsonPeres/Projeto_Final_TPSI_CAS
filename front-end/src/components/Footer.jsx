import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Coluna 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Suporte
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Centro de Ajuda
                </Link>
              </li>
              <li>
                <Link
                  to="/safety"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Segurança
                </Link>
              </li>
              <li>
                <Link
                  to="/cancellation"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Opções de cancelamento
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Comunidade
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/diversity"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Antidiscriminação
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Acessibilidade
                </Link>
              </li>
              <li>
                <Link
                  to="/neighborhood"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Denuncie no bairro
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Hospedagem
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/host"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Ofereça o seu espaço
                </Link>
              </li>
              <li>
                <Link
                  to="/host/resources"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Recursos para anfitriões
                </Link>
              </li>
              <li>
                <Link
                  to="/host/community"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Fórum da comunidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Viva Portugal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Termos e condições
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Viva Portugal – Hudson e Tássia - Atec.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
