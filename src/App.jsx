import React from "react";
import CodeShareProvider from "./context/CodeShare";
import FileShareProvider from "./context/FileShare";
import WhiteBoardProvider from "./context/WhiteBoard";
import MyRoutes from "./routes";

const App = () => {
    return (
        <FileShareProvider>
            <WhiteBoardProvider>
                <CodeShareProvider>
                    <MyRoutes />
                </CodeShareProvider>
            </WhiteBoardProvider>
        </FileShareProvider>
    );
};

export default App;
