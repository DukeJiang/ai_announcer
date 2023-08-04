import React, { useState, useEffect, useRef } from 'react';
import { copy, linkIcon, loader, tick, idle } from "../assets";
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

    const [textInput, setTextInput] = useState('');
    //const [mediaStream, setMediaStream] = useState({srcObject : null, loop : false}); // Assuming you have access to the media stream
    //const [peerConnection, setPeerConnection] = useState(); // ? RPCPeerConnection object
    const [streamId, setStreamId] = useState(''); // ! needs to be useRef
    const [sessionId, setSessionId] = useState(''); // ! needs to be useRef
    const [sessionClientAnswer, setSessionClientAnswer] = useState(''); // ! needs to be useRef
    const [statsIntervalId, setStatsIntervalId] = useState(); // ! needs to be useRef
    const [videoIsPlaying, setVideoIsPlaying] = useState(false);
    const [lastBytesReceived, setLastBytesReceived] = useState(0);

    const peerConnection = useRef(null);
    const talkVideo = useRef(null); // ? ref to video dom element
    const peerStatusLabel = useRef(null); // ? ref to peerStatus dom element
    const iceStatusLabel = useRef(null); // ? ref to iceStatus dom element
    const iceGatheringStatusLabel = useRef(null); // ? ref to iceGatheringStatus dom element
    const signalingStatusLabel = useRef(null); // ? ref to signalingStatus dom element
    const streamingStatusLabel = useRef(null); // ? ref to streamingStatus dom element

    // * RTK Query
    const [postCreateStream, { error: createStreamError, isLoading: isCreateStreamLoading }] = usePostCreateStreamMutation();
    const [postStartStream, { error: startStreamError, isLoading: isStartStreamLoading }] = usePostStartStreamMutation();
    const [postNetworkInfo, { error: networkInfoError, isLoading: isNetworkInfoLoading}] = usePostNetworkInfoMutation();
    const [postTalkStream, { error: talkStreamError, isLoading: isTalkStreamLoading}] = usePostTalkStreamMutation();
    const [deleteStream] = useDeleteStreamMutation()

    // * useEffects
    // ? on mount, called once
    useEffect(() => {
        
    }, []);

    // // ? side effect for mediaStream state change
    // useEffect(() => {
    //     if (mediaStream && talkVideo.current) {
    //       talkVideo.current.srcObject = mediaStream;
    //     }
    // }, [mediaStream]);


    // * Event Handlers
    // TODO: done
    const handleTalk = async (e) => {
        e.preventDefault();
        console.log("handling talk");
        if (peerConnection.current?.signalingState === 'stable' || peerConnection.current?.iceConnectionState === 'connected'){
            const params = {
                stream_id : streamId,
                session_id : sessionId,
                driver_url : 'bank://lively',
                script: {
                    type: 'text',
                    subtitles: false,
                    provider: {
                        type: 'microsoft',
                        voice_id: 'en-US-JennyNeural',
                        voice_config: {style: 'string', rate: '0.5', pitch: '+2st'}
                    },
                    input: textInput // TODO: need to pass in user input
                }
            }
            const talkResponse = await postTalkStream(params)
        }
    };

    // TODO: fix sessionResponse bug
    const handleCreateStream = async (e) => {
        e.preventDefault();
        console.log("handling create stream");
        if (peerConnection.current && peerConnection.current.connectionState === 'connected'){
            return;
        }

        stopAllStreams();
        closePC();
        
        const createStreamParams = {}
        const { data } = await postCreateStream(createStreamParams);

        const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = data;
        console.log(`Session response newStreamId is : ${newStreamId}`);
        console.log(`Session response newSessionId is : ${newSessionId}`);
        //console.log(`Session response offer sdp is : ${offer['sdp']}`);
        console.log(`Session response first iceServerser is : ${iceServers[0]['urls']}`);
        setStreamId(newStreamId);
        setSessionId(newSessionId);

        try{
            const answer = await createPeerConnection(offer, iceServers);
            setSessionClientAnswer(answer);
        } catch (e){
            console.log('error during streaming setup', e);
            stopAllStreams();
            closePC();
            return;
        }

        const startStreamParams = {
            stream_id : streamId,
            session_id : sessionId,
            answer: sessionClientAnswer
        }
        const sdpResponse = await postStartStream(startStreamParams);
    };

    // TODO: done
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
        iceGatheringStatusLabel.innerText = peerConnection.current.iceGatheringState;
        iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.current.iceGatheringState;
    }

    function onIceCandidate(event) {
        console.log('onIceCandidate', event);
        if (event.candidate) {
            const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
            const params = {
                stream_id : streamId,
                candidate : candidate,
                sdpMid : sdpMid,
                sdpMLineIndex : sdpMLineIndex
            }
            const networkInfoResponse = postNetworkInfo(params);
        }
    }

    function onIceConnectionStateChange() {
        iceStatusLabel.current.innerText = peerConnection.current.iceConnectionState;
        iceStatusLabel.current.className = 'iceConnectionState-' + peerConnection.current.iceConnectionState;
        if (peerConnection.current.iceConnectionState === 'failed' || peerConnection.current.iceConnectionState === 'closed') {
        stopAllStreams();
        closePC();
        }
    }
    function onConnectionStateChange() {
        // not supported in firefox
        peerStatusLabel.current.innerText = peerConnection.current.connectionState;
        peerStatusLabel.current.className = 'peerConnectionState-' + peerConnection.current.connectionState;
    }
    function onSignalingStateChange() {
        signalingStatusLabel.current.innerText = peerConnection.current.signalingState;
        signalingStatusLabel.current.className = 'signalingState-' + peerConnection.current.signalingState;
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
    
        const intervalID = setInterval(async () => {
            const stats = await peerConnection.current.getStats(event.track);
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

    // * peerConnection related
    async function createPeerConnection(offer, iceServers){
        if (!peerConnection.current){
            console.log("creating rtc PeerConnection obj")
            peerConnection.current = new RTCPeerConnection({ iceServers });
            console.log(`peer connection rn is ${peerConnection}`);
            peerConnection.current.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
            peerConnection.current.addEventListener('icecandidate', onIceCandidate, true);
            peerConnection.current.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
            peerConnection.current.addEventListener('connectionstatechange', onConnectionStateChange, true);
            peerConnection.current.addEventListener('signalingstatechange', onSignalingStateChange, true);
            peerConnection.current.addEventListener('track', onTrack, true);
        }

        await peerConnection.current.setRemoteDescription(offer);
        console.log('set remote sdp OK');

        const sessionClientAnswer = await peerConnection.current.createAnswer();
        console.log('create local sdp OK');

        await peerConnection.current.setLocalDescription(sessionClientAnswer);
        console.log('set local sdp OK');

        return sessionClientAnswer;
    }

    // TODO: need to implement setVideoElement(stream)
    function setVideoElement(stream){
        if (!stream) return;
        talkVideo.srcObject = stream;
        talkVideo.loop = false;

        // safari hotfix
        if (talkVideo.paused){
            talkVideo
                .play()
                .then((_) => {})
                .catch((e) => {});
        }
    }

    // TODO: need to generate Rebecca's idle video
    // TODO: need to implement playIdleVideo
    function playIdleVideo(){
        talkVideo.srcObject = undefined;
        talkVideo.src = idle;
        talkVideo.loop = true;
    }

    function stopAllStreams() {
        if (talkVideo.srcObject) {
          console.log('stopping video streams');
          talkVideo.srcObject.getTracks().forEach((track) => track.stop());
          talkVideo.srcObject = null;
        }
    }

    function closePC(pc = peerConnection.current) {
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
        if (pc === peerConnection.current) {
          peerConnection.current = null;
        }
    }

    // * handle enter key
    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            handleTalk(e);
        }
    };


    // * Component rendering
    return (
        <div>
            <section>
                {/* Display Video */}
                <div className='my-10 max-w-full flex justify-center items-center'>
                {isCreateStreamLoading || isStartStreamLoading || isNetworkInfoLoading || isTalkStreamLoading ? (
                    <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
                ) : createStreamError || startStreamError || networkInfoError || talkStreamError ? (
                    <p className='font-inter font-bold text-black text-center'>
                    Well, that wasn't supposed to happen...
                    <br />
                    </p>
                ) : (
                    talkVideo.srcObject && (
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

            <section className='mt-16 w-full max-w-xl'>
                <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                    <span className='blue_gradient'>INPUT YOUR SCRIPT</span>
                </h2>
                <div className='flex flex-col w-full gap-2'>
                    <form
                        className='relative flex justify-center items-center'
                        onSubmit={handleTalk}
                    >
                        <div className='relative flex items-center'>
                        <input
                            type='text'
                            placeholder='Input Script'
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            required
                            className='url_input peer' // When you need to style an element based on the state of a sibling element, mark the sibling with the peer class, and use peer-* modifiers to style the target element
                        />
                        </div>
                    </form>
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