import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRender from "../common/MarkdownRender";
import Modal from "../common/Modal";

const AiActions = () => {
  const { id: documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  // 🔹 Generate Summary
  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { data } = await aiService.generateSummary(documentId);
      setModalTitle("Generate Summary");
      setModalContent(data.summary);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 🔹 Explain Concept
  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setLoadingAction("explain");
    try {
      const { data } = await aiService.explainConcept(documentId, concept);
      setModalTitle(`Explanation: ${concept}`);
      setModalContent(data.explanation);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* ================= GENERATE SUMMARY ================= */}
        <div className="bg-white/80 dark:bg-[#181b22]/80
          backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60
          rounded-2xl shadow-sm px-6 py-4">

          <div className="flex items-center justify-between gap-6">
            
            {/* LEFT CONTENT */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20
                flex items-center justify-center">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">Generate Summary</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Get a concise summary of the entire document.
                </p>
              </div>
            </div>

            {/* RIGHT BUTTON */}
            <button
              onClick={handleGenerateSummary}
              disabled={loadingAction === "summary"}
              className="h-9 px-5 rounded-lg text-sm font-medium
                bg-indigo-600 text-white
                disabled:opacity-50 whitespace-nowrap"
            >
              {loadingAction === "summary" ? "Loading…" : "Summarize"}
            </button>
          </div>
        </div>

        {/* ================= EXPLAIN CONCEPT ================= */}
        <div className="bg-white/80 dark:bg-[#181b22]/80
          backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60
          rounded-2xl shadow-sm px-6 py-4">

          <form
            onSubmit={handleExplainConcept}
            className="flex items-center justify-between gap-6"
          >
            {/* LEFT CONTENT */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20
                flex items-center justify-center">
                <Lightbulb className="text-amber-600 dark:text-amber-400" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold">Explain a Concept</h3>
                <p className="text-xs text-slate-500 mt-1 mb-2">
                  Enter a topic from the document to get a detailed explanation.
                </p>

                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g. useState Hook"
                  className="w-full px-3 py-2 rounded-lg border
                    border-slate-300 dark:border-slate-600
                    bg-white/60 dark:bg-[#232734]
                    text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* RIGHT BUTTON */}
            <button
              type="submit"
              disabled={loadingAction === "explain" || !concept.trim()}
              className="h-9 px-5 rounded-lg text-sm font-medium
                bg-amber-500 text-white
                disabled:opacity-50 whitespace-nowrap"
            >
              {loadingAction === "explain" ? "Loading…" : "Explain"}
            </button>
          </form>
        </div>

      </div>

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="prose-sm max-w-none prose-slate dark:prose-invert">
          <MarkdownRender content={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default AiActions;