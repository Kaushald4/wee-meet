import React, { useEffect, useRef, useState } from "react";
import {
    Navigate,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import { TbMicrophone, TbMicrophoneOff } from "react-icons/tb";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { HiClipboardDocument } from "react-icons/hi2";
import { FiMonitor } from "react-icons/fi";
import { MdStopScreenShare } from "react-icons/md";
import { AiOutlineMessage } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useVideo from "../app/useVideo";
import { useSocket } from "../context/socket";
import ChatAudio from "../assets/msg.mp3";
import { useGetLoggedInUserQuery } from "../service/user/userService";
import peer from "../app/webRtc";
import Chat from "../Components/Chat";
import Video from "../Components/Video";
import { useFileShare } from "../context/FileShare";

const MeetingPage = () => {
    const [incomingUserRequest, setIncomingUserRequest] = useState({
        name: "",
        socketId: "",
        show: false,
    });
    const [myName, setMyName] = useState("");
    const [chanel, setDataChanel] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [myScreenStream, setMyScreeStream] = useState(null);
    const [remoteScreenStream, setRemoteScreenStream] = useState({
        stream: null,
        id: "",
    });
    const [forceUpdate, setForceUpdate] = useState(false);
    const [pinnedVideo, setPinndedVideo] = useState(null);
    const [mymessage, setMymessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [meetingLinkCopied, setMeetingLinkCopied] = useState(false);

    const chatAudioRef = useRef(new Audio(ChatAudio));

    const location = useLocation();
    const params = useParams();
    const { meetingCode } = params;
    const { socket } = useSocket();
    const {
        localVideoRef,
        localVideoStream,
        setLocalVideoStream,
        videoConstraint,
        setVideoConstraint,
    } = useVideo();

    const {
        sendFile,
        selectedFile,
        setRecievedFile,
        recievedFileChunkRef,
        setRecievedFileProgress,
        recievedFile,
        recivedChunk,
        isReceivingFile,
        setIsReceivingFile,
    } = useFileShare();

    const sendersRef = useRef([]);
    const pinnedVideoRef = useRef();
    const myScreenStreamRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteScreenRef = useRef(null);
    const navigate = useNavigate();

    const { data: userData } = useGetLoggedInUserQuery();

    const handleAcceptCall = () => {
        const { name, socketId } = incomingUserRequest;
        setIncomingUserRequest({ ...incomingUserRequest, show: false });
        socket.emit("join:request:accept", { name, socketId });
    };
    const handleRejectCall = () => {
        const { name, socketId } = incomingUserRequest;
        socket.emit("join:request:reject", { name, socketId });
        setIncomingUserRequest({
            ...incomingUserRequest,
            show: false,
            name: "",
            socketId: "",
        });
    };

    useEffect(() => {
        let isOtherUser = location.state?.otherUser;

        if (isOtherUser) {
            const { name } = location.state;
            setMyName(name);
            socket.emit("join:meeting", { name, meetingCode });
        }

        setVideoConstraint(location.state?.videoConstraint);
    }, []);
    useEffect(() => {
        let intervalId;
        if (meetingLinkCopied) {
            intervalId = setTimeout(() => {
                setMeetingLinkCopied(false);
            }, 2000);
        }

        return () => {
            clearTimeout(intervalId);
        };
    }, [meetingLinkCopied]);

    // socket listeners
    const handleIncomingJoinRequest = (data) => {
        const { name, socketId } = data;
        if (!incomingUserRequest.name) {
            setIncomingUserRequest({ name, socketId, show: true });
        }
    };
    const handleNewUserJoined = async (data) => {
        const { name } = data;
        console.log("New User Joined -- ", name);
        let me = myName || userData?.data?.name;
        setIncomingUserRequest({ ...incomingUserRequest, name });
        // create SDP offer and send to other connected user

        const offer = await peer.createOffer();
        socket.emit("call-offer", { toUser: name, fromUser: me, offer });

        toast(`${name} Joined the Meeting...`);
    };

    const handleIncomingOffer = async (data) => {
        const { fromUser, offer, socketId } = data;
        console.log("Offer Recieved ", offer);
        setIncomingUserRequest({ name: fromUser, socketId, show: false });

        const answer = await peer.createAnswer(offer);
        socket.emit("offer-accepted", { toUser: fromUser, answer });
    };

    const handleOfferAccepted = async (data) => {
        const { answer } = data;
        console.log("CALL Accepted", answer);
        await peer.setRemoteAnswer(answer);
    };

    //negotiation needed socket signaling
    const handleNegotationOffer = async (data) => {
        const { offer } = data;
        const answer = await peer.createAnswer(offer);
        console.log(offer, incomingUserRequest.name, answer);
        socket.emit("negotiation-result", {
            toUser: incomingUserRequest.name,
            answer,
        });
    };
    const handleNegotiationResult = async (data) => {
        const { answer } = data;
        await peer.setRemoteAnswer(answer);
    };

    const handleIceCandidate = async (data) => {
        const { candidate } = data;
        const candi = new RTCIceCandidate(candidate);
        await peer.peer.addIceCandidate(candi);
    };

    const handleUserDisconnected = (data) => {
        setIncomingUserRequest({ name: "", show: false, socketId: "" });
        setPinndedVideo(null);
        setRemoteScreenStream({ id: "", stream: "" });
        setRemoteStream(null);
        toast(`${data.name} Left the meeting...`);
    };
    useEffect(() => {
        socket.on("incoming:join:request", handleIncomingJoinRequest);

        socket.on("user:joined", handleNewUserJoined);
        socket.on("incoming-offer", handleIncomingOffer);
        socket.on("offer-accepted", handleOfferAccepted);

        socket.on("negotiation:needed", handleNegotationOffer);
        socket.on("negotiation-result", handleNegotiationResult);
        socket.on("icecandidate", handleIceCandidate);

        socket.on("user-disconnect", handleUserDisconnected);

        if (!incomingUserRequest.name) {
            setPinndedVideo(localVideoStream);
            localVideoRef.current.srcObject = localVideoStream;
        }

        return () => {
            socket.off("incoming:join:request", handleIncomingJoinRequest);
            socket.off("user:joined", handleNewUserJoined);
            socket.off("incoming-offer", handleIncomingOffer);
            socket.off("offer-accepted", handleOfferAccepted);

            socket.off("negotiation:needed", handleNegotationOffer);
            socket.off("icecandidate", handleIceCandidate);
            socket.off("negotiation-result", handleNegotiationResult);
            socket.off("user-disconnect", handleUserDisconnected);
        };
    }, [incomingUserRequest]);

    //peer listeners
    const handleRecieveMessage = (ev) => {
        if (typeof ev.data === "string") {
            const messageData = JSON.parse(ev.data);
            //handle remote audio disable enable notification
            if (messageData?.type === "audio") {
                remoteStream.getTracks().forEach((track) => {
                    if (track.kind === "audio") {
                        track.enabled = !track.enabled;
                        setForceUpdate(!forceUpdate);
                    }
                });
                return;
            }

            //handle screen stream id
            if (messageData?.screenStream) {
                setRemoteScreenStream({
                    ...remoteScreenStream,
                    id: messageData.id,
                });
                return;
            }

            if (messageData?.binaryData) {
                setRecievedFile(messageData);
                setMessages((prev) => {
                    return [...prev, messageData];
                });
                return;
            }

            if (messageData?.done) {
                setIsReceivingFile(false);
                setRecievedFileProgress(0);
                return;
            }

            // handle normal message
            setMessages((prev) => {
                return [...prev, messageData];
            });
        } else {
            if (recievedFile) {
                recivedChunk.current += ev.data.byteLength;
                let progress = Math.floor(
                    (recivedChunk.current / recievedFile.binaryData.size) * 100
                );
                setRecievedFileProgress(progress);
            }
            if (!isReceivingFile) {
                setIsReceivingFile(true);
            }
            recievedFileChunkRef.current.push(ev.data);
        }
    };
    const sendMessage = () => {
        let messageData = {};
        if (selectedFile.name) {
            messageData = {
                message: mymessage,
                toUser: incomingUserRequest.name,
                fromUser: myName || userData?.data?.name,
                sentAt: new Date(),
                isSeen: false,
                binaryData: selectedFile,
            };
        } else {
            messageData = {
                message: mymessage,
                toUser: incomingUserRequest.name,
                fromUser: myName || userData?.data?.name,
                sentAt: new Date(),
                isSeen: false,
                binaryData: null,
            };
        }
        setMessages((prev) => {
            return [...prev, messageData];
        });
        peer.chanel.send(JSON.stringify(messageData));
        setMymessage("");
        if (selectedFile.name) {
            sendFile(peer);
        }
        var elem = document.getElementById("msg-box");
        elem.scrollTop = elem.scrollHeight + 200;
    };

    const handleNegotiationNeeded = async () => {
        let toUser = incomingUserRequest.name;
        let me = myName || userData?.data?.name;
        await peer.createOffer();
        let localOffer = peer.peer.localDescription;
        socket.emit("negotiation:needed", { toUser, offer: localOffer });
    };

    const handleIcecandidate = (e) => {
        let toUser = incomingUserRequest.name;
        let me = myName || userData?.data?.name;
        if (e.candidate) {
            socket.emit("icecandidate", { toUser, candidate: e.candidate });
        }
    };

    const handleTrack = (event) => {
        const streams = event.streams;
        if (streams[0].id === remoteScreenStream.id) {
            // handle screen stream
            setRemoteScreenStream({
                id: remoteScreenStream.id,
                stream: streams[0],
            });
            remoteScreenRef.current.srcObject = streams[0];
            setPinndedVideo(streams[0]);
            pinnedVideoRef.current.srcObject = streams[0];
        } else {
            remoteVideoRef.current.srcObject = streams[0];
            setRemoteStream(streams[0]);
            setPinndedVideo(streams[0]);
            pinnedVideoRef.current.srcObject = streams[0];
        }
    };

    useEffect(() => {
        if (chanel) {
            chanel.onmessage = handleRecieveMessage;
        }

        peer.peer.onicecandidate = handleIcecandidate;

        peer.peer.addEventListener(
            "negotiationneeded",
            handleNegotiationNeeded
        );

        peer.peer.ondatachannel = (e) => {
            setDataChanel(e.channel);
        };

        peer.peer.addEventListener("track", handleTrack);

        return () => {
            peer.peer.removeEventListener(
                "negotiationneeded",
                handleNegotiationNeeded
            );
            peer.peer.onicecandidate = null;
            peer.peer.ondatachannel = null;
            peer.peer.removeEventListener("track", handleTrack);
        };
    }, [peer, incomingUserRequest, chanel, remoteStream, handleRecieveMessage]);

    const shareMyVideoStream = (constraints) => {
        navigator.mediaDevices
            .getUserMedia(constraints || location.state?.videoConstraint)
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                setLocalVideoStream(stream);
                stream.getTracks().forEach((track) => {
                    sendersRef.current.push(peer.peer.addTrack(track, stream));
                });
                if (!incomingUserRequest.name && !remoteScreenStream.stream) {
                    pinnedVideoRef.current.srcObject = stream;
                    setPinndedVideo(stream);
                }
            });
    };

    const shareScreenStream = async () => {
        if (!incomingUserRequest.name) {
            alert(
                "You can not share screen until other user has joined the meeting."
            );
            return;
        }
        let me = myName || userData?.data?.name;
        let streams = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
        peer.chanel.send(
            JSON.stringify({ screenStream: true, id: streams.id })
        );

        setMyScreeStream(streams);
        myScreenStreamRef.current.srcObject = streams;
        const streamTrack = streams.getTracks()[0];
        peer.peer.addTrack(streamTrack, streams);
        setPinndedVideo(streams);
        pinnedVideoRef.current.srcObject = streams;
    };

    const stopScreenShare = () => {
        myScreenStream.getTracks().forEach((track) => {
            track.stop();
        });
        setMyScreeStream(null);
    };

    const unPinVideo = () => {
        setPinndedVideo(null);
    };

    useEffect(() => {
        if (!socket.connected) {
            navigate(`/we/${meetingCode}`);
        }
    }, [socket.connected]);

    useEffect(() => {
        if (location.state?.videoConstraint) {
            shareMyVideoStream();
        }

        return () => {
            socket.disconnect();

            // peer.peer.close();
        };
    }, []);

    useEffect(() => {
        if (pinnedVideoRef.current) {
            pinnedVideoRef.current.srcObject = pinnedVideo;
        }
    }, [pinnedVideoRef, pinnedVideo]);

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
                    localVideoRef.current.srcObject = null;
                    shareMyVideoStream({ video: false, audio: true });
                    if (
                        !incomingUserRequest.name &&
                        !remoteScreenStream.stream
                    ) {
                        if (!remoteStream) {
                            pinnedVideoRef.current.srcObject = localVideoStream;
                            setPinndedVideo(localVideoStream);
                        }
                    }
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
                                peer.peer.addTrack(track, stream);
                            }
                        });
                        if (
                            !incomingUserRequest.name &&
                            !remoteScreenStream.stream
                        ) {
                            pinnedVideoRef.current.srcObject = stream;
                            setPinndedVideo(stream);
                        }
                        return;
                    }
                    stream.getTracks().forEach((track) => {
                        peer.peer.addTrack(track, stream);
                    });
                    setLocalVideoStream(stream);
                    setVideoConstraint({ audio: true, video: true });
                    if (
                        !incomingUserRequest.name &&
                        !remoteScreenStream.stream
                    ) {
                        pinnedVideoRef.current.srcObject = stream;
                        setPinndedVideo(stream);
                    }
                });
        }
    };

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
                peer.chanel.send(
                    JSON.stringify({ type: "audio", enabled: track.enabled })
                );
            }
        });
    };

    useEffect(() => {
        if (!showChat) {
            chatAudioRef.current.play();
        }
    }, [messages]);

    if (!location.state?.videoConstraint) {
        return <Navigate to={`/we/${meetingCode}`} />;
    }

    return (
        <div
            className="h-[90vh] overflow-y-hidden"
            onClick={() => setShowChat(false)}
        >
            {(remoteScreenStream.stream || myScreenStream) && (
                <div className="w-[400px] absolute top-8 left-8">
                    <p className="font-semibold bg-base-300 px-2 py-1 capitalize rounded-lg">
                        {myScreenStream && (
                            <span>
                                You are Presenting to {incomingUserRequest.name}
                            </span>
                        )}
                        {remoteScreenStream.stream && (
                            <span>
                                {incomingUserRequest?.name} is Presenting...
                            </span>
                        )}
                    </p>
                </div>
            )}
            {/* {Notification} */}
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="dark"
            />

            <div className="ml-auto w-[150px] pb-5 pt-2 flex justify-center items-center gap-2">
                <p className="capitalize">{myName || userData?.data?.name}</p>
                <div className="avatar">
                    <div className="avatar placeholder">
                        <div className="bg-secondary-focus text-secondary-content rounded-full w-12">
                            <span className="capitalize">
                                {(myName && myName[0]) ||
                                    (userData?.data?.name &&
                                        userData?.data?.name[0])}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {incomingUserRequest.show && (
                <div className="fixed w-screen bg-[rgba(0,0,0,.7)] z-10 top-0 right-0 left-0 bottom-0 h-[98vh]">
                    <div className="bg-base-300  w-[400px] mx-auto p-4">
                        <p>Incoming Request</p>
                        <p className="mt-4">
                            {incomingUserRequest.name} Wants To Join
                        </p>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={handleRejectCall}
                                className="btn btn-outline btn-primary btn-sm"
                            >
                                Deny
                            </button>
                            <button
                                onClick={handleAcceptCall}
                                className="btn btn-outline btn-sm"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between">
                {/* pinned video */}
                <div className="w-[80vw]">
                    <div
                        className={
                            pinnedVideo
                                ? "w-full mx-auto overflow-hidden rounded-lg h-[84vh] ml-4"
                                : "w-full mx-auto overflow-hidden rounded-lg h-[84vh] hidden invisible"
                        }
                    >
                        <Video
                            pinnedVideo={pinnedVideo}
                            setPinndedVideo={setPinndedVideo}
                            unPinVideo={unPinVideo}
                            videoRef={pinnedVideoRef}
                            videoStream={pinnedVideo}
                            hoverDisable
                            pinned
                            username={incomingUserRequest.name || "You"}
                            muted
                        />
                    </div>

                    <div className="absolute bottom-8 ml-[80px]">
                        <div className="flex justify-start">
                            <span>
                                Meeting Link |{" "}
                                <span className="font-semibold ml-1 inline-flex items-center gap-2">
                                    {meetingCode}
                                    <div
                                        onClick={() => {
                                            setMeetingLinkCopied(true);
                                            navigator.clipboard.writeText(
                                                `${window.location.protocol}//${window.location.host}/we/${meetingCode}`
                                            );
                                        }}
                                        className={
                                            meetingLinkCopied
                                                ? "tooltip cursor-pointer z-50"
                                                : "cursor-pointer z-50"
                                        }
                                        data-tip="Copied"
                                    >
                                        <HiClipboardDocument
                                            className={
                                                meetingLinkCopied
                                                    ? `text-1xl cursor-pointer text-success`
                                                    : `text-1xl cursor-pointer `
                                            }
                                        />
                                    </div>
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-5 gap-5 w-full flex justify-center">
                        {videoConstraint.audio ? (
                            <button
                                onClick={toggleAudio}
                                className="bg-[rgba(255,255,255,.2)] hover:bg-primary-focus w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <TbMicrophone className="text-2xl text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={toggleAudio}
                                className="bg-primary  hover:bg-primary w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <TbMicrophoneOff className="text-2xl text-white" />
                            </button>
                        )}

                        {videoConstraint.video ? (
                            <button
                                onClick={toggleVideo}
                                className="bg-[rgba(255,255,255,.2)] hover:bg-primary-focus w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <BsCameraVideo className="text-2xl text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={toggleVideo}
                                className="bg-primary  hover:bg-primary w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <BsCameraVideoOff className="text-2xl text-white" />
                            </button>
                        )}

                        {!myScreenStream ? (
                            <button
                                onClick={shareScreenStream}
                                className="bg-[rgba(255,255,255,.2)] hover:bg-primary-focus w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <FiMonitor className="text-2xl text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={stopScreenShare}
                                className="bg-primary hover:bg-primary w-[50px] h-[50px] rounded-full flex justify-center items-center"
                            >
                                <MdStopScreenShare className="text-2xl text-white" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-[95vh] pb-[80px] overflow-y-auto mr-4 ml-8">
                    {/* {local video stream} */}
                    <div className="w-[370px] h-[260px] mb-4">
                        <Video
                            pinnedVideo={pinnedVideo}
                            setPinndedVideo={setPinndedVideo}
                            unPinVideo={unPinVideo}
                            videoRef={localVideoRef}
                            videoStream={localVideoStream}
                            username={"You"}
                            muted
                        />
                    </div>

                    {/* {local Screen stream} */}
                    <div
                        className={
                            myScreenStream
                                ? "w-[370px] h-[260px] mb-4"
                                : "w-[370px] h-[260px] hidden invisible"
                        }
                    >
                        <Video
                            pinnedVideo={pinnedVideo}
                            setPinndedVideo={setPinndedVideo}
                            unPinVideo={unPinVideo}
                            videoRef={myScreenStreamRef}
                            videoStream={myScreenStream}
                            username={"You"}
                        />
                    </div>

                    {/* {remote video stream} */}
                    <div
                        className={
                            remoteStream
                                ? "w-[370px] h-[260px] mb-4"
                                : "w-[370px] h-[260px] hidden invisible"
                        }
                    >
                        <Video
                            pinnedVideo={pinnedVideo}
                            setPinndedVideo={setPinndedVideo}
                            unPinVideo={unPinVideo}
                            videoRef={remoteVideoRef}
                            videoStream={remoteStream}
                            username={incomingUserRequest.name}
                        />
                    </div>

                    {/* {remote screen stream} */}
                    <div
                        className={
                            remoteScreenStream.stream
                                ? "w-[370px] h-[260px]"
                                : "w-[370px] h-[260px] hidden invisible"
                        }
                    >
                        <Video
                            pinnedVideo={pinnedVideo}
                            setPinndedVideo={setPinndedVideo}
                            unPinVideo={unPinVideo}
                            videoRef={remoteScreenRef}
                            videoStream={remoteScreenStream.stream}
                            username={incomingUserRequest.name}
                        />
                    </div>
                </div>
            </div>

            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setShowChat(true);
                    const updatedMessage = messages.map((message) => {
                        message.isSeen = true;
                        return message;
                    });
                }}
                className="absolute z-10 bottom-[40px] right-[40px] w-[70px] h-[70px] cursor-pointer bg-[rgba(255,255,255,.1)] rounded-full flex justify-center items-center"
            >
                {!showChat &&
                    messages.filter(
                        (message) =>
                            !message.isSeen &&
                            message.fromUser !==
                                (myName || userData?.data?.name)
                    ).length >= 1 && (
                        <div className="absolute bg-primary text-primary-content w-[20px] h-[20px] rounded-full flex justify-center items-center top-4 left-4">
                            {
                                messages.filter((message) => !message.isSeen)
                                    .length
                            }
                        </div>
                    )}
                <AiOutlineMessage className="text-4xl text-secondary-focus" />
                {showChat && (
                    <div className="absolute bottom-10 right-8">
                        {" "}
                        <Chat
                            messages={messages}
                            sendMessage={sendMessage}
                            currentUser={myName || userData?.data?.name}
                            remoteUser={incomingUserRequest.name}
                            setMymessage={setMymessage}
                            myMessage={mymessage}
                            setShowChat={setShowChat}
                            peer={peer}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingPage;
