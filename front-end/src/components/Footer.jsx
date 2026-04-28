import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-200 py-8 shadow-[0_-2px_4px_rgba(0,0,0,0.06)]">
      {" "}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 justify-items-center gap-8 text-center md:grid-cols-3">
          {/* Coluna 1 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Suporte</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Centro de Ajuda
                </Link>
              </li>
            </ul>
          </div>
          {/* Coluna 2 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Hospedagem</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/account/places/new"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Ofereça o seu espaço
                </Link>
              </li>
            </ul>
          </div>
          {/* Coluna 3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
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
