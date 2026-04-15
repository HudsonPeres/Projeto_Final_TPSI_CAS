import React from "react";
import { Link, useParams } from "react-router-dom";
import AccProfile from "../components/AccProfile";
import AccPlaces from "../components/AccPlaces";

export const Account = () => {
  const { subpage } = useParams();

  const buttonClass = (button) => {
    let finalClass =
      "bg-primary-400 hover:bg-secondary-400 cursor-pointer rounded-full px-4 py-2 text-white transition";
    if (button === subpage) finalClass += " bg-secondary-400 text-white";
    return finalClass;
  };

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
            Lugares
          </Link>
        </div>
        {subpage === "profile" && <AccProfile />}
        {subpage === "places" && <AccPlaces />}
      </div>
    </section>
  );
};

export default Account;
