import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import Chatinterface from '../../components/chat/Chatinterface';
import AiActions from '../../components/ai/AiActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';
import PdfViewer from '../../components/common/PdfViewer';
import { BASE_URL } from '../../utils/apiPaths';


const DocumentDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.view || 'content');

  /* ================= FETCH DOCUMENT ================= */

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch document details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocumentDetails();
    }
  }, [id]);

  /* ================= PDF URL HELPER ================= */

  const getPdfUrl = () => {
    const filePath = document?.data?.filePath;
    if (!filePath) return null;

    // 1. If it's already a relative path, just prepend BASE_URL
    if (filePath.startsWith('/')) {
      return `${BASE_URL}${filePath}`;
    }

    // 2. If it's an absolute URL, check if it points to localhost
    if (filePath.startsWith('http')) {
      // If we are in production but the URL points to localhost, swap it for our real BASE_URL
      if (filePath.includes('localhost')) {
        // This handles cases like http://localhost:8000/uploads/...
        // by extracting the path portion and appending it to BASE_URL
        const pathPart = filePath.split('/uploads/')[1];
        if (pathPart) {
          return `${BASE_URL}/uploads/${pathPart}`;
        }
        
        // Generic replacement as backup
        return filePath.replace(/http:\/\/localhost:\d+/g, BASE_URL);
      }
      return filePath;
    }

    // 3. Fallback for any other weird formats
    return `${BASE_URL}/${filePath.replace(/^\/+/, '')}`;
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

    const pdfUrl = getPdfUrl();

    if (!pdfUrl) {
      return (
        <div className="text-sm text-slate-500">
          PDF not available
        </div>
      );
    }

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
            h-[75vh]
            rounded-xl overflow-hidden
            border border-slate-200 dark:border-slate-700
            bg-white dark:bg-[#181b22]
          "
        >
          <PdfViewer url={pdfUrl} />
        </div>
      </div>
    );
  };

  const renderChat = () => (
    <div className="text-sm text-slate-500">
      <Chatinterface />
    </div>
  );

  const renderAIActions = () => (
    <div className="text-sm text-slate-500">
      <AiActions />
    </div>
  );

  const renderFlashcardsTab = () => (
    <div className="text-sm text-slate-500">
      <FlashcardManager documentId={id} />
    </div>
  );

  const renderQuizzesTab = () => (
    <div className="text-sm text-slate-500">
      <QuizManager documentId={id} />
    </div>
  );

  /* ================= TABS CONFIG ================= */

  const tabs = [
    { key: 'content', label: 'Content', render: renderContent },
    { key: 'chat', label: 'Chat', render: renderChat },
    { key: 'ai', label: 'AI Actions', render: renderAIActions },
    { key: 'flashcards', label: 'Flashcards', render: renderFlashcardsTab },
    { key: 'quizzes', label: 'Quizzes', render: renderQuizzesTab },
  ];

  /* ================= PAGE STATES ================= */

  if (!loading && !document) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Document not found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link
        to="/documents"
        className="
          inline-flex items-center gap-2
          text-sm text-neutral-600
          hover:text-neutral-900
          transition-colors
        "
      >
        <ArrowLeft size={16} />
        Back to Documents
      </Link>

      {/* Page Header */}
      {document?.data?.title && (
        <PageHeader title={document.data.title} />
      )}

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default DocumentDetailPage;
