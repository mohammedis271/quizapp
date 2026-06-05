const WebSocket = require('ws');
const Quiz = require('./models/Quiz');

const sessions = new Map();

function sanitizeQuestion(question) {
  const obj = question.toObject ? question.toObject() : { ...question };
  const correctCount = Array.isArray(obj.correctAnswers) ? obj.correctAnswers.length : 0;
  return { ...obj, correctAnswers: undefined, correctCount };
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      const { type, roomId, username, quizId, answer } = data;

      switch (type) {
        case 'JOIN_ROOM':
          handleJoinRoom(ws, roomId, username);
          break;
        case 'CREATE_ROOM':
          handleCreateRoom(ws, roomId, quizId);
          break;
        case 'START_QUIZ':
          handleStartQuiz(roomId);
          break;
        case 'NEXT_QUESTION':
          handleNextQuestion(roomId);
          break;
        case 'SUBMIT_ANSWER':
          handleSubmitAnswer(roomId, username, answer);
          break;
        case 'REJOIN':
          handleRejoin(ws, roomId, username);
          break;
      }
    });
  });

  async function handleCreateRoom(ws, roomId, quizId) {
    let session = sessions.get(roomId);
    if (!session) {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return;
        session = {
            quiz,
            adminWs: ws,
            participants: new Map(),
            status: 'LOBBY',
            currentQuestionIndex: -1,
            questionStartTime: null,
        };
        sessions.set(roomId, session);
    } else {
        session.adminWs = ws; // Update admin connection on reconnect
    }
    ws.roomId = roomId;
    ws.send(JSON.stringify({
        type: 'ROOM_CREATED',
        roomId,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        participants: Array.from(session.participants.keys())
    }));
  }

  function handleJoinRoom(ws, roomId, username) {
    const session = sessions.get(roomId);
    if (!session) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
      return;
    }
    if (session.participants.has(username)) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Username taken' }));
      return;
    }
    session.participants.set(username, { ws, score: 0 });
    ws.roomId = roomId;
    ws.username = username;

    if (session.status === 'IN_PROGRESS') {
        const question = session.quiz.questions[session.currentQuestionIndex];
        const sanitizedQuestion = sanitizeQuestion(question);
        ws.send(JSON.stringify({
            type: 'REJOINED',
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            question: sanitizedQuestion, // Send ONLY the current question, not the whole quiz
            score: 0
        }));
    } else {
        ws.send(JSON.stringify({ type: 'JOINED', roomId, username }));
    }

    broadcastToRoom(roomId, {
      type: 'PARTICIPANT_LIST',
      participants: Array.from(session.participants.keys()),
    });
  }

  function handleRejoin(ws, roomId, username) {
    const session = sessions.get(roomId);
    if (!session) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
        return;
    }
    const participant = session.participants.get(username);
    if (participant) {
        participant.ws = ws;
        ws.roomId = roomId;
        ws.username = username;

        let sanitizedQuestion = null;
        if (session.status === 'IN_PROGRESS') {
            const question = session.quiz.questions[session.currentQuestionIndex];
            sanitizedQuestion = sanitizeQuestion(question);
        }

        ws.send(JSON.stringify({
            type: 'REJOINED',
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            question: sanitizedQuestion,
            score: participant.score
        }));
    } else {
        handleJoinRoom(ws, roomId, username);
    }
  }

  function handleStartQuiz(roomId) {
    const session = sessions.get(roomId);
    if (!session) return;
    session.status = 'IN_PROGRESS';
    handleNextQuestion(roomId);
  }

  function handleNextQuestion(roomId) {
    const session = sessions.get(roomId);
    if (!session) return;
    session.currentQuestionIndex++;
    if (session.currentQuestionIndex >= session.quiz.questions.length) {
      handleEndQuiz(roomId);
      return;
    }
    // Reset answered status for new question
    session.participants.forEach(p => p.hasAnsweredCurrent = false);
    session.questionStartTime = Date.now();
    const question = session.quiz.questions[session.currentQuestionIndex];
    const sanitizedQuestion = sanitizeQuestion(question);
    broadcastToRoom(roomId, {
      type: 'NEW_QUESTION',
      question: sanitizedQuestion,
      index: session.currentQuestionIndex,
      total: session.quiz.questions.length,
    });

    if (session.questionTimeout) clearTimeout(session.questionTimeout);
    session.questionTimeout = setTimeout(() => { revealAnswer(roomId); }, question.timeLimit * 1000);
  }

  function revealAnswer(roomId) {
    const session = sessions.get(roomId);
    if (!session || session.status !== 'IN_PROGRESS') return;
    if (session.questionTimeout) {
        clearTimeout(session.questionTimeout);
        session.questionTimeout = null;
    }
    const question = session.quiz.questions[session.currentQuestionIndex];
    broadcastToRoom(roomId, {
        type: 'QUESTION_ENDED',
        correctAnswers: question.correctAnswers,
        leaderboard: getLeaderboard(roomId)
    });
  }

  function handleSubmitAnswer(roomId, username, answer) {
    const session = sessions.get(roomId);
    if (!session || session.status !== 'IN_PROGRESS') return;
    const participant = session.participants.get(username);
    if (!participant || participant.hasAnsweredCurrent) return;

    participant.hasAnsweredCurrent = true;
    const question = session.quiz.questions[session.currentQuestionIndex];
    const timeTaken = (Date.now() - session.questionStartTime) / 1000;
    let isCorrect = false;
    if (question.type === 'text') {
        const a = typeof answer === 'string' ? answer : String(answer ?? '');
        isCorrect = question.correctAnswers.some(c => c.toLowerCase() === a.trim().toLowerCase());
    } else if (question.type === 'multiple') {
        const submitted = Array.isArray(answer) ? answer : [answer];
        const submittedSet = new Set(submitted);
        const correctSet = new Set(question.correctAnswers);
        isCorrect = submittedSet.size === correctSet.size &&
            [...correctSet].every(c => submittedSet.has(c));
    } else {
        isCorrect = question.correctAnswers.includes(answer);
    }
    if (isCorrect) {
        const timeLimit = question.timeLimit;
        const timePoints = Math.max(0, Math.floor(500 * (1 - timeTaken / timeLimit)));
        const totalPoints = 50 + timePoints;
        participant.score += totalPoints;
    }
    participant.ws.send(JSON.stringify({ type: 'ANSWER_RECEIVED', isCorrect, score: participant.score }));

    // Check if everyone has answered
    const allAnswered = Array.from(session.participants.values()).every(p => p.hasAnsweredCurrent);
    if (allAnswered) {
        revealAnswer(roomId);
    }
  }

  function handleEndQuiz(roomId) {
    const session = sessions.get(roomId);
    if (!session) return;
    session.status = 'FINISHED';
    broadcastToRoom(roomId, {
      type: 'QUIZ_FINISHED',
      podium: getLeaderboard(roomId).slice(0, 3),
    });
  }

  function getLeaderboard(roomId) {
    const session = sessions.get(roomId);
    if (!session) return [];
    return Array.from(session.participants.entries())
      .map(([username, data]) => ({ username, score: data.score }))
      .sort((a, b) => b.score - a.score);
  }

  function broadcastToRoom(roomId, data) {
    const session = sessions.get(roomId);
    if (!session) return;
    const message = JSON.stringify(data);
    if (session.adminWs.readyState === WebSocket.OPEN) session.adminWs.send(message);
    session.participants.forEach((p) => {
      if (p.ws.readyState === WebSocket.OPEN) p.ws.send(message);
    });
  }
}

module.exports = setupWebSocket;
