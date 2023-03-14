import { createContext, useContext, useState } from "react";
import { v4 } from "uuid";

const WhiteBoardContext = createContext();

const WhiteBoardProvider = ({ children }) => {
    const [whiteBoardId, setWhiteBoardId] = useState(null);
    const [remoteWhiteBoardId, setremoteWhiteBoardId] = useState(null);

    const generateWhiteId = (cb) => {
        if (!whiteBoardId) {
            let id = v4();
            setWhiteBoardId(id);
            cb(id);
        } else {
            cb(whiteBoardId);
        }
    };

    return (
        <WhiteBoardContext.Provider
            value={{
                whiteBoardId,
                generateWhiteId,
                setremoteWhiteBoardId,
                remoteWhiteBoardId,
            }}
        >
            {children}
        </WhiteBoardContext.Provider>
    );
};

export const useWhiteBoard = () => {
    return useContext(WhiteBoardContext);
};

export default WhiteBoardProvider;
