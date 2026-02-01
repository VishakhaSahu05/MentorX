# MentorX PHASE-1

- Created a Vite and React application
- Remove unecesssary code and intialize git
- installed Tailwind CSS
- installed DaisyUI library
- Premium Navbar with Login, Signup
- Clean search bar
- Department-wise mentors (Engineering, Design, AI, Startup)
- Horizontal mentor cards
- created a Navbar.jsx seperate component file
- Install react-router-dom

- Basic Structure of Routing
  "/"
  ├─ Landing (public)
  ├─ /login
  ├─ /signup

"/student"
└─ /feed - student dashboard

"/mentor"
└─ /dashboard - mentor

- created BrowserRouter > Routes > Route=/Body > RouteChildren
- Create an Outlet in the Body Component
- Created a login page
- Installed axios
- CORS installation in backend => add middleware to with configuration : origin and credentials : true
- Whenever making API call so pass {withCredentials:true}
- Install react - redux + @reduxjs/toolkit
- configureStore => Provider => add reducer to the store
- Login and validated if data is coming properly in the store
- NavBar should update as soon as user logs in
- Refactored our code to add constants file
- fixed the logout issue , One should not access routes without login
- if Token is not present redirect user to login page
- changed the css light - green
- Build logout
- Edit Profile feature complete with live preview
- New page to See all my Connections
- New page to See all my Connection Requests
- Feature - Accept/Reject Connection Request
  Remaining :
- Send connection request from feed
- signup new user
- MentorDashboard
- E2E testing

# PHASE - 2

- Frontend (React)
  |
  | 1. User selects image/video
  |
- Backend (Express)
  |
  | 2. Receives file
  | 3. Uploads to AWS S3
  |
- AWS S3
  |
  | 4. Returns public URL
  |
- Backend
  |
  | 5. Saves post data + URL in MongoDB
  |
- Frontend
  |
  | 6. Fetches posts and renders feed

- The mentor creates a post → media is uploaded to S3 → the URL is saved in MongoDB → the post appears in the student feed.

# Calendar for Mentor

- Build the personal Calendar for mentor
- Once the event gets over it should automatically get deleted from the DB also

# Real Time Chat using Socket.io

- built the Ui of the Chat window on /chat/:targetId
- SetUp Socket.io in backend
- npm i socket.io
- Setup frontend socket.io-client
- intialize the chat
- createSocketConnection
- Listen to events
- Next - fix security Bug -- auth in web socket
- fix bug if not friend then messages cant be sent
- Show green signal when online
- Limit message when fetching from DB

# How Voice Messages Work in Chat

- Enables users to record and send voice messages within the platform
- Uses the browser MediaRecorder API for audio capture on the frontend
- Supports common audio formats like webm for efficient recording
- Voice files are sent to the backend using multipart/form-data
- Backend handles uploads with Multer and stores files on AWS S3
- Audio URLs and metadata are saved in the database
- Voice messages are rendered using the native HTML <audio> player
- Includes proper microphone permission handling and error states
- Designed for smooth, real-time communication between users

# Video Call UI

- What we will build:
- 📹 Video Call button on the chat screen
- 📞 Incoming call popup/modal
- Buttons: Accept / Reject
- 🪟 Video call screen, which shows:
- Your own video
- The other user’s video
- An End Call button

- This UI does NOT handle the actual video transmission.
- First, we build the video call UI to manage user interactions like starting, accepting, or ending a call. This layer only handles presentation and user actions; the actual video streaming is handled separately by WebRTC
