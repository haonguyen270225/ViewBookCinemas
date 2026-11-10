
import React from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import App from "./App.jsx";
import "./index.css";

//=================== Khởi tạo giao diện trước khi React render ========================

const THEME_KEY = "vbc_theme";
const savedTheme = localStorage.getItem(THEME_KEY);

document.documentElement.setAttribute(
    "data-theme",
    savedTheme === "dark" ? "dark" : "light"
);

//=================== Render ứng dụng ========================

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
