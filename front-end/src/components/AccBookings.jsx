import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Booking from "./Booking";
import ReviewForm from "./ReviewForm";

const AccBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    const { data } = await axios.get("/bookings/owner");
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const canReview = (booking) => {
    if (booking.status !== "confirmed") return false;
    const checkoutDate = new Date(booking.checkout);
    const now = new Date();
    const diffDays = (now - checkoutDate) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <div className="flex w-full max-w-7xl flex-col gap-8">
      {bookings.map((booking) => (
        <div key={booking._id} className="relative">
          <Booking booking={booking} />
          {canReview(booking) && (
            <>
              <div className="absolute top-4 right-4 rounded-lg bg-yellow-100 p-2 text-xs text-yellow-800 shadow-sm">
                🔔 A experiência já terminou! Avalie o anfitrião e a
                experiência.
              </div>
              <button
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowReviewForm(true);
                }}
                className="absolute right-4 bottom-4 rounded-full bg-green-600 px-4 py-1 text-white hover:bg-green-700"
              >
                Avaliar
              </button>
            </>
          )}
        </div>
      ))}
      {showReviewForm && selectedBooking && (
        <ReviewForm
          booking={selectedBooking}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default AccBookings;
