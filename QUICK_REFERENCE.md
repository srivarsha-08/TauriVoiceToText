# Quick Reference Guide

Quick commands and tips for working with the Voice to Text app.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build for production
npm run tauri build
```

## 📦 Project Structure

```
voice-to-text-app/
├── src/
│   ├── services/          # Audio & transcription services
│   ├── hooks/             # React hooks
│   ├── App.tsx            # Main component
│   └── App.css            # Styles
├── src-tauri/             # Rust backend
├── README.md              # Main documentation
├── ARCHITECTURE.md        # Technical details
├── SETUP.md              # Setup instructions
└── DEMO_GUIDE.md         # Demo video guide
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/services/audioCapture.ts` | Microphone & recording |
| `src/services/transcription.ts` | Deepgram integration |
| `src/hooks/useVoiceToText.ts` | Main workflow logic |
| `src/App.tsx` | UI components |
| `src/App.css` | Styling |
| `src-tauri/tauri.conf.json` | App configuration |

## 🛠️ Common Commands

### Development

```bash
# Start dev server
npm run tauri dev

# Build frontend only
npm run build

# Run frontend dev server only
npm run dev

# Type check
npx tsc --noEmit
```

### Building

```bash
# Build for current platform
npm run tauri build

# Clean build
cd src-tauri && cargo clean && cd ..
rm -rf dist node_modules
npm install
npm run tauri build
```

### Debugging

```bash
# Enable Rust debug logs
RUST_LOG=debug npm run tauri dev

# Check for TypeScript errors
npx tsc --noEmit

# Lint check
npm run lint  # (if configured)
```

## 🔧 Configuration

### API Key Storage

- **Location**: Browser localStorage
- **Key**: `deepgram_api_key`

YAML config file support

- You can store a local YAML config file named `.deepgram.yaml` in the project root or import it through the app's configuration screen.
- Format:

```yaml
# .deepgram.yaml
deepgram_api_key: "YOUR_API_KEY"
language: "en-US" # optional
model: "nova-2" # optional
```

- WARNING: This file may contain secrets; do **not** commit it to source control. Add `.deepgram.yaml` to `.gitignore` (already included).

- **Clear**: Settings button in app

### Window Settings

Edit `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{
      "width": 900,      // Change width
      "height": 700,     // Change height
      "resizable": true  // Allow resize
    }]
  }
}
```

### Deepgram Settings

Edit `src/App.tsx`:

```typescript
const voiceToText = useVoiceToText({
  deepgramApiKey: apiKey,
  language: 'en-US',  // Change language
  model: 'nova-2',    // Change model
});
```

## 🎨 Customization

### Colors

Edit `src/App.css` CSS variables:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-primary: #0f0f23;
  --text-primary: #ffffff;
}
```

### Window Title

Edit `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{
      "title": "Your Custom Title"
    }]
  }
}
```

## 🐛 Troubleshooting

### Issue: Rust not found

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Restart terminal
rustc --version
```

### Issue: Microphone not working

1. Check system permissions
2. Restart app
3. Try different browser/system

### Issue: Build fails

```bash
# Clean everything
rm -rf dist node_modules src-tauri/target
npm install
npm run tauri build
```

### Issue: Deepgram connection fails

1. Check API key
2. Check internet connection
3. Verify Deepgram status

## 📝 Code Snippets

### Add New Language Support

In `src/App.tsx`:

```typescript
const [language, setLanguage] = useState('en-US');

const voiceToText = useVoiceToText({
  deepgramApiKey: apiKey,
  language: language,  // Use state variable
  model: 'nova-2',
});
```

### Change Audio Settings

In `src/services/audioCapture.ts`:

```typescript
this.mediaStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 16000,  // Adjust sample rate
  },
});
```

### Add Keyboard Shortcut

In `src/App.tsx`:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ' && e.ctrlKey) {
      handleToggleRecording();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [handleToggleRecording]);
```

## 🔐 Security

### API Key Best Practices

- ✅ Store in localStorage (current)
- ✅ Never commit to git
- ✅ Use environment variables for development
- ⚠️ Consider backend proxy for production

### CSP Configuration

In `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' https://api.deepgram.com wss://api.deepgram.com"
    }
  }
}
```

## 📊 Performance

### Bundle Sizes

- **Frontend**: ~260KB (gzipped: ~78KB)
- **Full App**: 
  - macOS: ~5-8 MB
  - Windows: ~4-6 MB
  - Linux: ~6-10 MB

### Optimization Tips

1. Keep dependencies minimal
2. Use code splitting (future)
3. Optimize images
4. Enable compression

## 🧪 Testing

### Manual Testing Checklist

- [ ] Microphone permission
- [ ] Recording start/stop
- [ ] Real-time transcription
- [ ] Copy to clipboard
- [ ] Clear transcript
- [ ] Error handling
- [ ] API key persistence
- [ ] Diagnostics: browser probe
- [ ] Diagnostics: native Tauri probe fallback

### Test Scenarios

#### 1. Happy Path (Normal Recording)
1. Start app with valid API key
2. Click "Push to Talk"
3. Speak clearly for 2–3 seconds
4. Click "Stop"
5. **Expected**: Transcript appears within 1–2 seconds

#### 2. Network Failure (WebSocket Close 1006)
1. Start app with valid API key
2. Open Diagnostics (🧪 button)
3. Click "Run Diagnostics (Browser + Native)"
4. **Expected**: Browser probe fails (1006), but native Tauri probe succeeds (shows success: true)
5. Try "Push to Talk" — transcription should work via native probe validation

#### 3. Invalid API Key
1. Start app with invalid/expired API key
2. Click "Push to Talk"
3. **Expected**: Error message "Authentication failed — check your Deepgram API key"
4. Update API key, restart, try again

#### 4. Microphone Permission Denied
1. Start app, deny microphone access
2. Click "Push to Talk"
3. **Expected**: Error "Microphone access denied. Please grant permission..."
4. Grant mic permission in system settings, restart app

#### 5. Network/Proxy Issue
1. If behind corporate proxy/VPN with TLS inspection:
2. Open Diagnostics
3. Click "Validate API Key"
4. **Expected**: Message about native Tauri probe fallback
5. Native probe should succeed (indicates working fallback)

#### 6. YAML Config Import
1. Create `.deepgram.yaml` with valid API key
2. Start app (before configuration screen)
3. Click file input, select YAML file
4. **Expected**: App loads key, marks configured, initializes services
5. Try recording — should work

### Diagnostic Panel Guide

**Browser Probe**: Uses browser WebSocket API — may fail due to TLS/proxy/firewall
**Native Tauri Probe**: Uses Rust `tokio-tungstenite` — bypasses browser restrictions

**Success Response:**
```json
{
  "success": true,
  "message": "WebSocket connection established successfully"
}
```

**Failure Response (Auth):**
```json
{
  "success": false,
  "message": "Authentication failed — check your Deepgram API key"
}
```

**Failure Response (Network):**
```json
{
  "success": false,
  "message": "WebSocket probe timed out (5000ms)",
  "code": 1006,
  "reason": "Timeout"
}
```

### Troubleshooting Tests

**If transcription doesn't work after "Push to Talk":**
1. Check console (DevTools F12) for errors
2. Confirm API key is valid (Diagnostics → Validate API Key)
3. Confirm microphone is working:
   - Use browser's audio test (check if mic level changes when you speak)
   - Test on another app (Voice Memos, etc.)
4. Try Diagnostics → Run Diagnostics to check WebSocket connectivity
5. If browser probe fails with 1006, check network/proxy settings

**If diagnostics show success but transcription doesn't work:**
1. Check if audio is being captured (console should show "Audio recording started")
2. Confirm Deepgram connection opened (look for "Connected to Deepgram" log)
3. Check if audio chunks are being sent (console logs for "Failed to send audio" would appear if not)
4. If silent failure: check Deepgram account quota/plan limits

**If native Tauri probe fails but browser probe succeeds:**
- This is unusual; may indicate Rust environment issue
- Try: `cargo update` and rebuild
2. **Error Path**: Invalid API key → error message
3. **Edge Case**: Very long recording (5+ minutes)
4. **Network**: Disconnect during recording

## 📚 Resources

- [Tauri Docs](https://tauri.app/start/)
- [Deepgram Docs](https://developers.deepgram.com/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## 🎯 Next Steps

1. ✅ Set up development environment
2. ✅ Get Deepgram API key
3. ✅ Run the app
4. 🎤 Start transcribing
5. 📹 Create demo video
6. 🚀 Build for production

## 💡 Tips

- Use `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux) for DevTools
- Check console for errors
- Test with different voices and accents
- Try different recording lengths
- Experiment with different Deepgram models

## 🆘 Getting Help

1. Check documentation files
2. Search GitHub issues
3. Ask on Tauri Discord
4. Check Deepgram community

---

**Happy coding! 🚀**
