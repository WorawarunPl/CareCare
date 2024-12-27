import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DailyPage from "./components/DailyPage";
import MainPage from "./components/MainPage";
import InfoPage from "./components/InfoPage";
import EmoToday from "./components/EmoToday";
import PinPage from "./components/PinPage";
import CalenPage from "./components/CalenPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PinPage />} />
        <Route element={<Layout />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/emotoday" element={<EmoToday />} />
          <Route path="/calendar" element={<CalenPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
