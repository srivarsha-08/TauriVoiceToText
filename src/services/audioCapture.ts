/**
 * Audio Capture Service
 * Handles microphone access and streams raw PCM audio (linear16, 16kHz) to callbacks
 * Uses Web Audio API for real-time processing instead of MediaRecorder (which encodes to webm/opus).
 */

export class AudioCaptureService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isRecording: boolean = false;
  private onDataAvailableCallback: ((audioData: Float32Array) => void) | null = null;

  /**
   * Request microphone permission and initialize media stream
   */
  async requestMicrophoneAccess(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          // Sample rate is controlled by AudioContext, not the device
        },
      });
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      throw new Error('Microphone access denied. Please grant permission to use the microphone.');
    }
  }

  /**
   * Start recording audio and stream raw PCM (float32) to callback
   * @param onDataAvailable - Callback invoked with Float32Array chunks at ~250ms intervals
   */
  startRecording(onDataAvailable: (audioData: Float32Array) => void): void {
    if (!this.mediaStream) {
      throw new Error('Media stream not initialized. Call requestMicrophoneAccess() first.');
    }

    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    this.onDataAvailableCallback = onDataAvailable;

    // Create AudioContext if not already created
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }

    // Ensure AudioContext is resumed (required after user interaction in modern browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Create source from media stream
    const mediaStreamAudioSourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Create ScriptProcessorNode to access raw audio samples
    // Use 4096 sample buffer (at 16kHz = ~256ms), process at ~250ms intervals
    const bufferSize = 4096;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    // Process audio on every audio frame
    this.scriptProcessor.onaudioprocess = (audioEvent: AudioProcessingEvent) => {
      if (this.isRecording && this.onDataAvailableCallback) {
        // Get the mono audio input (channel 0)
        const inputData = audioEvent.inputBuffer.getChannelData(0);
        // Send a copy to the callback (Float32Array)
        this.onDataAvailableCallback(new Float32Array(inputData));
      }
    };

    // Connect the nodes: mediaStream -> scriptProcessor -> audioContext.destination
    mediaStreamAudioSourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);

    this.isRecording = true;
    console.log(`Audio recording started (AudioContext sampleRate: ${this.audioContext.sampleRate}Hz)`);
  }

  /**
   * Stop recording audio
   */
  stopRecording(): Blob | null {
    if (!this.isRecording) {
      console.warn('No active recording to stop');
      return null;
    }

    this.isRecording = false;

    // Disconnect nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
    }

    console.log('Audio recording stopped');
    return null; // We return null because we're streaming PCM, not buffering
  }

  /**
   * Get the current recording state
   */
  getRecordingState(): boolean {
    return this.isRecording;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.isRecording) {
      this.stopRecording();
    }

    if (this.scriptProcessor) {
      try { this.scriptProcessor.disconnect(); } catch {}
      this.scriptProcessor = null;
    }

    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }

    if (this.mediaStream) {
      try { this.mediaStream.getTracks().forEach(track => track.stop()); } catch {}
      this.mediaStream = null;
    }

    this.onDataAvailableCallback = null;
  }
}

