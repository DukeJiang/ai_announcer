import { configureStore } from "@reduxjs/toolkit";

import { announcerApi } from "./announce";
import { didApi } from "./did";
import { ali2dAPI } from "./ali2d"

export const store = configureStore({
    reducer: {
        [announcerApi.reducerPath]: announcerApi.reducer,
        [didApi.reducerPath]: didApi.reducer,
        [ali2dAPI.reducerPath]: ali2dAPI.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
                                                .concat(announcerApi.middleware)
                                                .concat(didApi.middleware)
                                                .concat(ali2dAPI.middleware),
})