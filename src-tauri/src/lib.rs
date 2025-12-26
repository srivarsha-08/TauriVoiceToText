// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Serialize, Deserialize};
use std::time::Duration;
use tokio::time::timeout;

#[derive(Serialize, Deserialize, Debug)]
pub struct ProbeResult {
    pub success: bool,
    pub message: String,
    pub code: Option<u16>,
    pub reason: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Probe Deepgram WebSocket endpoint to validate API key and network connectivity.
/// Runs outside the browser context, avoiding browser-level TLS/proxy restrictions.
#[tauri::command]
async fn probe_deepgram(api_key: String, timeout_ms: u64) -> ProbeResult {
    // Build the WebSocket URL with API key as query parameter
    // Deepgram requires the key either as token= or via Authorization header
    let url = format!(
        "wss://api.deepgram.com/v1/listen?token={}&model=nova-2&language=en-US&encoding=linear16&sample_rate=16000",
        api_key
    );

    println!("[probe_deepgram] Attempting connection to: {}", url);
    println!("[probe_deepgram] Timeout: {}ms", timeout_ms);

    // Attempt WebSocket connection with timeout
    let probe_future = tokio_tungstenite::connect_async(&url);
    let result = timeout(Duration::from_millis(timeout_ms), probe_future).await;

    match result {
        Ok(Ok((mut ws_stream, _))) => {
            // Connection successful — close it gracefully
            println!("[probe_deepgram] WebSocket opened successfully");
            let _ = ws_stream.close(None);
            ProbeResult {
                success: true,
                message: "WebSocket connection established successfully".to_string(),
                code: None,
                reason: None,
            }
        }
        Ok(Err(e)) => {
            // WebSocket connection failed
            let error_msg = e.to_string();
            println!("[probe_deepgram] WebSocket error: {}", error_msg);
            let message = if error_msg.contains("401") || error_msg.contains("Unauthorized") {
                "Authentication failed — check your Deepgram API key".to_string()
            } else if error_msg.contains("403") || error_msg.contains("Forbidden") {
                "Permission denied — check your Deepgram account and plan".to_string()
            } else {
                format!("WebSocket connection failed: {}", error_msg)
            };

            ProbeResult {
                success: false,
                message,
                code: None,
                reason: None,
            }
        }
        Err(_) => {
            // Timeout
            println!("[probe_deepgram] Connection timed out after {}ms", timeout_ms);
            ProbeResult {
                success: false,
                message: format!("WebSocket probe timed out ({}ms)", timeout_ms),
                code: Some(1006),
                reason: Some("Timeout".to_string()),
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, probe_deepgram])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

