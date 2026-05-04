import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const BookingCalendar = ({ placeId, onDateChange, isMultiDay = true }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState(null);

  useEffect(() => {
    if (!placeId) return;
    const fetchAvailability = async () => {
      try {
        const { data } = await axios.get(`/places/${placeId}/availability`);
        setAvailableDates(data.availableDates || []);
        setBookedDates(data.bookedDates || []);
      } catch (error) {
        console.error("Erro ao carregar disponibilidade", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [placeId]);

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];

    if (selectedDates) {
      if (Array.isArray(selectedDates) && selectedDates.length === 2) {
        const [start, end] = selectedDates;
        let current = new Date(date);
        if (current >= start && current <= end) return "selected-date";
      } else if (
        selectedDates instanceof Date &&
        selectedDates.toDateString() === date.toDateString()
      ) {
        return "selected-date";
      }
    }

    if (bookedDates.includes(dateStr)) return "booked-date";
    if (availableDates.includes(dateStr)) return "available-date";
    return null;
  };

  const handleDateSelect = useCallback(
    (value) => {
      if (isMultiDay) {
        // Se for multiday, value é array [start, end]
        if (Array.isArray(value) && value.length === 2) {
          setSelectedDates(value);
          onDateChange({ startDate: value[0], endDate: value[1] });
        } else if (value instanceof Date) {
          // selecionou uma única data
          setSelectedDates([value, value]);
          onDateChange({ startDate: value, endDate: value });
        }
      } else {
        // Modo dia único: value é uma única data
        if (value instanceof Date) {
          setSelectedDates(value);
          onDateChange({ startDate: value, endDate: value });
        } else {
          if (Array.isArray(value) && value.length > 0) {
            const single = value[0];
            setSelectedDates(single);
            onDateChange({ startDate: single, endDate: single });
          }
        }
      }
    },
    [isMultiDay, onDateChange],
  );

  if (loading) return <p>Carregando disponibilidade...</p>;

  return (
    <div>
      <Calendar
        onChange={handleDateSelect}
        selectRange={isMultiDay}
        tileClassName={tileClassName}
        minDate={new Date()}
        locale="pt-PT"
      />
      <style>{`
        .available-date {
          background-color: #43a047 !important;
          color: white !important;
          border-radius: 50%;
        }
        .booked-date {
          background-color: #e53935 !important;
          color: white !important;
          border-radius: 50%;
          text-decoration: line-through;
        }
        .selected-date {
          background-color: #4a90e2 !important;
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default BookingCalendar;
