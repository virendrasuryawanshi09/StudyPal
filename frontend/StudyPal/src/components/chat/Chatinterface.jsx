import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/spinner';
import MarkdownRenderer from '../common/MarkdownRender';

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messageEndRef = useRef(null);

  /* ================= SCROLL ================= */

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  /* ================= FETCH HISTORY ================= */

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data || []);
      } catch (error) {
        console.error('Failed to fetch chat history', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  /* ================= SEND MESSAGE ================= */

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, message);

      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= MESSAGE RENDER ================= */

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';

    return (
      <div
        key={index}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`
            max-w-[75%] px-4 py-3 rounded-2xl text-sm
            ${
              isUser
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 dark:bg-[#232734] text-slate-800 dark:text-slate-200'
            }
          `}
        >
          {msg.role === 'assistant' ? (
            <MarkdownRenderer content={msg.content} />
          ) : (
            msg.content
          )}
        </div>
      </div>
    );
  };

  /* ================= LOADING STATE ================= */

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white dark:bg-[#181b22] rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
        <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#232734] mb-4">
          <MessageSquare size={26} className="text-slate-500" />
        </div>
        <Spinner />
        <p className="mt-3 text-sm text-slate-500">
          Loading chat history...
        </p>
      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-[#181b22] rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            <Sparkles className="mb-2" />
            Ask questions about this document
          </div>
        )}

        {history.map(renderMessage)}
        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 dark:border-slate-700 p-4 flex gap-3"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something about this document..."
          className="
            flex-1 px-4 py-2.5 rounded-xl text-sm
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-[#1f2430]
            focus:outline-none focus:ring-2 focus:ring-slate-400
          "
        />

        <button
          type="submit"
          disabled={loading}
          className="
            w-11 h-11 flex items-center justify-center rounded-xl
            bg-slate-900 text-white
            hover:bg-slate-800 transition
            disabled:opacity-50
          "
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
