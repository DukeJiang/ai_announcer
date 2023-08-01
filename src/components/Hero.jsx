import React from "react";

import { logo } from "../assets";

const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>
      <nav className='flex justify-between items-center w-full mb-10 pt-3'>
        <img src={logo} alt='duke_logo' className='w-28 object-contain' />

        <button
          type='button'
          onClick={() =>
            window.open("https://github.com/DukeJiang/ai_voiceover", "_blank")
          }
          className='black_btn'
        >
          GitHub
        </button>
      </nav>

      <h1 className='head_text'>
      <span className='orange_gradient '>Duke's </span>
        AI Voiceover Tool <br className='max-md:hidden' />
      </h1>
      <h2 className='desc'>
        Choose a voice and input the text you want voiceovered below ⬇️
      </h2>
    </header>
  );
};

export default Hero;