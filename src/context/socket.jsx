import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
    const socket = useMemo(() => {
        return io(process.env.VITE_APP_BACKEND_URL, {
            // return io("http://localhost:4000", {
            withCredentials: true,
        });
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};

export default SocketProvider;
