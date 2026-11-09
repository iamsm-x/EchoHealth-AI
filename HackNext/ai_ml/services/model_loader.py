import joblib

from .config import MODELS_DIR


class ModelArtifacts:
    def __init__(self):
        self.model = joblib.load(MODELS_DIR / "depression_model.pkl")
        self.scaler = joblib.load(MODELS_DIR / "scaler.pkl")
        self.label_encoder = joblib.load(MODELS_DIR / "label_encoder.pkl")


artifacts = ModelArtifacts()
