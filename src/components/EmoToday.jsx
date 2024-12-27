import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import happyImg from "../assets/happy.png";
import sadnessImg from "../assets/sadness.png";
import angerImg from "../assets/anger.png";
import anxietyImg from "../assets/anxiety.png";
import fearImg from "../assets/fear.png";
import ennuiImg from "../assets/ennui.png";
import cameraIcon from "../assets/camera.png";
import happyQuote from "../assets/happyQuote.png"
import sadQuote from "../assets/sadQuote.png";
import angerQuote from "../assets/angerQuote.png";
import anxietyQuote from "../assets/anxietyQuote.png";
import fearQuote from "../assets/fearQuote.png";
import ennuiQuote from "../assets/ennuiQuote.png";
import Swal from "sweetalert2";
import "./EmoToday.css";
import axios from "axios";


const EmoToday = () => {
  const navigate = useNavigate();
  const [sliderValue, setSliderValue] = useState(0);
  const [isTextBoxOpen, setIsTextBoxOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savedImages, setSavedImages] = useState([]);
  const [emojiLabel, setEmojiLabel] = useState("Happy");
  const [showQuoteImage, setShowQuoteImage] = useState(false);
  const [quoteImage, setQuoteImage] = useState(null);
  console.log("Save image is " , savedImages)
  // Calendar states and methods
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");
    if (savedDate) {
      setSelectedDate(new Date(savedDate));
    }
  }, []);

 const handleDateChange = (date) => {

   // Adjust for timezone offset
   const adjustedDate = new Date(
     date.getTime() - date.getTimezoneOffset() * 60000
   );

   setSelectedDate(date);
   localStorage.setItem(
     "selectedDate",
     adjustedDate.toISOString().split("T")[0]
   );
 };

  const getWeekDates = (startDate) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const changeWeek = (direction) => {
    setStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return limitYearRange(newDate);
    });
  };

  const limitYearRange = (date) => {
    if (date.getFullYear() < 2024) {
      date.setFullYear(2024);
    } else if (date.getFullYear() > 2025) {
      date.setFullYear(2025);
    }
    return date;
  };

  const getDayName = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const getMonthName = (date) => {
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
    return months[date.getMonth()];
  };

  const weekDates = getWeekDates(startDate);

  // EmoToday methods
  const states = [
    { label: "Happy", image: happyImg, quoteImage: happyQuote },
    { label: "Sadness", image: sadnessImg, quoteImage: sadQuote },
    { label: "Anger", image: angerImg, quoteImage: angerQuote },
    { label: "Anxiety", image: anxietyImg, quoteImage: anxietyQuote },
    { label: "Fear", image: fearImg, quoteImage: fearQuote },
    { label: "Ennui", image: ennuiImg, quoteImage: ennuiQuote },
  ];

function sentDataToServer() {
  // Assuming selectedDate is in ISO format like "2024-12-21T00:00:00.000Z"
  // Convert selectedDate to a Date object
  const formattedDate = new Date(selectedDate).toISOString().split("T")[0]; // "2024-12-21"
  console.log("before sent to server " , savedImages)
  axios
    .post(`https://api.yourkhqr.cloud/emotions/create`, {
      emotion_icon: emojiLabel,
      emotion_date: formattedDate, // Use formatted date here
      note: noteText,
      base64_images: savedImages,
    },{
      headers :{
        "Content-Type" : "multipart/form-data"
      }
    })
    .then((res) => {
      console.log(res.data);
      //Swal.fire(`Uploaded Data`, ``, `success`);
      localStorage.removeItem("userNotes");
      setNoteText("");
      setSavedImages([]);
      handleShowQuote();
    })
    .catch((err) => {
      console.log(err);
      Swal.fire(``, `${err}`, "error");
    });
}

  useEffect(() => {
    setSavedImages([]);
  }, []);

  const handleChange = (event) => {
    event.preventDefault();
    const emojiLabel = states[event.target.value].label;
    console.log(emojiLabel);
    setEmojiLabel(emojiLabel);
    setSliderValue(event.target.value);
  };
  const handleOpenTextBox = () => {
    //setNoteText("");
    // setSavedImages([]);
    setIsTextBoxOpen(true);
  };

  const handleCloseTextBox = () => {
    setIsTextBoxOpen(false);
  };

  const handleNoteTextChange = (event) => {
    setNoteText(event.target.value);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (savedImages.length + files.length > 5) {
      Swal.fire({
        title: "Oops !",
        text: "You can select up to 5 images.",
        icon: "error",
        confirmButtonText: "ok",
      });
      event.target.value = ""; // รีเซ็ตค่า input
      return;
    }

    const newImages = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then((images) => {
      console.log("binary" ,images)
      setSavedImages((prevImages) => [...prevImages, ...images]);
    });

    event.target.value = ""; // รีเซ็ตค่า input
  };

  const handleRemoveImage = (index) => {
    setSavedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSaveNote = () => {
    const existingData = localStorage.getItem("userNotes");
    const newNote = {
      text: noteText,
      images: savedImages,
    };

    let updatedNotes = [];
    if (existingData) {
      const previousNotes = JSON.parse(existingData);

      if (Array.isArray(previousNotes)) {
        updatedNotes = [...previousNotes, newNote];
      } else {
        updatedNotes = [newNote];
      }
    } else {
      updatedNotes = [newNote];
    }

    localStorage.setItem("userNotes", JSON.stringify(updatedNotes));

    console.log("Saved note:", newNote);

    // setNoteText("");
    // setSavedImages([]);
    setIsTextBoxOpen(false);
  };

  const handleShowQuote = () => {
    const selectedState = states[sliderValue];
    setQuoteImage(selectedState.quoteImage);
    setShowQuoteImage(true);
  };

  const handleCloseQuote = () => {
    setShowQuoteImage(false);
  };

  return (
    <div className="emo-container">
      <button className="close-button" onClick={() => navigate("/main")}>
        ✖
      </button>
      <h2 className="emo-title">
        How are you <br /> feeling today?
      </h2>

      <div className="emo-image">
        <img src={states[sliderValue].image} alt={states[sliderValue].label} />
      </div>

      <div className="slider-container">
        <div className="emo-slider-track"></div>
        <div className="slider-label" style={{ left: `${sliderValue * 20}%` }}>
          {states[sliderValue].label}
        </div>
        <input
          type="range"
          min="0"
          max="5"
          value={sliderValue}
          onChange={handleChange}
          className="emo-slider"
        />
      </div>

      <div className="emo-buttons">
        <div className="button-group">
          <button className="add-note" onClick={handleOpenTextBox}>
            + Add note
          </button>
          <button className="submit" onClick={() => sentDataToServer()}>
            Submit
          </button>
        </div>
      </div>
      <div className="horizontal-line"></div>

      {/* Calendar Container */}
      <div className="month-year-row">
        <span className="month-year">
          {getMonthName(startDate)} {startDate.getFullYear()}
        </span>
      </div>
      <div className="calendar-container">
        <button className="calendar-button" onClick={() => changeWeek(-1)}>
          {"<"}
        </button>
        <div className="week-dates">
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`date-box ${
                selectedDate.toDateString() === date.toDateString()
                  ? "selected"
                  : ""
              }`}
              onClick={() => handleDateChange(date)}
            >
              <span className="date-number">{date.getDate()}</span>
              <span className="day-name">{getDayName(date)}</span>
            </div>
          ))}
        </div>
        <button className="calendar-button" onClick={() => changeWeek(1)}>
          {">"}
        </button>
      </div>

      {/* Textbox overlay */}
      {isTextBoxOpen && (
        <div className="text-overlay">
          <div className="text-box">
            <button className="textbox-close" onClick={handleCloseTextBox}>
              ✖
            </button>

            {/* Textarea */}
            <textarea
              className="textbox-textarea"
              placeholder="Write your note here..."
              value={noteText}
              onChange={handleNoteTextChange}
            ></textarea>

            {/* Image preview container */}
            <div className="image-preview-container">
              {savedImages.map((image, index) => (
                <div key={index} className="image-preview-item">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="image-preview"
                  />
                  <button
                    className="remove-image"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>

            {/* Buttons for Save and Camera upload */}
            <div className="textbox-buttons">
              <label className="camera-button">
                <img
                  src={cameraIcon}
                  alt="Camera Icon"
                  className="camera-icon"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
              <button className="save-button" onClick={handleSaveNote}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Show quote image */}
      {showQuoteImage && (
        <div className="quote-overlay">
          <img
            src={quoteImage}
            alt="emotion quote"
            className="quote-img"
            onClick={handleCloseQuote}
          />
        </div>
      )}
    </div>
  );
};

export default EmoToday;
