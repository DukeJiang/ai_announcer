import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

//const Ali_Endpoint = import.meta.env.VITE_ALI2D_HOST;
const Ali_Endpoint = 'ai-avatar-express.azurewebsites.net';

export const ali2dAPI = createApi({
    reducerPath: 'ali2dAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://' + Ali_Endpoint,
        prepareHeaders: (headers) => {
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getVideo: builder.query({
            query: (params) => `ali2d?taskUuid=${params.taskUuid}`,
        }),
        postVideo: builder.mutation({
            query: (params) => ({
                url: `ali2d`,
                method: 'POST',
                body: {
                  "title": params.title,
                  "text": params.text,
                },
            })
        })
    }),
})

export const { useLazyGetVideoQuery, usePostVideoMutation } = ali2dAPI

