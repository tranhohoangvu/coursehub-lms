import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Cart from "./pages/Cart.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import Instructor from "./pages/Instructor.jsx";
import Admin from "./pages/Admin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="instructor" element={<ProtectedRoute allowedRoles={["INSTRUCTOR"]}><Instructor /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
