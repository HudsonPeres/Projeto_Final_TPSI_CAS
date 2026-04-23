import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AccProfile from "../components/AccProfile";
import AccPlaces from "../components/AccPlaces";
import { useUserContext } from "../contexts/UserContext";
import AccBookings from "../components/AccBookings";
import AdminPanel from "../components/AdminPanel";
import AuditPanel from "../components/AuditPanel";
import UserManager from "../components/UserManager";
import SupportPanel from "../components/SupportPanel";

export const Account = () => {
  const { subpage } = useParams();
  const { user, ready } = useUserContext();

  const buttonClass = (button) => {
    let finalClass =
      "bg-primary-400 hover:bg-secondary-400 cursor-pointer rounded-full px-4 py-2 text-white transition";
    if (button === subpage) finalClass += " bg-secondary-400 text-white";
    return finalClass;
  };

  if (!user && ready) <Navigate to="/login" />;

  return (
    <section className="p-8">
      <div className="max-w-7x1 mx-auto flex flex-col items-center gap-8">
        <div className="flex gap-2">
          <Link to="/account/profile" className={buttonClass("profile")}>
            Perfil
          </Link>
          <Link to="/account/bookings" className={buttonClass("bookings")}>
            Reservas
          </Link>
          <Link to="/account/places" className={buttonClass("places")}>
            Meus Anúncios
          </Link>

          {(user?.role === "admin" || user?.role === "superadmin") && (
            <Link to="/account/admin" className={buttonClass("admin")}>
              Painel Admin
            </Link>
          )}

          {user?.role === "superadmin" && (
            <>
              <Link to="/account/users" className={buttonClass("users")}>
                Usuários
              </Link>
              <Link to="/account/audit" className={buttonClass("audit")}>
                Auditoria
              </Link>
            </>
          )}
          {user?.role === "support" && (
            <Link to="/account/support" className={buttonClass("support")}>
              Painel Suporte
            </Link>
          )}
        </div>
        {subpage === "profile" && <AccProfile />}
        {subpage === "places" && <AccPlaces />}
        {subpage === "bookings" && <AccBookings />}
        {subpage === "admin" && <AdminPanel />}
        {subpage === "users" && <UserManager />}
        {subpage === "audit" && <AuditPanel />}
        {subpage === "support" && <SupportPanel />}
      </div>
    </section>
  );
};

export default Account;
