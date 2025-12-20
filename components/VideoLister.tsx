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
        <div className="glass rounded-3xl p-8 animate-fade-in max-w-5xl mx-auto">
            <div className="mb-8 border-b border-border pb-6">
                <h2 className="text-3xl font-heading font-bold text-foreground mb-2">AI Video Lister</h2>
                <p className="text-muted-foreground">Scan multiple items at once with a simple video pan.</p>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 mb-6 rounded-xl flex items-center gap-3" role="alert">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                    <video
                        ref={videoRef}
                        className={`w-full h-full object-cover ${videoBlob && !isRecording ? '' : 'hidden'}`}
                        controls
                    />
                    <div className={`absolute inset-0 flex items-center justify-center ${videoBlob ? 'hidden' : ''} bg-secondary/30`}>
                        {isRecording ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                                <span className="text-white font-bold tracking-wider">RECORDING</span>
                            </div>
                        ) : (
                            <div className="text-muted-foreground/50 flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-500">
                                <VideoIcon />
                                <span className="font-medium">Camera Preview</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    {!videoBlob && !isRecording && (
                        <div className="space-y-6 text-center md:text-left">
                            <div className="bg-secondary/50 p-6 rounded-2xl border border-border">
                                <h3 className="font-bold text-foreground mb-2">How it works</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Take a short video (under 20s) panning over the items you want to sell.
                                    Our AI will automatically identify each item and create listings for you!
                                </p>
                            </div>
                            <button
                                onClick={handleStartRecording}
                                className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Start Recording
                            </button>
                        </div>
                    )}

                    {isRecording && (
                        <button
                            onClick={handleStopRecording}
                            className="w-full bg-red-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] animate-pulse"
                        >
                            Stop Recording
                        </button>
                    )}

                    {videoBlob && !isLoading && generatedListings.length === 0 && (
                        <div className="space-y-4 animate-slide-up">
                            <p className="text-foreground font-medium text-center">Video captured! Ready to analyze?</p>
                            <button
                                onClick={handleAnalyzeVideo}
                                className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                Analyze Video
                            </button>
                            <button
                                onClick={reset}
                                className="w-full bg-secondary text-foreground font-bold py-3 px-6 rounded-xl hover:bg-secondary/80 transition-colors"
                            >
                                Record Again
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-8 bg-secondary/30 rounded-2xl border border-border animate-pulse">
                            <div className="flex items-center justify-center space-x-3 mb-4">
                                <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                            </div>
                            <p className="text-foreground font-medium">{loadingMessage}</p>
                        </div>
                    )}
                </div>
            </div>

            {generatedListings.length > 0 && (
                <div className="mt-12 animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-foreground">Generated Listings <span className="text-muted-foreground text-lg font-normal">({generatedListings.length})</span></h3>
                        <button onClick={reset} className="text-primary font-semibold hover:underline">
                            Start Over
                        </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {generatedListings.map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={`data:image/jpeg;base64,${item.imageData}`} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-foreground shadow-sm">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h4>
                                        <span className="text-lg font-bold text-green-600 whitespace-nowrap">${item.price}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                                    <button className="w-full mt-2 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-colors">
                                        Edit Details
                                    </button>
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
                if (blob) frames.push(blob);

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
