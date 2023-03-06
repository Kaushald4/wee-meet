import React from "react";
import {
    BsPinAngleFill,
    BsPinAngle,
    BsCameraVideo,
    BsCameraVideoOff,
} from "react-icons/bs";
import { TbMicrophone, TbMicrophoneOff } from "react-icons/tb";

const Video = ({
    videoRef,
    pinnedVideo,
    videoStream,
    setPinndedVideo,
    unPinVideo,
    username,
    hoverDisable,
    muted,
}) => {
    let isVideo = videoStream
        ?.getTracks()
        .findIndex((track) => track.kind === "video");
    let isAudio = videoStream?.getTracks().findIndex((track) => {
        if (track.kind === "audio" && track.enabled) {
            return true;
        } else {
            return false;
        }
    });

    return (
        <div
            className={
                !videoStream
                    ? `invisible hidden w-full h-full relative mb-2 overflow-hidden rounded-lg mr-2 `
                    : `relative group overflow-hidden w-full h-full rounded-lg mr-2 flex justify-center items-center bg-base-300`
            }
        >
            <div className="absolute z-10 left-5 top-2 text-white">
                {username}
            </div>
            <div className="absolute top-5 right-8 flex items-center gap-5">
                <div>
                    {isVideo !== -1 ? (
                        <BsCameraVideo className="text-[20px]" />
                    ) : (
                        <BsCameraVideoOff className="text-[20px] text-primary" />
                    )}
                </div>
                <div>
                    {isAudio !== -1 ? (
                        <TbMicrophone className="text-[20px]" />
                    ) : (
                        <TbMicrophoneOff className="text-[20px] text-primary" />
                    )}
                </div>
            </div>
            {!hoverDisable && (
                <div className="absolute top-0 left-0 right-0 bottom-0 group-hover:bg-[rgba(0,0,0,.5)] flex justify-end overflow-hidden">
                    <div className="invisible group-hover:visible mr-[20px] mt-4 cursor-pointer z-20">
                        {pinnedVideo ? (
                            <BsPinAngleFill
                                onClick={unPinVideo}
                                className="text-4xl text-secondary"
                            />
                        ) : (
                            <BsPinAngle
                                onClick={() => setPinndedVideo(videoStream)}
                                className="text-4xl text-secondary "
                            />
                        )}
                    </div>
                </div>
            )}
            <video
                ref={videoRef}
                playsInline
                autoPlay
                muted={muted}
                className={
                    isVideo !== -1
                        ? "w-full h-full object-cover object-center"
                        : "w-full h-full object-cover object-center hidden invisible"
                }
            ></video>
            {isVideo === -1 && (
                <div className="avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-24">
                        <span className="text-3xl">
                            {username === "You" ? "You" : username[0]}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Video;
