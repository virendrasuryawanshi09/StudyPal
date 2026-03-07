import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CopyPlus, Clock, ArrowRight, Layers, LayoutGrid, LayoutList, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import flashcardService from "../../services/flashcardService";
import Spinner from "../../components/common/spinner";
import Button from "../../components/common/Button";

const FlashcardsListPage = () => {
  const navigate = useNavigate();
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
          <Button
            size="lg"
            onClick={() => navigate('/documents')}
          >
            Go to Documents <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => {
            const documentTitle = set.documentId?.title || "Unknown Document";

            return (
              <Link
                key={set._id}
                to={`/documents/${set.documentId?._id}`}
                state={{ view: 'flashcards' }}
                className="
                  premium-card group cursor-pointer
                  rounded-2xl p-5
                  bg-white dark:bg-[#181b22]
                  border border-slate-200/60 dark:border-slate-700/60
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
                      <Layers className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>

                    <div>
                      <h3
                        className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1"
                        title={documentTitle}
                      >
                        {documentTitle}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {set.cards.length} cards in deck
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 transition-colors ml-2">
                    <ArrowRight size={18} />
                  </div>
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardsListPage;