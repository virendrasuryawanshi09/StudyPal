import React from 'react';

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="space-y-6">
      {/* ================= TAB HEADER ================= */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`
                relative px-5 py-3 text-sm font-semibold
                rounded-t-lg
                transition-all duration-200
                ${
                  activeTab === tab.name
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }
                hover:bg-slate-100/70 dark:hover:bg-slate-800/40
              `}
            >
              {tab.label}

              {/* Active underline */}
              {activeTab === tab.name && (
                <span
                  className="
                    absolute left-3 right-3 -bottom-[1px]
                    h-[2px] rounded-full
                    bg-slate-900 dark:bg-slate-100
                    transition-all duration-300
                  "
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="min-h-[200px] animate-fade-in">
        {tabs.map((tab) =>
          tab.name === activeTab ? (
            <div key={tab.name} className="focus:outline-none">
              {tab.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Tabs;
