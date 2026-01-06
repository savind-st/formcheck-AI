import React from 'react';
import { Exercise } from '../types';
import { ArrowRight, Activity, Zap } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 cursor-pointer"
      onClick={() => onSelect(exercise)}
    >
      <div className="absolute inset-0 h-48 w-full">
         <img 
            src={exercise.imageUrl} 
            alt={exercise.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-40"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
      </div>

      <div className="relative pt-32 p-6 flex flex-col h-full">
        <div className="mb-auto">
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                    ${exercise.difficulty === 'Beginner' ? 'bg-emerald-900/50 text-emerald-400' : 
                      exercise.difficulty === 'Intermediate' ? 'bg-yellow-900/50 text-yellow-400' : 
                      'bg-red-900/50 text-red-400'}`}>
                    {exercise.difficulty}
                </span>
                <span className="text-zinc-400 text-xs flex items-center gap-1">
                    <Activity size={12} />
                    {exercise.focusArea}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{exercise.name}</h3>
            <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{exercise.description}</p>
        </div>

        <button className="mt-4 flex items-center justify-between w-full py-3 px-4 rounded-xl bg-zinc-800 group-hover:bg-emerald-600 text-zinc-300 group-hover:text-white transition-all font-medium">
            <span>Start Session</span>
            <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;