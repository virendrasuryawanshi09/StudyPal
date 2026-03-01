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
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
            Your Flashcards
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Review, master, and test your knowledge. You have <span className="font-bold text-orange-600 dark:text-orange-400">{sets.length}</span> collections in your personal deck.
          </p>
        </div>

        {sets.length > 0 && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start md:self-auto border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all ${viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all ${viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <LayoutList size={20} />
            </button>
          </div>
        )}
      </div>

      {sets.length === 0 ? (
        <div className="py-24 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/40 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-orange-50/50">
            <CopyPlus size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">No Flashcards Found</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8">
            Upload a document and let our AI generate a complete study deck for you instantly.
          </p>
          <Link
            to="/documents"
            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 hover:shadow-orange-500/30 flex items-center gap-2"
          >
            Go to Documents <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            : "flex flex-col space-y-4"
        }>
          {sets.map((set, index) => {
            const documentTitle = set.documentId?.title || "Unknown Document";
            const isGrid = viewMode === "grid";

            return (
              <Link
                key={set._id}
                to={`/documents/${set.documentId?._id}`}
                className={`group relative overflow-hidden bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-[2rem] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] hover:-translate-y-1
                  ${isGrid ? "p-8 flex flex-col" : "p-6 flex items-center justify-between"}
                `}
              >
                {/* Decorative Elements for Grid Mode */}
                {isGrid && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-bl-[60px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="absolute top-6 right-6 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm text-orange-500 z-10 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                      <Layers size={24} />
                    </div>
                  </>
                )}

                <div className={`${isGrid ? "mb-auto" : "flex items-center gap-6"}`}>
                  {!isGrid && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl">
                      <Layers size={24} />
                    </div>
                  )}

                  <div className="z-10 relative">
                    {/* Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex shrink-0"></span>
                      Ready
                    </span>

                    <h3 className={`font-black text-slate-800 dark:text-white leading-tight mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors ${isGrid ? 'text-2xl mt-4' : 'text-xl mb-1'}`}>
                      {documentTitle}
                    </h3>

                    {/* Meta for Grid */}
                    {isGrid && (
                      <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mb-8">
                        <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 w-8 h-8 rounded-full text-slate-600 dark:text-slate-300 font-bold text-sm">
                          {set.cards.length}
                        </span>
                        cards in set
                      </p>
                    )}

                    {/* Meta for List */}
                    {!isGrid && (
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {set.cards.length} cards • Created {moment(set.createdAt).fromNow()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer for Grid Mode */}
                {isGrid && (
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 relative bg-white dark:bg-[#181b22]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                      <Clock size={16} />
                      {moment(set.createdAt).fromNow()}
                    </div>

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-orange-600 text-slate-400 group-hover:text-white transition-all duration-300">
                      <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )}

                {/* Arrow for List Mode */}
                {!isGrid && (
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-orange-600 text-slate-400 group-hover:text-white transition-all duration-300">
                    <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
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