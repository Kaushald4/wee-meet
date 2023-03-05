import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { TbMicrophone, TbMicrophoneOff } from "react-icons/tb";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { FiMonitor } from "react-icons/fi";
import { MdStopScreenShare } from "react-icons/md";
import { AiOutlineMessage } from "react-icons/ai";
import useVideo from "../app/useVideo";
import { useSocket } from "../context/socket";
import ChatAudio from "../assets/msg.mp3";
import { useGetLoggedInUserQuery } from "../service/user/userService";
import peer from "../app/webRtc";
import Chat from "../Components/Chat";
import streamsaver from "streamsaver";
import Video from "../Components/Video";

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
    const [pinnedVideo, setPinndedVideo] = useState(null);
    const [mymessage, setMymessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [recievedFile, setRecievedFile] = useState({
        name: "",
        size: 0,
        type: "",
    });
    const recievedFileChunkRef = useRef([]);
    const [recievedFileProgress, setRecievedFileProgress] = useState(0);
    const chatAudioRef = useRef(new Audio(ChatAudio));

    const location = useLocation();
    const { video, audio } = location.state?.videoConstraint;
    const params = useParams();
    const { meetingCode } = params;
    const { socket } = useSocket();
    const {
        localVideoRef,
        localVideoStream,
        setLocalVideoStream,
        toggleAudio,
        videoConstraint,
        setVideoConstraint,
    } = useVideo();

    const sendersRef = useRef([]);
    const pinnedVideoRef = useRef();
    const myScreenStreamRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteScreenRef = useRef(null);

    const { data: userData } = useGetLoggedInUserQuery();

    const handleAcceptCall = () => {
        const { name, socketId } = incomingUserRequest;
        setIncomingUserRequest({ ...incomingUserRequest, show: false });
        socket.emit("join:request:accept", { name, socketId });
    };
    const handleRejectCall = () => {};

    useEffect(() => {
        let isOtherUser = location.state?.otherUser;

        if (isOtherUser) {
            const { name } = location.state;
            setMyName(name);
            socket.emit("join:meeting", { name, meetingCode });
        }

        setVideoConstraint(location.state?.videoConstraint);
    }, []);

    // socket listeners
    const handleIncomingJoinRequest = (data) => {
        const { name, socketId } = data;
        setIncomingUserRequest({ name, socketId, show: true });
    };
    const handleNewUserJoined = async (data) => {
        const { name } = data;
        console.log("New User Joined -- ", name);
        let me = myName || userData?.data?.name;
        setIncomingUserRequest({ ...incomingUserRequest, name });
        // create SDP offer and send to other connected user

        const offer = await peer.createOffer();
        socket.emit("call-offer", { toUser: name, fromUser: me, offer });
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

    useEffect(() => {
        socket.on("incoming:join:request", handleIncomingJoinRequest);
        socket.on("user:joined", handleNewUserJoined);
        socket.on("incoming-offer", handleIncomingOffer);
        socket.on("offer-accepted", handleOfferAccepted);

        socket.on("negotiation:needed", handleNegotationOffer);
        socket.on("negotiation-result", handleNegotiationResult);
        socket.on("icecandidate", handleIceCandidate);

        return () => {
            socket.off("incoming:join:request", handleIncomingJoinRequest);
            socket.off("user:joined", handleNewUserJoined);
            socket.off("incoming-offer", handleIncomingOffer);
            socket.off("offer-accepted", handleOfferAccepted);

            socket.off("negotiation:needed", handleNegotationOffer);
            socket.off("icecandidate", handleIceCandidate);
            socket.off("negotiation-result", handleNegotiationResult);
        };
    }, [incomingUserRequest]);

    const downloadFile = () => {
        const blob = new Blob(recievedFileChunkRef.current);
        const stream = blob.stream();
        const fileStream = streamsaver.createWriteStream(recievedFile.name);
        stream.pipeTo(fileStream);
    };

    //peer listeners
    const handleRecieveMessage = (ev) => {
        console.log(ev);
        if (typeof ev.data === "string") {
            const messageData = JSON.parse(ev.data);
            if (messageData?.sentProgress) {
                setRecievedFileProgress(messageData.sentProgress);
                return;
            }

            if (messageData?.done) {
                // here we recieved full binary data
                if (
                    recievedFile.type === "jpeg" ||
                    recievedFile.type === "jpg" ||
                    recievedFile.type === "png"
                ) {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        console.log(reader.result);
                    };
                    reader.readAsDataURL(recievedFileChunkRef.current);
                }
            } else {
                //handle screen stream id
                if (messageData?.screenStream) {
                    setRemoteScreenStream({
                        ...remoteScreenStream,
                        id: messageData.id,
                    });
                    return;
                }
                // handle normal message
                setMessages((prev) => {
                    return [...prev, messageData];
                });

                //handle binary message info
                if (messageData?.binaryData) {
                    setRecievedFile(messageData.binaryData);
                }
            }
        } else {
            // handle recieving file chunks
            // worker.postMessage(ev.data);

            recievedFileChunkRef.current.push(ev.data);
        }
    };
    const sendMessage = (binaryData) => {
        const messageData = {
            message: mymessage,
            toUser: incomingUserRequest.name,
            fromUser: myName || userData?.data?.name,
            sentAt: new Date(),
            isSeen: false,
            binaryData: binaryData,
        };
        setMessages((prev) => {
            return [...prev, messageData];
        });
        peer.chanel.send(JSON.stringify(messageData));
        setMymessage("");
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
            });
    };

    const shareScreenStream = async () => {
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
        shareMyVideoStream();
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
                        return;
                    }
                    stream.getTracks().forEach((track) => {
                        peer.peer.addTrack(track, stream);
                    });
                    setLocalVideoStream(stream);
                    setVideoConstraint({ audio: true, video: true });
                });
        }
    };

    useEffect(() => {
        if (!showChat) {
            chatAudioRef.current.play();
        }
    }, [messages]);

    return (
        <div
            className="h-[90vh] overflow-y-hidden"
            onClick={() => setShowChat(false)}
        >
            {remoteScreenStream.stream && (
                <div className="w-[200px] absolute top-8 left-8">
                    <p className="font-semibold bg-base-300 p-2">
                        {incomingUserRequest.name} is Presenting
                    </p>
                </div>
            )}
            <div className="ml-auto w-[150px] py-5 flex justify-center items-center gap-2">
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
                    {pinnedVideo && (
                        <div className="w-[77vw] mx-auto overflow-hidden rounded-lg h-[80vh]">
                            <video
                                ref={pinnedVideoRef}
                                autoPlay
                                playsInline
                                className="w-[100%] h-[100%] object-cover"
                            ></video>
                        </div>
                    )}

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

                <div className="h-[95vh] overflow-y-auto">
                    {/* {local video stream} */}
                    <Video
                        pinnedVideo={pinnedVideo}
                        setPinndedVideo={setPinndedVideo}
                        unPinVideo={unPinVideo}
                        videoRef={localVideoRef}
                        videoStream={localVideoStream}
                        username={"You"}
                    />

                    {/* {local Screen stream} */}
                    <Video
                        pinnedVideo={pinnedVideo}
                        setPinndedVideo={setPinndedVideo}
                        unPinVideo={unPinVideo}
                        videoRef={myScreenStreamRef}
                        videoStream={myScreenStream}
                        username={"You"}
                    />

                    {/* {remote video stream} */}
                    <Video
                        pinnedVideo={pinnedVideo}
                        setPinndedVideo={setPinndedVideo}
                        unPinVideo={unPinVideo}
                        videoRef={remoteVideoRef}
                        videoStream={remoteStream}
                        username={incomingUserRequest.name}
                    />

                    {/* {remote screen stream} */}
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
                            setMymessage={setMymessage}
                            myMessage={mymessage}
                            setShowChat={setShowChat}
                            peer={peer}
                            downloadFile={downloadFile}
                            recievedFileProgress={recievedFileProgress}
                            recievedFile={recievedFile}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingPage;
