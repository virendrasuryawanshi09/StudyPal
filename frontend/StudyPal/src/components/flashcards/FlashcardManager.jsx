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
      toast.error("Generation failed");
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
    console.log("CONFIRM CLICKED");
    console.log("Stored ID:", setToDelete);

    try {
      setDeleting(true);

      if (!setToDelete) {
        console.log("No ID found");
        return;
      }

      console.log("Sending DELETE request...");

      await flashcardService.deleteFlashcardSet(setToDelete);

      console.log("DELETE SUCCESS");

      setFlashcardSets(prev =>
        prev.filter(item => item._id !== setToDelete)
      );

      toast.success("Deleted successfully");

      setIsDeleteModalOpen(false);
      setSetToDelete(null);

    } catch (error) {
      console.log("DELETE ERROR:", error);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedSet(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-black"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <span className="text-sm text-slate-500">
            Card {currentCardIndex + 1} of {selectedSet.cards.length}
          </span>
        </div>

        {/* Card */}
        <div className="relative bg-white border rounded-2xl shadow-lg p-10 min-h-[250px] flex flex-col justify-center">
          <button
            type="button"
            onClick={() => handleToggleStar(card._id)}
            className="absolute top-4 right-4"
          >
            <Star
              size={22}
              className={
                card.starred
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-slate-300"
              }
            />
          </button>

          <h3 className="text-xl font-semibold text-center mb-4">
            {card.question}
          </h3>

          <p className="text-slate-600 text-center">
            {card.answer}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    );
  };

  /* ================= MAIN RETURN ================= */

  return (
    <div className="bg-white border rounded-3xl shadow p-8">

      {selectedSet ? (
        renderFlashcardViewer()
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                Your Flashcard Sets
              </h3>
              <p className="text-sm text-slate-500">
                {flashcardSets.length} sets
              </p>
            </div>

            <button
              onClick={handleGenerateFlashcards}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              {generating ? "Generating..." : "Generate"}
              <Plus size={18} />
            </button>
          </div>

          {/* List */}
          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              {flashcardSets.map((set) => (
                <div
                  key={set._id}
                  onClick={() => handleSelectSet(set)}
                  className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md cursor-pointer"
                >
                  <div>
                    <h4 className="font-semibold">
                      Flashcard Set
                    </h4>
                    <p className="text-sm text-slate-500">
                      {set.cards.length} cards •{" "}
                      {moment(set.createdAt).format(
                        "MMMM D YYYY"
                      )}
                    </p>
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleDeleteRequest(e, set)
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Flashcard Set"
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete this
            flashcard set? This action cannot undone and all cards will permanently removed
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardManager;