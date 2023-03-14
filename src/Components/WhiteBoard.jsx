import React from "react";

const WhiteBoard = ({ id }) => {
    return (
        <div className="w-full h-full">
            <iframe
                width={"100%"}
                height={"85%"}
                src={`https://witeboard.com/${id}`}
            ></iframe>
        </div>
    );
};

export default WhiteBoard;
