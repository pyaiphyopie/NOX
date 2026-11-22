#!/usr/bin/env python3
"""Burmese Speech & Video Dubbing Agent — commercial-safe stack.
ASR: Faster-Whisper (MIT). LLM: Qwen2.5-7B-Instruct-AWQ via vLLM :8000 (Apache-2.0).
TTS: OmniVoice (Apache-2.0, 600+ langs incl. Burmese). Avoided F5-Myanmar-TTS (CC BY-NC 4.0).
Run: vllm serve Qwen/Qwen2.5-7B-Instruct-AWQ --port 8000
     uvicorn speech_agent:app --host 0.0.0.0 --port 8080
Web UI: open http://<host>:8080/  (serves index.html from the same folder)
"""
from __future__ import annotations
import logging, os, subprocess, tempfile, time
from pathlib import Path
from typing import Optional
import soundfile as sf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

VLLM_BASE_URL = os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
VLLM_MODEL = os.getenv("VLLM_MODEL", "Qwen/Qwen2.5-7B-Instruct-AWQ")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "large-v3")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
WHISPER_COMPUTE = os.getenv("WHISPER_COMPUTE_TYPE", "float16")
OMNIVOICE_VOICE = os.getenv("OMNIVOICE_VOICE", "default")
MAX_CHUNK_CHARS = 400
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("speech_agent")
_whisper = _omnivoice = _openai_client = None

def get_whisper():
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel
        log.info("Loading Faster-Whisper %s", WHISPER_MODEL)
        _whisper = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE)
    return _whisper

def get_omnivoice():
    global _omnivoice
    if _omnivoice is None:
        log.info("Loading OmniVoice (voice=%s)", OMNIVOICE_VOICE)
        try:
            from omnivoice import OmniVoice
            _omnivoice = OmniVoice.from_pretrained(OMNIVOICE_VOICE)
        except Exception as e:
            log.warning("OmniVoice.from_pretrained failed (%s); using module", e)
            import omnivoice as ov
            _omnivoice = ov
    return _omnivoice

def get_llm():
    global _openai_client
    if _openai_client is None:
        from openai import AsyncOpenAI
        _openai_client = AsyncOpenAI(api_key="not-needed", base_url=VLLM_BASE_URL)
    return _openai_client

def asr_transcribe(audio_path, language=None):
    model = get_whisper()
    segments, info = model.transcribe(audio_path, language=language, vad_filter=True)
    out = [{"start": s.start, "end": s.end, "text": s.text.strip()} for s in segments if s.text.strip()]
    log.info("ASR: %d segments, lang=%s", len(out), getattr(info, "language", "?"))
    return out

async def translate_to_burmese(text):
    client = get_llm()
    prompt = ("You are a professional Burmese translator. Translate into natural spoken Burmese (Myanmar). "
              "Output ONLY the Burmese translation, no commentary, no romanization.\n\nText: " + text)
    try:
        resp = await client.chat.completions.create(model=VLLM_MODEL, messages=[{"role": "user", "content": prompt}],
                                                    temperature=0.2, max_tokens=max(64, len(text) * 3))
        return resp.choices[0].message.content.strip()
    except Exception as e:
        log.error("LLM translation failed: %s", e)
        raise

def chunk_text(text, max_chars=MAX_CHUNK_CHARS):
    import re
    parts = re.split(r"(?<=[.!?။])\s+", text)
    chunks, cur = [], ""
    for p in parts:
        if len(cur) + len(p) + 1 <= max_chars:
            cur = (cur + " " + p).strip()
        else:
            if cur: chunks.append(cur)
            cur = p
    if cur: chunks.append(cur)
    return chunks or [text]

async def tts_synthesize(text, out_path):
    ov = get_omnivoice()
    try:
        if hasattr(ov, "synthesize"):
            r = ov.synthesize(text, voice=OMNIVOICE_VOICE, output=out_path)
            return str(r) if isinstance(r, (str, Path)) else out_path
        if hasattr(ov, "tts"):
            sf.write(out_path, ov.tts(text, voice=OMNIVOICE_VOICE), 24000)
            return out_path
    except Exception as e:
        log.error("OmniVoice synthesize failed: %s", e)
        raise
    raise RuntimeError("OmniVoice has no recognized synthesize entrypoint")

def mux_audio_to_video(video_path, audio_path, out_path):
    cmd = ["ffmpeg", "-y", "-i", video_path, "-i", audio_path, "-c:v", "copy", "-c:a", "aac",
           "-b:a", "192k", "-map", "0:v:0", "-map", "1:a:0", "-shortest", out_path]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        log.error("ffmpeg failed: %s", r.stderr[-2000:])
        raise RuntimeError("ffmpeg mux failed: " + r.stderr[-500:])
    return out_path

app = FastAPI(title="Burmese Dubbing Agent", version="1.0.0")

class TextIn(BaseModel):
    text: str

@app.get("/health")
async def health():
    return {"status": "ok", "vllm": VLLM_BASE_URL, "whisper": WHISPER_MODEL, "tts": "omnivoice"}

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    ui = Path(__file__).resolve().parent / "index.html"
    if ui.exists():
        return HTMLResponse(ui.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>NOX Dub API</h1><p>index.html not found next to speech_agent.py</p>", status_code=404)

@app.post("/dub/audio")
async def dub_audio(file: UploadFile = File(...), source_lang: Optional[str] = None):
    t0 = time.time()
    suffix = Path(file.filename or "in.wav").suffix or ".wav"
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / ("source" + suffix)
        src.write_bytes(await file.read())
        segs = asr_transcribe(str(src), language=source_lang)
        if not segs: raise HTTPException(400, "No speech detected")
        parts = []
        for seg in segs:
            parts.append(" ".join(await translate_to_burmese(ch) for ch in chunk_text(seg["text"])))
        full = " ".join(parts)
        out_wav = Path(td) / "dubbed.wav"
        await tts_synthesize(full, str(out_wav))
        final = Path(tempfile.gettempdir()) / ("dubbed_%d.wav" % int(time.time()))
        final.write_bytes(out_wav.read_bytes())
    return FileResponse(final, media_type="audio/wav", filename=final.name,
                        headers={"X-Elapsed-Sec": "%.1f" % (time.time()-t0), "X-Burmese-Text": full[:500]})

@app.post("/dub/video")
async def dub_video(file: UploadFile = File(...), source_lang: Optional[str] = None):
    t0 = time.time()
    suffix = Path(file.filename or "in.mp4").suffix or ".mp4"
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / ("source" + suffix)
        src.write_bytes(await file.read())
        audio_src = Path(td) / "source.wav"
        r = subprocess.run(["ffmpeg", "-y", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", str(audio_src)],
                           capture_output=True, text=True)
        if r.returncode != 0: raise HTTPException(400, "Could not extract audio: " + r.stderr[-300:])
        segs = asr_transcribe(str(audio_src), language=source_lang)
        if not segs: raise HTTPException(400, "No speech detected")
        parts = []
        for seg in segs:
            parts.append(" ".join(await translate_to_burmese(ch) for ch in chunk_text(seg["text"])))
        full = " ".join(parts)
        dubbed_wav = Path(td) / "dubbed.wav"
        await tts_synthesize(full, str(dubbed_wav))
        out = Path(tempfile.gettempdir()) / ("dubbed_%d.mp4" % int(time.time()))
        mux_audio_to_video(str(src), str(dubbed_wav), str(out))
    return FileResponse(out, media_type="video/mp4", filename=out.name,
                        headers={"X-Elapsed-Sec": "%.1f" % (time.time()-t0), "X-Burmese-Text": full[:500]})

@app.post("/translate/text")
async def translate_text(body: TextIn):
    chunks = chunk_text(body.text)
    out = [await translate_to_burmese(ch) for ch in chunks]
    return {"burmese": " ".join(out), "chunks": len(chunks)}
