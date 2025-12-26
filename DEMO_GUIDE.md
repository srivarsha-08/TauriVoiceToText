# Demo Video Guide

This guide helps you create a compelling demo video showcasing the Voice to Text application.

## Video Requirements

- **Duration**: 2-5 minutes
- **Format**: MP4, MOV, or WebM
- **Resolution**: 1080p (1920x1080) recommended
- **Hosting**: YouTube (unlisted) or Google Drive

## Recording Tools

### macOS
- **QuickTime Player** (built-in)
  - File → New Screen Recording
  - Select microphone for narration
  
- **OBS Studio** (free, advanced)
  - Download: [obsproject.com](https://obsproject.com/)

### Windows
- **Xbox Game Bar** (built-in)
  - Windows + G to open
  
- **OBS Studio** (free, advanced)
  - Download: [obsproject.com](https://obsproject.com/)

### Linux
- **SimpleScreenRecorder**
  ```bash
  sudo apt install simplescreenrecorder
  ```
  
- **OBS Studio**
  ```bash
  sudo apt install obs-studio
  ```

## Demo Script

### Introduction (30 seconds)

**What to show:**
- App window opening
- Clean, modern interface

**What to say:**
> "This is Voice to Text, a cross-platform desktop application built with Tauri and Deepgram. It provides real-time speech-to-text transcription with a clean, modern interface."

### Setup Flow (45 seconds)

**What to show:**
1. Configuration screen
2. Entering API key (blur the actual key!)
3. Clicking "Get Started"
4. Microphone permission prompt
5. Transition to main screen

**What to say:**
> "On first launch, you'll enter your Deepgram API key. The app securely stores it locally. After granting microphone permission, you're ready to start transcribing."

### Core Functionality (2 minutes)

**What to show:**
1. **Starting Recording**
   - Click microphone button
   - Visual feedback (button changes color)
   - Status indicator shows "Recording"

2. **Real-Time Transcription**
   - Speak clearly: "This is a demonstration of real-time voice transcription"
   - Show interim results appearing
   - Continue: "The app uses Deepgram's Nova-2 model for accurate speech recognition"
   - Show final results being added

3. **Multiple Recordings**
   - Stop recording
   - Start new recording
   - Show transcript accumulating

4. **Transcript Management**
   - Show copy to clipboard button
   - Demonstrate copying
   - Paste in another app (TextEdit, Notepad, etc.)
   - Show clear transcript button

**What to say:**
> "Click the microphone to start recording. As you speak, you'll see interim results in real-time, followed by the final transcription. The app supports multiple recording sessions, and you can easily copy the transcript to use in other applications."

### Features Highlight (1 minute)

**What to show:**
1. **Error Handling**
   - Disconnect internet (optional)
   - Show error message
   - Reconnect and continue

2. **UI Features**
   - Status indicators
   - Clean transcript display
   - Responsive controls

3. **Settings**
   - Click settings button
   - Show reconfiguration option

**What to say:**
> "The app includes robust error handling, clear status indicators, and a beautiful user interface. You can reconfigure your API key at any time through the settings."

### Technical Highlights (30 seconds)

**What to show:**
- Show file structure (briefly)
- Mention key technologies

**What to say:**
> "Built with Tauri for cross-platform support, React for the UI, and TypeScript for type safety. The app uses the MediaRecorder API for audio capture and WebSocket for real-time streaming to Deepgram."

### Conclusion (30 seconds)

**What to show:**
- Final recording session
- Successful transcription
- App in action

**What to say:**
> "This demonstrates a production-ready voice-to-text application with clean architecture, real-time transcription, and a polished user experience. Thank you for watching!"

## Recording Tips

### Before Recording

1. **Clean Your Desktop**
   - Close unnecessary applications
   - Hide personal information
   - Use a clean wallpaper

2. **Prepare the App**
   - Have API key ready
   - Test microphone
   - Practice the flow

3. **Test Audio**
   - Record a test clip
   - Check volume levels
   - Ensure clarity

### During Recording

1. **Speak Clearly**
   - Moderate pace
   - Clear pronunciation
   - Avoid filler words ("um", "uh")

2. **Smooth Movements**
   - Slow, deliberate mouse movements
   - Pause between actions
   - Allow time for transitions

3. **Show, Don't Tell**
   - Let the app speak for itself
   - Highlight key features visually
   - Keep narration concise

### After Recording

1. **Edit the Video**
   - Trim dead space
   - Add title slide (optional)
   - Add captions (recommended)

2. **Add Annotations** (optional)
   - Highlight key features
   - Add text overlays
   - Point out important elements

3. **Export Settings**
   - Format: MP4
   - Codec: H.264
   - Resolution: 1080p
   - Frame rate: 30fps

## Sample Narration Script

```
[0:00 - 0:30] Introduction
"Hello! This is Voice to Text, a desktop application that converts speech to text in real-time. Built with Tauri and powered by Deepgram AI, it works on Windows, macOS, and Linux."

[0:30 - 1:15] Setup
"Let me show you how it works. On first launch, you'll enter your Deepgram API key. Don't worry - it's stored securely on your device. After granting microphone permission, we're ready to go."

[1:15 - 3:00] Core Features
"To start recording, I'll click this microphone button. Watch as I speak - you can see interim results appearing in real-time. 'This is a demonstration of real-time voice transcription using Deepgram's advanced AI model.' 

Notice how the text appears almost instantly. The app uses WebSocket streaming for minimal latency. I can stop recording, and the final transcript is ready. 

Let me start another recording. 'The application features a clean, modern interface with smooth animations and clear visual feedback.' 

Perfect! Now I can copy this transcript to use in any other application. Let me paste it into TextEdit to show you."

[3:00 - 3:45] Additional Features
"The app includes robust error handling - if your connection drops, you'll see a clear error message. The status indicator always shows what's happening. And you can reconfigure your API key anytime through the settings."

[3:45 - 4:15] Technical Overview
"From a technical perspective, this app demonstrates clean architecture with separated concerns. The audio capture service handles microphone access, the transcription service manages Deepgram integration, and React hooks orchestrate everything together."

[4:15 - 4:30] Conclusion
"That's Voice to Text - a practical, production-ready application showcasing modern desktop development with AI integration. Thanks for watching!"
```

## Video Checklist

Before uploading, verify:

- [ ] Audio is clear and audible
- [ ] No personal information visible
- [ ] API key is blurred/hidden
- [ ] All features demonstrated
- [ ] Video is 2-5 minutes long
- [ ] Resolution is at least 720p
- [ ] No awkward pauses or errors
- [ ] Smooth transitions
- [ ] Professional presentation

## Uploading

### YouTube (Recommended)

1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Click "Create" → "Upload videos"
3. Select your video file
4. Set visibility to "Unlisted"
5. Add title: "Voice to Text Desktop App - Demo"
6. Add description with GitHub link
7. Publish and copy the link

### Google Drive

1. Go to [Google Drive](https://drive.google.com/)
2. Click "New" → "File upload"
3. Select your video file
4. Right-click → "Share"
5. Set to "Anyone with the link can view"
6. Copy the link

## Example Video Structure

```
0:00 - Title Screen (optional)
       "Voice to Text Desktop App"
       "Built with Tauri + Deepgram"

0:05 - App Launch
       Show clean interface

0:15 - Configuration
       Enter API key
       Grant permissions

0:45 - First Recording
       Demonstrate real-time transcription

1:30 - Multiple Recordings
       Show accumulating transcript

2:15 - Copy to Clipboard
       Paste in another app

2:45 - Error Handling
       Show error message

3:15 - Settings
       Reconfigure API key

3:45 - Final Demo
       Smooth recording session

4:15 - End Screen
       GitHub link
       Thank you message
```

## Pro Tips

1. **Use a Good Microphone**
   - Built-in mic is fine
   - External mic is better
   - Test before recording

2. **Good Lighting**
   - Well-lit screen
   - Clear visibility
   - No glare

3. **Practice First**
   - Do a dry run
   - Time yourself
   - Smooth out rough spots

4. **Keep It Simple**
   - Focus on core features
   - Don't overcomplicate
   - Show real usage

5. **Be Authentic**
   - Natural narration
   - Show real workflow
   - Highlight actual benefits

## Common Mistakes to Avoid

❌ **Too long** - Keep it under 5 minutes
❌ **Too fast** - Slow down, let features breathe
❌ **No audio** - Always include narration or captions
❌ **Poor quality** - Use at least 720p
❌ **Showing errors** - Edit out mistakes
❌ **Boring** - Keep it engaging and dynamic
❌ **No context** - Explain what you're doing

## Final Checklist

Before submitting:

- [ ] Video demonstrates all core features
- [ ] Audio is clear and professional
- [ ] No sensitive information visible
- [ ] Video length is appropriate
- [ ] Quality is good (720p+)
- [ ] Link is accessible
- [ ] Video is unlisted/public
- [ ] Description includes GitHub link

---

Good luck with your demo! 🎥✨
