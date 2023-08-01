import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rapidApiKey = import.meta.env.VITE_RAPID_API_ARTICLE_KEY;

export const voiceoverApi = createApi({
    reducerPath: 'voiceoverApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://cloudlabs-text-to-speech.p.rapidapi.com/',
        prepareHeaders: (headers) => {
            headers.set('content-type', 'application/x-www-form-urlencoded');
            headers.set('X-RapidAPI-Key', rapidApiKey);
            headers.set('X-RapidAPI-Host', 'cloudlabs-text-to-speech.p.rapidapi.com');

            return headers;
        },
    }),
    endpoints: (builder) => ({
        getVoices: builder.query({
            // encodeURIComponent() function encodes special characters that may be present in the parameter values
            // If we do not properly encode these characters, they can be misinterpreted by the server and cause errors or unexpected behavior. Thus that RTK bug
            query: () => `voices?language_code=en-US`,
        }),
        postText: builder.mutation({
            query: (params) => ({
                url: `synthesize`,
                method: 'POST',
                body: new URLSearchParams({
                    voice_code: params.voice_code,
                    text: params.text
                }).toString(),
            })
        })
    }),
})

export const { useLazyGetVoicesQuery, usePostTextMutation } = voiceoverApi