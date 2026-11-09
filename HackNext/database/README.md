# 🔥 Database Layer — Firebase Firestore

Voice Biomarker App · Hackathon · Database Module

---

## 📁 Folder Structure

```
database/
├── index.js                        ← Backend imports from HERE only
├── firebaseConfig.js               ← Firebase app init & Firestore connection
├── queries.js                      ← All query functions (insertRecording, insertAnalysis, getHistory)
├── .env.example                    ← Copy to .env and fill credentials
└── collections/
    ├── users.js                    ← users collection
    ├── recordings.js               ← recordings collection
    └── analysisResults.js          ← analysis_results collection
```

---

## 🗄️ Collections & Schemas

### `users`
| Field       | Type      | Description              |
|-------------|-----------|--------------------------|
| name        | string    | Full name of the patient |
| email       | string    | Email address            |
| createdAt   | Timestamp | Auto-set by Firestore    |

### `recordings`
| Field       | Type      | Description                        |
|-------------|-----------|------------------------------------|
| userId      | string    | Reference to `users` document ID   |
| filePath    | string    | Storage path/URL of the audio file |
| createdAt   | Timestamp | Auto-set by Firestore              |

### `analysis_results`
| Field          | Type      | Description                              |
|----------------|-----------|------------------------------------------|
| recordingId    | string    | Reference to `recordings` document ID    |
| pitch          | number    | Avg pitch in Hz                          |
| tremor         | number    | Tremor intensity score (0.0–1.0)         |
| breathlessness | number    | Breathlessness score (0.0–1.0)           |
| speech_rate    | number    | Speech rate (syllables/words per sec)    |
| risk_level     | string    | `"low"` / `"medium"` / `"high"`         |
| createdAt      | Timestamp | Auto-set by Firestore                    |

---

## ⚡ Setup

### 1. Install Firebase SDK
```bash
npm install firebase
```

### 2. Set environment variables
```bash
cp database/.env.example database/.env
# Fill in your Firebase credentials
```

### 3. Firebase Console Setup
- Go to [console.firebase.google.com](https://console.firebase.google.com)
- Create a project → Add Web App → Copy config values to `.env`
- Go to **Firestore Database** → Create database (start in test mode for dev)
- Add these **Composite Indexes** (required for ordered queries):

| Collection       | Fields                        |
|------------------|-------------------------------|
| recordings       | userId ASC, createdAt DESC    |
| analysis_results | recordingId ASC, createdAt DESC|

---

## 🔌 Backend Usage

```js
import { insertRecording, insertAnalysis, getHistory, insertUser } from "./database/index.js";

// 1. Create a user (on registration)
const userId = await insertUser({ name: "Riya Shah", email: "riya@example.com" });

// 2. After audio file is saved to storage:
const recordingId = await insertRecording({
  userId,
  filePath: "audio/user_abc/2024-04-11.wav"
});

// 3. After ML model runs analysis:
const analysisId = await insertAnalysis({
  recordingId,
  pitch: 118.4,
  tremor: 0.32,
  breathlessness: 0.21,
  speech_rate: 3.7,
  risk_level: "medium"
});

// 4. Fetch full history for dashboard:
const history = await getHistory(userId);
// Returns: [{ recordingId, filePath, recordedAt, analysis: { pitch, tremor, ... } }, ...]
```

---

## 📤 Exported Functions

| Function           | Description                                      |
|--------------------|--------------------------------------------------|
| `insertRecording`  | Save a new voice recording entry                 |
| `insertAnalysis`   | Save ML analysis result for a recording          |
| `getHistory`       | Get full joined history (recordings + analysis)  |
| `insertUser`       | Register a new user                              |
| `getUserById`      | Fetch user by Firestore doc ID                   |
| `getUserByEmail`   | Fetch user by email                              |
| `getRecordingById` | Fetch a single recording                         |
| `getAnalysisById`  | Fetch a single analysis result                   |
| `db`               | Raw Firestore instance (for advanced use)        |

---

## ⚠️ Constraints (as per spec)
- ❌ No APIs created here
- ❌ No frontend code
- ❌ No ML model calls
- ✅ Pure database functions only
- ✅ Firebase Firestore (replacing MongoDB as requested)
- ✅ All functions exported cleanly via `index.js`
