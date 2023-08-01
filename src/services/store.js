import { configureStore } from "@reduxjs/toolkit";

import { voiceoverApi } from "./article";

export const store = configureStore({
    reducer: {
        [voiceoverApi.reducerPath]: voiceoverApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(voiceoverApi.middleware)
})