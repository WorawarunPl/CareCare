import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CalenPage.css";

const generateCalendar = (year, navigate, selectedMonth) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleMonthClick = (year, monthIndex, monthName) => {
    const selectedMonth = { year, monthIndex, monthName };
    localStorage.setItem("selectedMonth", JSON.stringify(selectedMonth));
    navigate("/main");
  };

  return (
    <div className="year-section" key={year}>
      <h2 className="year-title">{year}</h2>
      <div className="horizontal-line-record"></div>
      <div className="calendar-grid">
        {months.map((month, index) => {
          const daysInMonth = getDaysInMonth(year, index);
          const firstDay = new Date(year, index, 1).getDay();
          const weeks = Array.from({ length: 6 }, () => Array(7).fill(null));
          let day = 1;

          for (let i = 0; i < weeks.length; i++) {
            for (let j = 0; j < 7; j++) {
              if (i === 0 && j < firstDay) continue;
              if (day > daysInMonth) break;
              weeks[i][j] = day++;
            }
          }

          const isSelectedMonth =
            selectedMonth &&
            selectedMonth.year === year &&
            selectedMonth.monthIndex === index;

          return (
            <div
              className={`month-box ${
                isSelectedMonth ? "selected-month" : ""
              }`}
              key={`${year}-${month}`}
              onClick={() => handleMonthClick(year, index, month)}
            >
              <h3 className="month-title">{month}</h3>
              <table className="calendar-table">
                <thead>
                  <tr>
                    <th>S</th>
                    <th>M</th>
                    <th>T</th>
                    <th>W</th>
                    <th>T</th>
                    <th>F</th>
                    <th>S</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((day, dayIndex) => (
                        <td
                          key={dayIndex}
                          className={day ? "day" : "empty"}
                        >
                          {day || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalenPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const years = [2024, 2025, 2026];
  const navigate = useNavigate();

  useEffect(() => {
    const storedMonth = localStorage.getItem("selectedMonth");
    if (storedMonth) {
      setSelectedMonth(JSON.parse(storedMonth));
    }
  }, []);

  return (
    <div className="calen-calendar-container">
      {years.map((year) => generateCalendar(year, navigate, selectedMonth))}
    </div>
  );
};

export default CalenPage;
