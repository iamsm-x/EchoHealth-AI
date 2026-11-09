import numpy as np
import subprocess
from scipy.fftpack import dct
from scipy.signal import get_window, resample_poly
import imageio_ffmpeg

from .config import MAX_DURATION_SECONDS, SAMPLE_RATE


def extract_model_features(file_path):
    signal, sr = load_audio(file_path, target_sr=SAMPLE_RATE, max_duration=MAX_DURATION_SECONDS)

    frames, spectrum, power_spectrum = _frame_signal(signal, sr)
    if frames.size == 0:
        raise ValueError("Uploaded audio is too short for analysis.")

    mel_filters = _mel_filter_bank(sr, power_spectrum.shape[1], n_mels=128)
    mel_spectrum = np.dot(power_spectrum, mel_filters.T) + 1e-10
    log_mel_spectrum = np.log(mel_spectrum)

    mfcc = dct(log_mel_spectrum, type=2, axis=1, norm="ortho")[:, :20]

    features = []
    features.extend(np.mean(mfcc, axis=0))
    features.extend(np.std(mfcc, axis=0))

    chroma = _compute_chroma(spectrum, sr)
    features.extend(np.mean(chroma, axis=0))

    contrast = _compute_spectral_contrast(power_spectrum, sr)
    features.extend(np.mean(contrast, axis=0))

    features.extend(np.mean(mel_spectrum, axis=0))

    zcr = _zero_crossing_rate(frames)
    features.append(float(np.mean(zcr)))
    features.append(float(np.std(zcr)))

    rms = _rms_energy(frames)
    features.append(float(np.mean(rms)))
    features.append(float(np.std(rms)))

    centroid = _spectral_centroid(power_spectrum, sr)
    features.append(float(np.mean(centroid)))

    bandwidth = _spectral_bandwidth(power_spectrum, sr, centroid)
    features.append(float(np.mean(bandwidth)))

    rolloff = _spectral_rolloff(power_spectrum, sr)
    features.append(float(np.mean(rolloff)))

    pitch_values = _estimate_pitch_track(frames, sr)
    features.append(float(np.mean(pitch_values)))
    features.append(float(np.std(pitch_values)))
    features.append(float(np.max(pitch_values)))

    return np.array(features, dtype=np.float64)


def extract_biomarkers(file_path):
    signal, sr = load_audio(file_path, target_sr=SAMPLE_RATE, max_duration=MAX_DURATION_SECONDS)

    frames, _, power_spectrum = _frame_signal(signal, sr)
    if frames.size == 0:
        raise ValueError("Uploaded audio is too short for analysis.")

    duration_seconds = max(len(signal) / sr, 1e-6)
    pitch_values = _estimate_pitch_track(frames, sr)
    rms = _rms_energy(frames)
    onsets = _estimate_onsets(signal, sr)

    pitch = round(float(np.mean(pitch_values)), 2)
    # If pitch is 0, it means the audio was basically silence or had no periodic content
    if pitch <= 10.0: # Human pitch is rarely below 50Hz, 10 is a safe "zeroish" threshold
         raise ValueError("Audio content is too quiet or lacks voice markers.")

    tremor = round(float(_clamp(np.std(pitch_values) / (np.mean(pitch_values) + 1e-6), 0.0, 1.0)), 3)
    breathlessness = round(float(_clamp(1.0 - np.mean(rms) * 10, 0.0, 1.0)), 3)
    speech_rate = round(float(onsets / duration_seconds), 2)

    return {
        "pitch": pitch,
        "tremor": tremor,
        "breathlessness": breathlessness,
        "speech_rate": speech_rate,
    }


def load_audio(file_path, target_sr, max_duration):
    # Try native 'wave' module first for .wav files (no external dependencies)
    if str(file_path).lower().endswith(".wav"):
        try:
            import wave
            with wave.open(str(file_path), "rb") as wf:
                # Basic WAV support (Mono, 16-bit or 32-bit float)
                params = wf.getparams()
                if params.nchannels == 1 and params.framerate == target_sr:
                    frames = wf.readframes(int(target_sr * max_duration))
                    if params.sampwidth == 2: # 16-bit PCM
                        signal = np.frombuffer(frames, dtype=np.int16).astype(np.float64) / 32768.0
                        return signal, target_sr
                    elif params.sampwidth == 4: # 32-bit float
                        signal = np.frombuffer(frames, dtype=np.float32).astype(np.float64)
                        return signal, target_sr
        except Exception:
            pass # Fall back to FFmpeg
            
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    max_seconds = str(max_duration)

    command = [
        ffmpeg_exe,
        "-i", file_path,
        "-f", "f32le",
        "-acodec", "pcm_f32le",
        "-ac", "1",
        "-ar", str(target_sr),
        "-t", max_seconds,
        "-"
    ]

    process = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False
    )

    if process.returncode != 0:
        raise ValueError(f"Audio decode failed: {process.stderr.decode(errors='ignore').strip()}")

    signal = np.frombuffer(process.stdout, dtype=np.float32).astype(np.float64)
    sr = target_sr

    if len(signal) == 0:
        raise ValueError("Uploaded audio is empty or could not be decoded.")

    max_samples = int(sr * max_duration)
    if len(signal) > max_samples:
        signal = signal[:max_samples]

    return signal, sr


def _frame_signal(signal, sr, frame_size=2048, hop_size=512):
    if len(signal) < frame_size:
        signal = np.pad(signal, (0, frame_size - len(signal)))

    frame_count = 1 + max(0, (len(signal) - frame_size) // hop_size)
    if frame_count <= 0:
        return np.empty((0, frame_size)), np.empty((0, frame_size // 2 + 1)), np.empty((0, frame_size // 2 + 1))

    shape = (frame_count, frame_size)
    strides = (signal.strides[0] * hop_size, signal.strides[0])
    frames = np.lib.stride_tricks.as_strided(signal, shape=shape, strides=strides).copy()
    window = get_window("hann", frame_size, fftbins=True)
    windowed = frames * window

    spectrum = np.abs(np.fft.rfft(windowed, axis=1))
    power_spectrum = (spectrum ** 2) / frame_size
    return frames, spectrum, power_spectrum


def _hz_to_mel(hz):
    return 2595.0 * np.log10(1.0 + hz / 700.0)


def _mel_to_hz(mel):
    return 700.0 * (10 ** (mel / 2595.0) - 1.0)


def _mel_filter_bank(sr, n_fft_bins, n_mels):
    fft_size = (n_fft_bins - 1) * 2
    mel_min = _hz_to_mel(0)
    mel_max = _hz_to_mel(sr / 2)
    mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
    hz_points = _mel_to_hz(mel_points)
    bin_points = np.floor((fft_size + 1) * hz_points / sr).astype(int)

    filters = np.zeros((n_mels, n_fft_bins))
    for index in range(1, n_mels + 1):
        left = bin_points[index - 1]
        center = bin_points[index]
        right = bin_points[index + 1]

        if center == left:
            center += 1
        if right == center:
            right += 1

        for freq in range(left, min(center, n_fft_bins)):
            filters[index - 1, freq] = (freq - left) / max(center - left, 1)
        for freq in range(center, min(right, n_fft_bins)):
            filters[index - 1, freq] = (right - freq) / max(right - center, 1)

    return filters


def _compute_chroma(spectrum, sr):
    freq_bins = np.fft.rfftfreq((spectrum.shape[1] - 1) * 2, d=1.0 / sr)
    chroma = np.zeros((spectrum.shape[0], 12))

    for index, freq in enumerate(freq_bins):
        if freq <= 0:
            continue
        midi = int(round(12 * np.log2(freq / 440.0) + 69))
        chroma_bin = midi % 12
        chroma[:, chroma_bin] += spectrum[:, index]

    chroma_sum = np.sum(chroma, axis=1, keepdims=True) + 1e-10
    return chroma / chroma_sum


def _compute_spectral_contrast(power_spectrum, sr):
    freq_bins = np.fft.rfftfreq((power_spectrum.shape[1] - 1) * 2, d=1.0 / sr)
    band_edges = np.geomspace(max(20, freq_bins[1]), sr / 2, num=8)
    contrast = np.zeros((power_spectrum.shape[0], 7))

    for band in range(7):
        left = band_edges[band]
        right = band_edges[band + 1]
        mask = (freq_bins >= left) & (freq_bins < right)
        band_values = power_spectrum[:, mask]

        if band_values.size == 0:
            continue

        peak = np.percentile(band_values, 90, axis=1)
        valley = np.percentile(band_values, 10, axis=1)
        contrast[:, band] = 10.0 * np.log10((peak + 1e-10) / (valley + 1e-10))

    return contrast


def _zero_crossing_rate(frames):
    signs = np.sign(frames)
    return np.mean(np.abs(np.diff(signs, axis=1)) > 0, axis=1)


def _rms_energy(frames):
    return np.sqrt(np.mean(frames ** 2, axis=1) + 1e-12)


def _spectral_centroid(power_spectrum, sr):
    freq_bins = np.fft.rfftfreq((power_spectrum.shape[1] - 1) * 2, d=1.0 / sr)
    weighted = np.sum(power_spectrum * freq_bins, axis=1)
    total = np.sum(power_spectrum, axis=1) + 1e-10
    return weighted / total


def _spectral_bandwidth(power_spectrum, sr, centroid):
    freq_bins = np.fft.rfftfreq((power_spectrum.shape[1] - 1) * 2, d=1.0 / sr)
    spread = np.sum(power_spectrum * (freq_bins - centroid[:, None]) ** 2, axis=1)
    total = np.sum(power_spectrum, axis=1) + 1e-10
    return np.sqrt(spread / total)


def _spectral_rolloff(power_spectrum, sr, roll_percent=0.85):
    freq_bins = np.fft.rfftfreq((power_spectrum.shape[1] - 1) * 2, d=1.0 / sr)
    cumulative = np.cumsum(power_spectrum, axis=1)
    threshold = cumulative[:, -1:] * roll_percent
    rolloff_index = np.argmax(cumulative >= threshold, axis=1)
    return freq_bins[rolloff_index]


def _estimate_pitch_track(frames, sr, fmin=65.0, fmax=1000.0):
    min_lag = max(1, int(sr / fmax))
    max_lag = max(min_lag + 1, int(sr / fmin))
    pitches = []

    for frame in frames:
        frame = frame - np.mean(frame)
        energy = np.sqrt(np.mean(frame ** 2))
        if energy < 1e-6: # Lowered threshold from 1e-4 to 1e-6
            pitches.append(0.0)
            continue

        autocorr = np.correlate(frame, frame, mode="full")[len(frame) - 1:]
        search = autocorr[min_lag:max_lag]
        if search.size == 0:
            pitches.append(0.0)
            continue

        lag = np.argmax(search) + min_lag
        pitch = sr / lag if lag > 0 else 0.0
        pitches.append(float(pitch))

    clean = np.array([value for value in pitches if value > 0.0], dtype=np.float64)
    if clean.size == 0:
        clean = np.array([0.0], dtype=np.float64)
    return clean


def _estimate_onsets(signal, sr):
    frame_size = 1024
    hop_size = 512
    if len(signal) < frame_size:
        signal = np.pad(signal, (0, frame_size - len(signal)))

    frame_count = 1 + max(0, (len(signal) - frame_size) // hop_size)
    shape = (frame_count, frame_size)
    strides = (signal.strides[0] * hop_size, signal.strides[0])
    frames = np.lib.stride_tricks.as_strided(signal, shape=shape, strides=strides).copy()
    energy = np.sum(frames ** 2, axis=1)

    if energy.size < 2:
        return 0

    diff = np.diff(energy)
    threshold = np.mean(diff) + np.std(diff)
    return int(np.sum(diff > threshold))


def _clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))
