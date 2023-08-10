import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../../assets";
import { useLazyGetVideoQuery, usePostVideoMutation } from "../../services/ali2d";


const Ali2d = () => {

  var textInput;

  const [article, setArticle] = useState({});
  const [message, setMessage] = useState("");

  // RTK Query
  const [getVideo] = useLazyGetVideoQuery();
  const [postVideo, { error, isLoading }] = usePostVideoMutation();
  
  // Events are driven by current working article update
  useEffect(() => {
    console.log("current article updated");
    console.log(article);
    if (article.taskUuid) {
      if (!article.url) {
        setMessage("Successfully sent request");
        console.log("setting up check timer");
        const interval = setInterval(() => {
          setMessage("");
          checkTaskStatus(article).then(result => {
            if (result) {
              console.log("clearing check timer");
              clearInterval(interval); 
            };
          });
        }, 10000);
      } 
      return;
    }
    console.log("new task received, submitting request")
    submmitTask(article).then(result => {
      console.log(result);
      if (result && result.taskUuid) {
        console.log("new task id received: " + result.taskUuid);  
        setArticle({...article, taskUuid: result.taskUuid})
      } else {
        console.log("Error when requesting Ali 2D video");
      }
    }).catch(e => {
      console.log("Error when requesting Ali 2D video");
    });
  }, [article]);

  /**
   * Create current working article
   */
  const handleSubmit = async (e) => {
    e.preventDefault();   
    console.log("requesting new task")
    if (!textInput){
      console.log("ignoring invalid input")
      return;
    }
    let current = new Date();
    setArticle({
      title: current.toLocaleString(),
      text: textInput,
      taskUuid: "",
    })
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };
  

  const submmitTask = async (article) => {
    if (!article || !article.text) return;
    console.log("posting: " + article.text);
    setMessage("Sending render request...")
    try {
      const { data } = await postVideo({
        title: article.title,
        text: article.text,
      });
      return data.body.data;
    } catch (error) {
      console.log("API call failed:", error);
      setMessage("Failed sending render request")
    }
  }

  const checkTaskStatus = async (article) => {
    if (!article || !article.taskUuid) return;
    if (article.url) return;
    console.log("checking status: " + article.taskUuid);
    try {
      const { data } = await getVideo({ taskUuid: article.taskUuid });
      let videoUrl = data.body.data.taskResult.videoUrl;
      if (videoUrl) {
        setArticle({...article, url: videoUrl});
        return videoUrl;
      }
    } catch (error) {
      console.log("API call failed:", error);
    }
  }

  const handleResult = (result) => {
    
  }

  return (
    <div>
        {/* head */}
        <header className='w-full flex justify-center items-center flex-col'>

        <h2 className='head_text'>
            Ali Digital Human API
        </h2>
        <h2 className='desc'>
            Choose input text below ⬇️
        </h2>
        </header>

        {/* Display Video */}
        <div className='my-10 max-w-full flex justify-center items-center'>
          {article.taskUuid ? (
            article.url ? (
              article.url && (
                <div className='flex flex-col gap-3'>
                  <h2 className='font-satoshi font-bold text-gray-600 text-xl'>
                    <span className='blue_gradient'>VIDEO CLIP</span>
                  </h2>
                  <div className='summary_box'>
                    <div className='flex justify-center items-center'>
                      <video controls key={article.url} width='400' height='300'>
                        <source src={article.url} type='video/mp4' />
                      </video>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
            )
          ) : (
            <div />
          )}
        </div>

        {/* text input */}
        <div>
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
                    onChange={(e) => textInput = e.target.value}
                    onKeyDown={handleKeyDown}
                    required
                    className='url_input peer'
                />
                <button
                    type='submit'
                    className='submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700 '
                >↵</button>
                </div> 
            </form>
            </div>
        </div>

        {/* System messgae */}
        <div><h3>{message}</h3></div>
    </div>
    
  );
};

export default Ali2d;