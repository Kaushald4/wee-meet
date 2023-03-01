import { weMeetApi } from "../weMeetApi";

const signUpApi = weMeetApi.injectEndpoints({
    endpoints: (build) => ({
        signUp: build.mutation({
            query: (data) => ({
                url: "/signup",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

        login: build.mutation({
            query: (data) => ({
                url: "/login",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

        getLoggedInUser: build.query({
            query: (data) => ({
                url: "/auth/user",
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useSignUpMutation, useLoginMutation, useGetLoggedInUserQuery } =
    signUpApi;
