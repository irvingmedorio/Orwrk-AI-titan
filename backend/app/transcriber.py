import json
import subprocess
import tempfile
from pathlib import Path

from .config import settings

AUDIO_VIDEO_EXTS = {
    ".wav",
    ".mp3",
    ".m4a",
    ".flac",
    ".ogg",
    ".mp4",
    ".mov",
    ".mkv",
    ".webm",
}

def transcribe_file(path: Path) -> str:
    """Transcribe an audio or video file using whisper.cpp."""
    suffix = path.suffix.lower()
    src = path
    if suffix not in {".wav", ".mp3"}:
        tmp_dir = tempfile.mkdtemp()
        wav_path = Path(tmp_dir) / "audio.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(path), str(wav_path)],
            check=True,
            capture_output=True,
        )
        src = wav_path
    cmd = [
        settings.whisper_cpp_bin,
        "-m",
        settings.whisper_cpp_model,
        str(src),
        "--output-json",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    return " ".join(seg.get("text", "").strip() for seg in data.get("segments", []))
