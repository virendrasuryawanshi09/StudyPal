import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-slate-900 border-t border-slate-800 py-6 transition-colors duration-300">
            <div className="max-w-[1500px] mx-auto px-6 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-slate-400 tracking-wide">
                    © {currentYear} StudyPal. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
