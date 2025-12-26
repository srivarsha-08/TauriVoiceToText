import { useState, useEffect } from 'react';
import { useVoiceToText } from './hooks/useVoiceToText';
import { load as yamlLoad } from 'js-yaml';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);

  const {
    isRecording,
    isProcessing,
    transcript,
    interimTranscript,
    error,
    isReady,
    initialize,
    startRecording,
    stopRecording,
    clearTranscript,
    copyToClipboard,
    validateApiKey,
    runDiagnostics,
  } = useVoiceToText({
    deepgramApiKey: apiKey,
    language: 'en-US',
    model: 'nova-2',
  });

  /* Load API key */
  useEffect(() => {
    const saved = localStorage.getItem('deepgram_api_key');
    if (saved) {
      setApiKey(saved);
      setIsConfigured(true);
    }
  }, []);

  /* Init Deepgram */
  useEffect(() => {
    if (isConfigured && apiKey) {
      initialize();
    }
  }, [isConfigured, apiKey, initialize]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('deepgram_api_key', apiKey.trim());
    setIsConfigured(true);
  };

  const handleReconfigure = () => {
    localStorage.removeItem('deepgram_api_key');
    setApiKey('');
    setIsConfigured(false);
  };

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  /* ---------------- CONFIG SCREEN ---------------- */
  if (!isConfigured) {
    return (
      <div className="app">
        <div className="config-container">
          <div className="config-card">
            <h1>Voice to Text</h1>

            <input
              type="password"
              placeholder="Deepgram API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />

            <button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
              Get Started
            </button>

            <div style={{ marginTop: 12 }}>
              <label htmlFor="yaml-file" style={{ display: 'inline-block', marginRight: 8 }}>
                Or import a config file:
              </label>
              <input
                id="yaml-file"
                type="file"
                accept=".yaml,.yml"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const data = yamlLoad(text) as any;
                    const key = data?.deepgram_api_key || data?.deepgramApiKey || data?.api_key;
                    const language = data?.language || data?.lang;

                    if (key && typeof key === 'string') {
                      setApiKey(key.trim());
                      localStorage.setItem('deepgram_api_key', key.trim());
                      if (language && typeof language === 'string') {
                        // optional: you might want to store language/model later
                      }
                      setIsConfigured(true);
                      // initialize will run via effect
                    } else {
                      alert('No valid API key found in YAML file');
                    }
                  } catch (err) {
                    console.error('Failed to parse YAML config:', err);
                    alert('Failed to parse YAML config');
                  } finally {
                    // clear input so same file can be selected again
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            <p style={{ fontSize: 12, marginTop: 8 }}>
              <strong>YAML format:</strong> <code>deepgram_api_key: "YOUR_KEY"</code>. This file may contain secrets — do not commit it to source control. The project includes a sample <code>.deepgram.yaml</code> in the repo root.
            </p>

            <a
              href="https://console.deepgram.com/signup"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a Deepgram API Key
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN APP ---------------- */
  return (
    <div className="app">
      <div className="main-container">

        {/* HEADER */}
        <header className="header">
          <h1>Voice to Text</h1>

          <div className="header-actions">
            <button
              className="settings-button"
              onClick={handleReconfigure}
              title="Change API Key"
            >
              ⚙️
            </button>

            <button
              className="settings-button"
              onClick={() => setShowDiagnostics((v) => !v)}
              title="Diagnostics"
            >
              🧪
            </button>
          </div>
        </header>

        {/* STATUS */}
        <div className={`status-bar ${isRecording ? 'recording' : ''}`}>
          <span>
            {isRecording
              ? 'Recording...'
              : isProcessing
              ? 'Processing...'
              : isReady
              ? 'Ready'
              : 'Initializing...'}
          </span>
        </div>

        {/* DIAGNOSTICS */}
        {showDiagnostics && (
          <div className="diagnostics-panel">
            <h3 style={{ marginBottom: 8 }}>Diagnostics</h3>

            <p style={{ fontSize: 12, marginBottom: 8, color: '#888' }}>
              <strong>About CORS:</strong> Browser WebSocket connections may fail due to TLS/proxy/firewall issues.
              This app includes a native Tauri fallback that performs the probe outside the browser context.
              <a href="https://dpgr.am/js-proxy" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>
                Deepgram proxy docs
              </a>
            </p>

            <button
              onClick={async () => {
                setDiagnosticsResult({ running: true });
                const res = await validateApiKey();
                setDiagnosticsResult(res);
              }}
            >
              Validate API Key
            </button>

            <button
              onClick={async () => {
                setDiagnosticsResult({ running: true });
                const res = await runDiagnostics(5000);
                setDiagnosticsResult(res);
              }}
            >
              Run Diagnostics (Browser + Native)
            </button>

            <button
              onClick={() => setDiagnosticsResult(null)}
              style={{ marginLeft: 8 }}
            >
              Clear
            </button>

            {/* Enhanced error details */}
            {diagnosticsResult && (
              <div style={{ marginTop: 12 }}>
                <pre style={{ padding: 8, backgroundColor: '#222', color: '#fff', borderRadius: 4 }}>
                  {JSON.stringify(diagnosticsResult, null, 2)}
                </pre>
                {diagnosticsResult.apiKey && !diagnosticsResult.apiKey.success && (
                  <div className="error-banner">API Key Error: {diagnosticsResult.apiKey.message}</div>
                )}
                {diagnosticsResult.websocket && !diagnosticsResult.websocket.success && (
                  <div className="error-banner">WebSocket Error: {diagnosticsResult.websocket.message} {diagnosticsResult.websocket.code ? `(Code: ${diagnosticsResult.websocket.code})` : ''} {diagnosticsResult.websocket.reason ? `(Reason: ${diagnosticsResult.websocket.reason})` : ''}</div>
                )}
                {diagnosticsResult.nativeWebSocket && !diagnosticsResult.nativeWebSocket.success && (
                  <div className="error-banner">Native Probe Error: {diagnosticsResult.nativeWebSocket.message} {diagnosticsResult.nativeWebSocket.code ? `(Code: ${diagnosticsResult.nativeWebSocket.code})` : ''} {diagnosticsResult.nativeWebSocket.reason ? `(Reason: ${diagnosticsResult.nativeWebSocket.reason})` : ''}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TRANSCRIPT */}
        <div className="transcript-container">
          <div className="transcript-actions">
            <button onClick={clearTranscript} disabled={!transcript}>
              Clear
            </button>
            <button onClick={copyToClipboard} disabled={!transcript}>
              Copy
            </button>
          </div>

          <div className="transcript-content">
            {transcript && <p>{transcript}</p>}
            {interimTranscript && <p className="interim">{interimTranscript}</p>}
            {!transcript && !interimTranscript && (
              <p>Press the mic and speak…</p>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && <div className="error-banner">{error}</div>}

        {/* RECORD BUTTON */}
        <div className="control-container">
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={!isReady || isProcessing}
          >
            {isRecording ? 'Stop' : 'Push to Talk'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
