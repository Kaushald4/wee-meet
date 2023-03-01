import { weMeetApi } from "../weMeetApi";

const signUpApi = weMeetApi.injectEndpoints({
    endpoints: (build) => ({
        signUp: build.mutation({
            query: (data) => ({
                url: "/signup",
                method: "POST",
                body: data,
            }),
        }),

        login: build.mutation({
            query: (data) => ({
                url: "/login",
                method: "POST",
                body: data,
            }),
        }),

        getLoggedInUser: build.query({
            query: (data) => ({
                url: "/auth/user",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useSignUpMutation, useLoginMutation, useGetLoggedInUserQuery } =
    signUpApi;
