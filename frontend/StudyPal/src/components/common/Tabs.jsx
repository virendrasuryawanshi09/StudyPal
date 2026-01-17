import React from 'react';

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ================= TAB HEADER ================= */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav
          className="
            flex gap-1
            overflow-x-auto
            whitespace-nowrap
            scrollbar-hide
          "
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative
                px-3 py-2 text-sm font-semibold
                sm:px-5 sm:py-3
                rounded-t-lg
                transition-all duration-200
                ${
                  activeTab === tab.key
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }
                hover:bg-slate-100/70 dark:hover:bg-slate-800/40
              `}
            >
              {tab.label}

              {/* Active underline */}
              {activeTab === tab.key && (
                <span
                  className="
                    absolute left-2 right-2 sm:left-3 sm:right-3
                    -bottom-[1px]
                    h-[2px] rounded-full
                    bg-slate-900 dark:bg-slate-100
                  "
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="min-h-[200px] animate-fade-in px-1 sm:px-0">
        {tabs.find(tab => tab.key === activeTab)?.render?.()}
      </div>
    </div>
  );
};

export default Tabs;
