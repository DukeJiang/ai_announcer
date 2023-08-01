import React, { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetVoicesQuery, usePostTextMutation } from "../services/article";

const Demo = () => {
  const [selectedVoice, setSelectedVoice] = useState("en-US-1");
  const [allVoices, setAllVoices] = useState([]);
  const [article, setArticle] = useState({
    voice_code: "en-US-1",
    text: "",
    audio_url: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");

  // RTK lazy query
  //const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();
  const [getVoices, { isFetching }] = useLazyGetVoicesQuery();
  const [postText, { error, isLoading }] = usePostTextMutation();


  // Load data from localStorage on mount
  useEffect(() => {
    // console.log("Executing useEffect")
    (async () =>{ // immediatly execute async function
      //load voices
      const { data } = await getVoices();
      // console.log(data)
      if(data.voices){
        // console.log(data.voices);
        setAllVoices(data.voices);
      }
    })();


    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingArticle = allArticles.find(
      (item) => item.text === article.text && item.voice_code === article.voice_code
    );

    if (existingArticle) return setArticle(existingArticle);

    const { data } = await postText({ voice_code: article.voice_code, text: article.text });
    // const { voices_data } = await getVoices();
    // if( voices_data?.voices ){
    //   console.log(voices_data)
    // }
    if (data?.result.audio_url) {
      const newArticle = { ...article, audio_url: data.result.audio_url };
      const updatedAllArticles = [newArticle, ...allArticles];

      // update state and local storage
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  // copy the url and toggle the icon for user feedback
  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  return (
    <div>
      <section>
        {/* Display Audio */}
        <div className='my-10 max-w-full flex justify-center items-center'>
          {isLoading ? (
            <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
          ) : error ? (
            <p className='font-inter font-bold text-black text-center'>
              Well, that wasn't supposed to happen...
              <br />
              <span className='font-satoshi font-normal text-gray-700'>
                {error?.data?.error}
              </span>
            </p>
          ) : (
            article.audio_url && (
              <div className='flex flex-col gap-3'>
                <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                  <span className='blue_gradient'>AUDIO CLIP</span>
                </h2>
                <div className='summary_box'>
                  {/* <p className='font-inter font-medium text-sm text-gray-700'>
                    {article.audio_url}
                  </p> */}
                  <div className='flex justify-center items-center'>
                    <audio controls key={article.audio_url}>
                      <source src={article.audio_url} type='audio/mp3'/>
                    </audio>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className='mt-16 w-full max-w-xl'>
        {/* All voices */}
        <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                  <span className='blue_gradient'>ALL VOICES</span>
        </h2>
        {/* <div className='flex flex-wrap gap-1 max-h-10 overflow-y-auto'>
          {allVoices.map((item, index) => (
            <div
              key={`voice-${index}`}
              onClick={() => {
                console.log(item)
                setSelectedVoice(item.voice_code);
                setArticle({...article, voice_code : item.voice_code})
                console.log(article)
              }}
              className={`voice_card ${selectedVoice === item.voice_code ? 'highlighted' : ''}`}
            >
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.voice_code}
              </p>
            </div>
          ))}
        </div> */}
        <select
          value = {selectedVoice}
          onChange={(event) => {
            setSelectedVoice(event.target.value);
            setArticle({...article, voice_code: event.target.value})
          }}
          className="voice_dropdown">
          
              
          <option value="">Select a voice</option>
          {allVoices.map((item, index) => (
            <option key={`voice-${index}`} value={item.voice_code}>
              {item.voice_code}
            </option>
          ))}

        </select>
      </section>

      <section className='mt-16 w-full max-w-xl'>

        {/* Search */}
        <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                  <span className='blue_gradient'>INPUT YOUR SCRIPT</span>
        </h2>
        <div className='flex flex-col w-full gap-2'>
          <form
            className='relative flex justify-center items-center'
            onSubmit={handleSubmit}
          >
            <div className='relative flex items-center'>
              <input
                type='text'
                placeholder='Paste the text you want voiceovered'
                value={article.text}
                onChange={(e) => setArticle({ ...article, text: e.target.value })}
                onKeyDown={handleKeyDown}
                required
                className='url_input peer' // When you need to style an element based on the state of a sibling element, mark the sibling with the peer class, and use peer-* modifiers to style the target element
              />
              <button
                type='submit'
                className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700 '
              >↵</button>
            </div>
          </form>
        </div>

        {/* Browse History */}
        <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                  <span className='blue_gradient'>HISTORY</span>
        </h2>
        <div className='flex flex-col gap-1 max-h-10 overflow-y-auto'>
          {allArticles.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => {
                console.log(item)
                setArticle(item)
                console.log(article)
              }}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleCopy(item.text)}>
                <img
                  src={copied === item.text ? tick : copy}
                  alt={copied === item.text ? "tick_icon" : "copy_icon"}
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text}
              </p>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
};

export default Demo;