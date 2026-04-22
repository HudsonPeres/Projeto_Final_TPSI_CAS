import React, { useState } from "react";
import AdminPlaces from "./AdminPlaces";
import AdminBookings from "./AdminBookings";

const AdminPanel = () => {
  const [tab, setTab] = useState("places");

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "places"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("places")}
        >
          Anúncios
        </button>
        <button
          className={`px-4 pb-2 text-sm font-medium transition ${
            tab === "bookings"
              ? "border-primary-400 text-primary-600 border-b-2"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("bookings")}
        >
          Reservas
        </button>
      </div>
      {tab === "places" ? <AdminPlaces /> : <AdminBookings />}
    </div>
  );
};

export default AdminPanel;
