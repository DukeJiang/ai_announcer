import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const heygenApiKey = import.meta.env.VITE_HEYGEN_API_KEY;

export const announcerApi = createApi({
    reducerPath: 'announcerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api.heygen.com/v1/',
        prepareHeaders: (headers) => {
            headers.set('accept', 'application/json');
            headers.set('content-type', 'application/json');
            headers.set('x-api-key', heygenApiKey);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getVoices: builder.query({
            // encodeURIComponent() function encodes special characters that may be present in the parameter values
            // If we do not properly encode these characters, they can be misinterpreted by the server and cause errors or unexpected behavior. Thus that RTK bug
            query: () => `voice.list`,
        }),
        getVideo: builder.query({
            query: (params) => `video_status.get?video_id=${params.video_id}`,
        }),
        postVideo: builder.mutation({
            query: (params) => ({
                url: `video.generate`,
                method: 'POST',
                body: {
                    background: params.background,
                    clips:[
                        {
                            avatar_id: params.avatar_id,
                            avatar_style: params.avatar_style,
                            caption: false,
                            input_text: params.input_text,
                            offset: {x: 0, y: 0},
                            scale: 1,
                            voice_id: params.voice_id,
                        }
                    ],
                    ratio: '9:16',
                    test: false,
                    version: 'v1alpha',
                    callback_id: 'string'
                },
            })
        })
    }),
})

export const { useLazyGetVoicesQuery, useLazyGetVideoQuery, usePostVideoMutation } = announcerApi

