import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div
      className="
        flex h-screen
        bg-slate-100 dark:bg-[#0f1115]
        text-slate-900 dark:text-slate-100
        transition-colors duration-300
      "
    >
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Page Content & Footer */}
        <main
          className="
            flex-1
            overflow-x-hidden overflow-y-auto
            animate-in fade-in slide-in-from-bottom-2 duration-300
          "
        >
          <div className="flex flex-col min-h-full">
            <div className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
