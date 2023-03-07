import React, { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { AiFillCloseCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import { FiDownloadCloud } from "react-icons/fi";

import moment from "moment";
import useFile from "../app/useFile";
import { useFileShare } from "../context/FileShare";

const Chat = ({
    messages,
    sendMessage,
    currentUser,
    setMymessage,
    myMessage,
    setShowChat,
    remoteUser,
}) => {
    const messageBoxRef = useRef();
    const {
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
        isReceivingFile,
        setIsReceivingFile,
        downloadFile,
    } = useFileShare();

    const [fileShareStatus, setFileShareStatus] = useState({
        fileSent: false,
        fileRecived: false,
    });

    const clearSelectedFile = () => {
        removeSelectedFile();
        messageBoxRef.current.value = null;
    };

    useEffect(() => {
        if (currentUser === recievedFile?.toUser) {
            if (recievedFileProgress >= 100) {
                setFileShareStatus({ ...fileShareStatus, fileRecived: true });
            }
        }

        if (fileSentProgress >= 100) {
            setFileShareStatus({ ...fileShareStatus, fileSent: true });
        }
    }, [recievedFileProgress, fileSentProgress]);

    return (
        <div className="h-[70vh] w-[470px] bg-base-300 rounded-lg overflow-hidden">
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
            {recievedFile?.binaryData && (
                <>
                    {currentUser === recievedFile?.toUser && (
                        <div className="pl-2">
                            {fileShareStatus.fileRecived && (
                                <div className="flex items-center justify-between px-4">
                                    <p id="file-recieved">File Recieved.</p>
                                    <AiFillCloseCircle
                                        className="text-primary"
                                        onClick={() =>
                                            setFileShareStatus({
                                                ...fileShareStatus,
                                                fileRecived: false,
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {isReceivingFile && (
                        <>
                            <p>Recieving File... {recievedFileProgress}% </p>
                            <progress
                                className="progress progress-primary w-full mt-0 pt-0"
                                value={recievedFileProgress}
                                max="100"
                            ></progress>
                        </>
                    )}
                </>
            )}
            {fileSentProgress >= 1 && (
                <div className="pl-2">
                    {fileShareStatus.fileSent && (
                        <div className="flex items-center justify-between px-4">
                            <p id="file-recieved">File Sent.</p>
                            <AiFillCloseCircle
                                className="text-primary"
                                onClick={() =>
                                    setFileShareStatus({
                                        ...fileShareStatus,
                                        fileSent: false,
                                    })
                                }
                            />
                        </div>
                    )}
                    {fileSentProgress <= 99 && (
                        <>
                            <p>Sending File... {fileSentProgress}%</p>
                            <progress
                                className="progress progress-primary w-full mt-0 pt-0"
                                value={fileSentProgress}
                                max="100"
                            ></progress>
                        </>
                    )}
                </div>
            )}

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
                                onClick={() => {
                                    if (
                                        currentUser === message.toUser &&
                                        fileSentProgress >= 100
                                    ) {
                                        downloadFile();
                                    }
                                    if (!isReceivingFile) {
                                        downloadFile();
                                    }
                                }}
                            >
                                {/* {binary data} */}
                                <div className="">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {
                                                <div className="w-[50px] relative">
                                                    <div
                                                        className={
                                                            fileSentProgress !==
                                                                100 ||
                                                            recievedFileProgress !==
                                                                100
                                                                ? "absolute top-0 bottom-0 left-0 right-0"
                                                                : "bg-[rgba(0,0,0,.7)] absolute top-0 bottom-0 left-0 right-0"
                                                        }
                                                    />

                                                    {currentUser ===
                                                    message?.fromUser ? (
                                                        <img
                                                            src={
                                                                message
                                                                    ?.binaryData
                                                                    ?.icon
                                                            }
                                                        />
                                                    ) : (
                                                        <img
                                                            src={
                                                                recievedFile
                                                                    ?.binaryData
                                                                    ?.icon
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
                {selectedFile.name && (
                    <div className="absolute bottom-[85px]">
                        {selectedFile.previewUrl && (
                            <div className="w-[280px]">
                                <img src={selectedFile.previewUrl} />
                            </div>
                        )}
                        <div className="flex items-center bg-base-100 p-2 rounded-lg mx-4 justify-between">
                            <div className="flex items-center gap-2">
                                {selectedFile.icon && (
                                    <div className="w-[80px]">
                                        <img src={selectedFile.icon} />
                                    </div>
                                )}
                                <p className="max-w-[360px]">
                                    Selected{" "}
                                    <span className="text-sm font-semibold">
                                        {selectedFile.name}
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
                                onClick={sendMessage}
                                className="text-2xl"
                            />
                        </div>
                        <div className="cursor-pointer">
                            <input
                                type="file"
                                id="file-share"
                                hidden
                                disabled={isReceivingFile}
                                onChange={onSelectFile}
                                ref={messageBoxRef}
                            />
                            <label
                                htmlFor="file-share"
                                className="cursor-pointer"
                            >
                                <ImAttachment
                                    className={
                                        isReceivingFile
                                            ? "text-[rgba(0,0,0,.6)] text-2xl"
                                            : "text-2xl"
                                    }
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
