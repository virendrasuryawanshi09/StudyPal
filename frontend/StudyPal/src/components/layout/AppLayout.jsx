import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

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

        {/* Page Content */}
        <main
          className="
            flex-1
            overflow-x-hidden overflow-y-auto
            p-6
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
