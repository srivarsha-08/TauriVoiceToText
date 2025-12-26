/**
 * Native Tauri WebSocket Probe
 * Calls the Rust backend to probe Deepgram without browser TLS/proxy restrictions
 */

import { invoke } from '@tauri-apps/api/core';

export interface NativeProbeResult {
  success: boolean;
  message: string;
  code?: number;
  reason?: string;
}

/**
 * Invoke the native Tauri probe_deepgram command
 */
export async function probeDeepgramNative(
  apiKey: string,
  timeoutMs: number = 5000
): Promise<NativeProbeResult> {
  try {
    const result = await invoke<NativeProbeResult>('probe_deepgram', {
      api_key: apiKey,
      timeout_ms: timeoutMs,
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: `Native probe failed: ${error?.message || String(error)}`,
    };
  }
}
