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
import Button from "../common/Button";

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
            const msg = error?.error || error?.message || "Quiz generation failed. Please try again.";
            toast.error(msg);
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
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSelectedQuiz(null);
                            setQuizResults(null);
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Quizzes
                    </Button>

                    <div className="bg-slate-100 dark:bg-[#232734] text-slate-900 dark:text-slate-100 px-6 py-3 rounded-2xl flex items-center shadow-sm gap-3">
                        <Award className="text-emerald-500" />
                        <span className="font-semibold text-lg">Score: {quizResults.score}%</span>
                        <span className="text-slate-500 bg-white dark:bg-[#181b22] px-2 py-0.5 rounded-md text-sm border border-slate-200 dark:border-slate-700">
                            ({Math.round((quizResults.score / 100) * quizResults.totalQuestions)} / {quizResults.totalQuestions})
                        </span>
                    </div>
                </div>

                {/* Detailed Review */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <RefreshCw size={20} className="text-slate-500" />
                        Detailed Review
                    </h3>

                    {quizResults.detailedResults.map((result, idx) => (
                        <div
                            key={idx}
                            className={`p-6 rounded-2xl border ${result.isCorrect
                                ? "bg-white dark:bg-[#181b22] border-slate-200 dark:border-slate-800"
                                : "bg-white dark:bg-[#181b22] border-rose-200/50 dark:border-rose-900/30"
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
                                    <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                        <span className="text-slate-500 mr-2">{idx + 1}.</span>
                                        {result.question}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.options.map((opt, optIdx) => {
                                            const isSelected = result.selectedAnswer === opt;
                                            const isCorrectAnswer = result.correctAnswer === opt;

                                            let optionClasses = "p-3 rounded-xl border text-sm transition-all ";

                                            if (isCorrectAnswer) {
                                                optionClasses += "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-medium";
                                            } else if (isSelected && !isCorrectAnswer) {
                                                optionClasses += "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-400 font-medium";
                                            } else {
                                                optionClasses += "bg-slate-50 dark:bg-[#232734] border-transparent text-slate-600 dark:text-slate-400 opacity-60";
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
                                        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1f2430] border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 flex gap-3">
                                            <Brain className="shrink-0 text-slate-400 mt-0.5" size={18} />
                                            <div>
                                                <span className="font-semibold block mb-1 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Explanation:</span>
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
        if (!selectedQuiz || !selectedQuiz.questions || selectedQuiz.questions.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Brain className="w-12 h-12 text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Quiz Content Unavailable</h3>
                    <p className="text-slate-500 mb-6 text-sm">This quiz doesn't have any questions yet. Try generating a new one.</p>
                    <Button onClick={() => setSelectedQuiz(null)}>Back to Quizzes</Button>
                </div>
            );
        }

        const question = selectedQuiz.questions[currentQuestionIndex];

        if (!question) {
            return (
                <div className="flex items-center justify-center p-12">
                    <Spinner />
                </div>
            );
        }

        const isLastQuestion = currentQuestionIndex === selectedQuiz.questions.length - 1;
        const answeredCount = Object.keys(answers).length;
        const allAnswered = answeredCount === selectedQuiz.questions.length;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 dark:bg-[#181b22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedQuiz(null)}
                    >
                        <ArrowLeft size={18} />
                        Exit Quiz
                    </Button>

                    {/* Progress Bar Container */}
                    <div className="w-full md:w-1/3 flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                            <span>Progress</span>
                            <span className="text-slate-700 dark:text-slate-300 bg-white dark:bg-[#232734] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                                {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-[#232734] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
                            >
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#232734] text-slate-900 dark:text-slate-100 font-bold text-xl mb-6">
                            {currentQuestionIndex + 1}
                        </span>

                        <h3 className="text-2xl md:text-3xl font-semibold text-center text-slate-900 dark:text-slate-100 mb-10 leading-relaxed md:px-8">
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
                                            <CheckCircle className="ml-auto text-emerald-500 shrink-0" size={20} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Navigation & Actions */}
                <div className="flex justify-between items-center max-w-2xl mx-auto px-4">
                    <Button
                        variant="outline"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </Button>

                    {isLastQuestion ? (
                        <Button
                            onClick={handleSubmitQuiz}
                            disabled={!allAnswered || submitting}
                        >
                            {submitting ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNextQuestion}
                        >
                            Next
                            <ChevronRight size={18} />
                        </Button>
                    )}
                </div>

                {!allAnswered && isLastQuestion && (
                    <p className="text-center text-amber-600 dark:text-amber-500 text-sm font-medium mt-4">
                        Please answer all questions before submitting. ({answeredCount}/{selectedQuiz.questions.length} answered)
                    </p>
                )}
            </div>
        );
    };

    /* ================= MAIN RETURN ================= */

    return (
        <div className="p-2 md:p-6 relative">
            <div className="relative z-10">
                {selectedQuiz ? (
                    selectedQuiz.completedAt ? renderQuizResults() : renderActiveQuiz()
                ) : (
                    <>
                        {/* Dashboard Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    Knowledge Quizzes
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {quizzes.length} available to test your skills
                                </p>
                            </div>

                            <Button
                                onClick={handleOpenGenerateModal}
                                disabled={generating}
                                className="w-full sm:w-auto"
                            >
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
                            </Button>
                        </div>

                        {/* Quiz List */}
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <Spinner />
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-24 bg-white dark:bg-[#181b22] border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-[#232734] rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                                    <Brain size={28} />
                                </div>
                                <h4 className="text-[22px] font-semibold text-slate-900 dark:text-slate-100 mb-3 font-['Inter']">No quizzes yet</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-[15px] leading-relaxed">
                                    Generate an AI-powered quiz from your notes to start testing your knowledge.
                                </p>
                                <Button
                                    onClick={handleOpenGenerateModal}
                                >
                                    Generate Quiz
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* Analytics Summary Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(() => {
                                        const completedQuizzes = quizzes.filter(q => q.completedAt);
                                        const totalTaken = completedQuizzes.length;

                                        const avgScore = totalTaken > 0
                                            ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / totalTaken)
                                            : 0;

                                        const bestScore = totalTaken > 0
                                            ? Math.max(...completedQuizzes.map(q => q.score || 0))
                                            : 0;

                                        return (
                                            <>
                                                <div className="bg-white dark:bg-[#181b22] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Average Score</span>
                                                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100 font-['Inter']">{totalTaken > 0 ? `${avgScore}%` : '--'}</span>
                                                </div>
                                                <div className="bg-white dark:bg-[#181b22] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Best Score</span>
                                                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100 font-['Inter']">{totalTaken > 0 ? `${bestScore}%` : '--'}</span>
                                                </div>
                                                <div className="bg-white dark:bg-[#181b22] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Quizzes Taken</span>
                                                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100 font-['Inter']">{totalTaken}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Quiz Cards Grid */}
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[24px]">
                                    {quizzes.map((quiz, index) => {
                                        const scoreColorClass = !quiz.completedAt ? "bg-slate-200"
                                            : quiz.score >= 90 ? "bg-emerald-500"
                                                : quiz.score >= 60 ? "bg-indigo-500"
                                                    : "bg-red-500";

                                        const textColorClass = !quiz.completedAt ? "text-slate-500"
                                            : quiz.score >= 90 ? "text-emerald-500"
                                                : quiz.score >= 60 ? "text-indigo-500"
                                                    : "text-red-500";

                                        return (
                                            <div
                                                key={quiz._id}
                                                className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-[16px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
                                            >
                                                {/* Header Row */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="mb-2">
                                                        <h4 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100 leading-snug font-['Inter']">
                                                            {quiz.title || `Quiz #${quizzes.length - index}`}
                                                        </h4>
                                                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                                                            {moment(quiz.createdAt).format("MMM D, YYYY")}
                                                        </p>
                                                    </div>

                                                    {/* Trash Action */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteRequest(e, quiz)}
                                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors -mr-2"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="mt-auto pt-6">
                                                    {/* Stats Row */}
                                                    <div className="flex justify-between items-end mb-4 font-['Inter']">
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mb-1">Questions</span>
                                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{quiz.totalQuestions}</span>
                                                        </div>

                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider mb-1">Score</span>
                                                            <span className={`font-bold ${textColorClass}`}>
                                                                {quiz.completedAt ? `${quiz.score}%` : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Score Visualization Bar */}
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${scoreColorClass}`}
                                                            style={{ width: quiz.completedAt ? `${quiz.score}%` : '0%' }}
                                                        ></div>
                                                    </div>

                                                    {/* Actions Row */}
                                                    <div className="flex gap-3">
                                                        {quiz.completedAt ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSelectQuiz(quiz)}
                                                                    className="flex-1 py-2.5 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                                                >
                                                                    View Results
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        // Duplicate/Retry logic could go here, for now it restarts it
                                                                        handleSelectQuiz(quiz);
                                                                    }}
                                                                    className="flex-1 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
                                                                >
                                                                    Retry
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleSelectQuiz(quiz)}
                                                                className="w-full py-2.5 text-sm font-medium rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                                                            >
                                                                Start Quiz
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* GENERATE MODAL */}
                <Modal
                    isOpen={isGenerateModalOpen}
                    title="Generate New Quiz"
                    onClose={() => setIsGenerateModalOpen(false)}
                >
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Number of Questions
                                </label>
                                <div className="flex gap-2">
                                    {[3, 5, 10, 15].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setGenerateOptions(prev => ({ ...prev, numQuestions: num }))}
                                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all border ${generateOptions.numQuestions === num
                                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent"
                                                : "bg-white dark:bg-[#181b22] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#232734]"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-4">
                                    Difficulty Level
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["easy", "medium", "hard"].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setGenerateOptions(prev => ({ ...prev, difficulty: level }))}
                                            className={`p-3 rounded-lg border text-sm font-semibold capitalize transition-all ${generateOptions.difficulty === level
                                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent"
                                                : "bg-white dark:bg-[#181b22] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#232734]"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="secondary"
                                onClick={() => setIsGenerateModalOpen(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleGenerateQuiz}
                                disabled={generating}
                            >
                                {generating ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Generating
                                    </>
                                ) : "Generate Quiz"}
                            </Button>
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
                        <div className="text-slate-700 dark:text-slate-300">
                            <p>Are you sure you want to delete this quiz?</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">All associated results will be permanently removed.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="danger"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default QuizManager;
