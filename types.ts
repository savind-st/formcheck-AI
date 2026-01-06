
export interface Exercise {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focusArea: string;
}

export enum SessionStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

export interface FeedbackMessage {
  id: string;
  text: string;
  sender: 'user' | 'model';
  timestamp: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
}

export interface ReviewData {
  score: number;
  feedback: string;
}
