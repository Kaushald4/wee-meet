import React, { useEffect, useState } from "react";
import { useGetLoggedInUserQuery } from "../service/user/userService";
import Header from "../Components/Header";
import {
    useCreateMeetingMutation,
    useLazyGetMeetingInfoQuery,
} from "../service/meeting/meetingService";
import { useNavigate } from "react-router-dom";
import MeetingSvg from "../assets/meeting-svg.svg";

const HomePage = () => {
    const [meetingCode, setMeetingCode] = useState("");

    const { data, error, isLoading } = useGetLoggedInUserQuery();
    const [createMeeting, result] = useCreateMeetingMutation();
    const navigate = useNavigate();
    const [getMeetingInfo, status] = useLazyGetMeetingInfoQuery();

    const handleCreateMeeting = () => {
        if (!data) {
            let ans = alert(
                "Please Login To create new Meeting Link. In the mean time if you have meeting code then you can join the meeting with meeting code"
            );
            console.log(ans);
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
            <div className="h-screen">
                <Header />
                <div className="flex h-[80vh] justify-between items-center px-[180px]">
                    <div className="max-w-[500px]">
                        <h1 className="text-4xl">Premium Video Meetings.</h1>
                        <h1 className="text-4xl mt-2 mb-8">
                            Now Free For everyone.
                        </h1>

                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit. Dolores impedit laudantium modi nihil placeat
                            quis rerum unde veniam veritatis voluptates?
                        </p>

                        <div className="max-w-[400px] mt-8">
                            <input
                                onChange={(e) => setMeetingCode(e.target.value)}
                                type="text"
                                placeholder="Meeting Code"
                                className="p-2 pl-5 w-full input input-bordered"
                            />
                            <button
                                onClick={handleJoinMeeting}
                                className="btn btn-primary w-full mt-4"
                            >
                                Join Meeting
                            </button>
                            <button
                                onClick={handleCreateMeeting}
                                className="btn btn-primary btn-outline w-full mt-2"
                            >
                                New Meeting
                            </button>
                        </div>
                    </div>

                    <div>
                        <img src={MeetingSvg} alt="me" />
                        <div className="text-center mt-4">
                            <p className="text-2xl">
                                Get a link that you can share.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
