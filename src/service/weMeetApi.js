import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Define a service using a base URL and expected endpoints
export const weMeetApi = createApi({
    reducerPath: "wemeetApi",
    baseQuery: fetchBaseQuery({
        baseUrl:
            process.env.REACT_APP_MYENV === "development"
                ? process.env.REACT_APP_BACKEND_URL
                : process.env.REACT_APP_BACKEND_URL,
    }),
    endpoints: () => ({}),
});
