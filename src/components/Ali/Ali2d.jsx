import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../../assets";
import { useLazyGetVideoQuery, usePostVideoMutation } from "../../services/ali2d";


const Ali2d = () => {

  const ALI_STATUS_CODES =  {
    "1":"等待执行", 
    "2": "执行中",
    "3": "成功",
    "4": "失败",
    "5": "已取消",
    "6": "已过期",
  }

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
      if (!article.url && article.loading) {
        setMessage("Successfully sent request");
        console.log("setting up check timer");
        let retry = 0;
        const interval = setInterval(() => {
          retry++;
          setMessage(`Checking status(${retry})...`);
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
      let uuid = result.data.taskUuid
      if (uuid) {
        console.log("new task id received: " + uuid);  
        setArticle({...article, taskUuid: uuid, loading: true})
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
      loading: false,
    })
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };
  
  /**
   * Submit new task
   * @param {*} article 
   */
  const submmitTask = async (article) => {
    if (!article || !article.text) return;
    console.log("posting: " + article.text);
    setMessage("Sending render request...")
    try {
      const { data } = await postVideo({
        title: article.title,
        text: article.text,
      });
      return handleSubmitStatus(data);
    } catch (error) {
      console.log("API call failed:", error);
      setMessage("Failed sending render request")
    }
  };

  /**
   * Query task current status
   * @param {*} article 
   */
  const checkTaskStatus = async (article) => {
    if (!article || !article.taskUuid) return;
    if (article.url) return;
    console.log("checking status: " + article.taskUuid);
    try {
      const { data } = await getVideo({ taskUuid: article.taskUuid });
      return handleTaskStatus(data);
    } catch (error) {
      console.log("API call failed:", error);
    }
  };

  /**
   * Handle server response for task creation
   * @param {*} data 
   */
  const handleSubmitStatus = (data) => {
    let result = data.body;
    if (result) {
      let submitSussess = result['success'];
      let submitDesc = result['message'];
      if (submitSussess) {
        return result;
      } else {
        setMessage(submitDesc);
      }
    }
  }

  /**
   * Handle server response for task status query
   * @param {*} data
   */
  const handleTaskStatus = (data) => {
    let current = new Date();
    let result = data.body.data;
    let ifStop = false
    if (result) {
      let statusCode = result['status'];
      let statusDesc = result['taskResult'];
      let resultStr = ALI_STATUS_CODES[statusCode];
      switch (statusCode) {
        case '1':
        case '2':
          break;
        case '3':
          ifStop = true;
          resultStr += "\n"
          resultStr += `视频: ${statusDesc['videoUrl']}` + "\n";
          resultStr += `字幕: ${statusDesc['subtitlesUrl']}` + "\n";
          setArticle({...article, url: statusDesc['videoUrl'], loading: false});
          break;
        case '4':
          ifStop = true;
          resultStr += ` ${statusDesc['failReason']}`
          setArticle({...article, loading: false});;
          break;
        case '5':
        case '6':
          ifStop = true;
          setArticle({...article, loading: false});;
          break;
      }
      setMessage(`${current.toTimeString()} \n${resultStr}`);
    } else setMessage("Failed to check status");
    return ifStop;
  };

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
              article.loading ? (
                <img src={loader} alt='loader' className='w-20 h-20 object-contain' />
              ) : (
                <div />
              )
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
        <div style={{whiteSpace: "pre-line"}}>{message}</div>
    </div>
    
  );
};

export default Ali2d;