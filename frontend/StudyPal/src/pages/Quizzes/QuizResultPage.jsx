import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Award, Brain, ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/spinner";
import Button from "../../components/common/Button";

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
      </div>
    );
  }

  const scorePercentage = Math.round((results.score / 100) * results.totalQuestions);
  const isPass = results.score >= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-16">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/documents/${results.document?._id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:shadow-sm transition-all text-sm"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
          <span>{new Date(results.completedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className={`relative overflow-hidden rounded-[2rem] p-8 md:p-12 border shadow-sm ${isPass ? "bg-white dark:bg-[#181b22] border-emerald-500/30" : "bg-white dark:bg-[#181b22] border-rose-500/30"
        }`}>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="relative">
            {/* Score Circle */}
            <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center relative z-10 border-8 ${isPass ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
              <span className={`text-5xl md:text-6xl font-bold ${isPass ? 'text-emerald-500' : 'text-rose-500'}`}>{results.score}%</span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide text-xs mt-2">{scorePercentage} / {results.totalQuestions} Right</span>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              {isPass ? "Great Job!" : "Keep Practicing!"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-sm">
              {isPass
                ? "You're getting the hang of it! Review the explanations below to perfect your knowledge."
                : "Don't give up. Review the material and try again."}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button>
                Share Result
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/documents/${results.document?._id}`)}
              >
                Review Document
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#181b22] text-slate-500 dark:text-slate-400">
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Question Review</h3>
          </div>
        </div>

        <div className="space-y-6">
          {results.detailedResults.map((result, idx) => (
            <div
              key={idx}
              className={`p-6 md:p-8 rounded-2xl border transition-all ${result.isCorrect
                ? "bg-white dark:bg-[#181b22] border-slate-200 dark:border-slate-800"
                : "bg-white dark:bg-[#181b22] border-rose-100 dark:border-rose-900/30"
                }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0 flex md:block items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-300 dark:text-slate-700 w-8 text-center">{idx + 1}</span>
                    <div className="md:hidden">
                      {result.isCorrect ? (
                        <CheckCircle className="text-emerald-500" size={24} />
                      ) : (
                        <XCircle className="text-rose-500" size={24} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-relaxed">
                      {result.question}
                    </p>
                    <div className="hidden md:block shrink-0 mt-1">
                      {result.isCorrect ? (
                        <CheckCircle className="text-emerald-500" size={24} />
                      ) : (
                        <XCircle className="text-rose-500" size={24} />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.options.map((opt, optIdx) => {
                      const isSelected = result.selectedAnswer === opt;
                      const isCorrectAnswer = result.correctAnswer === opt;

                      let optionClasses = "p-4 rounded-xl border text-sm transition-all flex items-center gap-3 ";

                      if (isCorrectAnswer) {
                        optionClasses += "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-semibold";
                      } else if (isSelected && !isCorrectAnswer) {
                        optionClasses += "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-400 font-semibold";
                      } else {
                        optionClasses += "bg-slate-50 dark:bg-[#232734] border-transparent text-slate-600 dark:text-slate-400 opacity-60 font-medium";
                      }

                      return (
                        <div key={optIdx} className={optionClasses}>
                          <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold shrink-0 ${isCorrectAnswer ? 'bg-emerald-200/50 text-emerald-700 dark:text-emerald-300' : isSelected ? 'bg-rose-200/50 text-rose-700 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                          {isCorrectAnswer && <CheckCircle size={16} className="ml-auto text-emerald-500 shrink-0" />}
                          {isSelected && !isCorrectAnswer && <XCircle size={16} className="ml-auto text-rose-500 shrink-0" />}
                        </div>
                      )
                    })}
                  </div>

                  {result.explanation ? (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1f2430] border border-slate-100 dark:border-slate-800 flex gap-4">
                      <Brain className="shrink-0 text-slate-400 mt-0.5" size={20} />
                      <div>
                        <span className="font-semibold text-xs uppercase tracking-wider block mb-1 text-slate-500">AI Explanation</span>
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  ) : null}
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