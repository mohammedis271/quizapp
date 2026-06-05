import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Trophy, Hourglass, PartyPopper } from 'lucide-react';
import useWebSocket from './useWebSocket';

const OPTION_COLORS = [
  'bg-rose-500 hover:bg-rose-600',
  'bg-sky-500 hover:bg-sky-600',
  'bg-amber-500 hover:bg-amber-600',
  'bg-emerald-500 hover:bg-emerald-600',
];

export default function QuizClient() {
  const { roomId } = useParams();
  const username = localStorage.getItem('username');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const [status, setStatus] = useState('JOINING');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const navigate = useNavigate();

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'JOINED': setStatus('LOBBY'); break;
      case 'REJOINED':
        setStatus(msg.status === 'LOBBY' ? 'LOBBY' : (msg.status === 'IN_PROGRESS' ? 'QUESTION' : msg.status));
        setScore(msg.score);
        if (msg.question) setQuestion(msg.question);
        break;
      case 'NEW_QUESTION':
        setQuestion(msg.question);
        setStatus('QUESTION');
        setAnswer('');
        setIsCorrect(null);
        break;
      case 'ANSWER_RECEIVED':
        setIsCorrect(msg.isCorrect);
        if (msg.score !== undefined) setScore(msg.score);
        setStatus('ANSWERED');
        break;
      case 'QUESTION_ENDED': setStatus('ENDED'); break;
      case 'QUIZ_FINISHED': setStatus('FINISHED'); break;
      case 'ERROR': alert(msg.message); break;
    }
  }, []);

  const { sendMessage, status: wsStatus } = useWebSocket(
    `${protocol}//${window.location.host}/ws`,
    handleMessage
  );

  useEffect(() => {
    if (wsStatus === 'connected' && username) {
      sendMessage({ type: 'REJOIN', roomId, username });
    }
  }, [wsStatus, sendMessage, roomId, username]);

  const submitAnswer = (val) => {
    setAnswer(val);
    sendMessage({ type: 'SUBMIT_ANSWER', roomId, username, answer: val });
  };

  if (status === 'JOINING') {
    return (
      <div className="min-h-screen bg-fun flex flex-col items-center justify-center text-primary-content gap-4">
        <span className="loading loading-ball loading-lg"></span>
        <p className="font-display text-2xl">Connecting...</p>
      </div>
    );
  }

  if (status === 'LOBBY') {
    return (
      <div className="min-h-screen bg-fun flex flex-col items-center justify-center p-6 text-primary-content">
        <PartyPopper size={64} className="animate-bounce" />
        <h1 className="font-display text-5xl font-bold mt-4">You're in!</h1>
        <div className="card bg-base-100 text-base-content shadow-2xl mt-6 animate-pop">
          <div className="card-body items-center">
            <p className="text-sm opacity-60">Playing as</p>
            <div className="font-display text-3xl font-bold">{username}</div>
            <div className="badge badge-primary badge-lg">Room {roomId}</div>
          </div>
        </div>
        <p className="mt-6 opacity-80">Waiting for the host to start...</p>
      </div>
    );
  }

  if (status === 'QUESTION' && question) {
    const opts = question.type === 'multiple' ? question.options
      : question.type === 'boolean' ? ['True', 'False'] : [];
    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <div className="navbar bg-base-100 shadow-md">
          <div className="flex-1 px-2 font-display font-bold">{username}</div>
          <div className="flex-none">
            <div className="badge badge-primary badge-lg gap-1">
              <Trophy size={14} /> {score}
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-4 max-w-2xl mx-auto w-full">
          <div className="card bg-base-100 shadow-xl animate-pop">
            <div className="card-body items-center text-center">
              <h2 className="font-display text-2xl font-bold">{question.questionText}</h2>
              {question.image && (
                <img src={question.image} className="max-h-48 rounded-xl mt-2" alt="" />
              )}
            </div>
          </div>

          <div className="grid gap-3 mt-auto">
            {opts.map((opt, i) => (
              <button
                key={opt}
                onClick={() => submitAnswer(opt)}
                className={`btn btn-lg ${OPTION_COLORS[i % 4]} text-white border-0 font-display text-xl normal-case shadow-lg`}
              >
                {opt}
              </button>
            ))}
            {question.type === 'text' && (
              <>
                <input
                  type="text"
                  className="input input-bordered input-lg input-primary text-xl"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                />
                <button
                  onClick={() => submitAnswer(answer)}
                  className="btn btn-primary btn-lg font-display"
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'ANSWERED') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center text-white p-6 ${isCorrect ? 'bg-success' : 'bg-error'}`}>
        <div className="animate-pop flex flex-col items-center">
          {isCorrect ? <Check size={96} strokeWidth={3} /> : <X size={96} strokeWidth={3} />}
          <h1 className="font-display text-5xl font-bold mt-4">
            {isCorrect ? 'CORRECT!' : 'WRONG'}
          </h1>
          <div className="badge badge-lg mt-6 bg-white/20 border-0 text-white gap-1">
            <Trophy size={14} /> {score}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'ENDED') {
    return (
      <div className="min-h-screen bg-info flex flex-col items-center justify-center text-info-content gap-3">
        <Hourglass size={64} className="animate-pulse" />
        <h1 className="font-display text-4xl font-bold">Question ended</h1>
        <p className="opacity-80">Hold tight for the next one...</p>
      </div>
    );
  }

  if (status === 'FINISHED') {
    return (
      <div className="min-h-screen bg-fun flex flex-col items-center justify-center text-primary-content p-6">
        <Trophy size={72} className="text-accent animate-bounce" />
        <h1 className="font-display text-5xl font-bold mt-4">Quiz Finished!</h1>
        <div className="card bg-base-100 text-base-content shadow-2xl mt-6 animate-pop">
          <div className="card-body items-center">
            <p className="text-sm opacity-60">Final score</p>
            <div className="font-display text-5xl font-bold text-primary">{score}</div>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-accent btn-lg mt-8">
          Done
        </button>
      </div>
    );
  }

  return null;
}
