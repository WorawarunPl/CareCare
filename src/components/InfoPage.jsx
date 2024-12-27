import React, { useState, useEffect, useRef } from "react";
import "./InfoPage.css";
import { GoogleLogin , GoogleLogout } from 'react-google-login'
import { gapi } from 'gapi-script'
import dailyRecordImg from "../assets/daily-record-img.png";
import photoRecordImg from "../assets/photo-record-img.png";
import happyImg from "../assets/happy.png";
import sadnessImg from "../assets/sadness.png";
import angerImg from "../assets/anger.png";
import anxietyImg from "../assets/anxiety.png";
import fearImg from "../assets/fear.png";
import ennuiImg from "../assets/ennui.png";
import iconHide from "../assets/icon-hidden.png"
import iconShow from "../assets/icon-show.png"
import axios from "axios";
import Swal from "sweetalert2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Legend,
  Tooltip
);

const InfoPage = () => {
  const [nickname, setNickname] = useState("Username");
  const [isEditing, setIsEditing] = useState(false);
  const [pin, setPin] = useState(localStorage.getItem("pin") || "");
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [yearSelect, setYearSelect] = useState("2024");

  { /* google authentic */}
  const clientId =
    "1054325575932-vt8to8l3p4a1tr5lc7p2952qa8i8boao.apps.googleusercontent.com";
  const [profile, setProfile] = useState(null)
  
    useEffect(() => {
      const initClient = () => {
        if (gapi && gapi.client && clientId) {
          gapi.client
            .init({
              clientId: clientId,
              scope: "",
            })
            .then(() => {
              console.log("Google API initialized");
            })
            .catch((err) => console.error("Google API init error:", err));
        }
      };
      gapi.load("client:auth2", initClient);
    }, []);


    const onSuccess = (res) => {
      setProfile(res.profileObj)
      console.log('success', res)
    }
    const onFailure = (res) => {
      console.log("failed", res)
    }
    const logOut = () => {
      setProfile(null);
    }

    {/* dropdown month-year */}
  const years = ["2024", "2025"];

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    localStorage.setItem("nickname", nickname);
  };

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }
    const savedPin = localStorage.getItem("pin");
    if (savedPin) {
      setPin(savedPin);
    }
  }, []);

    const handlePinEditClick = () => {
      setIsEditingPin(true);
    };

    const handlePinChange = (e) => {
      const value = e.target.value;
      if (/^\d{0,4}$/.test(value)) {
        setPin(value);
      }
    };

    const handlePinBlur = () => {
      if (pin.length === 4) {
        localStorage.setItem("pin", pin);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "PIN set successfully!",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please set your PIN to 4 digits",
          confirmButtonText: "Try again",
        });
        setPin(""); 
      }
      setIsEditingPin(false);
    };

  const [dateSelect, setDateSelect] = useState(
    localStorage.getItem("dateSelect") || "2024-01"
  );
  const [chartData, setChartData] = useState({
    allLabels: [],
    allData: [],
    fixedLabels: [],
    dailyRecorded: 0,
    photoRecorded: 0,
  });

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const months = [
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
  ];

  const handleDateSelectChange = (event) => {
    const selectedMonth = event.target.value;
    const selectedDate = `2024-${(
      "0" +
      (months.indexOf(selectedMonth) + 1)
    ).slice(-2)}`;
    setDateSelect(selectedDate);
    localStorage.setItem("dateSelect", selectedDate);
    getStatsEmotion(selectedDate);
  };

  const handleYearSelectChange = (event) => {
    const selectedYear = event.target.value;
    setYearSelect(selectedYear);

    const selectedDate = `${selectedYear}-${dateSelect.slice(5)}`;
    setDateSelect(selectedDate);
    localStorage.setItem("dateSelect", selectedDate);

    getStatsEmotion(selectedDate);
  };

  const getStatsEmotion = (dateSelect) => {
    const formattedDate = new Date(dateSelect + "-01")
      .toISOString()
      .split("T")[0]
      .slice(0, 7);

    axios
      .get(`https://api.yourkhqr.cloud/emotions/stats/${formattedDate}`)
      .then((res) => {
        const apiData = res.data.data;

        apiData.sort(
          (a, b) => new Date(a.emotion_date) - new Date(b.emotion_date)
        );

        const allLabels = apiData.map((entry) =>
          new Date(entry.emotion_date).toLocaleDateString("en-GB")
        );

        const allData = apiData.map((entry) => {
          switch (entry.emotion_icon) {
            case "Happy":
              return 6;
            case "Sadness":
              return 5;
            case "Anger":
              return 4;
            case "Anxiety":
              return 3;
            case "Fear":
              return 2;
            case "Ennui":
              return 1;
            default:
              return 0;
          }
        });

        const fixedLabels = ["1", "7", "14", "21", "30"].map(
          (day) =>
            `${day.padStart(2, "0")}/${dateSelect.slice(
              5,
              7
            )}/${dateSelect.slice(0, 4)}`
        );

        setChartData({
          allLabels,
          allData,
          fixedLabels,
          dailyRecorded: res.data.stats.daily_recorded,
          photoRecorded: res.data.stats.photo_recorded,
        });
      })
      .catch((err) => {
        console.error(err);
        setChartData({
          allLabels: [],
          allData: [],
          fixedLabels: [],
          dailyRecorded: 0,
          photoRecorded: 0,
        });
      });
  };

  useEffect(() => {
    getStatsEmotion(dateSelect);
  }, [dateSelect]);

useEffect(() => {
  if (!chartData.allLabels || chartData.allLabels.length === 0) {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    return; 
  }

  const ctx = chartRef.current.getContext("2d");

  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  const moodImages = [
    { src: ennuiImg, img: new Image() },
    { src: fearImg, img: new Image() },
    { src: anxietyImg, img: new Image() },
    { src: angerImg, img: new Image() },
    { src: sadnessImg, img: new Image() },
    { src: happyImg, img: new Image() },
  ];

  moodImages.forEach((mood) => {
    mood.img.src = mood.src;
  });

  chartInstance.current = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.allLabels,
      datasets: [
        {
          label: "Mood Trends",
          data: chartData.allLabels.map((label) => {
            const index = chartData.allLabels.indexOf(label);
            return chartData.allData[index] !== undefined
              ? chartData.allData[index]
              : null;
          }),
          borderColor: "#fff878",
          backgroundColor: "rgba(66, 165, 245, 0.2)",
          pointRadius: 2,
          pointBackgroundColor: "#fff878",
          lineTension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { display: false },
          offset: true,
          suggestedMin: 0,
          padding: 10,
        },
        y: {
          min: 0.5,
          max: moodImages.length + 0.5,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              return value >= 1 && value <= moodImages.length
                ? ["Ennui", "Fear", "Anxiety", "Anger", "Sadness", "Happy"][
                    value - 1
                  ]
                : null;
            },
          },
        },
      },
    },
    plugins: [
      {
        id: "customYAxisImages",
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const yScale = chart.scales.y;
          const xScale = chart.scales.x;

          moodImages.forEach((mood, index) => {
            const yValue = yScale.getPixelForValue(index + 1);
            const xValue = Math.max(xScale.left - 50, 0);

            const size = 20;
            if (mood.img.complete) {
              ctx.drawImage(mood.img, xValue, yValue - size / 2, size, size);
            }
          });
        },
      },
    ],
  });
}, [chartData]);

  return (
    <div className="info-page">
      <div className="mood-flow-container">
        <div className="mood-flow-wrapper">
          <div className="mood-flow-header">
            <span className="mood-flow-text">Mood Flow</span>
            <div className="all-dropdown">
              <select
                className="month-dropdown"
                value={months[parseInt(dateSelect.slice(5, 7), 10) - 1]}
                onChange={handleDateSelectChange}
              >
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                className="year-dropdown"
                value={yearSelect}
                onChange={handleYearSelectChange}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <canvas ref={chartRef} className="mood-flow-chart"></canvas>
        </div>
      </div>
      {/* My Records */}
      <div className="record-container">
        <div className="record-text">My Records</div>
        <div className="horizontal-line-record"></div>
        <div className="record-box">
          <div className="daily-record">
            <div className="daily-topic">Daily Recorded</div>
            <div className="daily-record-content">
              <div className="daily-record-count">
                {chartData.dailyRecorded || "0"}
              </div>
              <img src={dailyRecordImg} alt="Daily Record" />
            </div>
          </div>
          <div className="photo-record">
            <div className="photo-topic">Photo</div>
            <div className="photo-record-content">
              <div className="photo-record-count">
                {chartData.photoRecorded || "0"}
              </div>
              <img src={photoRecordImg} alt="Photo Record" />
            </div>
          </div>
        </div>
      </div>

      {/* Login Information */}
      <div className="loginfo-container">
        <div className="loginfo-text">Login Information</div>
        <div className="horizontal-line-loginfo"></div>
        <div className="loginfo-box">
          {/* nickname */}
          <div className="info-nickname">
            <div className="nickname-label">Nickname</div>
            <div className="nickname-editable">
              {isEditing ? (
                <input
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  onBlur={handleBlur}
                  autoFocus
                />
              ) : (
                <span>{nickname}</span>
              )}
              <button onClick={handleEditClick}>Edit</button>
            </div>
          </div>

          {/* PIN Setting */}
          <div className="pin-label">PIN</div>

          <div className="info-pin">
            <div className="pin-editable">
              {isEditingPin ? (
                <input
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  onBlur={handlePinBlur}
                  maxLength={4}
                  autoFocus
                />
              ) : (
                <div className="pin-container">
                  <span>{isPinVisible ? pin : "****"}</span>
                </div>
              )}

              <div className="control-box-password">
                <div
                  className="eye-box-password"
                  onClick={() => setIsPinVisible((prev) => !prev)}
                >
                  <img
                    src={isPinVisible ? iconHide : iconShow}
                    alt={isPinVisible ? "Hide PIN" : "Show PIN"}
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>
                <div
                  className="edit-button-box-password"
                  onClick={handlePinEditClick}
                >
                  <p>{isEditingPin ? "Save" : pin ? "Edit" : "Set PIN"}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Connect Account */}
          <div className="info-conacc">
            <div className="conacc-label">Connected account</div>
            {profile ? (
              <div className="show-email-connec">
                <p>{profile.email}</p>
                <GoogleLogout
                  clientId={clientId}
                  onLogoutSuccess={logOut}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className="google-logout-button"
                    >
                      Log Out
                    </button>
                  )}
                />
              </div>
            ) : (
              <GoogleLogin
                clientId={
                  clientId
                }
                buttonText="Connect with Google"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={"single_host_origin"}
                isSignedIn={false}
                className="google-login-button"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
