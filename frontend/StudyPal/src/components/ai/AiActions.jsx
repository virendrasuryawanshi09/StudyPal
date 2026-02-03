import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {Sparkles, BookOpen, Lightbulb} from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRender from "../common/MarkdownRender";

const AiActions = () => {

  const { id: documentId} = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handleGenerateSumary = async () => {
    setLoadingAction("summary");
    try {
      const {summary} = await aiService.generateSummary(documentId);
      setIsModalOpen("Generate Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    }catch (error) {
      toast.error("Failed to generate summary.");
    }finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if(!explainConcept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }
    setLoadingAction("explain");
    try {
      const { explaination} = await aiService.explainConcept(
        documentId,
        concept
      );

      setModalTitle("Explain Concept");
    }
  }
  return (
    <div>AiActions</div>
  )
}

export default AiActions