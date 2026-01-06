import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { SessionStatus, FeedbackMessage, ReviewData } from '../types';
import { decode, decodeAudioData, createBlob, blobToBase64 } from '../utils/audio';
import { MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const FRAME_RATE = 5; // Frames per second sent to model
const JPEG_QUALITY = 0.6;

interface UseLiveSessionProps {
  exerciseName: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

// Define the tool for the model to use
const scoreToolDeclaration: FunctionDeclaration = {
  name: 'submitWorkoutScore',
  description: 'Submits the final score and feedback for the workout session.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.NUMBER,
        description: 'A score from 0 to 100 representing the quality of the exercise form.',
      },
      feedback: {
        type: Type.STRING,
        description: 'A concise summary of what went well and what needs improvement.',
      },
    },
    required: ['score', 'feedback'],
  },
};

export function useLiveSession({ exerciseName, videoRef }: UseLiveSessionProps) {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [isCorrectForm, setIsCorrectForm] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  // Refs for persistent objects across renders
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  // Control flags
  const isSessionActiveRef = useRef(false);
  const shouldSendVideoRef = useRef(false);

  const connect = useCallback(async () => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
      }

      setStatus(SessionStatus.CONNECTING);
      isSessionActiveRef.current = true;
      shouldSendVideoRef.current = true;
      setIsReviewing(false);
      setReviewData(null);
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const outputCtx = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
      const inputCtx = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
      
      audioContextRef.current = outputCtx;
      inputAudioContextRef.current = inputCtx;
      
      // Get User Media (Audio & Video)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config = {
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION(exerciseName) }] },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          tools: [{ functionDeclarations: [scoreToolDeclaration] }],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setStatus(SessionStatus.ACTIVE);
            startAudioInput(stream, inputCtx);
            startVideoInput();
          },
          onmessage: (message: LiveServerMessage) => {
            handleServerMessage(message, outputCtx);
          },
          onclose: (e) => {
            console.log("Live Session Closed", e);
            if (status !== SessionStatus.ERROR) setStatus(SessionStatus.IDLE);
          },
          onerror: (e) => {
            console.error("Live Session Error", e);
            setStatus(SessionStatus.ERROR);
          }
        }
      });
      
      sessionPromise.catch(e => {
          console.error("Connection failed", e);
          setStatus(SessionStatus.ERROR);
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error("Connection failed", err);
      setStatus(SessionStatus.ERROR);
    }
  }, [exerciseName, videoRef, status]);

  const disconnect = useCallback(() => {
    isSessionActiveRef.current = false;
    shouldSendVideoRef.current = false;

    // Stop media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    // Clear intervals
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    // Close session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }

    setStatus(SessionStatus.IDLE);
    setMessages([]);
    setIsCorrectForm(false);
    setIsReviewing(false);
    // Don't clear reviewData here so we can show it on the end screen if needed, 
    // but usually user goes back to menu which unmounts component.
  }, []);

  const requestReview = useCallback(async () => {
    if (!sessionPromiseRef.current) return;
    
    // Stop normal video streaming
    shouldSendVideoRef.current = false;
    setIsReviewing(true);
    
    // Create a special "REVIEW MODE" visual frame to signal the model
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Draw black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('REVIEW MODE', canvas.width / 2, canvas.height / 2);
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
            if (blob) {
                const base64Data = await blobToBase64(blob);
                sessionPromiseRef.current.then(session => {
                    session.sendRealtimeInput({
                        media: { 
                            data: base64Data, 
                            mimeType: 'image/jpeg' 
                        }
                    });
                });
            }
        }
    } catch (e) {
        console.error("Failed to send review frame", e);
    }

  }, []);

  const startAudioInput = (stream: MediaStream, inputCtx: AudioContext) => {
    const source = inputCtx.createMediaStreamSource(stream);
    const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (e) => {
      if (!sessionPromiseRef.current || !isSessionActiveRef.current) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createBlob(inputData, INPUT_SAMPLE_RATE);
      
      sessionPromiseRef.current.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(inputCtx.destination);
  };

  const startVideoInput = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    videoIntervalRef.current = window.setInterval(() => {
        if (!video || !ctx || !sessionPromiseRef.current || !isSessionActiveRef.current || !shouldSendVideoRef.current) return;
        
        canvas.width = video.videoWidth * 0.5; // Downscale for bandwidth
        canvas.height = video.videoHeight * 0.5;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
            if (blob) {
                const base64Data = await blobToBase64(blob);
                sessionPromiseRef.current!.then(session => {
                    session.sendRealtimeInput({
                        media: { 
                            data: base64Data, 
                            mimeType: 'image/jpeg' 
                        }
                    });
                });
            }
        }, 'image/jpeg', JPEG_QUALITY);

    }, 1000 / FRAME_RATE);
  };

  const handleServerMessage = async (message: LiveServerMessage, outputCtx: AudioContext) => {
    // Handle Tool Calls (Function Calling)
    if (message.toolCall) {
        for (const fc of message.toolCall.functionCalls) {
            if (fc.name === 'submitWorkoutScore') {
                const { score, feedback } = fc.args as any;
                setReviewData({ score, feedback });
                
                // Acknowledge the tool call
                sessionPromiseRef.current?.then(session => {
                    session.sendToolResponse({
                        functionResponses: {
                            id: fc.id,
                            name: fc.name,
                            response: { result: 'OK' }
                        }
                    });
                });
            }
        }
    }

    // Handle Text Transcription
    const outputText = message.serverContent?.outputTranscription?.text;
    const inputText = message.serverContent?.inputTranscription?.text;

    if (outputText) {
      currentOutputTranscription.current += outputText;
    }
    if (inputText) {
        currentInputTranscription.current += inputText;
    }

    if (message.serverContent?.turnComplete) {
        if (currentInputTranscription.current.trim()) {
            setMessages(prev => [...prev, {
                id: Date.now().toString() + 'u',
                text: currentInputTranscription.current,
                sender: 'user',
                timestamp: Date.now()
            }]);
            currentInputTranscription.current = '';
        }

        if (currentOutputTranscription.current.trim()) {
            const text = currentOutputTranscription.current;
            setMessages(prev => [...prev, {
                id: Date.now().toString() + 'm',
                text: text,
                sender: 'model',
                timestamp: Date.now()
            }]);

            const lower = text.toLowerCase();
            if (lower.includes('good form') || lower.includes('perfect') || lower.includes('great job')) {
                setIsCorrectForm(true);
                setTimeout(() => setIsCorrectForm(false), 3000);
            }

            currentOutputTranscription.current = '';
        }
    }

    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      try {
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
        
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputCtx,
            OUTPUT_SAMPLE_RATE,
            1
        );

        const source = outputCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputCtx.destination);
        
        source.addEventListener('ended', () => {
            sourcesRef.current.delete(source);
        });

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        sourcesRef.current.add(source);

      } catch (e) {
        console.error("Error decoding audio", e);
      }
    }

    // Handle Interruption
    if (message.serverContent?.interrupted) {
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        currentOutputTranscription.current = '';
    }
  };

  return {
    connect,
    disconnect,
    requestReview,
    status,
    messages,
    isCorrectForm,
    isReviewing,
    reviewData
  };
}