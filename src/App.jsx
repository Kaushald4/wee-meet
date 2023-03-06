import React from "react";
import FileShareProvider from "./context/FileShare";
import MyRoutes from "./routes";

const App = () => {
    return (
        <FileShareProvider>
            <MyRoutes />
        </FileShareProvider>
    );
};

export default App;
