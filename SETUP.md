# Setup Guide - Voice to Text Desktop App

This guide will walk you through setting up the development environment and running the Voice to Text application.

## Table of Contents

1. [Prerequisites Installation](#prerequisites-installation)
2. [Project Setup](#project-setup)
3. [Getting Deepgram API Key](#getting-deepgram-api-key)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites Installation

### 1. Install Node.js

**macOS** (using Homebrew):
```bash
brew install node
```

**Windows**:
- Download from [nodejs.org](https://nodejs.org/)
- Install the LTS version

**Linux** (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation:**
```bash
node --version  # Should show v18 or higher
npm --version
```

### 2. Install Rust

**All Platforms**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the on-screen instructions. When prompted, choose option 1 (default installation).

**After installation, restart your terminal and verify:**
```bash
rustc --version
cargo --version
```

### 3. Install Platform-Specific Dependencies

#### macOS

Install Xcode Command Line Tools:
```bash
xcode-select --install
```

#### Windows

Install Microsoft C++ Build Tools:
1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. Install "Desktop development with C++" workload

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Linux (Fedora)**:
```bash
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

**Linux (Arch)**:
```bash
sudo pacman -Syu
sudo pacman -S webkit2gtk \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg \
  libvips
```

---

## Project Setup

### 1. Clone or Navigate to Project

If you haven't already:
```bash
cd /Users/mohithdk/Documents/Build/voice-to-text-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React and related packages
- Tauri CLI
- Deepgram SDK
- TypeScript and build tools

**Expected output:**
```
added 89 packages, and audited 89 packages in 4s
found 0 vulnerabilities
```

### 3. Verify Installation

Check that all dependencies are installed:
```bash
npm list --depth=0
```

---

## Getting Deepgram API Key

### 1. Sign Up for Deepgram

1. Visit [Deepgram Console](https://console.deepgram.com/signup)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to [Deepgram Console](https://console.deepgram.com/)
2. Navigate to "API Keys" in the sidebar
3. Click "Create a New API Key"
4. Give it a name (e.g., "Voice to Text App")
5. Copy the API key (you won't be able to see it again!)

### 3. Free Tier Information

Deepgram offers:
- **$200 in free credits** for new accounts
- Approximately **45,000 minutes** of transcription
- No credit card required for signup

---

## Running the Application

### Development Mode

**Start the development server:**
```bash
npm run tauri dev
```

**What happens:**
1. Vite dev server starts (frontend)
2. Rust backend compiles (first time takes 2-5 minutes)
3. Desktop application window opens
4. Hot reload enabled for frontend changes

**First run output:**
```
> voice-to-text-app@0.1.0 dev
> vite

  VITE v7.3.0  ready in 234 ms

  ➜  Local:   http://localhost:1420/
  ➜  Network: use --host to expose
  
     Info Watching /path/to/src-tauri for changes...
  Compiling voice-to-text-app v0.1.0
     Finished dev [unoptimized + debuginfo] target(s) in 2m 34s
```

### First-Time App Setup

1. **Enter API Key**
   - When the app opens, you'll see a configuration screen
   - Paste your Deepgram API key
   - Click "Get Started"

2. **Grant Microphone Permission**
   - Browser/system will prompt for microphone access
   - Click "Allow" or "Grant Permission"

3. **Start Using**
   - Click the microphone button to start recording
   - Speak clearly
   - Click stop when done
   - View your transcript!

### Production Build

**Build the application:**
```bash
npm run tauri build
```

**Build output locations:**

**macOS:**
```
src-tauri/target/release/bundle/dmg/Voice to Text_0.1.0_aarch64.dmg
src-tauri/target/release/bundle/macos/Voice to Text.app
```

**Windows:**
```
src-tauri/target/release/bundle/msi/Voice to Text_0.1.0_x64_en-US.msi
src-tauri/target/release/voice-to-text-app.exe
```

**Linux:**
```
src-tauri/target/release/bundle/deb/voice-to-text-app_0.1.0_amd64.deb
src-tauri/target/release/bundle/appimage/voice-to-text-app_0.1.0_amd64.AppImage
```

---

## Troubleshooting

### Common Issues

#### 1. "Command not found: rustc"

**Problem:** Rust is not installed or not in PATH

**Solution:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart terminal, then verify
rustc --version
```

#### 2. "Microphone access denied"

**Problem:** Browser/system denied microphone permission

**Solution:**

**macOS:**
1. System Preferences → Security & Privacy → Privacy
2. Select "Microphone" from the list
3. Check the box next to your terminal/app

**Windows:**
1. Settings → Privacy → Microphone
2. Enable "Allow apps to access your microphone"

**Linux:**
```bash
# Check if microphone is detected
arecord -l

# Test microphone
arecord -d 5 test.wav
```

#### 3. "Failed to connect to transcription service"

**Problem:** Network issue or invalid API key

**Solutions:**
- Check internet connection
- Verify API key is correct
- Check Deepgram status: [status.deepgram.com](https://status.deepgram.com)
- Try regenerating API key in Deepgram console

#### 4. Build fails with "webkit2gtk not found" (Linux)

**Problem:** Missing system dependencies

**Solution:**
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel

# Arch
sudo pacman -S webkit2gtk
```

#### 5. "npm install" fails

**Problem:** Network issues or permission problems

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# If permission errors on Linux/macOS
sudo chown -R $USER ~/.npm
```

#### 6. App window is blank

**Problem:** CSP or build issue

**Solutions:**
1. Check browser console (Cmd+Option+I / Ctrl+Shift+I)
2. Rebuild frontend:
   ```bash
   npm run build
   npm run tauri dev
   ```

#### 7. Audio not recording

**Problem:** MediaRecorder not supported or codec issue

**Solution:**
- Update your browser/system
- Check browser compatibility
- Try different browser (Chrome/Edge recommended)

#### 8. Slow transcription

**Problem:** Network latency or Deepgram API issues

**Solutions:**
- Check internet speed
- Try different network
- Check Deepgram API status
- Reduce audio quality if needed

---

## Development Tips

### Hot Reload

Frontend changes auto-reload, but Rust changes require restart:

```bash
# After changing Rust code
# Stop the dev server (Ctrl+C)
npm run tauri dev
```

### Debugging

**Frontend debugging:**
- Open DevTools in the app window (Cmd+Option+I / Ctrl+Shift+I)
- Check Console for errors
- Use React DevTools extension

**Backend debugging:**
```bash
# Enable Rust debug logs
RUST_LOG=debug npm run tauri dev
```

### Clean Build

If you encounter strange issues:

```bash
# Clean frontend
rm -rf dist node_modules
npm install

# Clean Rust build
cd src-tauri
cargo clean
cd ..

# Rebuild
npm run tauri dev
```

---

## Performance Tips

### Faster Builds

**Use Rust nightly (optional):**
```bash
rustup install nightly
rustup default nightly
```

**Parallel compilation:**
```bash
# Add to ~/.cargo/config.toml
[build]
jobs = 8  # Adjust based on CPU cores
```

### Smaller Bundle Size

**Production optimizations are already configured:**
- Tree shaking enabled
- Minification enabled
- Dead code elimination

---

## Next Steps

1. ✅ Install prerequisites
2. ✅ Set up project
3. ✅ Get Deepgram API key
4. ✅ Run the app
5. 🎤 Start transcribing!

For more information:
- See [README.md](./README.md) for feature documentation
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Check [Tauri Docs](https://tauri.app/start/) for Tauri-specific help
- Check [Deepgram Docs](https://developers.deepgram.com/) for API details

---

## Support

If you encounter issues not covered here:

1. Check the [Tauri Discord](https://discord.gg/tauri)
2. Check [Deepgram Community](https://github.com/deepgram/deepgram-python-sdk/discussions)
3. Open an issue on GitHub

Happy transcribing! 🎤✨
