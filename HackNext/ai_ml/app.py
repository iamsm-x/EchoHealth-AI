from flask import Flask
from flask_cors import CORS

from services.routes import analysis_bp


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(analysis_bp)
    return app


app = create_app()


if __name__ == "__main__":
    print("Starting Voice Biomarker API on http://localhost:8000")
    app.run(host="0.0.0.0", port=8000, debug=False)
