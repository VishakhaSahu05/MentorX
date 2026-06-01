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