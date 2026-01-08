import React from 'react';
import { Exercise } from '../types';
import { X, Play, Activity, Clock, Info } from 'lucide-react';

interface ExercisePreviewModalProps {
  exercise: Exercise;
  onClose: () => void;
  onStart: () => void;
}

const ExercisePreviewModal: React.FC<ExercisePreviewModalProps> = ({ exercise, onClose, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Header */}
        <div className="relative h-64 w-full shrink-0">
          <img 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
             <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                    ${exercise.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                      exercise.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' : 
                      'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                    {exercise.difficulty}
                </span>
             </div>
             <h2 className="text-3xl font-bold text-white shadow-sm leading-tight">{exercise.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-6 mb-6 text-sm text-zinc-400 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
               <Activity size={16} className="text-emerald-500" />
               <span>{exercise.focusArea}</span>
            </div>
             <div className="flex items-center gap-2">
               <Clock size={16} className="text-blue-500" />
               <span>~5-10 mins</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Info size={14} className="text-zinc-500" />
                    Instructions
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                {exercise.description}
                </p>
            </div>
            
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
               <h4 className="text-emerald-400 font-medium mb-3 text-sm flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                 AI Coach Tips
               </h4>
               <ul className="text-sm text-zinc-400 space-y-2 ml-1">
                  <li className="flex gap-2">
                    <span className="text-zinc-600">•</span>
                    Ensure your full body is visible in the camera frame.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-600">•</span>
                    Perform movements slowly for accurate analysis.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-600">•</span>
                    Make sure you have good lighting.
                  </li>
               </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 mt-auto bg-zinc-900">
            <button 
                onClick={onStart}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-900/20"
            >
                <Play size={20} fill="currentColor" />
                Start Session
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExercisePreviewModal;
