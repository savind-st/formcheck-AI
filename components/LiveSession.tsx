import React, { useRef, useEffect, useState } from 'react';
import { Exercise, SessionStatus } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';
import { Mic, MicOff, Video, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Activity, Square, Sparkles, Trophy } from 'lucide-react';

interface LiveSessionProps {
  exercise: Exercise;
  onBack: () => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ exercise, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { connect, disconnect, requestReview, status, messages, isCorrectForm, isReviewing, reviewData } = useLiveSession({
    exerciseName: exercise.name,
    videoRef
  });

  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check permissions on mount
  useEffect(() => {
    async function checkPermissions() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setHasPermissions(true);
      } catch (e) {
        setHasPermissions(false);
      }
    }
    checkPermissions();
  }, []);

  const handleStart = () => {
    connect();
  };

  const handleStop = () => {
    disconnect();
  };

  const handleFinish = () => {
    requestReview();
  };

  if (hasPermissions === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <Video size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Permissions Denied</h2>
        <p className="text-zinc-400 max-w-md">
            Please allow camera and microphone access to use the AI Coach features. 
            Check your browser settings and refresh the page.
        </p>
        <button onClick={onBack} className="mt-8 text-zinc-400 hover:text-white underline">
            Go Back
        </button>
      </div>
    );
  }

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500';
    if (score >= 70) return 'text-yellow-400 border-yellow-500';
    return 'text-red-400 border-red-500';
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button 
            onClick={() => { disconnect(); onBack(); }}
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-full"
        >
            <ArrowLeft size={18} />
            <span className="font-medium">Exit</span>
        </button>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800/50">
            <span className="text-emerald-400 font-bold tracking-wide uppercase text-sm">
                {exercise.name} Coach
            </span>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-2 backdrop-blur-md
            ${status === SessionStatus.ACTIVE ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
              status === SessionStatus.CONNECTING ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
              'bg-zinc-800/50 text-zinc-400 border border-zinc-700'}`}>
            <div className={`w-2 h-2 rounded-full ${status === SessionStatus.ACTIVE ? 'bg-red-500 animate-pulse' : 'bg-current'}`} />
            {isReviewing ? 'REVIEWING' : status === SessionStatus.IDLE ? 'READY' : status}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-zinc-900 overflow-hidden">
        {/* Video Element */}
        <video 
            ref={videoRef} 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isReviewing ? 'opacity-30 blur-md' : 'opacity-100'}`}
            muted 
            playsInline
        />

        {/* Start Overlay */}
        {status === SessionStatus.IDLE && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <div className="text-center p-8">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 animate-bounce">
                        <Video size={32} className="text-black" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Ready to Start?</h2>
                    <p className="text-zinc-300 mb-8 max-w-sm mx-auto">
                        Make sure your full body is visible in the camera frame. The AI will analyze your form in real-time.
                    </p>
                    <button 
                        onClick={handleStart}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-transform active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <Mic size={20} />
                        Start Session
                    </button>
                </div>
            </div>
        )}

        {/* Loading Overlay */}
        {status === SessionStatus.CONNECTING && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center">
                    <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                    <p className="text-white font-medium">Connecting to AI Coach...</p>
                </div>
            </div>
        )}

        {/* Reviewing Overlay - With Score */}
        {isReviewing && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 animate-in fade-in duration-300 p-6">
                <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center text-center max-w-md w-full shadow-2xl relative overflow-hidden">
                    
                    {!reviewData ? (
                        <>
                             {/* Computing State */}
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                <Sparkles size={32} className="text-emerald-400 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Performance</h3>
                            <p className="text-zinc-400 font-medium animate-pulse">
                                Calculating your form score...
                            </p>
                        </>
                    ) : (
                        <>
                             {/* Result State */}
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500" />
                             
                             <div className="mb-6 relative">
                                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-zinc-900 ${getScoreColor(reviewData.score)}`}>
                                    <div className="text-center">
                                        <span className="text-4xl font-black text-white">{reviewData.score}</span>
                                        <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider">%</span>
                                    </div>
                                </div>
                                <div className="absolute -top-2 -right-2 bg-zinc-800 p-2 rounded-full border border-zinc-700">
                                    <Trophy size={20} className={reviewData.score > 80 ? "text-yellow-400" : "text-zinc-500"} />
                                </div>
                             </div>

                             <h3 className="text-xl font-bold text-white mb-4">
                                {reviewData.score >= 90 ? "Outstanding Form!" : 
                                 reviewData.score >= 70 ? "Good Job!" : "Needs Improvement"}
                             </h3>
                             
                             <div className="bg-zinc-900/50 rounded-xl p-4 mb-8 text-left border border-zinc-800/50 w-full">
                                <p className="text-zinc-300 text-sm leading-relaxed">
                                    {reviewData.feedback}
                                </p>
                             </div>

                             <div className="flex gap-4 w-full">
                                <button 
                                    onClick={() => { disconnect(); onBack(); }}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                                >
                                    Done
                                </button>
                             </div>
                        </>
                    )}
                </div>
             </div>
        )}

        {/* Correct Form Notification */}
        {isCorrectForm && !isReviewing && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/40 flex items-center gap-3">
                    <CheckCircle2 size={24} className="animate-bounce" />
                    <span className="font-bold text-lg">Perfect Form!</span>
                </div>
            </div>
        )}

        {/* Controls Overlay */}
        {status === SessionStatus.ACTIVE && !isReviewing && (
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-6">
                <button 
                    onClick={handleStop}
                    className="bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 text-red-400 p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border border-zinc-700"
                    title="Abort Session"
                >
                    <Square size={20} fill="currentColor" />
                </button>
                
                <button 
                    onClick={handleFinish}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 font-bold flex items-center gap-3"
                    title="Finish & Review"
                >
                    <CheckCircle2 size={24} />
                    Finish & Review
                </button>
            </div>
        )}
      </div>

      {/* Transcript / Feedback Panel */}
      <div className="h-48 md:h-64 bg-zinc-950 border-t border-zinc-800 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs uppercase tracking-widest font-semibold">
            <Activity size={12} />
            Live Feedback
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
            {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm">
                    {status === SessionStatus.ACTIVE ? "Listening and watching..." : "Session history will appear here"}
                </div>
            ) : (
                messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-zinc-800 text-zinc-300 rounded-br-none' 
                                : 'bg-emerald-900/40 text-emerald-100 border border-emerald-800/50 rounded-bl-none'
                        }`}>
                            {msg.sender === 'model' && (
                                <span className="block text-[10px] text-emerald-500/80 font-bold mb-1 uppercase tracking-wide">AI Coach</span>
                            )}
                            {msg.text}
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LiveSession;