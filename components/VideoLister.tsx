
import React, { useState, useRef, useCallback } from 'react';
import { generateListingsFromVideo } from '../services/geminiService';
import { SparklesIcon, VideoIcon } from './Icons';

type Listing = {
    title: string;
    description: string;
    price: number;
    category: string;
    imageData: string;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};


export const VideoLister: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [generatedListings, setGeneratedListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const handleStartRecording = async () => {
        try {
            setError(null);
            setGeneratedListings([]);
            setVideoBlob(null);
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                videoRef.current.play();
            }

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            const chunks: Blob[] = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                chunks.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setVideoBlob(blob);
                cleanup();
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Could not start camera. Please grant camera permissions.");
            cleanup();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    
    const handleAnalyzeVideo = async () => {
        if (!videoBlob) return;

        setIsLoading(true);
        setError(null);
        setGeneratedListings([]);

        try {
            setLoadingMessage('Extracting frames from video...');
            const frames = await extractFramesFromVideo(videoBlob, 1); // 1 frame per second
            
            if (frames.length === 0) {
                throw new Error("Could not extract any frames from the video.");
            }
            if (frames.length > 20) { // Limit frames to avoid being too slow
                throw new Error(`Video is too long (${frames.length}s). Please record a shorter video (max 20s).`);
            }

            setLoadingMessage('AI is identifying your items...');
            const base64Frames = await Promise.all(frames.map(blob => blobToBase64(blob)));
            
            const result = await generateListingsFromVideo(base64Frames);

            if (result.listings && result.listings.length > 0) {
                setGeneratedListings(result.listings);
            } else {
                setError("AI couldn't identify any items to list. Try a clearer video!");
            }

        } catch (err: any) {
            console.error("Error analyzing video:", err);
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const reset = () => {
        setIsRecording(false);
        setVideoBlob(null);
        setGeneratedListings([]);
        setIsLoading(false);
        setError(null);
        cleanup();
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Video Lister</h2>
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">{error}</div>}
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center min-h-[300px]">
                    <video ref={videoRef} className={`w-full rounded-lg ${videoBlob && !isRecording ? '' : 'hidden'}`} controls />
                     <div className={`w-full h-full flex items-center justify-center ${videoBlob ? 'hidden' : ''}`}>
                        {isRecording ? <div className="text-red-500 font-bold">Recording...</div> : <VideoIcon />}
                    </div>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                     {!videoBlob && !isRecording && (
                        <>
                            <p className="text-gray-600 text-center">Take a short video (under 20s) panning over the items you want to sell. Our AI will automatically create listings for you!</p>
                            <button onClick={handleStartRecording} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                                Start Recording
                            </button>
                        </>
                    )}
                    {isRecording && (
                        <button onClick={handleStopRecording} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">
                            Stop Recording
                        </button>
                    )}
                    {videoBlob && !isLoading && generatedListings.length === 0 && (
                         <>
                             <p className="text-gray-600 text-center">Video ready! Let's see what you've got.</p>
                             <button onClick={handleAnalyzeVideo} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                                 <SparklesIcon /> Analyze Video
                             </button>
                             <button onClick={reset} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                                Record Again
                             </button>
                         </>
                    )}
                     {isLoading && (
                        <div className="text-center">
                             <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                            <p className="mt-4 text-gray-600">{loadingMessage}</p>
                        </div>
                    )}
                </div>
            </div>

            {generatedListings.length > 0 && (
                 <div className="mt-8">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Generated Listings ({generatedListings.length})</h3>
                        <button onClick={reset} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Start Over
                        </button>
                     </div>
                     <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         {generatedListings.map((item, index) => (
                             <div key={index} className="bg-gray-50 rounded-lg shadow p-4 space-y-2">
                                 <img src={`data:image/jpeg;base64,${item.imageData}`} alt={item.title} className="w-full h-40 object-cover rounded-md" />
                                 <h4 className="font-bold">{item.title}</h4>
                                 <p className="text-sm text-gray-600 truncate">{item.description}</p>
                                 <div className="flex justify-between items-center">
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{item.category}</span>
                                    <span className="text-lg font-bold text-green-700">${item.price}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            )}
        </div>
    );
};


// Helper function to extract frames
async function extractFramesFromVideo(videoBlob: Blob, fps: number): Promise<Blob[]> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.muted = true;
        video.src = URL.createObjectURL(videoBlob);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const frames: Blob[] = [];

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.currentTime = 0;
        };

        video.onseeked = async () => {
            if (!context) {
                 reject(new Error("Canvas context is not available."));
                 return;
            }
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob((blob) => {
                if(blob) frames.push(blob);

                if (video.currentTime < video.duration) {
                    video.currentTime += 1 / fps;
                } else {
                    resolve(frames);
                }
            }, 'image/jpeg', 0.8);
        };
        
        video.onerror = () => {
            reject(new Error("Failed to load video for frame extraction."));
        }
    });
}
