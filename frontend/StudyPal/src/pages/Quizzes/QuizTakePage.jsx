import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/spinner";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizById(quizId);

        // If quiz is already completed, redirect to results page
        if (response.data?.completedAt) {
          navigate(`/quizzes/${quizId}/results`, { replace: true });
          return;
        }

        setSelectedQuiz(response.data);
      } catch (error) {
        toast.error("Failed to load quiz");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId, navigate]);

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);

      const formattedAnswers = Object.entries(answers).map(([index, answer]) => ({
        questionIndex: parseInt(index),
        selectedAnswer: answer
      }));

      await quizService.submitQuiz(selectedQuiz._id, formattedAnswers);
      toast.success("Quiz submitted successfully! Great job!");

      // Navigate to results
      navigate(`/quizzes/${selectedQuiz._id}/results`);

    } catch (error) {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !selectedQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Spinner />
        <p className="text-slate-500 font-medium animate-pulse">Loading your challenge...</p>
      </div>
    );
  }

  const question = selectedQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === selectedQuiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 to-orange-900 dark:to-orange-950 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-orange-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <Brain size={28} className="text-orange-300" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{selectedQuiz.title}</h1>
              <p className="text-orange-200 text-sm font-semibold max-w-sm truncate opacity-80 mt-0.5">Focus Mode • Take your time</p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between text-sm font-bold text-white mb-1">
              <span className="opacity-80 uppercase tracking-widest text-[10px]">Progress</span>
              <span className="bg-orange-500 px-2.5 py-0.5 rounded-md text-[11px] shadow-sm">
                {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
              </span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 relative overflow-hidden group">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 transition-opacity duration-700 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-bold text-2xl mb-8 shadow-sm ring-8 ring-white dark:ring-[#181b22]">
            {currentQuestionIndex + 1}
          </span>

          <h3 className="text-2xl md:text-3xl font-black text-center text-slate-800 dark:text-white mb-10 leading-tight md:px-8">
            {question.question}
          </h3>

          <div className="w-full max-w-2xl space-y-4">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-5 group/btn ${isSelected
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 shadow-[0_0_25px_rgba(99,102,241,0.2)] scale-[1.02]"
                      : "border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md"
                    }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold transition-colors shadow-sm ${isSelected ? "bg-orange-600 text-white" : "bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 group-hover/btn:bg-orange-100 dark:group-hover/btn:bg-orange-900 group-hover/btn:text-orange-600"
                    }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-lg font-semibold flex-1 ${isSelected ? "text-orange-900 dark:text-orange-100" : "text-slate-700 dark:text-slate-300"}`}>
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle className="text-orange-500 animate-in zoom-in duration-300 shrink-0" size={24} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation & Actions */}
      <div className="flex justify-between items-center max-w-2xl mx-auto px-4 gap-4">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center justify-center w-14 h-14 md:w-auto md:px-6 md:h-14 rounded-2xl font-bold uppercase tracking-wider text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm"
        >
          <ChevronLeft size={20} className="md:mr-2" />
          <span className="hidden md:inline">Previous</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || submitting}
            className="flex-1 max-w-[280px] flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex-1 max-w-[280px] flex items-center justify-center gap-2 h-14 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-slate-900/20 dark:shadow-orange-600/20 hover:scale-105 active:scale-95"
          >
            Next Question
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {!allAnswered && isLastQuestion && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            {selectedQuiz.questions.length - answeredCount} questions remaining before you can submit.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizTakePage;