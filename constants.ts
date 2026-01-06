import { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    description: 'Keep your back straight, chest up, and lower your hips as if sitting in a chair.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Beginner',
    focusArea: 'Legs & Glutes'
  },
  {
    id: 'pushup',
    name: 'Push Up',
    description: 'Maintain a straight line from head to heels. Lower your chest until it almost touches the floor.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Intermediate',
    focusArea: 'Chest & Arms'
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'Hold a push-up position on your forearms. Keep your core tight and body straight.',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Beginner',
    focusArea: 'Core'
  },
  {
    id: 'lunge',
    name: 'Forward Lunge',
    description: 'Step forward with one leg, lowering your hips until both knees are bent at a 90-degree angle.',
    imageUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Intermediate',
    focusArea: 'Legs'
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    description: 'Jump spreading your legs and clapping your hands overhead, then return to starting position.',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Beginner',
    focusArea: 'Cardio'
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    description: 'Start in a plank position and alternate driving your knees towards your chest rapidly.',
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Intermediate',
    focusArea: 'Core & Cardio'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Drop to a squat, kick feet back, do a push-up, return to squat, and jump up.',
    imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Advanced',
    focusArea: 'Full Body'
  },
  {
    id: 'glute_bridge',
    name: 'Glute Bridge',
    description: 'Lie on your back, knees bent. Lift your hips until your body forms a straight line.',
    imageUrl: 'https://images.unsplash.com/photo-1608216737135-162803600b64?q=80&w=600&auto=format&fit=crop',
    difficulty: 'Beginner',
    focusArea: 'Glutes'
  }
];

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const SYSTEM_INSTRUCTION = (exerciseName: string) => `
You are an expert fitness coach AI. Your goal is to analyze the user's form for the exercise: "${exerciseName}".

PROTOCOL:
1. PHASE 1: OBSERVATION
   - Watch the video stream.
   - Give short, encouraging feedback on form (e.g., "Good depth", "Keep back straight").
   - If the user stops moving briefly, ask if they are ready to continue.

2. PHASE 2: REVIEW (TRIGGERED BY "REVIEW MODE")
   - The user will trigger this phase by sending a visual frame with text "REVIEW MODE".
   - CRITICAL: When you see this, you MUST STOP giving live feedback.
   - You MUST immediately evaluate the entire session history.
   - You MUST call the "submitWorkoutScore" tool with:
     1. A score from 0-100 based on their technique consistency.
     2. A short summary string explaining the score.
   - DO NOT speak the score. Use the tool.

General Rules:
- Be strict on form but encouraging in tone.
- If form was perfect, give 100. If dangerous, give < 50.
`;