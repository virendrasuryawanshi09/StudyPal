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
      {/* ================= AI ACTIONS (ONE BY ONE) ================= */}
      <div className="flex flex-col gap-6">

        {/* ================= GENERATE SUMMARY CARD ================= */}
        <div className="group relative bg-white/80 dark:bg-[#181b22]/80
          backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60
          rounded-2xl shadow-lg transition-all
          hover:shadow-2xl hover:-translate-y-1">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-500/20
              flex items-center justify-center">
              <Sparkles className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Summary</h3>
              <p className="text-xs text-slate-500">One-click document overview</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Instantly generate a clear, concise summary of the entire document using AI.
            </p>

            {/* ✅ Right aligned button */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="h-10 px-6 rounded-xl
                  bg-gradient-to-r from-indigo-600 to-blue-600
                  text-white text-sm font-medium
                  flex items-center gap-2
                  transition-all hover:opacity-90
                  disabled:opacity-50"
              >
                {loadingAction === "summary" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Summary"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= EXPLAIN CONCEPT CARD ================= */}
        <div className="group relative bg-white/80 dark:bg-[#181b22]/80
          backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60
          rounded-2xl shadow-lg transition-all
          hover:shadow-2xl hover:-translate-y-1">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/20
              flex items-center justify-center">
              <Lightbulb className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Explain Concept</h3>
              <p className="text-xs text-slate-500">Deep dive into any topic</p>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleExplainConcept} className="p-6 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter any concept from the document and get a detailed AI explanation.
            </p>

            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. Normalization in DBMS"
              disabled={loadingAction === "explain"}
              className="w-full px-4 py-2.5 rounded-xl border
                border-slate-300 dark:border-slate-600
                bg-white/60 dark:bg-[#232734]
                text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {/* ✅ Right aligned button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingAction === "explain" || !concept.trim()}
                className="h-10 px-6 rounded-xl
                  bg-gradient-to-r from-amber-500 to-orange-500
                  text-white text-sm font-medium
                  transition-all hover:opacity-90
                  disabled:opacity-50"
              >
                {loadingAction === "explain" ? "Explaining…" : "Explain"}
              </button>
            </div>
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