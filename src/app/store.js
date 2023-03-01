import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { weMeetApi } from "../service/weMeetApi";

export const store = configureStore({
    reducer: {
        [weMeetApi.reducerPath]: weMeetApi.reducer,
    },
    middleware: (gDM) => gDM().concat(weMeetApi.middleware),
});

setupListeners(store.dispatch);
