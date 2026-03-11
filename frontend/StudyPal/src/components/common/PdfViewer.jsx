import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import Spinner from './spinner';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  };

  const adjustScale = (delta) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.5));
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {pageNumber} / {numPages || '--'}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustScale(-0.1)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm font-medium min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => adjustScale(0.1)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Download PDF"
        >
          <Download size={18} />
        </a>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        <div className="shadow-lg bg-white">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center py-20 px-10 gap-3">
                <Spinner />
                <p className="text-sm text-slate-500 animate-pulse">Loading PDF...</p>
              </div>
            }
            error={
              <div className="p-10 text-center text-red-500">
                <p>Failed to load PDF.</p>
                <p className="text-xs mt-2 opacity-70">Please check your connection or try again later.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer={true}
              renderTextLayer={true}
              className="max-w-full"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
