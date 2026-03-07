import React, { useState, useEffect } from "react";
import { Star, RotateCw } from "lucide-react";

const Flashcard = ({ card, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card._id, card.question]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar(card._id);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[450px] sm:h-[500px] cursor-pointer group perspective-1000" onClick={handleFlip}>
      {/* 3D Flip Container */}
      <div
        className="w-full h-full relative preserve-3d transition-transform duration-700 ease-out"
        style={{ transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)' }}
      >

        {/* FRONT FACE (QUESTION) */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col p-10 backface-hidden">

          <div className="flex justify-between items-start w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              QUESTION
            </div>

            <button
              type="button"
              onClick={handleStarClick}
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Star size={20} className={card.starred ? "text-amber-500 fill-amber-500" : ""} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-4 md:px-12">
            <h3 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {card.question}
            </h3>
          </div>

          <div className="flex items-center justify-center text-slate-400 text-sm font-medium gap-2 pb-2">
            <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* BACK FACE (ANSWER) */}
        <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-[#1f232b] border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col p-10 backface-hidden"
          style={{ transform: 'rotateX(180deg)' }}>

          <div className="flex justify-between items-start w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              ANSWER
            </div>

            <button
              type="button"
              onClick={handleStarClick}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 bg-white dark:bg-[#232734] transition-all"
            >
              <Star size={20} className={card.starred ? "text-amber-500 fill-amber-500" : ""} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-12 overflow-y-auto">
            <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 shrink-0"></div>
            <p className="text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {card.answer}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;