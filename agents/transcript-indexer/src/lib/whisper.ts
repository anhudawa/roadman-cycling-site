import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fetchTranscript } from "../../../../scripts/lib/transcript.js";

/**
 * Get transcript for an episode. Tries YouTube captions first,
 * falls back to Whisper via OpenAI API if captions aren't available.
 */
export async function getTranscript(
  youtubeId: string,
  audioUrl?: string,
  tempDir?: string
): Promise<string | null> {
  // Try YouTube captions first (free, fast)
  console.log(`    Trying YouTube captions for ${youtubeId}...`);
  const ytTranscript = await fetchTranscript(youtubeId);
  if (ytTranscript && ytTranscript.length > 100) {
    console.log(`    YouTube captions found (${ytTranscript.length} chars)`);
    return ytTranscript;
  }

  // Fallback: Whisper via OpenAI API
  if (!audioUrl) {
    console.log(`    No YouTube captions and no audio URL $€” skipping`);
    return null;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.log(`    No OPENAI_API_KEY set $€” cannot use Whisper fallback`);
    return null;
  }

  console.log(`    YouTube captions unavailable. Downloading audio for Whisper...`);
  return await transcribeWithWhisper(audioUrl, openaiKey, tempDir);
}

/**
 * Download audio and transcribe with OpenAI Whisper API.
 * Handles long episodes by chunking (Whisper has a 25MB file limit).
 */
async function transcribeWithWhisper(
  audioUrl: string,
  apiKey: string,
  tempDir?: string
): Promise<string | null> {
  const dir = tempDir ?? path.join(process.cwd(), "tmp/whisper");
  fs.mkdirSync(dir, { recursive: true });
  const audioFile = path.join(dir, "episode.mp3");

  try {
    // Download audio
    console.log(`    Downloading audio...`);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      console.error(`    Audio download failed: ${audioResponse.status}`);
      return null;
    }
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    fs.writeFileSync(audioFile, audioBuffer);

    const fileSizeMB = audioBuffer.length / (1024 * 1024);
    console.log(`    Audio downloaded (${fileSizeMB.toFixed(1)} MB)`);

    if (fileSizeMB > 24) {
      // Split into 10-minute chunks using ffmpeg
      return await transcribeChunked(audioFile, apiKey, dir);
    }

    // Single file transcription
    return await callWhisperAPI(audioFile, apiKey);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`    Whisper transcription failed: ${msg}`);
    return null;
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile);
      const chunks = fs.readdirSync(dir).filter((f) => f.startsWith("chunk_"));
      for (const chunk of chunks) fs.unlinkSync(path.join(dir, chunk));
    } catch {
      // ignore cleanup errors
    }
  }
}

async function transcribeChunked(
  audioFile: string,
  apiKey: string,
  tempDir: string
): Promise<string> {
  console.log(`    File > 24MB $€” splitting into 10-minute chunks...`);

  // Use ffmpeg to split
  try {
    execSync(
      `ffmpeg -i "${audioFile}" -f segment -segment_time 600 -c copy "${tempDir}/chunk_%03d.mp3" -y 2>/dev/null`,
      { stdio: "pipe" }
    );
  } catch {
    // ffmpeg might not be installed $€” try without chunking
    console.log(`    ffmpeg not available $€” attempting full file transcription`);
    return (await callWhisperAPI(audioFile, apiKey)) ?? "";
  }

  const chunks = fs
    .readdirSync(tempDir)
    .filter((f) => f.startsWith("chunk_"))
    .sort();

  console.log(`    Split into ${chunks.length} chunks`);

  const transcripts: string[] = [];
  for (const chunk of chunks) {
    const chunkPath = path.join(tempDir, chunk);
    console.log(`    Transcribing ${chunk}...`);
    const text = await callWhisperAPI(chunkPath, apiKey);
    if (text) transcripts.push(text);
  }

  return transcripts.join(" ");
}

async function callWhisperAPI(
  audioFile: string,
  apiKey: string
): Promise<string | null> {
  const formData = new FormData();
  const audioBuffer = fs.readFileSync(audioFile);
  const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
  formData.append("file", blob, path.basename(audioFile));
  formData.append("model", "whisper-1");
  formData.append("response_format", "text");
  formData.append("language", "en");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`    Whisper API error: ${response.status} $€” ${errorText.slice(0, 200)}`);
    return null;
  }

  return await response.text();
}
