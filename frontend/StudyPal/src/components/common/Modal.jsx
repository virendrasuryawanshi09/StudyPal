import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className="
          relative w-full max-w-2xl mx-4
          bg-white dark:bg-[#181b22]
          rounded-2xl shadow-2xl
          animate-in fade-in zoom-in duration-200
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            px-6 py-4 border-b
            border-slate-200 dark:border-slate-700
          "
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* ✅ BODY (IMPORTANT CHANGE HERE) */}
        <div
          className="
            px-6 py-5
            max-h-[70vh] overflow-y-auto
            flex flex-col gap-6
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;