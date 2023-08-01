import React from "react";

import { logo } from "../assets";

const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>

      <h1 className='head_text'>
      <span className='orange_gradient '>WBG </span>
        AI Announcer <br className='max-md:hidden' />
      </h1>
      <h2 className='desc'>
        Choose a voice and input text below ⬇️
      </h2>
    </header>
  );
};

export default Hero;