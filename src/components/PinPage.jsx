import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./PinPage.css";

const PinPage = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const correctPin = localStorage.getItem("pin");
  const isFirstSetup = !correctPin;

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^\d$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (index < 3) {
        inputsRef.current[index + 1].focus();
      } else {
        const enteredPin = newPin.join("");

        if (isFirstSetup) {
          // Save the PIN during first setup
          localStorage.setItem("pin", enteredPin);
          Swal.fire({
            icon: "success",
            title: "PIN Set",
            text: "Your PIN has been successfully set!",
            confirmButtonText: "OK",
          });
          navigate("/main");
        } else {
          if (enteredPin === correctPin) {
            navigate("/main");
          } else {
            Swal.fire({
              icon: "error",
              title: "Incorrect",
              text: "PIN Incorrect!",
              confirmButtonText: "Try again",
            });
            setPin(["", "", "", ""]);
            inputsRef.current[0].focus();
          }
        }
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && pin[index] === "") {
      if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  return (
    <div className="pin-page">
      <div className="pin-topic">
        {isFirstSetup ? "Set your PIN" : "Enter your PIN"}
      </div>
      <div className="pin-input-container">
        {pin.map((digit, index) => (
          <input
            key={index}
            type="password"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            className="pin-circle"
            style={{
              backgroundColor:
                index === 0
                  ? "#f6d6d6"
                  : index === 1
                  ? "#f6f7c4"
                  : index === 2
                  ? "#a1eebd"
                  : "#7bd3ea",
            }}
          />
        ))}
      </div>
      {/* Show message if PIN is not set */}
      {!correctPin && (
        <div className="pin-message">
          <p>
            First time use?{" "}
            <a
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Please set a PIN 
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default PinPage;
