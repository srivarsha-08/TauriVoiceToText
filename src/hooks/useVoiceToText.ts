/**
 * useVoiceToText Hook
 * Custom React hook to manage voice recording and transcription workflow
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioCaptureService } from '../services/audioCapture';
import { TranscriptionService, TranscriptionResult } from '../services/transcription';

export interface VoiceToTextConfig {
    deepgramApiKey: string;
    language?: string;
    model?: string;
}

export interface VoiceToTextState {
    isRecording: boolean;
    isProcessing: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isReady: boolean;
}

export function useVoiceToText(config: VoiceToTextConfig) {
    const [state, setState] = useState<VoiceToTextState>({
        isRecording: false,
        isProcessing: false,
        transcript: '',
        interimTranscript: '',
        error: null,
        isReady: false,
    });

    const audioServiceRef = useRef<AudioCaptureService | null>(null);
    const transcriptionServiceRef = useRef<TranscriptionService | null>(null);

    /**
     * Initialize services
     */
    const initialize = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isProcessing: true, error: null }));

            // Initialize audio capture service
            if (!audioServiceRef.current) {
                audioServiceRef.current = new AudioCaptureService();
                await audioServiceRef.current.requestMicrophoneAccess();
            }

            // Initialize transcription service
            if (!transcriptionServiceRef.current) {
                transcriptionServiceRef.current = new TranscriptionService({
                    apiKey: config.deepgramApiKey,
                    language: config.language,
                    model: config.model,
                });

                // Set up transcription callback
                transcriptionServiceRef.current.onTranscript((result: TranscriptionResult) => {
                    if (result.isFinal) {
                        setState(prev => ({
                            ...prev,
                            transcript: prev.transcript + ' ' + result.transcript,
                            interimTranscript: '',
                        }));
                    } else {
                        setState(prev => ({
                            ...prev,
                            interimTranscript: result.transcript,
                        }));
                    }
                });

                // Set up error callback
                transcriptionServiceRef.current.onError((error: Error) => {
                    setState(prev => ({
                        ...prev,
                        error: error.message,
                        isRecording: false,
                        isProcessing: false,
                    }));
                });

                // Validate API key immediately so we can fail fast with a clear message
                await transcriptionServiceRef.current.validateApiKey();
            }

            setState(prev => ({ ...prev, isProcessing: false, isReady: true }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize services';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isProcessing: false,
                isReady: false,
            }));
        }
    }, [config.deepgramApiKey, config.language, config.model]);

    /**
     * Validate API key on-demand
     */
    const validateApiKey = useCallback(async () => {
        if (!transcriptionServiceRef.current) {
            const msg = 'Services not initialized';
            setState(prev => ({ ...prev, error: msg }));
            throw new Error(msg);
        }

        try {
            setState(prev => ({ ...prev, isProcessing: true, error: null }));
            await transcriptionServiceRef.current.validateApiKey();
            setState(prev => ({ ...prev, isProcessing: false }));
            return { success: true };
        } catch (err: any) {
            const message = err instanceof Error ? err.message : String(err);
            setState(prev => ({ ...prev, isProcessing: false, error: message }));
            return { success: false, message };
        }
    }, []);

    /**
     * Run network and auth diagnostics (validate API key and probe websocket)
     * Includes native Tauri fallback if browser-based probes fail
     */
    const runDiagnostics = useCallback(async (timeoutMs = 5000) => {
        if (!transcriptionServiceRef.current) {
            const msg = 'Services not initialized';
            setState(prev => ({ ...prev, error: msg }));
            return { apiKey: { success: false, message: msg }, websocket: null, nativeWebSocket: null };
        }

        setState(prev => ({ ...prev, isProcessing: true, error: null }));

        const results: any = { apiKey: null, websocket: null, nativeWebSocket: null };

        try {
            await transcriptionServiceRef.current.validateApiKey();
            results.apiKey = { success: true };
        } catch (err: any) {
            results.apiKey = { success: false, message: err?.message || String(err) };
        }

        try {
            const probe = await transcriptionServiceRef.current.probeConnection(timeoutMs);
            results.websocket = probe;
        } catch (err: any) {
            results.websocket = { success: false, message: err?.message || String(err) };
        }

        setState(prev => ({ ...prev, isProcessing: false }));
        return results;
    }, []);

    /**
     * Start recording and transcription
     */
    const startRecording = useCallback(async () => {
        if (!audioServiceRef.current || !transcriptionServiceRef.current) {
            setState(prev => ({ ...prev, error: 'Services not initialized' }));
            return;
        }

        try {
            setState(prev => ({
                ...prev,
                isProcessing: true,
                error: null,
                transcript: '',
                interimTranscript: '',
            }));

            // Connect to Deepgram
            await transcriptionServiceRef.current.connect();

            // Start recording with callback to send audio to Deepgram
            audioServiceRef.current.startRecording((audioChunk: Float32Array) => {
                if (transcriptionServiceRef.current) {
                    transcriptionServiceRef.current.sendAudio(audioChunk).catch(err => {
                        console.error('Failed to send audio:', err);
                    });
                }
            });

            setState(prev => ({
                ...prev,
                isRecording: true,
                isProcessing: false
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isRecording: false,
                isProcessing: false,
            }));
        }
    }, []);

    /**
     * Stop recording and transcription
     */
    const stopRecording = useCallback(async () => {
        if (!audioServiceRef.current || !transcriptionServiceRef.current) {
            return;
        }

        try {
            setState(prev => ({ ...prev, isProcessing: true }));

            // Stop recording
            audioServiceRef.current.stopRecording();

            // Finish transcription and get final results
            await transcriptionServiceRef.current.finish();

            // Disconnect from Deepgram
            transcriptionServiceRef.current.disconnect();

            setState(prev => ({
                ...prev,
                isRecording: false,
                isProcessing: false,
                interimTranscript: '',
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording';
            setState(prev => ({
                ...prev,
                error: errorMessage,
                isRecording: false,
                isProcessing: false,
            }));
        }
    }, []);

    /**
     * Clear transcript
     */
    const clearTranscript = useCallback(() => {
        setState(prev => ({
            ...prev,
            transcript: '',
            interimTranscript: '',
            error: null,
        }));
    }, []);

    /**
     * Copy transcript to clipboard
     */
    const copyToClipboard = useCallback(async () => {
        if (!state.transcript) return;

        try {
            await navigator.clipboard.writeText(state.transcript.trim());
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to copy to clipboard',
            }));
        }
    }, [state.transcript]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (audioServiceRef.current) {
                audioServiceRef.current.cleanup();
            }
            if (transcriptionServiceRef.current) {
                // Ensure finish is called before disconnect
                transcriptionServiceRef.current.finish().finally(() => {
                    transcriptionServiceRef.current?.disconnect();
                });
            }
        };
    }, []);

    return {
        ...state,
        initialize,
        startRecording,
        stopRecording,
        clearTranscript,
        copyToClipboard,
        // diagnostics helpers
        validateApiKey,
        runDiagnostics,
    };
}
