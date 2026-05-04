import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const AvailabilityCalendar = ({ selectedDates, setSelectedDates }) => {
  const handleDateChange = (date) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === date.toDateString(),
    );
    if (isSelected) {
      setSelectedDates(
        selectedDates.filter((d) => d.toDateString() !== date.toDateString()),
      );
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const removeDate = (dateToRemove) => {
    setSelectedDates(
      selectedDates.filter(
        (d) => d.toDateString() !== dateToRemove.toDateString(),
      ),
    );
  };

  const formatDate = (date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("pt-PT");
  };
  return (
    <div className="flex flex-col gap-4">
      <label className="text-2xl font-bold">
        Marque a disponibilidade do local
      </label>
      <Calendar
        onChange={handleDateChange}
        value={null}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const isSelected = selectedDates.some(
              (d) => d.toDateString() === date.toDateString(),
            );
            return isSelected ? "selected-date" : null;
          }
        }}
        locale="pt-PT"
        className="rounded-lg border shadow-sm"
      />
      {selectedDates.length > 0 && (
        <div>
          <p className="mb-2 text-lg font-semibold">Datas selecionadas:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((date, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {formatDate(date)}
                <button
                  type="button"
                  onClick={() => removeDate(date)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
