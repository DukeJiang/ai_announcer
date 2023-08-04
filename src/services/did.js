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
                url: `talks/streams`,
                method: 'POST',
                body: {
                    source_url : avatar_url
                },
            })
        }),
        postNetworkInfo: builder.mutation({
            query: (params) =>({
                url: `talks/streams`,
                method: 'POST',
                body: {
                    source_url : avatar_url
                },
            })
        }),
        postTalkStream: builder.mutation({
            query: (params) =>({
                url: `talks/streams`,
                method: 'POST',
                body: {
                    source_url : avatar_url
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