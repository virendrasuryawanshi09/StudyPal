import React, { useState, useEffect, useRef } from 'react';
import { Plus, Upload, FileText, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../services/documentService';
import Spinner from '../../components/common/spinner';
import Button from '../../components/common/Button';
import DocumentCard from '../../components/document/DocumentCard';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Upload modal */
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /* Delete modal */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);
  const titleInputRef = useRef(null);

  /* ================= HELPERS ================= */

  const clearSelectedFile = () => {
    setUploadFile(null);
    setUploadTitle('');
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ================= FETCH ================= */

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  /* ================= FILE HANDLING ================= */

  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  /* ================= UPLOAD ================= */

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle.trim()) {
      toast.error('Please provide title and select a file');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim());

    try {
      await documentService.uploadDocument(formData);
      toast.success('Document uploaded');
      setIsUploadModalOpen(false);
      clearSelectedFile();
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d._id !== selectedDoc._id));
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            My Documents
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and organize your learning materials
          </p>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus size={18} />
          Upload Document
        </Button>
      </div>

      {/* Content */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white dark:bg-[#181b22] rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <FileText className="w-10 h-10 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500 mb-4">
            No documents uploaded yet
          </p>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus size={18} />
            Upload Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(doc => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* ================= UPLOAD MODAL ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleUpload}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#181b22] p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Document</h2>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  clearSelectedFile();
                }}
              >
                <X />
              </button>
            </div>

            <input
              ref={titleInputRef}
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Document title"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f2430]"
            />

            <div
              onClick={() => !uploadFile && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                isDragging
                  ? 'border-slate-500 bg-slate-100 dark:bg-[#232734]'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {!uploadFile ? (
                <div className="text-center cursor-pointer">
                  <Upload className="mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Click to upload or drag & drop PDF
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium">
                      {uploadFile.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#181b22] p-6 rounded-2xl space-y-4">
            <p>
              Delete <strong>{selectedDoc?.title}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
