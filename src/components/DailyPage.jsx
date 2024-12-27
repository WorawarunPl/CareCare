import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DailyPage.css";
import happyImg from "../assets/happy.png";
import sadnessImg from "../assets/sadness.png";
import angerImg from "../assets/anger.png";
import anxietyImg from "../assets/anxiety.png";
import fearImg from "../assets/fear.png";
import ennuiImg from "../assets/ennui.png";
import editIcon from "../assets/edit.png";
import deleteIcon from "../assets/delete.png";

const DailyPage = () => {
  const [emotionData, setEmotionData] = useState([]);
  const [dailyPageSelectedMonth, setdailyPageSelectedMonth] = useState(
    localStorage.getItem("dailyPageSelectedMonth") || "January"
  );
  const [selectedYear, setSelectedYear] = useState(
    localStorage.getItem("selectedYear") || "2024"
  );
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const emotionIconMap = {
    Happy: happyImg,
    Sadness: sadnessImg,
    Anger: angerImg,
    Anxiety: anxietyImg,
    Fear: fearImg,
    Ennui: ennuiImg,
  };

  useEffect(() => {
    axios
      .get("https://api.yourkhqr.cloud/emotions/all")
      .then((res) => {
        setEmotionData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching emotions data:", err);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("dailyPageSelectedMonth", dailyPageSelectedMonth);
    localStorage.setItem("selectedYear", selectedYear);
  }, [dailyPageSelectedMonth, selectedYear]);

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSaveNote = (id, updatedNote) => {
    const updatedEntry = emotionData.find((entry) => entry.id === id);
    if (!updatedEntry) return;

    const updatedData = {
      emotion_icon: updatedEntry.emotion_icon,
      emotion_date: updatedEntry.emotion_date,
      note: updatedNote,
    };

    axios
      .put(`https://api.yourkhqr.cloud/emotions/${id}`, updatedData)
      .then(() => {
        setEmotionData((prevData) =>
          prevData.map((entry) =>
            entry.id === id ? { ...entry, note: updatedNote } : entry
          )
        );
        setEditingId(null);
      })
      .catch((err) => {
        console.error("Error updating note:", err);
      });
  };

  const handleDelete = () => {
    axios
      .delete(`https://api.yourkhqr.cloud/emotions/${deleteId}`)
      .then(() => {
        setEmotionData((prevData) =>
          prevData.filter((entry) => entry.id !== deleteId)
        );
        setShowDeleteModal(false);
      })
      .catch((err) => {
        console.error("Error deleting note:", err);
      });
  };

  const filteredData = emotionData.filter((entry) => {
    if (!entry.emotion_date) return false;

    const date = new Date(entry.emotion_date);
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const selectedYearInt = parseInt(selectedYear, 10);
    const adjustedYear = year > 2400 ? year - 543 : year;

    return (
      monthName === dailyPageSelectedMonth && adjustedYear === selectedYearInt
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="daily-container">
      {/* Dropdowns */}
      <div className="dropdown-container">
        <select
          value={dailyPageSelectedMonth}
          onChange={(e) => setdailyPageSelectedMonth(e.target.value)}
          className="dropdown"
        >
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="dropdown"
        >
          {["2024", "2025"].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Emotion Boxes */}
      <div>
        {filteredData.map((entry) => (
          <div key={entry.id} className="emotion-wrapper">
            <div className="actions-container">
              <button
                className="edit-button"
                onClick={() => handleEdit(entry.id)}
              >
                <img src={editIcon} alt="Edit" />
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  setDeleteId(entry.id);
                  setShowDeleteModal(true);
                }}
              >
                <img src={deleteIcon} alt="Delete" />
              </button>
            </div>
            <div className="emotion-box">
              <div className="left-side">
                <img
                  src={
                    emotionIconMap[entry.emotion_icon] ||
                    "https://via.placeholder.com/50?text=No+Icon"
                  }
                  alt={`${entry.emotion_icon || "Unknown"} Icon`}
                />
                <p>{formatDate(entry.emotion_date)}</p>
              </div>
              <div className="right-side">
                {editingId === entry.id ? (
                  <textarea
                    defaultValue={entry.note}
                    onBlur={(e) => handleSaveNote(entry.id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <p onClick={() => handleEdit(entry.id)}>{entry.note}</p>
                )}
                <div className="images-container">
                  {entry.image_url && entry.image_url.length > 0 ? (
                    entry.image_url.map((imageObj, idx) => (
                      <img
                        key={idx}
                        src={imageObj.src}
                        alt={`Emotion Image ${idx}`}
                      />
                    ))
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this note?</p>
            <button className="confirm-button" onClick={handleDelete}>
              Confirm
            </button>
            <button
              className="cancel-button"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPage;
