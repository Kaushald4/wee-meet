import React, { useRef } from "react";
import { FiSend } from "react-icons/fi";
import { AiFillCloseCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import { FiDownloadCloud } from "react-icons/fi";

import moment from "moment";
import useFile from "../app/useFile";

const Chat = ({
    messages,
    sendMessage,
    currentUser,
    setMymessage,
    myMessage,
    setShowChat,
    peer,
    downloadFile,
    recievedFileProgress,
    recievedFile,
}) => {
    const messageBoxRef = useRef();
    const {
        fileDetails,
        onSelectFile,
        sendFile,
        progress,
        removeSelectedFile,
    } = useFile();

    const clearSelectedFile = () => {
        removeSelectedFile();
        messageBoxRef.current.value = null;
    };
    const handleMessageSend = () => {
        if (fileDetails.name) {
            sendMessage({
                name: fileDetails.name,
                size: fileDetails.size,
                type: fileDetails.type,
                icon: fileDetails.icon,
            });
            sendFile(peer);
        } else {
            sendMessage(null);
        }
    };

    console.log(fileDetails);

    return (
        <div className="h-[700px] w-[470px] bg-base-300 rounded-lg overflow-hidden">
            <div className="bg-base-100 flex justify-center items-center">
                <div className="w-full h-[40px] text-center pt-2">Chats</div>
                <div
                    className="mr-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowChat(false);
                    }}
                >
                    <AiFillCloseCircle className="text-3xl text-primary" />
                </div>
            </div>

            <div id="msg-box" className="h-[450px] overflow-auto px-2 pt-4">
                {messages.map((message, i) => {
                    return message.binaryData ? (
                        <div
                            key={i}
                            className={
                                currentUser === message.fromUser
                                    ? "chat chat-end"
                                    : "chat chat-start"
                            }
                        >
                            <div className="chat-image avatar placeholder">
                                <div
                                    className={
                                        currentUser === message?.fromUser
                                            ? "bg-primary-focus text-primary-content rounded-full w-12"
                                            : "bg-secondary-focus text-secondary-content rounded-full w-12"
                                    }
                                >
                                    <span className="capitalize">
                                        {message?.fromUser[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-header capitalize">
                                {currentUser === message?.fromUser
                                    ? "You"
                                    : message.fromUser}
                                <time className="text-xs opacity-50 ml-1">
                                    {moment(message.sentAt).format("LT")}
                                </time>
                            </div>
                            <div
                                className="chat-bubble hover:text-[rgba(255,255,255,1)]"
                                onClick={downloadFile}
                            >
                                {/* {binary data} */}
                                <div className="">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {
                                                <div className="w-[50px] relative">
                                                    <div
                                                        className={
                                                            progress !== 100 ||
                                                            recievedFileProgress !==
                                                                100
                                                                ? "absolute top-0 bottom-0 left-0 right-0"
                                                                : "bg-[rgba(0,0,0,.7)] absolute top-0 bottom-0 left-0 right-0"
                                                        }
                                                    />
                                                    <div className="absolute top-[20%] left-[8%]">
                                                        {currentUser ===
                                                        message?.fromUser ? (
                                                            <>
                                                                {progress !==
                                                                    100 && (
                                                                    <div
                                                                        className="radial-progress"
                                                                        style={{
                                                                            "--value":
                                                                                progress,
                                                                            "--size":
                                                                                "38px",
                                                                            "--thickness":
                                                                                "2px",
                                                                        }}
                                                                    >
                                                                        {
                                                                            progress
                                                                        }
                                                                        %
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {recievedFileProgress !==
                                                                    100 && (
                                                                    <div
                                                                        className="radial-progress"
                                                                        style={{
                                                                            "--value":
                                                                                recievedFileProgress,
                                                                            "--size":
                                                                                "38px",
                                                                            "--thickness":
                                                                                "2px",
                                                                        }}
                                                                    >
                                                                        {
                                                                            recievedFileProgress
                                                                        }
                                                                        %
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    {currentUser ===
                                                    message?.fromUser ? (
                                                        <img
                                                            src={
                                                                fileDetails.icon
                                                            }
                                                        />
                                                    ) : (
                                                        <img
                                                            src={
                                                                recievedFile.icon
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            }

                                            <div>
                                                {message?.binaryData?.name}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            {message?.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-footer opacity-50 text-[11px]">
                                Delivered
                            </div>
                        </div>
                    ) : (
                        <div
                            key={i}
                            className={
                                currentUser === message.fromUser
                                    ? "chat chat-end"
                                    : "chat chat-start"
                            }
                        >
                            <div className="chat-image avatar placeholder">
                                <div
                                    className={
                                        currentUser === message?.fromUser
                                            ? "bg-primary-focus text-primary-content rounded-full w-12"
                                            : "bg-secondary-focus text-secondary-content rounded-full w-12"
                                    }
                                >
                                    <span className="capitalize">
                                        {message?.fromUser[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="chat-header capitalize">
                                {currentUser === message?.fromUser
                                    ? "You"
                                    : message.fromUser}
                                <time className="text-xs opacity-50 ml-1">
                                    {moment(message.sentAt).format("LT")}
                                </time>
                            </div>
                            <div className="chat-bubble">{message.message}</div>
                            <div className="chat-footer opacity-50 text-[11px]">
                                {currentUser === message.fromUser
                                    ? "Sent"
                                    : "Delivered"}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mx-2 absolute bottom-0 right-0 left-0">
                <textarea
                    onChange={(e) => {
                        e.stopPropagation();
                        setMymessage(e.target.value);
                    }}
                    className="textarea textarea-bordered w-full pr-[80px]"
                    placeholder="Message..."
                    value={myMessage}
                ></textarea>
                {fileDetails.name && (
                    <div className="absolute bottom-[85px]">
                        {fileDetails.previewUrl && (
                            <div className="w-[280px]">
                                <img src={fileDetails.previewUrl} />
                            </div>
                        )}
                        <div className="flex items-center bg-base-100 p-2 rounded-lg mx-4 justify-between">
                            <div className="flex items-center gap-2">
                                {fileDetails.icon && (
                                    <div className="w-[80px]">
                                        <img src={fileDetails.icon} />
                                    </div>
                                )}
                                <p className="max-w-[360px]">
                                    Selected{" "}
                                    <span className="text-sm font-semibold">
                                        {fileDetails.name}
                                    </span>
                                </p>
                            </div>
                            <AiOutlineCloseCircle
                                onClick={clearSelectedFile}
                                className="text-2xl text-primary hover:text-primary-focus"
                            />
                        </div>
                    </div>
                )}
                <div className="absolute top-[30%] cursor-pointer right-5">
                    <div className="flex items-center gap-4 flex-row-reverse">
                        <div className="">
                            <FiSend
                                onClick={handleMessageSend}
                                className="text-2xl"
                            />
                        </div>
                        <div className="cursor-pointer">
                            <input
                                type="file"
                                id="file-share"
                                hidden
                                onChange={onSelectFile}
                                ref={messageBoxRef}
                            />
                            <label
                                htmlFor="file-share"
                                className="cursor-pointer"
                            >
                                <ImAttachment className="text-2xl" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
