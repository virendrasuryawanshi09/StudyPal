import React, { useState, useEffect } from "react";
import { Star, RotateCw } from "lucide-react";

const Flashcard = ({ card, onToggleStar }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Reset revealed state when card changes
  useEffect(() => {
    setIsRevealed(false);
  }, [card._id, card.question]);

  // Keyboard listener for Spacebar to reveal answer locally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) setIsRevealed(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed]);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar(card._id);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Label and Actions */}
      <div className="flex justify-between items-center mb-6 px-2">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Flashcard Topic
        </span>
        <button
          onClick={handleStarClick}
          className="text-slate-400 hover:text-amber-500 transition-colors p-2 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Star size={20} className={card.starred ? "text-amber-500 fill-amber-500" : ""} />
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-10 min-h-[360px] flex flex-col items-center justify-center text-center transition-all duration-300">

        {/* Question Area */}
        <div className="w-full flex-shrink-0 animate-in fade-in duration-500">
          <p className="text-[12px] font-bold text-indigo-500 tracking-widest uppercase mb-4">Question</p>
          <h3 className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 font-['Inter'] leading-snug">
            {card.question}
          </h3>
        </div>

        {/* Divider / Action Area */}
        <div className="w-full mt-10 mb-8 flex flex-col items-center justify-center">
          {!isRevealed ? (
            <button
              onClick={handleReveal}
              className="px-6 py-2.5 bg-[#F8FAFC] dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-full hover:bg-slate-100 dark:hover:bg-[#2a2f3a] hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 group shadow-sm text-sm"
            >
              <RotateCw size={16} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
              Reveal Answer
            </button>
          ) : (
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full animate-in fade-in duration-300"></div>
          )}
        </div>

        {/* Answer Area */}
        {isRevealed && (
          <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500 flex-1 flex flex-col items-center">
            <p className="text-[12px] font-bold text-emerald-500 tracking-widest uppercase mb-4">Answer</p>
            <p className="text-[18px] text-slate-700 dark:text-slate-300 font-['Inter'] leading-[1.6]">
              {card.answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;