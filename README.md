# Voice to Text Desktop App

A cross-platform desktop application for real-time voice-to-text transcription powered by **Tauri** and **Deepgram AI**. This project demonstrates modern desktop app development with AI integration, featuring a clean architecture and beautiful user interface.

![Voice to Text App](https://img.shields.io/badge/Tauri-2.0-blue) ![React](https://img.shields.io/badge/React-19.1-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6) ![Deepgram](https://img.shields.io/badge/Deepgram-AI-purple)

## 🎯 Project Overview

This application is a functional clone of Wispr Flow, focusing on core voice-to-text functionality with real-time speech recognition. It provides a seamless voice input experience across Windows, macOS, and Linux platforms.

### Key Features

- ✅ **Push-to-Talk Voice Input** - Intuitive recording mechanism with visual feedback
- ✅ **Real-Time Transcription** - Low-latency speech-to-text using Deepgram's Nova-2 model
- ✅ **Microphone Access** - Proper permission handling and audio capture
- ✅ **Clean UI** - Modern, responsive interface with glassmorphism effects
- ✅ **Error Handling** - Graceful handling of network issues, API errors, and permission denials
- ✅ **Cross-Platform** - Works on Windows, macOS, and Linux
- ✅ **Clipboard Integration** - Easy copy-to-clipboard functionality
- ✅ **Secure API Key Storage** - Local storage for Deepgram API credentials

## 🏗️ Technical Stack

### Core Technologies

- **[Tauri 2.0](https://tauri.app/)** - Cross-platform desktop framework with native system integration
- **[React 19.1](https://react.dev/)** - Modern UI library with hooks
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type-safe development
- **[Deepgram SDK](https://deepgram.com/)** - Real-time speech recognition API
- **[Vite 7.0](https://vite.dev/)** - Fast build tool and dev server

### Why These Technologies?

- **Tauri**: Smaller bundle sizes (~3-5MB vs Electron's 50MB+), better performance, native system APIs, and Rust-powered security
- **Deepgram**: State-of-the-art speech recognition with low latency (<300ms), high accuracy, and support for real-time streaming
- **React + TypeScript**: Robust component architecture with type safety for maintainable code

## 📁 Project Structure

```
voice-to-text-app/
├── src/
│   ├── services/
│   │   ├── audioCapture.ts      # Microphone access & audio recording
│   │   └── transcription.ts     # Deepgram API integration
│   ├── hooks/
│   │   └── useVoiceToText.ts    # Main workflow orchestration
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Styling with modern design system
│   └── main.tsx                  # React entry point
├── src-tauri/
│   ├── src/
│   │   └── lib.rs                # Rust backend
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **Rust** (latest stable)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Platform-specific dependencies**:
   - **macOS**: Xcode Command Line Tools
     ```bash
     xcode-select --install
     ```
   - **Windows**: Microsoft C++ Build Tools
   - **Linux**: See [Tauri prerequisites](https://tauri.app/start/prerequisites/)

4. **Deepgram API Key**
   - Sign up at [Deepgram Console](https://console.deepgram.com/signup)
   - Get your API key from the dashboard
   - Free tier includes $200 credits

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-to-text-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run tauri dev
   ```

   This will:
   - Start the Vite dev server
   - Compile the Rust backend
   - Launch the desktop application

### First-Time Setup

1. When the app launches, you'll see a configuration screen
2. Enter your Deepgram API key
3. Click "Get Started"
4. Grant microphone permissions when prompted
5. Start using voice-to-text!

## 🎨 Architecture & Design Decisions

### Separation of Concerns

The application follows a clean architecture with three distinct layers:

1. **Service Layer** (`src/services/`)
   - `audioCapture.ts`: Handles all microphone and MediaRecorder interactions
   - `transcription.ts`: Manages Deepgram WebSocket connections and events

2. **Hook Layer** (`src/hooks/`)
   - `useVoiceToText.ts`: Orchestrates services and manages application state
   - Provides a clean API for UI components

3. **UI Layer** (`src/App.tsx`)
   - Pure presentation logic
   - No direct service dependencies
   - Responsive and accessible design

### Key Design Decisions

#### Audio Capture Strategy
- **MediaRecorder API** with 250ms time slices for near real-time streaming
- **16kHz sample rate** optimized for Deepgram's requirements
- **Automatic MIME type detection** for cross-browser compatibility
- **Proper cleanup** to prevent memory leaks

#### Transcription Integration
- **WebSocket connection** for real-time streaming
- **Interim results** for immediate user feedback
- **Final results** for accurate transcript building
- **Graceful error handling** with user-friendly messages

#### State Management
- **React hooks** for local state management
- **useCallback** to prevent unnecessary re-renders
- **useRef** for service instances to persist across renders
- **localStorage** for API key persistence

#### UI/UX Decisions
- **Glassmorphism** for modern, premium feel
- **Gradient accents** for visual hierarchy
- **Smooth animations** for better user engagement
- **Clear visual feedback** for recording state
- **Responsive design** for different screen sizes

## 🔧 Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

Key configurations:
- **CSP (Content Security Policy)**: Allows Deepgram API connections and microphone access
- **Window settings**: 900x700 default size, resizable, centered
- **Bundle settings**: Cross-platform icons and build targets

### Deepgram Configuration

Default settings (can be modified in `useVoiceToText` hook):
- **Model**: `nova-2` (latest, most accurate)
- **Language**: `en-US`
- **Features**: Smart formatting, punctuation, interim results

## 📝 Usage

### Basic Workflow

1. **Start Recording**
   - Click the microphone button
   - Speak clearly into your microphone
   - See interim results appear in real-time

2. **Stop Recording**
   - Click the stop button
   - Wait for final transcription
   - Review the complete transcript

3. **Manage Transcript**
   - Copy to clipboard with the copy button
   - Clear transcript with the trash button
   - Reconfigure API key with settings button

### Keyboard Shortcuts

Currently, the app uses click-to-record. Future enhancements could include:
- Global hotkeys for push-to-talk
- Keyboard shortcuts for copy/clear actions

## 🧪 Testing

### Manual Testing Checklist

- [ ] Microphone permission request works
- [ ] Recording starts and stops correctly
- [ ] Interim results appear during recording
- [ ] Final transcript is accurate
- [ ] Copy to clipboard works
- [ ] Clear transcript works
- [ ] Error messages display properly
- [ ] API key configuration persists
- [ ] App works after restart

### Testing Different Scenarios

1. **Network Issues**: Disconnect internet during recording
2. **Permission Denial**: Deny microphone access
3. **Invalid API Key**: Enter wrong API key
4. **Long Recording**: Test with 1+ minute recordings
5. **Multiple Sessions**: Record multiple times in succession

## 🚧 Known Limitations

1. **No Global Hotkey**: Currently requires clicking the button to record
2. **No Text Insertion**: Transcript stays in app (no system-wide text insertion)
3. **Single Language**: Only English (en-US) configured by default
4. **No Offline Mode**: Requires internet connection for transcription
5. **No Audio Playback**: Cannot replay recorded audio

## 🔮 Future Enhancements

### High Priority
- [ ] Global hotkey support for push-to-talk
- [ ] System-wide text insertion (paste into any app)
- [ ] Multiple language support
- [ ] Audio visualization during recording
- [ ] Transcript history/sessions

### Medium Priority
- [ ] Custom keyboard shortcuts
- [ ] Export transcript to file
- [ ] Dark/light theme toggle
- [ ] Voice commands for app control
- [ ] Audio playback of recordings

### Low Priority
- [ ] Cloud sync for transcripts
- [ ] Speaker diarization
- [ ] Custom vocabulary/training
- [ ] Analytics and usage stats

## 🏗️ Building for Production

### Development Build
```bash
npm run tauri dev
```

### Production Build
```bash
npm run tauri build
```

This creates optimized bundles in `src-tauri/target/release/bundle/`:
- **macOS**: `.dmg` and `.app`
- **Windows**: `.msi` and `.exe`
- **Linux**: `.deb`, `.AppImage`

### Bundle Sizes
- **macOS**: ~5-8 MB
- **Windows**: ~4-6 MB
- **Linux**: ~6-10 MB

(Much smaller than Electron alternatives!)

## 🛠️ Development

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Standard React/TypeScript rules
- **Formatting**: Consistent 2-space indentation
- **Comments**: JSDoc for public APIs

### Adding New Features

1. **Service Layer**: Add new services in `src/services/`
2. **Hook Layer**: Create custom hooks in `src/hooks/`
3. **UI Layer**: Update components in `src/`
4. **Backend**: Add Rust commands in `src-tauri/src/`

### Debugging

**Frontend**:
```bash
npm run tauri dev
# Then open DevTools in the app window
```

**Backend**:
```bash
# Rust logs appear in terminal
RUST_LOG=debug npm run tauri dev
```

## 📚 Resources

### Documentation
- [Tauri Documentation](https://tauri.app/start/)
- [Deepgram Documentation](https://developers.deepgram.com/)
- [React Documentation](https://react.dev/)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

### Tutorials
- [Tauri + React Setup](https://tauri.app/start/create-project/)
- [Deepgram Streaming](https://developers.deepgram.com/docs/streaming)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created for educational and demonstration purposes.

## 🙏 Acknowledgments

- **Tauri Team** for the amazing desktop framework
- **Deepgram** for state-of-the-art speech recognition
- **Wispr Flow** for the inspiration
- **React Team** for the excellent UI library

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using Tauri, React, and Deepgram**
