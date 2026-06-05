import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Rocket, PartyPopper } from 'lucide-react';

export default function JoinQuiz() {
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) setRoomId(roomParam.toUpperCase());
  }, [searchParams]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId && username) {
      localStorage.setItem('username', username);
      navigate(`/quiz/${roomId.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-fun flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-pop">
        <div className="card-body items-center text-center">
          <div className="flex items-center gap-2 mb-1">
            <PartyPopper className="text-accent" />
            <h1 className="font-display text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              QuizApp
            </h1>
            <PartyPopper className="text-accent" />
          </div>
          <p className="text-base-content/60 mb-4">Join the live quiz!</p>

          <form onSubmit={handleJoin} className="w-full space-y-4">
            <input
              type="text"
              placeholder="GAME PIN"
              className="input input-bordered input-lg input-primary w-full text-center text-3xl font-display font-bold tracking-widest uppercase"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Your nickname"
              className="input input-bordered input-lg input-secondary w-full text-center text-2xl font-display font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-lg w-full gap-2 wiggle bg-violet-700 text-slate-50">
              <Rocket size={22} /> Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
