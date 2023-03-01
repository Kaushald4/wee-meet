import { useState, useRef } from "react";

const useVideo = () => {
    const [videoConstraint, setVideoConstraint] = useState({
        video: true,
        audio: true,
    });
    const [localVideoStream, setLocalVideoStream] = useState(null);
    const localVideoRef = useRef(null);

    const toggleAudio = () => {
        localVideoStream.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = !track.enabled;
                setVideoConstraint((prev) => {
                    return {
                        ...prev,
                        audio: track.enabled,
                    };
                });
            }
        });
    };

    const toggleVideo = () => {
        if (videoConstraint.video) {
            localVideoStream.getTracks().forEach((track) => {
                if (track.kind === "video") {
                    track.stop();
                    setVideoConstraint((prev) => {
                        return {
                            ...prev,
                            video: false,
                        };
                    });
                }
            });
        } else {
            navigator.mediaDevices
                .getUserMedia({ audio: true, video: true })
                .then((stream) => {
                    localVideoRef.current.srcObject = stream;
                    if (!videoConstraint.audio) {
                        stream.getTracks().forEach((track) => {
                            if (track.kind === "audio") {
                                track.enabled = false;
                                setLocalVideoStream(stream);
                                setVideoConstraint({
                                    audio: false,
                                    video: true,
                                });
                            }
                        });
                        return;
                    }
                    setLocalVideoStream(stream);
                    setVideoConstraint({ audio: true, video: true });
                });
        }
    };

    return {
        toggleVideo,
        toggleAudio,
        localVideoRef,
        setLocalVideoStream,
        videoConstraint,
        localVideoStream,
        setVideoConstraint,
    };
};

export default useVideo;
