import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../services/documentService';
import Spinner from '../../components/common/spinner';
import Button from '../../components/common/Button';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Upload modal */
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  /* Delete modal */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error('Please provide title and file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success('Document uploaded');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

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
      setDocuments((prev) => prev.filter((d) => d._id !== selectedDoc._id));
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- RENDER ---------------- */

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

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60">
          <FileText className="w-10 h-10 text-slate-400 mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            No documents uploaded yet
          </p>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={18} />
            Upload your first document
          </Button>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="group p-5 rounded-2xl bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#232734] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                      {doc.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRequest(doc)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleUpload}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#181b22] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)}>
                <X />
              </button>
            </div>

            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Document title"
              className="w-full input"
            />

            <input type="file" onChange={handleFileChange} />

            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#181b22] p-6 space-y-4">
            <p className="text-sm">
              Delete <strong>{selectedDoc?.title}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} disabled={deleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
