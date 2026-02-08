import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain
} from "lucicide-react";
import toast from 'react-hot-toast';
import moment from "moment";

import flashcardService from '../../services/flashcardService';
import Flashcard from './Flashcard';
import aiService from '../../services/aiService';
import Spinner from '../common/spinner';
import Modal
    from '../common/Modal';

const FlashcardManager = ({ documentId }) => {

    const [flashcardSets, useFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardSets(documentId);
            useFlashcardSets(response);
        } catch (error) {
            console.error("Error fetching flashcard sets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            const response = await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcardSets();
        } catch (error) {
            console.error("Error generating flashcards:", error);
            toast.error("Failed to generate flashcards");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);

        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
        }
    };

    const handleReview = async (cardIndex) => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        if (!currentCard) return;
        try {
            await flashcardService.reviewFlashcard(currentCard.id, index);
            toast.success("Flashcard reviewed!");

        } catch (error) {
            console.error("Error reviewing flashcard:", error);
            toast.error("Failed to review flashcard");
        }
    };

    const handleToggleStar = async (cardId) => {

    }

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        return "renderFlashcardViewer";
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="">
                    <Spinner />
                </div>
            );
        }

        return (
            <div className="">
                <div className="">
                    <Brain className="" strokeWidth={2} />
                </div>
                <h3 className="">
                    No Flashcards Yet
                </h3>
                <p className="">
                    Generate flashcards from your document to start learning and reinforce your knowledge.
                </p>
                <button
                    onClick={handleGenerateFlashcards}
                    disabled={generating}
                    className=""
                >
                    {generating ? (
                        <>
                            <div className="flex items-center justify-center">
                                <Spinner className="w-4 h-4 mr-2" />
                                Generating...
                            </>
                        </div>
                    ): (
                    <>
                        <Sparkles className="w-4 h-4 mr-2" strokeWidth={2} />
                        Generate Flashcards
                    </>
                    )}
                </button>
            </div>
        )
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-slate-200/50 p-8">
            {selectedSet ? renderFlashcardViewer() : renderSetList()}
        </div>
    )
}

export default FlashcardManager