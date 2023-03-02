import React from "react";
import { FiSend } from "react-icons/fi";
import { AiFillCloseCircle } from "react-icons/ai";
import moment from "moment";

const Chat = ({
    messages,
    sendMessage,
    currentUser,
    setMymessage,
    myMessage,
    setShowChat,
}) => {
    console.log(messages);
    return (
        <div className="h-[600px] w-[400px] bg-base-300 rounded-lg overflow-hidden">
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
            <div className="h-[450px] overflow-auto px-2 pt-4">
                {messages.map((message, i) => {
                    return (
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
                <div className="absolute top-[30%] cursor-pointer right-5">
                    <FiSend onClick={sendMessage} className="text-2xl" />
                </div>
            </div>
        </div>
    );
};

export default Chat;
