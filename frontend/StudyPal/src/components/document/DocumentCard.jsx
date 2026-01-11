import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Clock } from 'lucide-react';
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
        group cursor-pointer
        p-5 rounded-2xl
        bg-white dark:bg-[#181b22]
        border border-slate-200/60 dark:border-slate-700/60
        hover:shadow-lg hover:-translate-y-0.5
        transition-all
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="
            w-10 h-10 rounded-xl
            bg-slate-100 dark:bg-[#232734]
            flex items-center justify-center
          ">
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>

          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {document.title}
            </p>
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
          aria-label="Delete document"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
        <Clock size={14} />
        <span>
          Uploaded {moment(document.createdAt).fromNow()}
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
