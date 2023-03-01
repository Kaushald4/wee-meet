import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import SocketProvider from "./context/socket";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <BrowserRouter>
            <SocketProvider>
                <App />
            </SocketProvider>
        </BrowserRouter>
    </Provider>
);
