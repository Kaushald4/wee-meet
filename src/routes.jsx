import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import MeetingPage from "./Pages/MeetingPage";
import JoinPage from "./Pages/JoinPage";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";

const MyRoutes = () => {
    return (
        <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<LoginPage />} path="/login" />
            <Route element={<SignupPage />} path="/signup" />
            <Route element={<JoinPage />} path="/we/:meetingCode" />
            <Route element={<MeetingPage />} path="/meeting/:meetingCode" />
        </Routes>
    );
};

export default MyRoutes;
