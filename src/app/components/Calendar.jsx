import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const SimpleCalendar = () => {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div >
      <Calendar
        onChange={handleDateChange}
        value={date}
        className="react-calendar"
      />
      <p className="mt-4 text-center text-lg">Выбранная дата: {date.toDateString()}</p>
    </div>
  );
};

export default SimpleCalendar;
