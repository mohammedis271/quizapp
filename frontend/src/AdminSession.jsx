import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Play, ArrowRight, Trophy, Users, Crown } from 'lucide-react';
import useWebSocket from './useWebSocket';

const ANSWER_COLORS = ['bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500'];

export default function AdminSession() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const [status, setStatus] = useState('LOBBY');
  const [participants, setParticipants] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [podium, setPodium] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'ROOM_CREATED':
        if (msg.status) setStatus(msg.status);
        if (msg.participants) setParticipants(msg.participants);
        break;
      case 'PARTICIPANT_LIST': setParticipants(msg.participants); break;
      case 'NEW_QUESTION':
        setCurrentQuestion(msg.question);
        setStatus('QUESTION');
        setTimeLeft(msg.question.timeLimit);
        break;
      case 'QUESTION_ENDED':
        setStatus('REVEALED');
        setLeaderboard(msg.leaderboard);
        break;
      case 'QUIZ_FINISHED':
        setStatus('FINISHED');
        setPodium(msg.podium);
        break;
    }
  }, []);

  const { sendMessage, status: wsStatus } = useWebSocket(
    `${protocol}//${window.location.host}/ws`,
    handleMessage
  );

  useEffect(() => {
    let t;
    if (status === 'QUESTION' && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    }
    return () => clearInterval(t);
  }, [status, timeLeft]);

  useEffect(() => {
    if (wsStatus === 'connected' && quizId) {
      sendMessage({ type: 'CREATE_ROOM', roomId, quizId });
    }
  }, [wsStatus, sendMessage, roomId, quizId]);

  if (status === 'LOBBY') {
    return (
      <div className="min-h-screen bg-fun text-primary-content p-6 flex flex-col items-center">
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-center">
          Join the Quiz!
        </h1>

        <div className="card bg-base-100 text-base-content shadow-2xl animate-pop">
          <div className="card-body flex-col md:flex-row gap-8 items-center">
            <div className="text-center">
              <p className="text-sm opacity-60 uppercase tracking-wide">Join at</p>
              <p className="font-display text-xl font-bold">{window.location.host}/join</p>
              <div className="divider my-2">with PIN</div>
              <p className="font-display text-6xl font-extrabold text-primary tracking-widest">
                {roomId}
              </p>
            </div>
            <div className="p-3 bg-base-200 rounded-2xl">
              <QRCodeSVG value={`${window.location.origin}/join?room=${roomId}`} size={180} />
            </div>
          </div>
        </div>

        <div className="mt-10 w-full max-w-4xl">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display text-3xl font-bold flex items-center gap-2">
              <Users /> {participants.length} Joined
            </h2>
            <button
              onClick={() => sendMessage({ type: 'START_QUIZ', roomId })}
              disabled={participants.length === 0}
              className="btn btn-accent btn-lg gap-2 font-display"
            >
              <Play /> START
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {participants.map((p, i) => (
              <div
                key={i}
                className="badge badge-lg badge-secondary p-4 text-base font-display font-bold animate-pop"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'QUESTION' && currentQuestion) {
    const opts = currentQuestion.type === 'multiple' ? currentQuestion.options
      : currentQuestion.type === 'boolean' ? ['True', 'False'] : [];
    const pct = (timeLeft / currentQuestion.timeLimit) * 100;
    return (
      <div className="min-h-screen bg-base-200 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div
            className="radial-progress text-primary bg-base-100"
            style={{ "--value": pct, "--size": "5rem", "--thickness": "8px" }}
          >
            <span className="font-display font-bold text-2xl text-base-content">{timeLeft}</span>
          </div>
          <div className="card bg-base-100 shadow-xl flex-1">
            <div className="card-body py-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-center">
                {currentQuestion.questionText}
              </h1>
            </div>
          </div>
        </div>

        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            className="max-h-[40vh] mx-auto rounded-2xl shadow-xl"
            alt=""
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
          {opts.map((o, i) => (
            <div
              key={i}
              className={`${ANSWER_COLORS[i % 4]} text-white p-8 rounded-2xl shadow-xl text-3xl font-display font-bold flex items-center justify-center text-center animate-pop`}
            >
              {o}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'REVEALED') {
    return (
      <div className="min-h-screen bg-fun text-primary-content p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-display text-4xl font-bold flex items-center gap-2">
              <Trophy /> Leaderboard
            </h1>
            <button
              onClick={() => sendMessage({ type: 'NEXT_QUESTION', roomId })}
              className="btn btn-accent gap-2"
            >
              Next <ArrowRight size={18} />
            </button>
          </div>
          <ul className="space-y-3">
            {leaderboard.slice(0, 5).map((e, i) => (
              <li
                key={i}
                className="card bg-base-100 text-base-content shadow-xl animate-pop"
              >
                <div className="card-body py-4 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="badge badge-primary badge-lg font-display font-bold">
                      #{i + 1}
                    </div>
                    <span className="font-display text-2xl font-bold">{e.username}</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-primary">{e.score}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (status === 'FINISHED') {
    const podiumStyles = [
      { h: 'h-64', bg: 'bg-accent', text: 'text-accent-content', label: '1', size: 'text-6xl', icon: true },
      { h: 'h-48', bg: 'bg-base-300', text: 'text-base-content', label: '2', size: 'text-5xl' },
      { h: 'h-36', bg: 'bg-warning', text: 'text-warning-content', label: '3', size: 'text-4xl' },
    ];
    const order = [1, 0, 2];
    return (
      <div className="min-h-screen bg-fun text-primary-content p-6 flex flex-col items-center justify-center">
        <h1 className="font-display text-6xl font-extrabold mb-12 text-accent flex items-center gap-3">
          <Crown size={56} /> Podium
        </h1>
        <div className="flex items-end gap-4 md:gap-8">
          {order.map((idx) => {
            const p = podium[idx];
            const s = podiumStyles[idx];
            if (!p) return <div key={idx} className="w-28 md:w-32" />;
            return (
              <div key={idx} className="flex flex-col items-center animate-pop">
                <div className="font-display text-xl md:text-2xl font-bold mb-2">{p.username}</div>
                <div className={`${s.bg} ${s.text} ${s.h} w-28 md:w-32 rounded-t-2xl shadow-2xl flex flex-col items-center justify-center`}>
                  {s.icon && <Crown size={24} className="mb-1" />}
                  <div className={`${s.size} font-display font-extrabold`}>{s.label}</div>
                  <div className="badge badge-neutral mt-2">{p.score}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => window.location.href = '/admin'}
          className="btn btn-accent btn-lg mt-12"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return null;
}
