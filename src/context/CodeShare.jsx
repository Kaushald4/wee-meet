import { createContext, useContext, useState } from "react";
import { v4 } from "uuid";

const CodeShareContext = createContext();

const CodeShareProvider = ({ children }) => {
    const [codeShareId, setCodeShareId] = useState(null);
    const [remoteCodeShareId, setremoteCodeShareId] = useState(null);

    const generateCodeShareId = (cb) => {
        if (!codeShareId) {
            let id = v4();
            setCodeShareId(id);
            cb(id);
        } else {
            cb(codeShareId);
        }
    };

    return (
        <CodeShareContext.Provider
            value={{
                codeShareId,
                generateCodeShareId,
                setremoteCodeShareId,
                remoteCodeShareId,
            }}
        >
            {children}
        </CodeShareContext.Provider>
    );
};

export const useCodeShare = () => {
    return useContext(CodeShareContext);
};

export default CodeShareProvider;
