# QuizApp - Real-Time Web Quiz Application

QuizApp is a full-stack, real-time quiz platform similar to Kahoot. It allows admins to create custom quizzes with images and various question types, and participants to join and compete in real-time from their mobile devices.

## Features

- **Real-time Gameplay:** Powered by native WebSockets for instant interaction.
- **Admin Dashboard:** Create, edit, and manage quizzes.
- **Multiple Question Types:**
  - Multiple Choice
  - True/False
  - Text Entry (with case-insensitive matching against multiple correct answers)
- **Image Support:** Upload images to supplement your questions.
- **Scoring System:**
  - 50 points for a correct answer.
  - Up to 500 bonus points based on response speed (decaying linearly).
- **Session Persistence:** Participants and admins can rejoin active sessions if they refresh or disconnect.
- **Master View:** Large-screen display with QR code lobby, live leaderboards, and a final podium.
- **Dockerized:** Single-command setup for the entire stack.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, Native WebSockets
- **Database:** MongoDB
- **Containerization:** Docker, Docker Compose

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd quizapp
   ```

2. **Run the application using Docker Compose:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **Main App/Join Page:** [http://localhost:5000](http://localhost:5000)
   - **Admin Login:** [http://localhost:5000/login](http://localhost:5000/login)

### Admin Credentials

The system automatically creates a default admin account on the first startup:
- **Username:** `admin`
- **Password:** `password123`

---

## How to Run a Quiz

### 1. Create a Quiz
1. Log in to the [Admin Dashboard](http://localhost:5000/login).
2. Click **"Create Quiz"**.
3. Give your quiz a Title and Description.
4. Add questions:
   - Choose the **Type** (Multiple Choice, True/False, or Text Entry).
   - Enter the **Question Text**.
   - (Optional) Upload an **Image**.
   - Set the **Correct Answer(s)**.
   - Adjust the **Time Limit** (seconds).
5. Click **"Save Quiz"**.

### 2. Start a Session
1. In the Admin Dashboard, find your quiz and click **"Start"**.
2. This opens the **Master View**.
3. Display this screen on a large monitor or projector.

### 3. Participants Join
1. Participants can scan the **QR Code** displayed on the Master View or go to `http://localhost:5000/join` and enter the **Game PIN**.
2. Once they enter a nickname, their name will appear on the Master View lobby.

### 4. Control the Quiz
1. Once all players have joined, the Admin clicks **"START"** on the Master View.
2. The question will appear on the big screen and the participants' devices.
3. After the time limit expires (or all participants answer), the correct answer and current leaderboard are shown.
4. Click **"Next"** to proceed to the next question.
5. After the final question, the **Podium** will display the Top 3 winners.

---

## Development

If you wish to run the project locally without Docker:

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file (see `backend/.env.example` if available, or set `MONGODB_URI`, `JWT_SECRET`, `PORT`).
4. `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
