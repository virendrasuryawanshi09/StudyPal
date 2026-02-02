import React, { useState } from 'react';
import { FileText, BrainCircuit, Layers, HelpCircle, Sparkles } from 'lucide-react';
import Spinner from '../common/spinner';
import MarkdownRenderer from '../common/MarkdownRender';

const AiActions = () => {
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  /* ================= HANDLER ================= */

  const runAction = async (actionType) => {
    setActiveAction(actionType);
    setLoading(true);
    setResult('');

    // 🔴 TEMP: Fake AI response (backend later)
    setTimeout(() => {
      const mockResponses = {
        summary: `### Document Summary\n\nThis document explains the core concepts clearly and helps build foundational understanding.`,
        concepts: `### Key Concepts\n- Artificial Intelligence\n- Machine Learning\n- Neural Networks\n- Deep Learning`,
        flashcards: `### Flashcards\n**Q:** What is AI?\n**A:** Artificial Intelligence is the simulation of human intelligence.`,
        quiz: `### Quiz\n1. What does AI stand for?\nA) Artificial Internet\nB) Artificial Intelligence ✅`,
      };

      setResult(mockResponses[actionType]);
      setLoading(false);
    }, 1500);
  };

  /* ================= UI ================= */

  const actions = [
    {
      key: 'summary',
      title: 'Summarize Document',
      icon: FileText,
      description: 'Get a concise AI-generated summary',
    },
    {
      key: 'concepts',
      title: 'Key Concepts',
      icon: BrainCircuit,
      description: 'Extract important ideas & topics',
    },
    {
      key: 'flashcards',
      title: 'Generate Flashcards',
      icon: Layers,
      description: 'Convert content into flashcards',
    },
    {
      key: 'quiz',
      title: 'Generate Quiz',
      icon: HelpCircle,
      description: 'Test your understanding with quiz',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          AI Actions
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Let AI help you learn smarter
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.key;

          return (
            <button
              key={action.key}
              onClick={() => runAction(action.key)}
              disabled={loading}
              className={`
                group p-5 rounded-2xl text-left
                border border-slate-200/60 dark:border-slate-700/60
                bg-white dark:bg-[#181b22]
                hover:shadow-lg transition-all
                disabled:opacity-50
                ${isActive ? 'ring-2 ring-slate-900 dark:ring-slate-100' : ''}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-[#232734]">
                  <Icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {action.title}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Result Area */}
      <div className="min-h-[200px] rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-[#181b22] p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Sparkles className="mb-3 text-slate-400" />
            <Spinner />
            <p className="mt-2 text-sm text-slate-500">
              AI is generating results...
            </p>
          </div>
        ) : result ? (
          <MarkdownRenderer content={result} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-500">
            Select an AI action to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default AiActions;
