import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Star,
  Clock,
  BookOpen
} from "lucide-react";

import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/spinner";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyMode, setStudyMode] = useState("study"); // "study" | "preview"

  // Keyboard Navigation for Next/Prev
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedSet || studyMode !== "study") return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSet, studyMode, currentCardIndex]);

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
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-20">

        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <button
            onClick={() => setSelectedSet(null)}
            className="flex flex-shrink-0 items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-[13px] md:text-sm border border-slate-200 bg-white px-3 py-1.5 md:py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {/* Mode Toggle */}
          <div className="flex w-full md:w-auto items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setStudyMode("study")}
              className={`flex-1 md:flex-none px-4 py-1.5 text-[13px] md:text-sm font-medium rounded-md transition-all ${studyMode === "study" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Study Mode
            </button>
            <button
              onClick={() => setStudyMode("preview")}
              className={`flex-1 md:flex-none px-4 py-1.5 text-[13px] md:text-sm font-medium rounded-md transition-all ${studyMode === "preview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Preview Mode
            </button>
          </div>
        </div>

        {studyMode === "study" ? (
          <>
            {/* Flashcard Component */}
            <div className="mt-8">
              <Flashcard card={card} onToggleStar={handleToggleStar} />
            </div>

            {/* Bottom Navigation & Progress */}
            <div className="flex flex-col items-center mt-12 gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                <Button
                  onClick={handlePrev}
                  className="flex-1 sm:flex-none px-8"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-8"
                >
                  Next
                </Button>
              </div>

              <div className="text-sm font-medium text-slate-400">
                Card {currentCardIndex + 1} of {selectedSet.cards.length}
              </div>
            </div>
          </>
        ) : (
          /* Preview Mode Component */
          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-6">Previewing {selectedSet.cards.length} Cards</h4>
            <div className="grid grid-cols-1 gap-4">
              {selectedSet.cards.map((previewCard, idx) => (
                <div key={previewCard._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Question</span>
                    <p className="text-slate-900 font-medium">{previewCard.question}</p>
                  </div>
                  <div className="flex-1 space-y-2 md:border-l md:border-slate-100 md:pl-6 pt-4 md:pt-0 border-t border-slate-100">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Answer</span>
                    <p className="text-slate-600">{previewCard.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                    className="
                      group cursor-pointer
                      rounded-2xl p-5
                      bg-white dark:bg-[#181b22]
                      border border-slate-200/60 dark:border-slate-700/60
                      hover:shadow-xl hover:-translate-y-0.5
                      transition-all duration-200
                      flex flex-col h-full
                    "
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="
                          w-11 h-11 rounded-xl
                          bg-slate-100 dark:bg-[#232734]
                          flex items-center justify-center min-w-[44px]
                        ">
                          <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>

                        <div>
                          <h3
                            className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1"
                            title={`Revision Pack #${flashcardSets.length - idx}`}
                          >
                            {`Revision Pack #${flashcardSets.length - idx}`}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {set.cards.length} Core Concepts
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteRequest(e, set)}
                        className="
                          text-slate-400 hover:text-red-600
                          transition-colors
                        "
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Stats Badges */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <div
                        className="
                          inline-flex items-center gap-2
                          px-3 py-1 rounded-full text-xs font-medium
                          bg-indigo-50 text-indigo-600
                          dark:bg-indigo-500/15 dark:text-indigo-300
                        "
                      >
                        <BookOpen size={14} />
                        {set.cards.length} Flashcards
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="
                      flex items-center gap-1.5 mt-5
                      text-xs text-slate-500 dark:text-slate-400
                      mt-auto
                    ">
                      <Clock size={14} />
                      <span>
                        Created {moment(set.createdAt).fromNow()}
                      </span>
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

export default FlashcardManager;