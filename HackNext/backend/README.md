# Voice Diary Backend

Minimal Express backend for the hackathon demo.

## Run

```bash
npm install
npm start
```

Server runs on `http://localhost:5000` by default.

## Routes

### `POST /api/upload`

Multipart form-data:

- `audio`: audio file
- `userId`: user identifier

Success response:

```json
{
  "success": true,
  "message": "Audio uploaded and analyzed successfully.",
  "data": {
    "recordingId": "uuid",
    "userId": "user-123",
    "createdAt": "2026-04-11T12:00:00.000Z",
    "fileUrl": "/uploads/file.webm",
    "analysis": {
      "pitch": 210,
      "tremor": 0.11,
      "breathlessness": 0.24,
      "speech_rate": 3.8,
      "risk_level": "medium"
    }
  }
}
```

### `GET /api/analysis/:id`

Returns one recording and its analysis.

### `GET /api/history/:userId`

Returns all saved recordings for a user.

## ML service

Backend forwards the uploaded file to:

`http://localhost:8000/analyze`

Expected ML response:

```json
{
  "pitch": 210,
  "tremor": 0.11,
  "breathlessness": 0.24,
  "speech_rate": 3.8,
  "risk_level": "medium"
}
```

## Database helper

If your teammate provides DB helper functions, set `DB_HELPER_PATH` in `.env`.

The helper module should export:

```js
async function createRecording(record) {}
async function getRecordingById(recordingId) {}
async function getHistoryByUserId(userId) {}
```

If no helper is connected yet, the backend uses an in-memory fallback so the API still works during integration.
