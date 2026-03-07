import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/spinner";
import Button from "../../components/common/Button";

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
      toast.success("Quiz submitted successfully!");
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
      </div>
    );
  }

  const question = selectedQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === selectedQuiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 rounded-2xl p-4 sm:p-6 md:p-8 text-slate-100 shadow-sm border border-slate-800">

        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="p-3 bg-slate-800 rounded-xl">
              <Brain size={24} className="text-slate-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{selectedQuiz.title}</h1>
              <p className="text-slate-400 text-sm mt-0.5">Focus Mode</p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span className="uppercase tracking-widest text-[10px] text-slate-500">Progress</span>
              <span className="bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="premium-card bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-[2rem] p-5 sm:p-8 md:p-12 relative shadow-sm">

        <div className="relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#232734] text-slate-900 dark:text-slate-100 font-bold text-xl mb-6">
            {currentQuestionIndex + 1}
          </span>

          <h3 className="text-xl md:text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-10 leading-relaxed md:px-8 font-['Inter']">
            {question.question}
          </h3>

          <div className="w-full max-w-2xl space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center gap-4 group/btn ${isSelected
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#181b22] hover:bg-slate-50 dark:hover:bg-[#232734]"
                    }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-[#232734] text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200"
                    }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-base font-medium flex-1 ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation & Actions */}
      <div className="flex justify-between items-center max-w-2xl mx-auto px-4 gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="w-12 px-0 md:px-6 md:w-auto"
        >
          <ChevronLeft size={18} className="md:mr-2" />
          <span className="hidden md:inline">Previous</span>
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || submitting}
            size="lg"
            className="flex-1 max-w-[240px]"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            size="lg"
            className="flex-1 max-w-[240px]"
          >
            Next Question
            <ChevronRight size={18} />
          </Button>
        )}
      </div>

      {!allAnswered && isLastQuestion && (
        <div className="flex justify-center text-sm font-medium text-amber-600 dark:text-amber-500">
          {selectedQuiz.questions.length - answeredCount} questions remaining before you can submit.
        </div>
      )}
    </div>
  );
};

export default QuizTakePage;