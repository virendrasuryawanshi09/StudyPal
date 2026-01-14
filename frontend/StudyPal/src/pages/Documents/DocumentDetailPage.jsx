import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const DocumentDetailPage = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  /* ================= FETCH DOCUMENT ================= */

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  /* ================= PDF URL HELPER ================= */

  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    // Absolute URL
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // Relative URL
    const baseUrl =
      process.env.REACT_APP_API_URL || 'http://localhost:8000';

    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  /* ================= TAB RENDERS ================= */

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (!document?.data?.filePath) {
      return (
        <div className="text-sm text-slate-500">
          PDF not available
        </div>
      );
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex justify-end">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              text-sm font-medium
              text-slate-600 hover:text-slate-900
              dark:text-slate-400 dark:hover:text-slate-200
              transition
            "
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        {/* PDF Viewer */}
        <div
          className="
            rounded-xl overflow-hidden
            border border-slate-200 dark:border-slate-700
            bg-white dark:bg-[#181b22]
            h-[75vh]
          "
        >
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="w-full h-full"
            frameBorder="0"
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return (
      <div className="text-sm text-slate-500">
        Chat feature coming soon
      </div>
    );
  };

  const renderAIActions = () => {
    return (
      <div className="text-sm text-slate-500">
        AI actions will appear here
      </div>
    );
  };

  const renderFlashcardsTab = () => {
    return (
      <div className="text-sm text-slate-500">
        Flashcards loading...
      </div>
    );
  };

  const renderQuizzesTab = () => {
    return (
      <div className="text-sm text-slate-500">
        Quizzes loading...
      </div>
    );
  };

  /* ================= TABS CONFIG ================= */

  const tabs = [
    { key: 'content', label: 'Content', render: renderContent },
    { key: 'chat', label: 'Chat', render: renderChat },
    { key: 'ai', label: 'AI Actions', render: renderAIActions },
    { key: 'flashcards', label: 'Flashcards', render: renderFlashcardsTab },
    { key: 'quizzes', label: 'Quizzes', render: renderQuizzesTab },
  ];


  if(loading) {
    return <Spinner />
  }

  if(!document) {
    return <div className="">Document not found.</div>
  }

  return (
    <div> DocumentDetailPage</div>
  )
}
