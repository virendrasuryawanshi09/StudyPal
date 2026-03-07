import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Star,
} from "lucide-react";

import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/spinner";
import Modal from "../common/Modal";
import Button from "../common/Button";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH ================= */

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFlashcardSets();
  }, [documentId]);

  /* ================= GENERATE ================= */

  const handleGenerateFlashcards = async () => {
    try {
      setGenerating(true);
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated!");
      fetchFlashcardSets();
    } catch (error) {
      const msg = error?.error || error?.message || "Generation failed. Please try again.";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set._id);   // STORE ONLY ID
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {

    try {
      setDeleting(true);

      if (!setToDelete) {
        return;
      }

      await flashcardService.deleteFlashcardSet(setToDelete);

      setFlashcardSets(prev =>
        prev.filter(item => item._id !== setToDelete)
      );

      toast.success("Deleted successfully");

      setIsDeleteModalOpen(false);
      setSetToDelete(null);

    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= STAR ================= */

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);

      setSelectedSet((prev) => ({
        ...prev,
        cards: prev.cards.map((card) =>
          card._id === cardId
            ? { ...card, starred: !card.starred }
            : card
        ),
      }));
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  /* ================= NAVIGATION ================= */

  const handleNext = () => {
    setCurrentCardIndex(
      (prev) => (prev + 1) % selectedSet.cards.length
    );
  };

  const handlePrev = () => {
    setCurrentCardIndex(
      (prev) =>
        (prev - 1 + selectedSet.cards.length) %
        selectedSet.cards.length
    );
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  /* ================= FLASHCARD VIEW ================= */
  const renderFlashcardViewer = () => {
    const card = selectedSet.cards[currentCardIndex];
    return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-100/50 dark:bg-[#181b22] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedSet(null)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-semibold"
          >
            <ArrowLeft size={18} />
            Exit Practice
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-[#232734] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              Card {currentCardIndex + 1} / {selectedSet.cards.length}
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="relative group perspective-1000">
          <div className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 md:p-20 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] transition-all duration-500 hover:border-emerald-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full"></div>

            <button
              type="button"
              onClick={() => handleToggleStar(card._id)}
              className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-50 dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 transition-all active:scale-95"
            >
              <Star
                size={24}
                className={card.starred ? "text-amber-500 fill-amber-500" : ""}
              />
            </button>

            <div className="w-full max-w-2xl text-center space-y-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 mb-4">
                Question
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-slate-50 leading-tight">
                {card.question}
              </h3>

              <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 mx-auto rounded-full my-8"></div>

              <div className="space-y-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 mb-2">
                  Answer
                </div>
                <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  {card.answer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-10">
          <button
            onClick={handlePrev}
            className="w-14 h-14 rounded-2xl bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-lg active:scale-90"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={handleNext}
            className="w-20 h-20 rounded-3xl bg-slate-900 dark:bg-slate-50 flex items-center justify-center text-white dark:text-slate-900 hover:scale-105 transition-all shadow-xl active:scale-95 group"
          >
            <ChevronRight size={38} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  /* ================= MAIN RETURN ================= */

  return (
    <div className="p-0 relative">
      <div className="relative z-10">

        {selectedSet ? (
          renderFlashcardViewer()
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Flashcard Archive
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Master your curriculum with {flashcardSets.length} specialized sets
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className="w-full sm:w-auto"
              >
                {generating ? <Spinner /> : <><Plus size={20} /> Generate New Sets</>}
              </Button>
            </div>

            {/* List */}
            {loading ? (
              <div className="py-20 flex justify-center"><Spinner /></div>
            ) : flashcardSets.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 dark:bg-[#181b22] border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white dark:bg-[#232734] border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                  <Plus size={28} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">No Study Material Found</h4>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-medium">Generate AI-powered flashcards from your documents to start active recall training.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {flashcardSets.map((set, idx) => (
                  <div
                    key={set._id}
                    onClick={() => handleSelectSet(set)}
                    className="group bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer flex flex-col h-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-10">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#232734] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                        <BookOpen size={20} />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteRequest(e, set)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                        {`Revision Pack #${flashcardSets.length - idx}`}
                      </h4>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                        {moment(set.createdAt).format("MMM D, YYYY")}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-tighter uppercase tracking-widest">
                        {set.cards.length} Core Concepts
                      </span>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DELETE MODAL */}
        <Modal
          isOpen={isDeleteModalOpen}
          title="Archive Destructuring"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="space-y-6">
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to permanently remove this revision pack? All cards and progress data will be obliterated.
            </p>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Retain Pack
              </Button>

              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Purging..." : "Confirm Purge"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Add missing icon
const BookOpen = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default FlashcardManager;