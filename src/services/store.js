import { configureStore } from "@reduxjs/toolkit";

import { announcerApi } from "./announce";
import { didApi } from "./did";

export const store = configureStore({
    reducer: {
        [announcerApi.reducerPath]: announcerApi.reducer,
        [didApi.reducerPath]: didApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
                                                .concat(announcerApi.middleware)
                                                .concat(didApi.middleware),
})