import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  Clock,
  BookOpen,
  BrainCircuit,
} from 'lucide-react';
import moment from 'moment';

/* Utility: format file size */
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      onClick={handleNavigate}
      className="
        premium-card group cursor-pointer
        rounded-2xl p-5
        bg-white dark:bg-[#181b22]
        border border-slate-200/60 dark:border-slate-700/60
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="
            w-11 h-11 rounded-xl
            bg-slate-100 dark:bg-[#232734]
            flex items-center justify-center
          ">
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>

          <div>
            <h3
              className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1"
              title={document.title}
            >
              {document.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatFileSize(document.fileSize)}
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
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
        {document.flashcardCount !== undefined && (
          <div
            className="
              inline-flex items-center gap-2
              px-3 py-1 rounded-full text-xs font-medium
              bg-indigo-50 text-indigo-600
              dark:bg-indigo-500/15 dark:text-indigo-300
            "
          >
            <BookOpen size={14} />
            {document.flashcardCount} Flashcards
          </div>
        )}

        {document.quizCount !== undefined && (
          <div
            className="
              inline-flex items-center gap-2
              px-3 py-1 rounded-full text-xs font-medium
              bg-violet-50 text-violet-600
              dark:bg-violet-500/15 dark:text-violet-300
            "
          >
            <BrainCircuit size={14} />
            {document.quizCount} Quizzes
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="
        flex items-center gap-1.5 mt-5
        text-xs text-slate-500 dark:text-slate-400
      ">
        <Clock size={14} />
        <span>
          Uploaded {moment(document.createdAt).fromNow()}
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
