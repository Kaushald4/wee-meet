import React, { useState } from "react";
import PDFIcon from "../assets/pdf-icon.png";
import ZIPIcon from "../assets/zip-icon.png";

const useFile = () => {
    const [fileDetails, setFileDetails] = useState({
        name: "",
        size: 0,
        type: "",
        previewUrl: "",
        file: null,
        icon: "",
    });

    const [progress, setProgress] = useState(0);

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
            setFileDetails({
                name: file.name,
                size: file.size,
                type: ext,
                previewUrl,
                file,
            });
        } else {
            setFileDetails({
                name: file.name,
                size: file.size,
                type: ext,
                file,
                icon: ext === "psd" || ext === "pdf" ? PDFIcon : ZIPIcon,
            });
        }
    };

    const sendFile = async (peer) => {
        const stream = fileDetails.file.stream();
        const reader = stream.getReader();
        let readChunks = 0;
        peer.chanel.binaryType = "arraybuffer";

        reader.read().then((obj) => {
            handleReading(obj.done, obj.value);
            readFile(obj.done, obj.value);
        });

        function handleReading(done, value) {
            if (done) {
                peer.chanel.send(
                    JSON.stringify({
                        done: true,
                        fileName: fileDetails.name,
                        type: fileDetails.type,
                    })
                );
                return;
            }

            peer.chanel.send(value);
            reader.read().then((obj) => {
                handleReading(obj.done, obj.value);
                readFile(obj.done, obj.value);
            });
        }

        function readFile(done, value) {
            readChunks += value.byteLength;
            let sentProgress = Math.floor(
                (readChunks / fileDetails.size) * 100
            );
            peer.chanel.send(value);
            setProgress(sentProgress);
            peer.chanel.send(JSON.stringify({ sentProgress }));
        }
    };

    const removeSelectedFile = () => {
        setFileDetails({
            file: null,
            name: "",
            previewUrl: "",
            size: 0,
            type: "",
        });
    };

    return {
        onSelectFile,
        fileDetails,
        sendFile,
        progress,
        removeSelectedFile,
    };
};

export default useFile;
