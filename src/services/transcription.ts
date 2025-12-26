/**
 * Deepgram Transcription Service
 * Handles real-time speech-to-text transcription using Deepgram API
 */

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { probeDeepgramNative } from './nativeProbe';

export interface TranscriptionConfig {
    apiKey: string;
    language?: string;
    model?: string;
    punctuate?: boolean;
    interimResults?: boolean;
}

export interface TranscriptionResult {
    transcript: string;
    isFinal: boolean;
    confidence: number;
}

export class TranscriptionService {
    private deepgram: any;
    private connection: any = null;
    private isConnected: boolean = false;
    private onTranscriptCallback: ((result: TranscriptionResult) => void) | null = null;
    private onErrorCallback: ((error: Error) => void) | null = null;

    constructor(private config: TranscriptionConfig) {
        if (!config.apiKey) {
            throw new Error('Deepgram API key is required');
        }

        this.deepgram = createClient(config.apiKey);
    }

    /**
     * Initialize live transcription connection
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            console.warn('Already connected to Deepgram');
            return;
        }

        let attempts = 0;
        const maxAttempts = 2;
        let lastError: any = null;

        while (attempts < maxAttempts) {
            try {
                // Create live transcription connection
                this.connection = this.deepgram.listen.live({
                    model: this.config.model || 'nova-2',
                    language: this.config.language || 'en-US',
                    punctuate: this.config.punctuate !== false,
                    interim_results: this.config.interimResults !== false,
                    smart_format: true,
                    encoding: 'linear16',
                    sample_rate: 16000,
                    channels: 1,
                });

                // Set up event listeners
                this.setupEventListeners();

                // Wait for connection to open
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Connection timeout'));
                    }, 10000);

                    this.connection.on(LiveTranscriptionEvents.Open, () => {
                        clearTimeout(timeout);
                        this.isConnected = true;
                        console.log('Connected to Deepgram');
                        resolve();
                    });

                    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
                return;
            } catch (error: any) {
                lastError = error;
                attempts++;
                // If abnormal close or network error, try reconnect once
                if (error?.message?.includes('1006') || error?.message?.includes('Network error')) {
                    console.warn('Deepgram connection failed, retrying...');
                    await new Promise(res => setTimeout(res, 500));
                    continue;
                }
                break;
            }
        }

        // Notify any registered error handlers with the original message
        if (this.onErrorCallback) {
            this.onErrorCallback(new Error(lastError?.message || 'Failed to connect to Deepgram'));
        }

        // Throw a descriptive error that includes the original error message so callers can surface it to users
        throw new Error(`Failed to connect to transcription service: ${lastError?.message || String(lastError)}`);
    }

    /**
     * Set up event listeners for the Deepgram connection
     */
    private setupEventListeners(): void {
        if (!this.connection) return;

        // Handle transcription results
        this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
            const transcript = data.channel?.alternatives?.[0]?.transcript;
            const isFinal = data.is_final;
            const confidence = data.channel?.alternatives?.[0]?.confidence || 0;

            if (transcript && this.onTranscriptCallback) {
                this.onTranscriptCallback({
                    transcript,
                    isFinal,
                    confidence,
                });
            }
        });

        // Handle metadata
        this.connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
            console.log('Metadata:', data);
        });

        // Handle errors (map common problems to friendly messages)
        this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
            console.error('Deepgram error:', error);

            // Default message from SDK
            let userMessage = error?.message || 'Transcription error';

            // Map common SDK messages to clearer user-facing text
            if (/Status:\s*401|401 Unauthorized|No key or access token provided|access token/i.test(userMessage)) {
                userMessage = 'Authentication failed — check your Deepgram API key';
            } else if (/Status:\s*403|403 Forbidden/i.test(userMessage)) {
                userMessage = 'Permission denied — check your Deepgram account and plan';
            } else if (/Connection timeout|timeout|Ready State: CLOSING|Ready State: CLOSED/i.test(userMessage)) {
                userMessage = 'Network error — WebSocket connection failed (check network/firewall)';
            }

            if (this.onErrorCallback) {
                this.onErrorCallback(new Error(userMessage));
            }
        });

        // Handle connection close (include code & reason for diagnostics)
        this.connection.on(LiveTranscriptionEvents.Close, (event: any) => {
            const code = event?.code;
            const reason = event?.reason;
            console.log('Deepgram connection closed', { code, reason });

            this.isConnected = false;

            // Provide a helpful message for common abnormal close codes
            if (code && code !== 1000) {
                let message: string;

                if (code === 1006) {
                    // 1006 = Abnormal closure (no close frame) — frequently indicates network, TLS, or proxy issues
                    message = 'Connection closed abnormally (1006) — possible network/firewall/TLS/proxy issue blocking WebSocket connections';
                } else {
                    message = `Connection closed (code ${code})${reason ? `: ${reason}` : ''}`;
                }

                if (this.onErrorCallback) {
                    this.onErrorCallback(new Error(message));
                }
            }
        });
    }

    /**
     * Send audio data to Deepgram for transcription
     * Accepts either raw Float32Array PCM or Blob, converts to linear16 bytes for Deepgram
     */
    async sendAudio(audioData: Blob | Float32Array): Promise<void> {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected to transcription service');
        }

        try {
            let audioBuffer: ArrayBuffer;

            // If input is Float32Array (raw PCM), convert to linear16
            if (audioData instanceof Float32Array) {
                audioBuffer = this.float32ToLinear16(audioData);
            } else {
                // If input is Blob, convert to ArrayBuffer
                audioBuffer = await audioData.arrayBuffer();
            }

            // Send audio data to Deepgram
            this.connection.send(audioBuffer);
        } catch (error) {
            console.error('Failed to send audio:', error);
            throw new Error('Failed to send audio for transcription');
        }
    }

    /**
     * Convert Float32Array (raw PCM samples from Web Audio API) to linear16 (Int16Array) bytes
     * Deepgram expects signed 16-bit PCM at 16kHz
     */
    private float32ToLinear16(float32Array: Float32Array): ArrayBuffer {
        const int16Array = new Int16Array(float32Array.length);

        for (let i = 0; i < float32Array.length; i++) {
            // Clamp float32 value to [-1, 1] range
            let sample = Math.max(-1, Math.min(1, float32Array[i]));

            // Convert to signed 16-bit integer
            int16Array[i] = sample < 0 ? sample * 32768 : sample * 32767;
        }

        return int16Array.buffer;
    }

    /**
     * Register callback for transcription results
     */
    onTranscript(callback: (result: TranscriptionResult) => void): void {
        this.onTranscriptCallback = callback;
    }

    /**
     * Register callback for errors
     */
    onError(callback: (error: Error) => void): void {
        this.onErrorCallback = callback;
    }

    /**
     * Validate API key using a WebSocket probe.
     * Falls back to native Tauri probe if browser probe fails (CORS/TLS/proxy issues).
     *
     * Note: REST requests from the browser are blocked by CORS for Deepgram API.
     * We perform a short-lived WebSocket probe instead to surface auth vs network errors.
     */
    async validateApiKey(timeoutMs = 4000): Promise<void> {
        // Try browser-based probe first
        const probe = await this.probeConnection(timeoutMs);
        if (probe.success) return; // probe succeeded, key is valid for WS

        // If browser probe failed (likely due to TLS/proxy), try native Tauri probe
        console.warn('Browser-based probe failed; attempting native Tauri probe...');
        const nativeProbe = await probeDeepgramNative(this.config.apiKey, timeoutMs);
        if (nativeProbe.success) return; // Native probe succeeded

        // Both probes failed — map error to user-friendly message
        const msg = nativeProbe.message || probe.message || '';

        if (/Authentication failed|401|Unauthorized|access token/i.test(msg)) {
            throw new Error('Authentication failed — check your Deepgram API key');
        }

        if (/timed out|WebSocket probe timed out|timeout|Timeout/i.test(msg) || probe.code === 1006) {
            throw new Error(`WebSocket connection failed (possible network/firewall/proxy issue): ${msg}`);
        }

        // Generic failure
        throw new Error(`Deepgram API key validation failed: ${msg}`);
    }

    /**
     * Probe the websocket endpoint by creating a short-lived live connection and reporting the result.
     */
    async probeConnection(timeoutMs = 5000): Promise<{ success: boolean; message: string; code?: number; reason?: string }> {
        try {
            // Create a short-lived connection with the same params as connect()
            const probeConn: any = this.deepgram.listen.live({
                model: this.config.model || 'nova-2',
                language: this.config.language || 'en-US',
                punctuate: this.config.punctuate !== false,
                interim_results: this.config.interimResults !== false,
                smart_format: true,
                encoding: 'linear16',
                sample_rate: 16000,
                channels: 1,
            });

            return await new Promise((resolve) => {
                let finished = false;

                const finish = (result: { success: boolean; message: string; code?: number; reason?: string }) => {
                    if (finished) return;
                    finished = true;
                    try {
                        probeConn.finish();
                    } catch (e) {
                        // ignore
                    }
                    resolve(result);
                };

                const timeout = setTimeout(() => {
                    finish({ success: false, message: 'WebSocket probe timed out' });
                }, timeoutMs);

                probeConn.on(LiveTranscriptionEvents.Open, () => {
                    clearTimeout(timeout);
                    finish({ success: true, message: 'WebSocket opened successfully' });
                });

                probeConn.on(LiveTranscriptionEvents.Error, (err: any) => {
                    clearTimeout(timeout);
                    const msg = err?.message || String(err);
                    finish({ success: false, message: `Error: ${msg}` });
                });

                probeConn.on(LiveTranscriptionEvents.Close, (event: any) => {
                    clearTimeout(timeout);
                    const code = event?.code;
                    const reason = event?.reason;
                    finish({ success: false, message: `Closed (code ${code})${reason ? `: ${reason}` : ''}`, code, reason });
                });
            });
        } catch (err: any) {
            return { success: false, message: `Probe failed: ${err?.message || String(err)}` };
        }
    }

    /**
     * Finish sending audio and close the connection gracefully
     */
    async finish(): Promise<void> {
        if (!this.connection) return;

        try {
            // Send finish signal to get final results
            this.connection.finish();

            // Wait a bit for final results
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error finishing transcription:', error);
        }
    }

    /**
     * Disconnect from Deepgram
     */
    disconnect(): void {
        if (this.connection) {
            this.connection.finish();
            this.connection = null;
        }
        this.isConnected = false;
        this.onTranscriptCallback = null;
        this.onErrorCallback = null;
    }

    /**
     * Check if connected to Deepgram
     */
    getConnectionState(): boolean {
        return this.isConnected;
    }
}
