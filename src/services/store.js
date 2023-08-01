import { configureStore } from "@reduxjs/toolkit";

import { announcerApi } from "./announce";

export const store = configureStore({
    reducer: {
        [announcerApi.reducerPath]: announcerApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(announcerApi.middleware)
})