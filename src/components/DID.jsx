import React, { useState, useEffect, useRef } from 'react';

import {usePostCreateStreamMutation, 
    usePostStartStreamMutation,
    usePostNetworkInfoMutation,
    usePostTalkStreamMutation,
    useDeleteStreamMutation} from "../services/did";
  


const DID = () => {
    const RTCPeerConnection = (
        window.RTCPeerConnection ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection
      ).bind(window);

    const [mediaStream, setMediaStream] = useState(null); // Assuming you have access to the media stream
    const [peerConnection, setPeerConnection] = useState(null); // ? RPCPeerConnection object
    const [streamId, setStreamId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [sessionClientAnswer, setSessionClientAnswer] = useState('');
    const [statsIntervalId, setStatsIntervalId] = useState(null);
    const [videoIsPlaying, setVideoIsPlaying] = useState(false);
    const [lastBytesReceived, setLastBytesReceived] = useState(0);

    const talkVideo = React.useRef(null);
    const peerStatusLabel = React.useRef(null);
    const iceStatusLabel = React.useRef(null);
    const iceGatheringStatusLabel = React.useRef(null);
    const signalingStatusLabel = React.useRef(null);
    const streamingStatusLabel = React.useRef(null);

    // * RTK Query
    const [postCreateStream, { error: createStreamError, isLoading: isCreateStreamLoading }] = usePostCreateStreamMutation();
    const [postStartStream, { error: startStreamError, isLoading: isStartStreamLoading }] = usePostStartStreamMutation();
    const [postNetworkInfo, { error: networkInfoError, isLoading: isNetworkInfoLoading}] = usePostNetworkInfoMutation();
    const [postTalkStream, { error: talkStreamError, isLoading: isTalkStreamLoading}] = usePostTalkStreamMutation();
    const [deleteStream] = useDeleteStreamMutation()

    // * useEffects
    useEffect(() => {
        
    }, []);

    useEffect(() => {
        if (mediaStream && talkVideo.current) {
          talkVideo.current.srcObject = mediaStream;
        }
    }, [mediaStream]);


    // * Event Handlers
    const handleTalk = async (e) => {
        console.log("handling talk")
    };

    const handleCreateStream = async (e) => {
        e.preventDefault();
        console.log("handling create stream")
    };

    const handleDeleteStream = async (e) => {
        e.preventDefault();
        console.log("handling closing stream")
        
        const params = {
            stream_id : streamId,
            session_id : sessionId
        }
        const { data } = await deleteStream(params);

        stopAllStreams();
        closePC();
    };

    // * event handlers, handle sdp and ice
    function onIceGatheringStateChange() {
        iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
        iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
    }
    function onIceCandidate(event) {
        console.log('onIceCandidate', event);
        if (event.candidate) {
        const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
    
        fetch(`${DID_API.url}/talks/streams/${streamId}/ice`, {
            method: 'POST',
            headers: {
            Authorization: `Basic ${DID_API.key}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            candidate,
            sdpMid,
            sdpMLineIndex,
            session_id: sessionId,
            }),
        });
        }
    }
    function onIceConnectionStateChange() {
        iceStatusLabel.current.innerText = peerConnection.iceConnectionState;
        iceStatusLabel.current.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
        if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
        stopAllStreams();
        closePC();
        }
    }
    function onConnectionStateChange() {
        // not supported in firefox
        peerStatusLabel.current.innerText = peerConnection.connectionState;
        peerStatusLabel.current.className = 'peerConnectionState-' + peerConnection.connectionState;
    }
    function onSignalingStateChange() {
        signalingStatusLabel.current.innerText = peerConnection.signalingState;
        signalingStatusLabel.current.className = 'signalingState-' + peerConnection.signalingState;
    }
    
    function onVideoStatusChange(videoIsPlaying, stream) {
        let status;
        if (videoIsPlaying) {
        status = 'streaming';
        const remoteStream = stream;
        setVideoElement(remoteStream);
        } else {
        status = 'empty';
        playIdleVideo();
        }
        streamingStatusLabel.current.innerText = status;
        streamingStatusLabel.current.className = 'streamingState-' + status;
    }
    
    function onTrack(event) {
        /**
         * The following code is designed to provide information about wether currently there is data
         * that's being streamed - It does so by periodically looking for changes in total stream data size
         *
         * This information in our case is used in order to show idle video while no talk is streaming.
         */
    
        if (!event.track) return;
    
        intervalID = setInterval(async () => {
            const stats = await peerConnection.getStats(event.track);
            stats.forEach((report) => {
                if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;
        
                if (videoStatusChanged) {
                    setVideoIsPlaying(report.bytesReceived > lastBytesReceived);
                    onVideoStatusChange(videoIsPlaying, event.streams[0]);
                }
                setLastBytesReceived(report.bytesReceived);
                }
            });
        }, 500);
        setStatsIntervalId(intervalID)
    }


    function stopAllStreams() {
        if (mediaStream.srcObject) {
          console.log('stopping video streams');
          mediaStream.srcObject.getTracks().forEach((track) => track.stop());
          mediaStream.srcObject = null;
        }
    }

    function closePC(pc = peerConnection) {
        if (!pc) return;
        console.log('stopping peer connection');
        pc.close();
        pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
        pc.removeEventListener('icecandidate', onIceCandidate, true);
        pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
        pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
        pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
        pc.removeEventListener('track', onTrack, true);
        clearInterval(statsIntervalId);
        iceGatheringStatusLabel.current.innerText = '';
        signalingStatusLabel.current.innerText = '';
        iceStatusLabel.current.innerText = '';
        peerStatusLabel.current.innerText = '';
        console.log('stopped peer connection');
        if (pc === peerConnection) {
          peerConnection = null;
        }
    }


    // * Component rendering
    return (
        <div>
            <section>
                {/* Display Video */}
                <div className='my-10 max-w-full flex justify-center items-center'>
                {isCreateStreamLoading || isStartStreamLoading || isNetworkInfoLoading ? (
                    <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
                ) : createStreamError || startStreamError || networkInfoError ? (
                    <p className='font-inter font-bold text-black text-center'>
                    Well, that wasn't supposed to happen...
                    <br />
                    </p>
                ) : (
                    mediaStream && (
                    <div className='flex flex-col gap-3'>
                        <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                        <span className='blue_gradient'>VIDEO CLIP</span>
                        </h2>
                        <div className='summary_box'>
                        <div className='flex justify-center items-center'>
                            <video ref={talkVideo} controls width='400' height='400' autoPlay playsInline />
                        </div>
                        </div>
                    </div>
                    )
                )}
                </div>
            </section>

            <section>
                <button id="talk-button" type="button" onClick={handleTalk}
                    style={{
                        backgroundColor: "#3490dc",
                        color: "#ffffff",
                        padding: "10px 20px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        outline: "none",
                        border: "none",
                      }}>Speak</button>
            </section>

            <section>
                {/* <!-- added div#buttons --> */}
                <div id="buttons">
                    <button id="connect-button" type="button" onClick={handleCreateStream}>Connect</button><br />
                    <button id="destroy-button" type="button" onClick={handleDeleteStream}>Disconnect</button>
                </div>

                {/* <!-- added div#status --> */}
                <div id="status">
                    {/* <!-- removed the wrapping <div> tags --> */}
                    ICE gathering status: <label ref={iceGatheringStatusLabel}></label
                    ><br />
                    ICE status: <label ref={iceStatusLabel}></label><br />
                    Peer connection status: <label ref={peerStatusLabel}></label><br />
                    Signaling status: <label ref={signalingStatusLabel}></label><br />
                    Streaming status: <label ref={streamingStatusLabel}></label><br />
                </div>
            </section>
        </div>
    )
}

export default DID;