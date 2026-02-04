import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRender from "../common/MarkdownRender";

const AiActions = () => {

  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handleGenerateSumary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setIsModalOpen("Generate Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };


  return (
    <>
      <div className="bg-white/80 dark:bg-[#181b22]/80 backdrop-blur-xl
                  border border-slate-200/60 dark:border-slate-700/60
                  rounded-2xl shadow-xl shadow-slate-200/40
                  overflow-hidden transition-all hover:shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60
                    bg-gradient-to-br from-slate-50/60 to-white/40
                    dark:from-[#1f2430] dark:to-[#181b22]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl
                        bg-slate-100 dark:bg-[#232734]
                        flex items-center justify-center">
              <Sparkles className="text-slate-700 dark:text-slate-300" strokeWidth={2} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg
                        bg-slate-100 dark:bg-[#232734]
                        flex items-center justify-center">
              <BookOpen className="text-slate-600 dark:text-slate-300" strokeWidth={2} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Generate Summary
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get a concise summary of the entire document
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateSummary}
            disabled={loadingAction === 'summary'}
            className="
          w-full mt-2 inline-flex items-center justify-center gap-2
          px-4 py-2.5 rounded-xl text-sm font-semibold
          bg-slate-900 text-white
          hover:bg-slate-800 transition-all
          disabled:opacity-60 disabled:cursor-not-allowed
        "
          >
            {loadingAction === 'summary' ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              'Summarize'
            )}
          </button>
        </div>
      </div>
    </>

  )
}

export default AiActions