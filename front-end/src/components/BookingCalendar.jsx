import axios from "axios";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const BookingCalendar = ({ placeId, onDateChange }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState(null); // armazena a(s) data(s) selecionada(s)

  // Buscar disponibilidade do lugar
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

  // Lógica para definir as cores dos dias
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];

    // Prioridade: dia selecionado pelo usuário (azul)
    if (selectedDates) {
      if (Array.isArray(selectedDates) && selectedDates.length === 2) {
        // intervalo
        let start = new Date(selectedDates[0]);
        let end = new Date(selectedDates[1]);
        let current = new Date(date);
        if (current >= start && current <= end) return "selected-date";
      } else if (
        selectedDates instanceof Date &&
        selectedDates.toDateString() === date.toDateString()
      ) {
        return "selected-date";
      }
    }

    // Dias já reservados (vermelho)
    if (bookedDates.includes(dateStr)) return "booked-date";
    // Dias disponíveis (verde)
    if (availableDates.includes(dateStr)) return "available-date";
    return null;
  };

  // Manipular a seleção de data(s)
  const handleDateSelect = (value) => {
    // value pode ser Date (single) ou [Date, Date] (range)
    setSelectedDates(value);
    if (onDateChange) {
      if (Array.isArray(value) && value.length === 2) {
        onDateChange({ startDate: value[0], endDate: value[1] });
      } else if (value instanceof Date) {
        onDateChange({ startDate: value, endDate: value });
      } else {
        onDateChange(null);
      }
    }
  };

  if (loading) return <p>Carregando disponibilidade...</p>;

  return (
    <div>
      <Calendar
        onChange={handleDateSelect}
        selectRange={true} // permite selecionar intervalo
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
