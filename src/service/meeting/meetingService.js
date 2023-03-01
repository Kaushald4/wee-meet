import { weMeetApi } from "../weMeetApi";

const meetingApi = weMeetApi.injectEndpoints({
    endpoints: (build) => ({
        createMeeting: build.mutation({
            query: (data) => ({
                url: "/meeting",
                method: "POST",
                body: data,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),

        getMeetingInfo: build.query({
            query: (data) => ({
                url: "/meeting/info",
                method: "POST",
                body: data,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),
    }),
});

export const {
    useCreateMeetingMutation,
    useGetMeetingInfoQuery,
    useLazyGetMeetingInfoQuery,
} = meetingApi;
