import React, { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetVoicesQuery, useLazyGetVideoQuery, usePostVideoMutation } from "../services/announce";

const Demo = () => {
  const [selectedVideo, setSelectedVideo] = useState({});
  const [selectedVoice, setSelectedVoice] = useState();
  const [allVoices, setAllVoices] = useState([]);
  const [article, setArticle] = useState({
    background: "#ffffff",
    avatar_id: "Tina-insuit-20220821",
    voice_id: "00c8fd447ad7480ab1785825978a2215",
    input_text: "",
    avatar_style: "normal",
    status: "none"
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");

  // *  RTK lazy query
  const [getVoices, { isFetching }] = useLazyGetVoicesQuery();
  const [getVideo] = useLazyGetVideoQuery();
  const [postVideo, { error, isLoading }] = usePostVideoMutation();


  // * Load data from localStorage on mount
  useEffect(() => {
    (async () => {
      console.log("Executing useEffect");
      try {
        // Load voices
        const { data } = await getVoices();
  
        if (data.data.list) {
          const chineseVoices = data.data.list.filter((voice) => voice.language === 'Chinese' && voice.gender === 'Female');
          console.log("Chinese voices:", chineseVoices);
  
          // Set the filtered voices in the state
          setAllVoices(chineseVoices);
          setSelectedVoice(chineseVoices[0].display_name)
        }
      } catch (error) {
        console.error("API call failed:", error);
      }
    })();


    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    );

    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
      checkArticleStatus(articlesFromLocalStorage);
    }

    // Call checkArticleStatus every 30 seconds
    const interval = setInterval(() => {
      console.log('Checking rendering status again')
      checkArticleStatus(allArticles);
    }, 10000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(interval);
      
  }, []);

  // * Function to check the status of articles with 'processing' status
  const checkArticleStatus = async (articles) => {
    for (const article of articles) {
      if ((article.status === "processing" || article.status === "none") && article.video_id) {
        try {
          const { data } = await getVideo({ video_id: article.video_id });

          if (data && data.data.status === "completed") {
            // If status has changed to 'completed', update the article's status
            const updatedArticle = { ...article, status: "completed", video_url: data.data.video_url };
            setAllArticles((prevArticles) =>
              prevArticles.map((prevArticle) =>
                prevArticle.id === updatedArticle.id ? updatedArticle : prevArticle
              )
            );
          }
        } catch (error) {
          console.log("API call failed:", error);
        }
      }
    }
  };

  // * Handle submit action PostVideo
  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingArticle = allArticles.find(
      (item) => item.input_text === article.input_text && item.voice_id === article.voice_id
    );

    if (existingArticle) return setArticle(existingArticle);

    const options = {
      background: article.background,
      avatar_id: article.avatar_id,
      voice_id: article.voice_id, 
      input_text: article.input_text,
      avatar_style: article.avatar_style
    }
    const { data } = await postVideo(options);

    if (data?.data.video_id) {
      console.log(`returned video id is ${data.data.video_id}`)
      const newArticle = { ...article, video_id: data.data.video_id };
      const updatedAllArticles = [newArticle, ...allArticles];

      // update state and local storage
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  // * select past script videos
  const handleSelection = (video_id) => {
    // Find the article in allArticles with the matching video_id
    const selectedArticle = allArticles.find((article) => article.video_id === video_id);

    // If a matching article is found, update the article state
    if (selectedArticle) {
      setArticle(selectedArticle);
      console.log(article)
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  // * Component rendering
  return (
    <div>
      <section>
        {/* Display Video */}
        <div className='my-10 max-w-full flex justify-center items-center'>
          {article.status === 'processing' ? (
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
            article.video_url && (
              <div className='flex flex-col gap-3'>
                <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                  <span className='blue_gradient'>VIDEO CLIP</span>
                </h2>
                <div className='summary_box'>
                  <div className='flex justify-center items-center'>
                    <video controls key={article.video_url} width='400' height='300'>
                      <source src={article.video_url} type='video/mp4' />
                    </video>
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
        <select
          value = {selectedVoice}
          onChange={(event) => {
            setSelectedVoice(event.target.value);
            setArticle({...article, voice_id: event.target.value})
            console.log(`Selected voice: ${event.target.value}`)
            console.log(allArticles)
          }}
          className="voice_dropdown">
          
              
          <option value="">Select a voice</option>
          {allVoices.map((item, index) => (
            <option key={`voice-${index}`} value={item.voice_id}>
              {item.display_name}
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
                value={article.input_text}
                onChange={(e) => setArticle({ ...article, input_text: e.target.value })}
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
                  <span className='blue_gradient'>RENDERINGS</span>
        </h2>
        <div className='flex flex-col gap-1 max-h-10 overflow-y-auto'>
          {allArticles.reverse().map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => {
                console.log(item)
                setArticle(item)
              }}
              className='link_card'
            >
              <div className='copy_btn' onClick={() => handleSelection(item.video_id)}>
                <img
                  src={copied === item.video_id ? tick : copy}
                  alt={copied === item.video_id ? "tick_icon" : "copy_icon"}
                  className='w-[40%] h-[40%] object-contain'
                />
              </div>
              <p className='flex-1 font-satoshi text-blue-700 font-medium text-sm truncate'>
                {item.input_text.length > 100 ? `${item.input_text.substring(0, 100)}...` : item.input_text}
              </p>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
};

export default Demo;