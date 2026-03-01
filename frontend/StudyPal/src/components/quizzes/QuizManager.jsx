import React, { useState, useEffect } from "react";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Brain,
    Award,
    Clock,
    RefreshCw,
} from "lucide-react";

import toast from "react-hot-toast";
import moment from "moment";

import quizService from "../../services/quizService";
import aiService from "../../services/aiService";
import Spinner from "../common/spinner";
import Modal from "../common/Modal";

const QuizManager = ({ documentId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizResults, setQuizResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // New Generation Modal State
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateOptions, setGenerateOptions] = useState({
        numQuestions: 5,
        difficulty: "medium",
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /* ================= FETCH ================= */

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await quizService.getQuizzesForDocument(documentId);
            setQuizzes(response.data);
        } catch (error) {
            toast.error("Failed to fetch quizzes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) fetchQuizzes();
    }, [documentId]);

    /* ================= GENERATE ================= */

    const handleOpenGenerateModal = () => {
        setIsGenerateModalOpen(true);
    };

    const handleGenerateQuiz = async () => {
        try {
            setGenerating(true);
            setIsGenerateModalOpen(false);
            await aiService.generateQuiz(documentId, generateOptions);
            toast.success("Quiz generated successfully!");
            fetchQuizzes();
        } catch (error) {
            toast.error("Quiz generation failed. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    /* ================= DELETE ================= */

    const handleDeleteRequest = (e, quiz) => {
        e.stopPropagation();
        setQuizToDelete(quiz._id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleting(true);

            if (!quizToDelete) return;

            await quizService.deleteQuiz(quizToDelete);

            setQuizzes((prev) => prev.filter((item) => item._id !== quizToDelete));

            if (selectedQuiz?._id === quizToDelete) {
                setSelectedQuiz(null);
                setQuizResults(null);
            }

            toast.success("Quiz deleted successfully");
            setIsDeleteModalOpen(false);
            setQuizToDelete(null);
        } catch (error) {
            toast.error("Failed to delete quiz");
        } finally {
            setDeleting(false);
        }
    };

    /* ================= QUIZ ACTIONS ================= */

    const handleSelectQuiz = async (quiz) => {
        setSelectedQuiz(quiz);
        setCurrentQuestionIndex(0);
        setAnswers({});

        if (quiz.completedAt) {
            try {
                setLoading(true);
                const response = await quizService.getQuizResults(quiz._id);
                setQuizResults(response.data.quiz);
            } catch (e) {
                toast.error("Failed to load quiz results");
            } finally {
                setLoading(false);
            }
        } else {
            setQuizResults(null);
        }
    };

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

            // Refresh to get results
            fetchQuizzes();
            const updatedQuiz = await quizService.getQuizById(selectedQuiz._id);
            handleSelectQuiz(updatedQuiz.data);

        } catch (error) {
            toast.error("Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };


    /* ================= RENDER COMPONENTS ================= */

    const renderQuizResults = () => {
        if (!quizResults) return <Spinner />;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Results */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <button
                        onClick={() => {
                            setSelectedQuiz(null);
                            setQuizResults(null);
                        }}
                        className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200/50"
                    >
                        <ArrowLeft size={18} />
                        Back to Quizzes
                    </button>

                    <div className="bg-orange-50 text-orange-700 px-6 py-3 rounded-2xl flex border border-orange-100 items-center shadow-sm gap-3">
                        <Award className="text-orange-500" />
                        <span className="font-semibold text-lg">Score: {quizResults.score}%</span>
                        <span className="text-orange-400 bg-white px-2 py-0.5 rounded-md text-sm">
                            ({Math.round((quizResults.score / 100) * quizResults.totalQuestions)} / {quizResults.totalQuestions})
                        </span>
                    </div>
                </div>

                {/* Detailed Review */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCw size={20} className="text-slate-400" />
                        Detailed Review
                    </h3>

                    {quizResults.detailedResults.map((result, idx) => (
                        <div
                            key={idx}
                            className={`p-6 rounded-2xl border ${result.isCorrect
                                    ? "bg-emerald-50/30 border-emerald-100 shadow-sm shadow-emerald-100/20"
                                    : "bg-rose-50/30 border-rose-100 shadow-sm shadow-rose-100/20"
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    {result.isCorrect ? (
                                        <CheckCircle className="text-emerald-500" size={24} />
                                    ) : (
                                        <XCircle className="text-rose-500" size={24} />
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <p className="font-semibold text-lg text-slate-800">
                                        <span className="text-slate-400 mr-2">{idx + 1}.</span>
                                        {result.question}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.options.map((opt, optIdx) => {
                                            const isSelected = result.selectedAnswer === opt;
                                            const isCorrectAnswer = result.correctAnswer === opt;

                                            let optionClasses = "p-3 rounded-xl border text-sm transition-all ";

                                            if (isCorrectAnswer) {
                                                optionClasses += "bg-emerald-100 border-emerald-300 text-emerald-800 font-medium ring-1 ring-emerald-500/20";
                                            } else if (isSelected && !isCorrectAnswer) {
                                                optionClasses += "bg-rose-100 border-rose-300 text-rose-800 font-medium";
                                            } else {
                                                optionClasses += "bg-white/60 border-slate-200 text-slate-600 opacity-60";
                                            }

                                            return (
                                                <div key={optIdx} className={optionClasses}>
                                                    <span className="mr-2 font-mono text-xs opacity-50">
                                                        {String.fromCharCode(65 + optIdx)}.
                                                    </span>
                                                    {opt}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {result.explanation && (
                                        <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-sm text-blue-800 flex gap-3">
                                            <Brain className="shrink-0 text-blue-400 mt-0.5" size={18} />
                                            <div>
                                                <span className="font-semibold block mb-1 text-blue-900">Explanation:</span>
                                                {result.explanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderActiveQuiz = () => {
        const question = selectedQuiz.questions[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1;
        const answeredCount = Object.keys(answers).length;
        const allAnswered = answeredCount === selectedQuiz.questions.length;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <button
                        onClick={() => setSelectedQuiz(null)}
                        className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50"
                    >
                        <ArrowLeft size={18} />
                        Exit Quiz
                    </button>

                    {/* Progress Bar Container */}
                    <div className="w-full md:w-1/3 flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                            <span>Progress</span>
                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                                {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
                            </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out relative"
                                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 relative overflow-hidden group">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-50 to-rose-50 rounded-full blur-3xl -ml-24 -mb-24 opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-600 font-bold text-xl mb-6 shadow-sm ring-4 ring-white">
                            {currentQuestionIndex + 1}
                        </span>

                        <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-10 leading-tight">
                            {question.question}
                        </h3>

                        <div className="w-full max-w-2xl space-y-3">
                            {question.options.map((option, idx) => {
                                const isSelected = answers[currentQuestionIndex] === option;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group/btn ${isSelected
                                                ? "border-orange-500 bg-orange-50/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.02]"
                                                : "border-slate-100 hover:border-orange-200 hover:bg-slate-50 hover:shadow-md"
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold transition-colors ${isSelected ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-500 group-hover/btn:bg-orange-100 group-hover/btn:text-orange-600"
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-lg font-medium ${isSelected ? "text-orange-900" : "text-slate-700"}`}>
                                            {option}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle className="ml-auto text-orange-500 animate-in zoom-in duration-300" size={20} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Navigation & Actions */}
                <div className="flex justify-between items-center max-w-2xl mx-auto px-4">
                    <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-sm"
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!allAnswered || submitting}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105"
                        >
                            {submitting ? "Submitting..." : "Submit Quiz"}
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:scale-105"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>

                {!allAnswered && isLastQuestion && (
                    <p className="text-center text-amber-600 text-sm font-medium animate-pulse mt-4">
                        Please answer all questions before submitting. ({answeredCount}/{selectedQuiz.questions.length} answered)
                    </p>
                )}
            </div>
        );
    };

    /* ================= MAIN RETURN ================= */

    return (
        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 relative overflow-hidden">
            {/* Subtle Background Pattern for glassmorphism area */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

            <div className="relative z-10">
                {selectedQuiz ? (
                    selectedQuiz.completedAt ? renderQuizResults() : renderActiveQuiz()
                ) : (
                    <>
                        {/* Dashboard Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 bg-white/60 p-6 rounded-3xl border border-white shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
                                    <Brain size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                                        Knowledge Quizzes
                                    </h3>
                                    <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                        {quizzes.length} available to test your skills
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleOpenGenerateModal}
                                disabled={generating}
                                className="group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20 disabled:scale-100 disabled:opacity-70 w-full sm:w-auto"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <span className="relative z-10 flex items-center gap-2">
                                    {generating ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            New AI Quiz
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Quiz List */}
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-slate-500 font-medium animate-pulse">Loading your quizzes...</p>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-24 bg-white/50 border border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 shadow-inner relative">
                                    <Brain size={32} />
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-ping"></div>
                                </div>
                                <h4 className="text-xl font-bold text-slate-700 mb-2">No Quizzes Yet</h4>
                                <p className="text-slate-500 max-w-md mx-auto mb-8">Generate an AI-powered quiz from your document to start testing your knowledge.</p>
                                <button
                                    onClick={handleOpenGenerateModal}
                                    className="px-6 py-3 bg-orange-50 text-orange-700 font-semibold rounded-xl hover:bg-orange-100 transition-colors border border-orange-100"
                                >
                                    Generate First Quiz
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {quizzes.map((quiz, index) => (
                                    <div
                                        key={quiz._id}
                                        onClick={() => handleSelectQuiz(quiz)}
                                        className="group bg-white border border-slate-100/80 rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 cursor-pointer relative overflow-hidden flex flex-col h-full"
                                    >
                                        {/* Decorative Gradient Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r gap-1 flex">
                                            <div className="h-full flex-1 bg-orange-400"></div>
                                            <div className="h-full flex-1 bg-purple-400"></div>
                                            <div className="h-full flex-1 bg-pink-400"></div>
                                        </div>

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${quiz.completedAt ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {quiz.completedAt ? <CheckCircle size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <span className={`text-xs font-black uppercase tracking-wider ${quiz.completedAt ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {quiz.completedAt ? 'Completed' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* DELETE BUTTON */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteRequest(e, quiz)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="mb-8 flex-grow">
                                            <h4 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">
                                                {quiz.title || `Quiz #${quizzes.length - index}`}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-2 font-medium">
                                                {moment(quiz.createdAt).format("MMM D, YYYY")}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100/80">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Questions</span>
                                                <span className="font-bold text-slate-700">{quiz.totalQuestions}</span>
                                            </div>

                                            {quiz.completedAt && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Score</span>
                                                    <span className={`font-black text-lg ${quiz.score >= 80 ? 'text-emerald-500' : quiz.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                        {quiz.score}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* GENERATE MODAL */}
                <Modal
                    isOpen={isGenerateModalOpen}
                    title="Generate AI Quiz"
                    onClose={() => setIsGenerateModalOpen(false)}
                >
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-sm">
                            <Brain className="shrink-0 text-orange-500 mt-1" size={20} />
                            <p>AI will analyze your document content to create a customized multiple-choice quiz.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Number of Questions
                                </label>
                                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
                                    {[3, 5, 10, 15].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setGenerateOptions(prev => ({ ...prev, numQuestions: num }))}
                                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${generateOptions.numQuestions === num
                                                    ? "bg-white text-orange-600 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Difficulty Level
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["easy", "medium", "hard"].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setGenerateOptions(prev => ({ ...prev, difficulty: level }))}
                                            className={`p-3 rounded-xl border-2 text-sm font-bold capitalize transition-all flex flex-col items-center gap-1 ${generateOptions.difficulty === level
                                                    ? "border-orange-500 bg-orange-50 text-orange-700 scale-[1.02]"
                                                    : "border-slate-200 text-slate-500 hover:border-orange-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            {level === "easy" && <span className="text-emerald-500 text-lg">🌱</span>}
                                            {level === "medium" && <span className="text-amber-500 text-lg">🔥</span>}
                                            {level === "hard" && <span className="text-rose-500 text-lg">⚡</span>}
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsGenerateModalOpen(false)}
                                className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleGenerateQuiz}
                                disabled={generating}
                                className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Generating
                                    </>
                                ) : "Generate Quiz"}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* DELETE MODAL */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    title="Delete Quiz"
                    onClose={() => setIsDeleteModalOpen(false)}
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-center p-6 bg-rose-50 rounded-full w-24 h-24 mx-auto mb-2 border-4 border-white shadow-sm">
                            <Trash2 className="text-rose-500" size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete this quiz?</h3>
                            <p className="text-slate-500">
                                Are you sure you want to delete this quiz? This action cannot be undone and all your results for this quiz will be permanently removed.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all hover:scale-105 active:scale-95"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete Quiz"}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default QuizManager;
