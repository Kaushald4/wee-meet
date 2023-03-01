import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TbMicrophone, TbMicrophoneOff } from "react-icons/tb";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import useVideo from "../app/useVideo";
import Header from "../Components/Header";
import { useSocket } from "../context/socket";
import { useGetMeetingInfoQuery } from "../service/meeting/meetingService";
import { useGetLoggedInUserQuery } from "../service/user/userService";

const JoinPage = () => {
    const [name, setName] = useState("");
    const [isRequestingToJoin, setIsRequestingToJoin] = useState(false);
    const {
        toggleVideo,
        toggleAudio,
        localVideoRef,
        setLocalVideoStream,
        videoConstraint,
    } = useVideo();
    const { socket } = useSocket();
    const params = useParams();
    const navigate = useNavigate();

    const { meetingCode } = params;

    const { data: meetingInfo, isLoading: isMeetingInfoLoading } =
        useGetMeetingInfoQuery({
            meetingCode: params.meetingCode,
        });

    const { data: userData } = useGetLoggedInUserQuery();

    const getUserMediaStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(
            videoConstraint
        );
        setLocalVideoStream(stream);
        localVideoRef.current.srcObject = stream;
    };

    useEffect(() => {
        getUserMediaStream();
    }, []);

    const handleJoinNow = () => {
        socket.emit("join:meeting", {
            name: userData?.data?.name,
            meetingCode,
        });
    };
    const handleRequestToJoin = () => {
        const myName = name || userData?.data?.name;
        const toName = meetingInfo?.data?.author?.name;
        setIsRequestingToJoin(true);
        socket.emit("join:request", {
            name: myName,
            toUser: toName,
            meetingCode,
        });
    };

    // socket listeners
    // current user joined meeting
    const handleUserJoined = (data) => {
        navigate(`/meeting/${meetingCode}`, { state: { videoConstraint } });
    };
    const handleJoinRequestAccepted = () => {
        let myName = userData?.data?.name || name;
        navigate(`/meeting/${meetingCode}`, {
            state: {
                otherUser: true,
                name: myName,
                videoConstraint,
            },
        });
    };

    useEffect(() => {
        socket.on("joined", handleUserJoined);
        socket.on("join:request:accept", handleJoinRequestAccepted);

        return () => {
            socket.off("joined", handleUserJoined);
            socket.off("join:request:accept", handleJoinRequestAccepted);
        };
    }, [videoConstraint, name]);

    // peer listeners

    return (
        <div>
            <Header />

            <div className="flex gap-8 items-center justify-center mt-[80px]">
                <div className="w-[700px] h-[500px] rounded-lg overflow-hidden relative">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-[100%] h-[100%] object-cover"
                    />
                    <div className="absolute bottom-5 gap-5 w-full flex justify-center">
                        {videoConstraint.audio ? (
                            <button
                                onClick={toggleAudio}
                                className="bg-primary hover:bg-primary-focus w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <TbMicrophone className="text-2xl text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={toggleAudio}
                                className="bg-[rgba(255,255,255,.2)] hover:bg-primary w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <TbMicrophoneOff className="text-2xl text-white" />
                            </button>
                        )}

                        {videoConstraint.video ? (
                            <button
                                onClick={toggleVideo}
                                className="bg-primary hover:bg-primary-focus w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <BsCameraVideo className="text-2xl text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={toggleVideo}
                                className="bg-[rgba(255,255,255,.2)] hover:bg-primary w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <BsCameraVideoOff className="text-2xl text-white" />
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex flex-col gap-2 mt-5">
                        <p className="font-semibold text-center">
                            Ready To Join
                        </p>
                        {!userData?.data ? (
                            <>
                                {isRequestingToJoin ? (
                                    <div className="text-center">
                                        <h4 className="text-xl">
                                            Getting Ready
                                        </h4>
                                        <p>
                                            You will be able to join in a moment
                                        </p>
                                        <progress className="progress w-56"></progress>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            placeholder="Name"
                                            className="input input-bordered"
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            value={name}
                                        />
                                        <button
                                            onClick={handleRequestToJoin}
                                            className="btn btn-outline"
                                        >
                                            Ask to Join
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {meetingInfo?.data?.author?._id ===
                                userData?.data?._id ? (
                                    <button
                                        onClick={handleJoinNow}
                                        className="btn btn-outline"
                                    >
                                        Join Now
                                    </button>
                                ) : (
                                    <>
                                        {isRequestingToJoin ? (
                                            <div className="text-center">
                                                <h4 className="text-xl">
                                                    Getting Ready
                                                </h4>
                                                <p>
                                                    You will be able to join in
                                                    a moment
                                                </p>
                                                <progress className="progress w-56"></progress>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleRequestToJoin}
                                                className="btn btn-outline"
                                            >
                                                Ask to Join
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinPage;
