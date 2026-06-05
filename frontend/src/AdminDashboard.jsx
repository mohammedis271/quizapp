import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from './api';
import { Plus, Play, Edit, Trash2, LogOut, Sparkles, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await getQuizzes();
      setQuizzes(data);
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this quiz?')) {
      await deleteQuiz(id);
      fetchQuizzes();
    }
  };

  const startQuiz = (quizId) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/admin/session/${roomId}?quizId=${quizId}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-30">
        <div className="flex-1">
          <span className="font-display text-2xl font-bold px-4 flex items-center gap-2">
            <Sparkles className="text-secondary" />
            QuizApp
            <span className="badge badge-primary badge-sm ml-2">Admin</span>
          </span>
        </div>
        <div className="flex-none gap-2">
          <Link to="/admin/quiz/new" className="btn btn-primary gap-2">
            <Plus size={18} /> Create Quiz
          </Link>
          <button
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }}
            className="btn btn-ghost gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="font-display text-4xl font-bold mb-6">Your Quizzes</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-bars loading-lg text-primary"></span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center py-16">
              <BookOpen size={48} className="text-primary mb-2" />
              <h2 className="card-title font-display">No quizzes yet</h2>
              <p className="text-base-content/60">Create your first quiz to get started.</p>
              <Link to="/admin/quiz/new" className="btn btn-primary mt-4 gap-2">
                <Plus size={18} /> Create Quiz
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow animate-pop">
                <div className="card-body">
                  <h2 className="card-title font-display">{quiz.title}</h2>
                  <div className="flex gap-2 flex-wrap">
                    <div className="badge badge-primary badge-outline">
                      {quiz.questions.length} Questions
                    </div>
                  </div>
                  {quiz.description && (
                    <p className="text-base-content/70 line-clamp-2">{quiz.description}</p>
                  )}
                  <div className="card-actions justify-end mt-2">
                    <button onClick={() => startQuiz(quiz._id)} className="btn btn-success btn-sm gap-1">
                      <Play size={16} /> Start
                    </button>
                    <Link to={`/admin/quiz/edit/${quiz._id}`} className="btn btn-warning btn-sm gap-1">
                      <Edit size={16} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(quiz._id)} className="btn btn-error btn-sm gap-1">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
