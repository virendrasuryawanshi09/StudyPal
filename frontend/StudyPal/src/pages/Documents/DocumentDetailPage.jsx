
import React, { useState, useEffect, use } from 'react'
import { Plus, Upload, Trash2, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'

import documentService from '../../services/documentService'
import Spinner from '../../components/common/spinner'
export const DocumentDetailPage = () => {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  //State for upload model
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadfile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploaduing] = useState(false);

  //For Deleting
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadfile(file);
      setUploadTitle{
        file.name.replace(/\.[^/.]+$/, "");

      }
    };

    const handleUpload = async (e) => {
      e.preventDefault();
      if (!uploadFile || !uploadTitle) {
        toast.error("Please provide a title and select a file.");
        return;
      }
      setUploaduing(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle);

      try {
        await documentService.uploadDocument(formData);
        toast.success("Document uploaded successfully!");
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadTitle("");
        setLoading(true);
        fetchDocuments();
      } catch (error) {
        toast.error(error.message || "Upload failed.");
      } finally {
        setUploading(false);
      }

    }
  }

  return (
    <div>DocumentDetailPage</div>
  )
}
export default DocumentDetailPage;