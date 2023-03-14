import React from "react";

const CodeShare = ({ id }) => {
    return (
        <div className="w-full h-full">
            <iframe
                width={"100%"}
                height={"85%"}
                src={`https://codeshare.io/${id}`}
            ></iframe>
        </div>
    );
};

export default CodeShare;
