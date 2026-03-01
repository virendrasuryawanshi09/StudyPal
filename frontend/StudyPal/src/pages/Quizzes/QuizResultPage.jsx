import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Award, Brain, ArrowLeft, RefreshCw, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/spinner";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizResults(quizId);
        setResults(response.data.quiz);
      } catch (error) {
        toast.error("Failed to load quiz results");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchResults();
  }, [quizId, navigate]);

  if (loading || !results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Spinner />
        <p className="text-slate-500 font-medium animate-pulse">Calculating your genius score...</p>
      </div>
    );
  }

  const scorePercentage = Math.round((results.score / 100) * results.totalQuestions);
  const isPerfect = results.score === 100;
  const isPass = results.score >= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-16">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/documents/${results.document?._id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:shadow-md transition-all sm:text-sm text-xs"
        >
          <ArrowLeft size={18} />
          Back to Document
        </Link>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
          <span>{new Date(results.completedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl p-8 md:p-12 border ${isPerfect ? "bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 border-orange-400 shadow-orange-500/30" :
          isPass ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-emerald-500/30" :
            "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 shadow-amber-500/30"
        }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="relative">
            {/* Massive Score Circle */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/30 flex flex-col items-center justify-center shadow-inner relative z-10">
              <span className="text-6xl md:text-7xl font-black text-white drop-shadow-md">{results.score}%</span>
              <span className="text-white/80 font-bold uppercase tracking-widest mt-2">{scorePercentage} / {results.totalQuestions} Right</span>
            </div>
            {isPerfect && (
              <div className="absolute -top-6 -right-6 bg-amber-400 p-4 rounded-3xl rotate-12 shadow-xl animate-bounce">
                <Award className="text-white" size={40} />
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1 text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-sm leading-tight">
              {isPerfect ? "Flawless Victory!" : isPass ? "Great Job!" : "Keep Practicing!"}
            </h1>
            <p className="text-lg text-white/90 font-medium leading-relaxed mb-6 max-w-sm">
              {isPerfect
                ? "You've fully mastered this document. Nothing can stop you now."
                : isPass
                  ? "You're getting the hang of it! Review the explanations below to perfect your knowledge."
                  : "Don't give up. AI generated quizzes are tough. Review the material and try again."}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button className="px-6 py-3 bg-white text-slate-800 font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                Share Result
              </button>
              <Link
                to={`/documents/${results.document?._id}`}
                className="px-6 py-3 bg-black/20 text-white font-bold rounded-xl shadow-lg hover:bg-black/30 hover:scale-105 active:scale-95 transition-all backdrop-blur-md border border-white/10"
              >
                Review Document
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <RefreshCw size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Question Review</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">Learn from your mistakes</p>
          </div>
        </div>

        <div className="space-y-6">
          {results.detailedResults.map((result, idx) => (
            <div
              key={idx}
              className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all hover:shadow-lg ${result.isCorrect
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 shadow-emerald-100/20"
                  : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 hover:border-rose-300 shadow-rose-100/20"
                }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0 flex md:block items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-700 w-10 text-center">{idx + 1}</span>
                    <div className="md:hidden">
                      {result.isCorrect ? (
                        <CheckCircle className="text-emerald-500 drop-shadow-sm" size={28} />
                      ) : (
                        <XCircle className="text-rose-500 drop-shadow-sm" size={28} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-bold text-xl text-slate-800 dark:text-slate-200 leading-relaxed">
                      {result.question}
                    </p>
                    <div className="hidden md:block shrink-0 mt-1">
                      {result.isCorrect ? (
                        <CheckCircle className="text-emerald-500 drop-shadow-sm" size={28} />
                      ) : (
                        <XCircle className="text-rose-500 drop-shadow-sm" size={28} />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.options.map((opt, optIdx) => {
                      const isSelected = result.selectedAnswer === opt;
                      const isCorrectAnswer = result.correctAnswer === opt;

                      let optionClasses = "p-4 rounded-2xl border-2 text-sm transition-all flex items-center gap-3 ";

                      if (isCorrectAnswer) {
                        optionClasses += "bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm";
                      } else if (isSelected && !isCorrectAnswer) {
                        optionClasses += "bg-rose-100/70 dark:bg-rose-900/40 border-rose-400 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 font-bold";
                      } else {
                        optionClasses += "bg-white/80 dark:bg-[#181b22] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-60 font-medium";
                      }

                      return (
                        <div key={optIdx} className={optionClasses}>
                          <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0 ${isCorrectAnswer ? 'bg-emerald-200/50 text-emerald-700' : isSelected ? 'bg-rose-200/50 text-rose-700' : 'bg-slate-100 text-slate-400'}`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                          {isCorrectAnswer && <CheckCircle size={18} className="ml-auto text-emerald-500/80 shrink-0" />}
                          {isSelected && !isCorrectAnswer && <XCircle size={18} className="ml-auto text-rose-500/80 shrink-0" />}
                        </div>
                      )
                    })}
                  </div>

                  {result.explanation ? (
                    <div className="mt-6 p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 text-orange-900 dark:text-orange-200 flex gap-4">
                      <Brain className="shrink-0 text-orange-400 mt-0.5 drop-shadow-sm" size={24} />
                      <div>
                        <span className="font-black text-xs uppercase tracking-widest block mb-2 text-orange-600 dark:text-orange-400">AI Explanation</span>
                        <p className="font-medium text-[15px] leading-relaxed opacity-90">{result.explanation}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex gap-4 items-center">
                      <span className="font-medium text-[15px]">No AI explanation provided for this question.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;