import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import streamsaver from "streamsaver";

import PDFIcon from "../assets/pdf-icon.png";
import ZIPIcon from "../assets/zip-icon.png";

const FileContext = createContext();

const FileShareProvider = ({ children }) => {
    const [selectedFile, setSelectedFile] = useState({
        name: "",
        size: 0,
        type: "",
        previewUrl: "",
        file: null,
        icon: "",
    });

    const [fileDetails, setFileDetails] = useState({
        name: "",
        size: 0,
        type: "",
        previewUrl: "",
        file: null,
        icon: "",
    });

    const recievedFileChunkRef = useRef([]);
    const recivedChunk = useRef(0);
    const [recievedFile, setRecievedFile] = useState(null);
    const [fileSentProgress, setFileSentProgress] = useState(0);
    const [recievedFileProgress, setRecievedFileProgress] = useState(0);
    const [isReceivingFile, setIsReceivingFile] = useState(false);

    const onSelectFile = async (e) => {
        const file = e.target.files[0];

        let ext = file.name.split(".");
        ext = ext[ext.length - 1]?.replace(".", "");

        if (
            ext?.toLowerCase() === "jpg" ||
            ext?.toLowerCase() === "jpeg" ||
            ext?.toLowerCase() === "png"
        ) {
            const previewUrl = URL.createObjectURL(file);
            setSelectedFile({
                name: file.name,
                size: file.size,
                type: ext,
                previewUrl,
                file,
            });
        } else {
            setSelectedFile({
                name: file.name,
                size: file.size,
                type: ext,
                file,
                icon: ext === "psd" || ext === "pdf" ? PDFIcon : ZIPIcon,
            });
        }
    };

    const sendFile = async (peer) => {
        recievedFileChunkRef.current = [];
        let buffer = await selectedFile.file.arrayBuffer();
        let readChunks = 0;
        peer.chanel.binaryType = "arraybuffer";

        const send = () => {
            var chunkSize = 65535;
            while (buffer.byteLength) {
                if (
                    peer.chanel.bufferedAmount >
                    peer.chanel.bufferedAmountLowThreshold
                ) {
                    peer.chanel.onbufferedamountlow = () => {
                        peer.chanel.onbufferedamountlow = null;
                        send();
                    };
                    return;
                }
                const chunk = buffer.slice(0, chunkSize);
                buffer = buffer.slice(chunkSize, buffer.byteLength);
                peer.chanel.send(chunk);
                readFile(null, chunk);
            }
            peer.chanel.send(JSON.stringify({ done: true }));
        };
        send();

        setSelectedFile({
            name: "",
            size: 0,
            type: "",
            previewUrl: "",
            file: null,
            icon: "",
        });

        function readFile(done, value) {
            if (value) {
                readChunks += value.byteLength;
                let sentProgress = Math.floor(
                    (readChunks / selectedFile.size) * 100
                );
                console.log(sentProgress);
                // peer.chanel.send(value);
                setFileSentProgress(sentProgress);
                // peer.chanel.send(JSON.stringify({ sentProgress }));
            }
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile({
            file: null,
            name: "",
            previewUrl: "",
            size: 0,
            type: "",
        });
    };

    const downloadFile = () => {
        const blob = new Blob(recievedFileChunkRef.current);
        const stream = blob.stream();
        const fileStream = streamsaver.createWriteStream(
            recievedFile.binaryData.name
        );
        stream.pipeTo(fileStream);
        recievedFileChunkRef.current = [];
    };

    return (
        <FileContext.Provider
            value={{
                sendFile,
                selectedFile,
                onSelectFile,
                removeSelectedFile,
                recievedFile,
                setRecievedFile,
                recievedFileChunkRef,
                fileSentProgress,
                setRecievedFileProgress,
                recievedFileProgress,
                downloadFile,
                recivedChunk,
                isReceivingFile,
                setIsReceivingFile,
            }}
        >
            {children}
        </FileContext.Provider>
    );
};

export const useFileShare = () => {
    return useContext(FileContext);
};

export default FileShareProvider;
