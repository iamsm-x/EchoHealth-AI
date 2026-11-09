# AI/ML Service

Minimal voice biomarker inference service for the hackathon.

## Run

```bash
pip install -r requirements.txt
python app.py
```

The service starts on `http://localhost:8000`.

## API

### `GET /health`

Returns service health.

### `POST /analyze`

Multipart form-data:

- `file`: audio file

Returns:

```json
{
  "pitch": 210.4,
  "tremor": 0.11,
  "breathlessness": 0.24,
  "speech_rate": 3.8,
  "risk_level": "medium"
}
```
