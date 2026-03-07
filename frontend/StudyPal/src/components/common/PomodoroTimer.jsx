import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('study'); // 'study' or 'break'

    const timerRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else {
                    // Timer finished
                    clearInterval(timerRef.current);
                    setIsActive(false);
                    playAlarm();

                    if (mode === 'study') {
                        toast.success("Study session finished! Time for a break.");
                        handleSwitchMode('break');
                    } else {
                        toast.success("Break over! Ready to study?");
                        handleSwitchMode('study');
                    }
                }
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, minutes, seconds, mode]);

    const playAlarm = () => {
        // Basic beep or visual alert since we don't have audio files guaranteed
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
        gainNode.gain.setValueAtTime(0.1, context.currentTime);

        oscillator.start();
        oscillator.stop(context.currentTime + 1);
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(mode === 'study' ? 25 : 5);
        setSeconds(0);
    };

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setMinutes(newMode === 'study' ? 25 : 5);
        setSeconds(0);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Pomodoro
                </h3>
                <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    <button
                        onClick={() => handleSwitchMode('study')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'study' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Study
                    </button>
                    <button
                        onClick={() => handleSwitchMode('break')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'break' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Break
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center w-full">
                <div className="text-5xl md:text-6xl font-black font-mono text-slate-900 mb-8 tracking-tighter">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>

                <div className="flex gap-4 w-full">
                    <button
                        onClick={toggleTimer}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-sm ${isActive
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
                            }`}
                    >
                        {isActive ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                        {isActive ? 'Pause' : 'Start'}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                    {mode === 'study' ? (
                        <><BookOpen size={12} className="text-indigo-500" /> Focusing: 25 min sessions</>
                    ) : (
                        <><Coffee size={12} className="text-amber-500" /> Resting: 5 min relaxation</>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;
