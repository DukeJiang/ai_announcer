import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const didApiKey = import.meta.env.VITE_DID_API_KEY;
const avatar_url = 'https://i.postimg.cc/G3M81Pdc/90-scaled.jpg'

export const didApi = createApi({
    reducerPath: 'didApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api.d-id.com/',
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            headers.set('Authorization', `Basic ${didApiKey}`);
            return headers;
        },
    }),
    endpoints: (builder) => ({
        postCreateStream: builder.mutation({
            query: (params) =>({
                url: `talks/streams`,
                method: 'POST',
                body: {
                    source_url : avatar_url
                },
            })
        }),
        postStartStream: builder.mutation({
            query: (params) =>({
                url: `talks/streams/${params.stream_id}/sdp`,
                method: 'POST',
                body: { // TODO : map request body
                    session_id : params.session_id,
                    answer : params.answer
                },
            })
        }),
        postNetworkInfo: builder.mutation({
            query: (params) =>({
                url: `talks/streams/${params.stream_id}/ice`,
                method: 'POST',
                body: { // TODO : map request body
                    session_id : params.session_id,
                    candidate : params.candidate,
                    sdpMid : params.sdpMid,
                    sdpMLineIndex : params.sdpMLineIndex
                },
            })
        }),
        postTalkStream: builder.mutation({
            query: (params) =>({
                url: `talks/streams/${params.stream_id}`,
                method: 'POST',
                body: {
                    session_id: params.session_id,
                    driver_url: params.driver_url,
                    script: params.script
                },
            })
        }),
        deleteStream: builder.mutation({
            query: (params) =>({
                url: `talks/streams/${params.stream_id}`,
                method: 'DELETE',
                body: {
                    session_id: params.session_id
                },
            })
        })
    }),
})

export const {usePostCreateStreamMutation, 
                usePostStartStreamMutation,
                usePostNetworkInfoMutation,
                usePostTalkStreamMutation,
                useDeleteStreamMutation} = didApi