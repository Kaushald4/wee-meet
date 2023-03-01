import React, { useEffect, useState } from "react";
import { useGetLoggedInUserQuery } from "../service/user/userService";
import Header from "../Components/Header";
import {
    useCreateMeetingMutation,
    useLazyGetMeetingInfoQuery,
} from "../service/meeting/meetingService";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const [meetingCode, setMeetingCode] = useState("");

    const { data, error, isLoading } = useGetLoggedInUserQuery();
    const [createMeeting, result] = useCreateMeetingMutation();
    const navigate = useNavigate();
    const [getMeetingInfo, status] = useLazyGetMeetingInfoQuery();

    const handleCreateMeeting = () => {
        if (!data) {
            return;
        }
        createMeeting()
            .unwrap()
            .then(({ data }) => {
                if (data) {
                    navigate(`/we/${data.meetingCode}`);
                }
            });
    };

    const handleJoinMeeting = async () => {
        getMeetingInfo({ meetingCode })
            .unwrap()
            .then(({ data }) => {
                console.log(data);
                if (data) {
                    navigate(`/we/${data.meetingCode}`);
                }
            });
    };

    return (
        <div>
            <Header />
            <div className="card">
                <div className="card-body">
                    <input
                        onChange={(e) => setMeetingCode(e.target.value)}
                        value={meetingCode}
                        className="input input-bordered p-2"
                        placeholder="Meeting Code"
                    />
                    <button onClick={handleJoinMeeting} className="btn">
                        Join
                    </button>
                    <button
                        onClick={handleCreateMeeting}
                        className="btn btn-outline"
                    >
                        Create New Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
