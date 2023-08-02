import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../../assets";

import avatar20220130, * as $avatar20220130 from '@alicloud/avatar20220130';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';

const Ali2d = () => {

  const localNames = {
    article: 'aliArticle'
  };
  const [article, setArticle] = useState({});
  const [allArticles, setAllArticles] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // initial mount
  useEffect(() => {
    const localArticle = JSON.stringify(localStorage.getItem(localNames['article']));
    if (localArticle) {

    }
  }, []);
  
  // state change on 'submitted'
  useEffect(() => {

    return () => {

    };
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('submitting request')

    
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

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
                    value={info.article.input_text}
                    onChange={(e) => setInfo({ 
                        ...info, article: {...article, text: e.target.value}
                    })}
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