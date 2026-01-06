import React, { useState } from 'react';
import { EXERCISES } from './constants';
import { Exercise } from './types';
import ExerciseCard from './components/ExerciseCard';
import LiveSession from './components/LiveSession';
import { Dumbbell } from 'lucide-react';

export default function App() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (selectedExercise) {
    return (
      <LiveSession 
        exercise={selectedExercise} 
        onBack={() => setSelectedExercise(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-lg">
                <Dumbbell className="text-black" size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white">FormCheck AI</h1>
                <p className="text-xs text-zinc-500">Real-time Form Correction</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-medium px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400">
                Powered by Gemini 2.5 Live
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
             <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-6 py-16 md:py-24 text-center relative z-0">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                Perfect Your Form.<br/> Prevent Injury.
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Select an exercise below and let our advanced AI analyze your movement in real-time using your camera. Get instant audio feedback just like a personal trainer.
            </p>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="container mx-auto px-6 py-12">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            Available Exercises
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXERCISES.map((exercise) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onSelect={setSelectedExercise} 
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 mt-12">
        <div className="container mx-auto px-6 text-center text-zinc-600 text-sm">
            <p>&copy; {new Date().getFullYear()} FormCheck AI. Built with Gemini Multimodal Live API.</p>
        </div>
      </footer>
    </div>
  );
}