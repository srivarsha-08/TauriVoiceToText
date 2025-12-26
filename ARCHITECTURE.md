# Architecture Documentation

## Overview

This document provides an in-depth explanation of the architectural decisions, design patterns, and implementation details of the Voice to Text Desktop App.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                         (React)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Logic                         │
│                  (Custom React Hooks)                        │
└─────────┬───────────────────────────────────────┬───────────┘
          │                                       │
          ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│   Audio Capture      │              │   Transcription      │
│     Service          │              │      Service         │
│  (MediaRecorder)     │              │    (Deepgram)        │
└──────────┬───────────┘              └──────────┬───────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐
│   Browser APIs       │              │   Deepgram API       │
│  (getUserMedia)      │              │   (WebSocket)        │
└──────────────────────┘              └──────────────────────┘
```

## Layer Breakdown

### 1. UI Layer (`App.tsx`)

**Responsibilities:**
- Render user interface components
- Handle user interactions
- Display application state
- Manage configuration flow

**Key Features:**
- Configuration screen for API key setup
- Main application screen with recording controls
- Transcript display with interim and final results
- Error messaging and status indicators

**Design Patterns:**
- **Presentational Components**: Pure UI logic, no business logic
- **Controlled Components**: Form inputs managed by React state
- **Conditional Rendering**: Different screens based on configuration state

### 2. Hook Layer (`useVoiceToText.ts`)

**Responsibilities:**
- Orchestrate audio capture and transcription services
- Manage application state
- Provide clean API for UI components
- Handle service lifecycle

**State Management:**
```typescript
interface VoiceToTextState {
  isRecording: boolean;      // Currently recording audio
  isProcessing: boolean;     // Processing/connecting
  transcript: string;        // Final transcript text
  interimTranscript: string; // Real-time interim results
  error: string | null;      // Error messages
  isReady: boolean;          // Services initialized
}
```

**Design Patterns:**
- **Facade Pattern**: Simplifies complex service interactions
- **Observer Pattern**: Callbacks for service events
- **Singleton Pattern**: Service instances persist across renders

### 3. Service Layer

#### Audio Capture Service (`audioCapture.ts`)

**Responsibilities:**
- Request microphone permissions
- Initialize MediaRecorder
- Capture audio in real-time
- Stream audio chunks for processing

**Key Implementation Details:**

```typescript
// Optimized audio settings for Deepgram
{
  echoCancellation: true,
  noiseSuppression: true,
  sampleRate: 16000  // Deepgram's recommended rate
}

// Time slicing for real-time streaming
mediaRecorder.start(250)  // 250ms chunks
```

**Design Patterns:**
- **Strategy Pattern**: Different MIME types based on browser support
- **Resource Management**: Proper cleanup of media streams

#### Transcription Service (`transcription.ts`)

**Responsibilities:**
- Connect to Deepgram WebSocket API
- Send audio data for transcription
- Receive and process transcription results
- Handle connection lifecycle

**Key Implementation Details:**

```typescript
// Deepgram configuration
{
  model: 'nova-2',           // Latest model
  language: 'en-US',
  punctuate: true,
  interim_results: true,     // Real-time feedback
  smart_format: true,
  encoding: 'linear16',
  sample_rate: 16000,
  channels: 1
}
```

**Event Handling:**
- `Open`: Connection established
- `Transcript`: Transcription results received
- `Metadata`: Additional information
- `Error`: Error occurred
- `Close`: Connection closed

**Design Patterns:**
- **Event-Driven Architecture**: Callbacks for async events
- **Promise-based API**: Async/await for clean code

## Data Flow

### Recording Flow

```
User clicks record button
         │
         ▼
useVoiceToText.startRecording()
         │
         ├─→ TranscriptionService.connect()
         │   └─→ WebSocket connection to Deepgram
         │
         └─→ AudioCaptureService.startRecording()
             └─→ MediaRecorder.start()
                 │
                 ▼
         Audio chunks (every 250ms)
                 │
                 ├─→ TranscriptionService.sendAudio()
                 │   └─→ Send to Deepgram via WebSocket
                 │
                 └─→ Deepgram processes audio
                     │
                     ├─→ Interim results (real-time)
                     │   └─→ Update interimTranscript state
                     │
                     └─→ Final results
                         └─→ Append to transcript state
```

### Stop Recording Flow

```
User clicks stop button
         │
         ▼
useVoiceToText.stopRecording()
         │
         ├─→ AudioCaptureService.stopRecording()
         │   └─→ MediaRecorder.stop()
         │
         └─→ TranscriptionService.finish()
             ├─→ Send finish signal
             ├─→ Wait for final results
             └─→ Disconnect WebSocket
```

## State Management Strategy

### Why No Redux/MobX?

**Decision:** Use React hooks and local state

**Rationale:**
1. **Simplicity**: Application state is relatively simple
2. **Performance**: No global state updates needed
3. **Maintainability**: Easier to understand and debug
4. **Bundle Size**: Smaller without additional libraries

### State Location

- **UI State**: Component-level (useState)
- **Service State**: Hook-level (useRef for instances)
- **Persistent State**: localStorage (API key)

## Error Handling Strategy

### Layers of Error Handling

1. **Service Layer**
   - Catch low-level errors
   - Throw meaningful error messages
   - Log technical details

2. **Hook Layer**
   - Catch service errors
   - Update error state
   - Provide user-friendly messages

3. **UI Layer**
   - Display error messages
   - Provide recovery options
   - Maintain app stability

### Error Categories

```typescript
// Permission Errors
"Microphone access denied. Please grant permission..."

// Network Errors
"Failed to connect to transcription service"

// API Errors
"Deepgram API key is required"

// State Errors
"Services not initialized"
```

## Performance Optimizations

### React Optimizations

1. **useCallback**: Memoize event handlers
   ```typescript
   const startRecording = useCallback(async () => {
     // ...
   }, [/* dependencies */]);
   ```

2. **useRef**: Persist service instances
   ```typescript
   const audioServiceRef = useRef<AudioCaptureService | null>(null);
   ```

3. **Conditional Rendering**: Only render what's needed
   ```typescript
   {isConfigured ? <MainApp /> : <ConfigScreen />}
   ```

### Audio Optimizations

1. **Chunk Size**: 250ms balances latency and overhead
2. **Sample Rate**: 16kHz optimal for speech recognition
3. **Encoding**: Linear16 for best Deepgram compatibility

### Network Optimizations

1. **WebSocket**: Persistent connection for real-time streaming
2. **Binary Data**: ArrayBuffer for efficient transmission
3. **Graceful Degradation**: Handle connection issues

## Security Considerations

### API Key Storage

- **Location**: localStorage (browser)
- **Encryption**: None (client-side only)
- **Best Practice**: User should keep key secure

**Note**: For production, consider:
- Encrypted storage
- Backend proxy for API calls
- Token rotation

### Content Security Policy

```json
{
  "csp": "default-src 'self'; 
          connect-src 'self' https://api.deepgram.com wss://api.deepgram.com; 
          media-src 'self' blob: mediastream:"
}
```

**Rationale:**
- Restrict external connections
- Allow Deepgram API access
- Enable microphone access

### Permissions

- **Microphone**: Requested on first use
- **Clipboard**: Used for copy functionality
- **Network**: Required for Deepgram API

## Testing Strategy

### Unit Testing (Recommended)

```typescript
// Example: audioCapture.test.ts
describe('AudioCaptureService', () => {
  it('should request microphone access', async () => {
    // Test implementation
  });
  
  it('should start recording', () => {
    // Test implementation
  });
});
```

### Integration Testing

- Test service interactions
- Test hook orchestration
- Test error scenarios

### E2E Testing (Recommended)

- Test complete user workflows
- Test across different platforms
- Test with real Deepgram API

## Scalability Considerations

### Current Limitations

1. **Single Session**: One recording at a time
2. **No History**: Transcripts not persisted
3. **Single User**: No multi-user support

### Future Scalability

1. **Multiple Sessions**
   - Queue system for recordings
   - Session management
   - History storage

2. **Backend Integration**
   - API proxy for security
   - Database for transcripts
   - User authentication

3. **Advanced Features**
   - Real-time collaboration
   - Cloud sync
   - Analytics

## Platform-Specific Considerations

### macOS

- **Permissions**: System preferences for microphone
- **Notarization**: Required for distribution
- **Code Signing**: Required for security

### Windows

- **Permissions**: Windows privacy settings
- **Installer**: MSI or EXE
- **Antivirus**: May flag unsigned apps

### Linux

- **Permissions**: Varies by distribution
- **Dependencies**: Audio libraries required
- **Packaging**: AppImage, DEB, RPM

## Build Process

### Development Build

```bash
npm run dev          # Frontend only
npm run tauri dev    # Full app with hot reload
```

### Production Build

```bash
npm run build        # Build frontend
npm run tauri build  # Build complete app
```

### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript
- **Code Splitting**: Lazy load components (future)

## Maintenance Guidelines

### Code Quality

1. **TypeScript**: Strict mode enabled
2. **Comments**: Document complex logic
3. **Naming**: Descriptive variable names
4. **Formatting**: Consistent style

### Dependency Management

1. **Regular Updates**: Keep dependencies current
2. **Security Audits**: Run `npm audit`
3. **Version Pinning**: Lock file for consistency

### Documentation

1. **README**: User-facing documentation
2. **ARCHITECTURE**: Technical documentation
3. **Code Comments**: Inline documentation
4. **API Docs**: Service interfaces

## Conclusion

This architecture prioritizes:
- **Simplicity**: Easy to understand and maintain
- **Performance**: Fast and responsive
- **Reliability**: Proper error handling
- **Extensibility**: Easy to add features

The clean separation of concerns makes it easy to:
- Test individual components
- Replace services (e.g., different transcription provider)
- Add new features without breaking existing code
- Onboard new developers quickly
