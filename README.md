# MentorX

## PHASE 1

- Created a Vite and React application
- Removed unnecessary code and initialized git
- Installed Tailwind CSS
- Installed DaisyUI library
- Premium Navbar with Login, Signup
- Clean search bar
- Department-wise mentors (Engineering, Design, AI, Startup)
- Horizontal mentor cards
- Created a `Navbar.jsx` separate component file
- Installed `react-router-dom`

### Routing Structure

```
"/"
├── Landing (public)
├── /login
└── /signup

"/student"
└── /feed — student dashboard

"/mentor"
└── /dashboard — mentor dashboard
```

- Created `BrowserRouter > Routes > Route=/Body > RouteChildren`
- Created an `Outlet` in the Body component
- Created a login page
- Installed axios
- CORS setup in backend with `origin` and `credentials: true`
- Always pass `{ withCredentials: true }` when making API calls
- Installed `react-redux` + `@reduxjs/toolkit`
- `configureStore` → `Provider` → added reducer to the store
- Login validated and data stored properly in Redux store
- Navbar updates immediately on login
- Refactored code to add a constants file
- Fixed logout issue — routes are not accessible without login
- If token is not present, redirect user to login page
- Updated CSS to light green theme
- Built logout feature
- Edit Profile feature complete with live preview
- New page to see all connections
- New page to see all connection requests
- Feature — Accept / Reject connection requests

**Remaining:**
- Send connection request from feed
- Signup new user
- MentorDashboard
- E2E testing

---

## PHASE 2

### Media Upload Flow

```
Frontend (React)
  │
  │ 1. User selects image/video
  ▼
Backend (Express)
  │
  │ 2. Receives file
  │ 3. Uploads to AWS S3
  ▼
AWS S3
  │
  │ 4. Returns public URL
  ▼
Backend
  │
  │ 5. Saves post data + URL in MongoDB
  ▼
Frontend
  │
  │ 6. Fetches posts and renders feed
```

The mentor creates a post → media is uploaded to S3 → the URL is saved in MongoDB → the post appears in the student feed.

---

## Calendar for Mentor

- Built the personal calendar for mentors
- Events are automatically deleted from the DB once they are over

---

## Real-Time Chat (Socket.io)

- Built the chat window UI at `/chat/:targetId`
- Set up Socket.io in backend — `npm i socket.io`
- Set up `socket.io-client` on frontend
- Initialized chat and `createSocketConnection`
- Listening to socket events
- Fixed security bug — auth in WebSocket
- Fixed bug — messages can only be sent between connected users
- Shows green indicator when user is online
- Limited messages fetched from DB
- **Auto scroll to latest message** — chat window automatically scrolls to the bottom when new messages arrive or when the chat is first loaded

---

## Voice Messages

- Enables users to record and send voice messages within the platform
- Uses the browser `MediaRecorder` API for audio capture on the frontend
- Supports common audio formats like `webm` for efficient recording
- Voice files are sent to the backend using `multipart/form-data`
- Backend handles uploads with Multer and stores files on AWS S3
- Audio URLs and metadata are saved in the database
- Voice messages are rendered using the native HTML `<audio>` player
- Includes proper microphone permission handling and error states
- Designed for smooth, real-time communication between users

---

## Video Call (Agora RTC)

- Integrated **Agora RTC SDK** for real-time video and audio streaming
- Video call is initiated from the chat screen via a call button
- Socket.io handles signaling — call invite, accept, reject, and end events
- 📹 Video call button on the chat screen
- 📞 Incoming call popup/modal with Accept / Reject buttons
- 🪟 Video call screen showing:
  - Your own local video feed
  - The remote user's video feed
  - An End Call button
- On call end, Agora client is cleanly unsubscribed and local tracks are stopped
- Agora channel is created dynamically per user pair using their IDs

---

## Collaborative Whiteboard (Excalidraw + Socket.io)

- Built a real-time collaborative whiteboard accessible from the chat screen
- Uses **Excalidraw** — a full-featured open-source whiteboard library — for the drawing canvas
- Integrated with Socket.io so both users see each other's changes live with no delay

### How it works

```
User A draws on Excalidraw
  │
  │ onChange fires with elements + appState
  ▼
Socket emits "whiteboard:update" with { roomId, elements, appState }
  │
  ▼
Backend broadcasts to the other user in the room
  │
  ▼
User B receives "whiteboard:update"
  │
  │ excalidrawAPI.updateScene() called
  ▼
User B's canvas updates in real time
```

### Key implementation details

- `excalidrawAPI` ref is used to call `updateScene()` on incoming remote events
- `isRemoteUpdate` flag prevents echoing remote changes back to the socket (avoids infinite loop)
- Socket listener is re-registered on reconnect via the `connect` event
- `appState` syncs background color and font family across both users
- `collaborators: new Map()` is passed to prevent Excalidraw's internal collaborator rendering conflicts

### Features available out of the box via Excalidraw

- ✏️ Freehand drawing, shapes, arrows, text
- 🎨 Color picker and stroke width controls
- 🧹 Eraser tool
- 🗑️ Clear canvas
- ↩️ Undo / Redo
- 🔒 Lock tool, zoom, pan
---

## Video Call Recording (Agora Cloud Recording)

Lets either participant record a video call. The recording is produced **server-side by
Agora Cloud Recording**, so the final file always contains **both participants' video and
both participants' audio** — it does not depend on one person's browser staying open.

Recording never starts on its own. A call is completely normal and unrecorded until
somebody presses the Record button, and the other person accepts.

### Flow

```
Normal video call
  │
  │ 1. Participant A presses ● Record
  ▼
POST /recording/request
  │
  │ 2. Backend creates the session and asks B for consent
  ▼
Participant B sees "A wants to record this call"  [ Accept ] [ Decline ]
  │
  │ 3a. Decline -> nothing is recorded, call continues
  │ 3b. Accept  -> POST /recording/:id/consent { accept: true }
  ▼
Backend calls Agora: acquire -> start (mode "mix")
  │
  │ 4. Agora joins the channel as an extra user, mixes both streams
  ▼
BOTH participants see a persistent "● REC 0:42" badge
  │
  │ 5. Someone presses ■ Stop, or the call ends
  ▼
Backend calls Agora stop -> file is written to private S3
  │
  ▼
status = ready -> secure expiring link emailed to both participants
```

### UI pieces

- `components/videocall/RecordingConsentModal.jsx` — consent gate shown to the
  participant who did *not* press Record. Recording cannot start without Accept.
- `components/videocall/RecordingIndicator.jsx` — the persistent `● REC` badge with a
  live timer, shown to **both** participants the whole time recording is active.
- `hooks/useCallRecording.js` — the recording state machine
  (`idle → requesting / awaiting-consent → recording → stopping → processing`).
- `services/recordingApi.js` — thin axios client for the recording endpoints.
- The Record button lives in the existing `VideoCall.jsx` control bar:
  `[ Mic ] [ Camera ] [ Screen ] [ ● Record ] [ Whiteboard ] [ End Call ]`
  and becomes `■ Stop Recording` while a recording is running.

### Key implementation details

- **The backend is the source of truth.** The hook never decides on its own that a
  recording is running; it mirrors the REST responses and the `recording:*` socket
  events. On mount it calls `GET /recording/active` so a refresh or rejoin mid-call
  still shows the correct REC state.
- **No browser `MediaRecorder`.** The browser only presses buttons; Agora's servers do
  the capturing and the upload. Closing the tab does not corrupt the recording.
- Socket events consumed: `recording:consent-request`, `recording:started`,
  `recording:declined`, `recording:stopping`, `recording:processing`,
  `recording:ready`, `recording:failed`.
- The Record button is disabled while a request is in flight or while the recording is
  stopping/processing, so a participant cannot start two sessions by double-clicking.
- If both participants press Record at nearly the same moment, the loser receives
  `409` and simply adopts the winner's session — only one recording ever exists.
- Recordings are private: the app only ever receives short-lived presigned URLs, never
  a public S3 link.
