import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../../assets";
import { useLazyGetVideoQuery, usePostVideoMutation } from "../../services/ali2d";


const Ali2d = () => {

  var textInput;

  const [article, setArticle] = useState({});
  const [submitText, setSubmitText] = useState();
  const [allArticles, setAllArticles] = useState([]);

  // RTK Query
  const [getVideo] = useLazyGetVideoQuery();
  const [postVideo, { error, isLoading }] = usePostVideoMutation();

  // initial mount
  useEffect(() => {
    
  }, []);
  
  // state change on 'submitted'
  useEffect(() => {
    console.log("current article updated");
    return () => {

    };
  }, [article]);

  useEffect(() => {
    console.log("submit text updated");
    let current = new Date();
    checkTaskStatus("76ecb3e0-9456-4418-9284-515f972f5eab").then(result => {
      console.log(result);
    });
    
    return () => {

    };
  }, [submitText]);

  const handleSubmit = async (e) => {
    e.preventDefault();   
    
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };
  

  const submmitTask = async (text) => {
    
  }

  const checkTaskStatus = async (uuid) => {
    console.log(article.taskUuid);
    try {
      const { data } = await getVideo({ taskUuid: uuid });
      return data.body.data;
    } catch (error) {
      console.log("API call failed:", error);
    }
  }

  return (
    <div>
        {/* head */}
        <header className='w-full flex justify-center items-center flex-col'>
        <h1 className='head_text'>
        <span className='orange_gradient '>WBG </span>
            AI Announcer <br className='max-md:hidden' />
        </h1>
        <h2 className='desc'>
            Ali Digital Human API
        </h2>
        <h2 className='desc'>
            Choose input text below ⬇️
        </h2>
        </header>

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
                    //value={article.input_text}
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

        {/* history */}
        <div>

        </div>
    </div>
    
  );
};

export default Ali2d;