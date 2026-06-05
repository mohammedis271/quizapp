import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';
import { Sparkles, LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(username, password);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fun flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-pop">
        <div className="card-body">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-secondary" />
            <h2 className="font-display text-3xl font-bold text-center">Admin Login</h2>
            <Sparkles className="text-secondary" />
          </div>
          <p className="text-center text-base-content/60 mb-4">Sign in to host a quiz</p>

          {error && (
            <div role="alert" className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="form-control w-full">
              <div className="label"><span className="label-text font-semibold">Username</span></div>
              <input
                type="text"
                className="input input-bordered input-primary w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label"><span className="label-text font-semibold">Password</span></div>
              <input
                type="password"
                className="input input-bordered input-primary w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-2 gap-2 ${loading ? 'btn-disabled' : ''}`}
            >
              {loading ? <span className="loading loading-spinner" /> : <LogIn size={18} />}
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
