import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import axios from "axios";

// Map of emotion icons to corresponding image paths
const emotionIconMap = {
  Happy: "/src/assets/happy.png",
  Anger: "/src/assets/anger.png",
  Fear: "/src/assets/fear.png",
  Anxiety: "/src/assets/anxiety.png",
  Sadness: "/src/assets/sadness.png",
  Ennui: "/src/assets/ennui.png",
};

const generateCalendar = (year, monthIndex, emotionData) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const weeks = Array.from({ length: 6 }, () => Array(7).fill(null));
  let day = 1;

  for (let i = 0; i < weeks.length; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) continue;
      if (day > daysInMonth) break;
      weeks[i][j] = day++;
    }
  }

  return (
    <table className="main-calendar-table">
      <thead>
        <tr>
          <th>Sun</th>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((day, dayIndex) => {
              const emotionEntry = emotionData.find((entry) => {
                const emotionDate = new Date(entry.emotion_date);
                return (
                  emotionDate.getFullYear() === year &&
                  emotionDate.getMonth() === monthIndex &&
                  emotionDate.getDate() === day
                );
              });

              const imageSrc =
                emotionEntry?.emotion_icon &&
                emotionIconMap[emotionEntry.emotion_icon];

              return (
                <td key={dayIndex} className={day ? "main-day" : "main-empty"}>
                  {day && (
                    <>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={emotionEntry.emotion_icon}
                          className="main-emotion-image"
                          
                        />
                      ) : (
                        <div className="main-empty-circle"></div>
                      )}
                      <div className="main-date-number">{day}</div>
                    </>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [emotionData, setEmotionData] = useState([]);

  const getAllDataEmotions = () => {
    axios
      .get(`https://api.yourkhqr.cloud/emotions/all`)
      .then((res) => {
        setEmotionData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching emotions data:", err);
      });
  };

  useEffect(() => {
    getAllDataEmotions();
  }, []);

  useEffect(() => {
    const storedMonth = localStorage.getItem("selectedMonth");
    if (storedMonth) {
      try {
        setSelectedMonth(JSON.parse(storedMonth));
      } catch (error) {
        console.error("Error parsing selectedMonth from localStorage:", error);
        localStorage.removeItem("selectedMonth");
      }
    } else {
      const currentYear = new Date().getFullYear();
      const defaultMonth = {
        year: currentYear,
        monthIndex: 0,
        monthName: "Jan",
      };
      setSelectedMonth(defaultMonth);
      localStorage.setItem("selectedMonth", JSON.stringify(defaultMonth));
    }
  }, []);

  return (
    <div className="main-container">
      <div className="main-calendar-icon" onClick={() => navigate("/calendar")}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/8302/8302424.png"
          alt="Calendar Icon"
        />
      </div>

      {selectedMonth ? (
        <div className="main-selected-month">
          <h2>
            {selectedMonth.monthName}, {selectedMonth.year}
          </h2>
          {generateCalendar(
            selectedMonth.year,
            selectedMonth.monthIndex,
            emotionData
          )}
        </div>
      ) : (
        <p>No month selected yet.</p>
      )}

      <button
        className="main-navigate-button"
        onClick={() => navigate("/emotoday")}
      >
        Let's go record!
      </button>
    </div>
  );
};

export default MainPage;
