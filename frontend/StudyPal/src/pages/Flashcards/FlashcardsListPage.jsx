import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CopyPlus, Clock, ArrowRight, Layers, LayoutGrid, LayoutList } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import flashcardService from "../../services/flashcardService";
import Spinner from "../../components/common/spinner";

const FlashcardsListPage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchSets = async () => {
      try {
        setLoading(true);
        const res = await flashcardService.getAllFlashcardSets();
        setSets(res.data || []);
      } catch (error) {
        toast.error("Failed to load flashcard sets.");
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Your Flashcards
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">
            Review, master, and test your knowledge. You have <span className="font-semibold text-slate-700 dark:text-slate-300">{sets.length}</span> collections in your personal deck.
          </p>
        </div>

        {sets.length > 0 && (
          <div className="flex bg-slate-100 dark:bg-[#181b22] p-1.5 rounded-xl self-start md:self-auto border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                  ? "bg-white dark:bg-[#232734] text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                  ? "bg-white dark:bg-[#232734] text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <LayoutList size={18} />
            </button>
          </div>
        )}
      </div>

      {sets.length === 0 ? (
        <div className="py-24 bg-white dark:bg-[#181b22] border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-[#232734] text-slate-500 rounded-xl flex items-center justify-center mb-6">
            <CopyPlus size={28} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Flashcards Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center mb-6">
            Upload a document and let our AI generate a complete study deck for you instantly.
          </p>
          <Link
            to="/documents"
            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-colors hover:opacity-90 flex items-center gap-2"
          >
            Go to Documents <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col space-y-4"
        }>
          {sets.map((set, index) => {
            const documentTitle = set.documentId?.title || "Unknown Document";
            const isGrid = viewMode === "grid";

            return (
              <Link
                key={set._id}
                to={`/documents/${set.documentId?._id}`}
                className={`group relative bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600
                  ${isGrid ? "p-6 flex flex-col h-full" : "p-4 flex items-center justify-between"}
                `}
              >
                <div className={`${isGrid ? "mb-auto" : "flex items-center gap-4"}`}>
                  {!isGrid && (
                    <div className="p-3 bg-slate-100 dark:bg-[#232734] text-slate-500 rounded-xl">
                      <Layers size={20} />
                    </div>
                  )}

                  <div>
                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-[#232734] text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider rounded border border-slate-200 dark:border-slate-700/50 mb-3">
                      Ready
                    </span>

                    <h3 className={`font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-2 group-hover:text-emerald-500 transition-colors ${isGrid ? 'text-lg mt-2' : 'text-md mb-1'}`}>
                      {documentTitle}
                    </h3>

                    {/* Meta for Grid */}
                    {isGrid && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                        {set.cards.length} cards in set
                      </p>
                    )}

                    {/* Meta for List */}
                    {!isGrid && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {set.cards.length} cards • Created {moment(set.createdAt).fromNow()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer for Grid Mode */}
                {isGrid && (
                  <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock size={14} />
                      {moment(set.createdAt).fromNow()}
                    </div>

                    <div className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-all duration-300">
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )}

                {/* Arrow for List Mode */}
                {!isGrid && (
                  <div className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-all duration-300">
                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardsListPage;