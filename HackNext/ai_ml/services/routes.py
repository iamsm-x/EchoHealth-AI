import os
import tempfile

from flask import Blueprint, jsonify, request

from .analysis_service import analyze_audio


analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.get("/health")
def health():
    return jsonify({"status": "ok", "message": "Voice Biomarker API is running"})


@analysis_bp.post("/analyze")
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No audio file provided in 'file' field"}), 400

    uploaded_file = request.files["file"]
    extension = os.path.splitext(uploaded_file.filename or "")[1] or ".wav"

    with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as tmp:
        uploaded_file.save(tmp.name)
        temp_path = tmp.name

    try:
        return jsonify(analyze_audio(temp_path))
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
