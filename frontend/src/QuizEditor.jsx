import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuiz, createQuiz, updateQuiz, uploadImage } from './api';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => { if (id) fetchQuiz(); }, [id]);

  const fetchQuiz = async () => {
    const { data } = await getQuiz(id);
    setTitle(data.title);
    setDescription(data.description);
    setQuestions(data.questions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      type: 'multiple',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswers: [''],
      timeLimit: 30,
      image: ''
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleImageUpload = async (index, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await uploadImage(formData);
      updateQuestion(index, 'image', data.imageUrl);
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleSave = async () => {
    try {
      if (id) await updateQuiz(id, { title, description, questions });
      else await createQuiz({ title, description, questions });
      navigate('/admin');
    } catch (err) {
      alert('Save failed');
    }
  };

  const accentColors = ['border-l-primary', 'border-l-secondary', 'border-l-accent', 'border-l-info'];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-30">
        <div className="flex-1 px-2 gap-2">
          <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-circle">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display text-2xl font-bold">
            {id ? 'Edit Quiz' : 'Create Quiz'}
          </h1>
        </div>
        <div className="flex-none">
          <button onClick={handleSave} className="btn btn-primary gap-2">
            <Save size={18} /> Save Quiz
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <label className="form-control">
              <div className="label"><span className="label-text font-semibold">Quiz Title</span></div>
              <input
                type="text"
                className="input input-bordered input-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Quiz"
              />
            </label>
            <label className="form-control">
              <div className="label"><span className="label-text font-semibold">Description</span></div>
              <textarea
                className="textarea textarea-bordered textarea-primary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's it about?"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className={`card bg-base-100 shadow-xl border-l-8 ${accentColors[qIndex % accentColors.length]} animate-pop`}
            >
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <div className="badge badge-primary badge-lg font-display font-bold">
                    Q{qIndex + 1}
                  </div>
                  <button
                    onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
                    className="btn btn-ghost btn-sm btn-circle text-error"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                  <select
                    className="select select-bordered"
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  >
                    <option value="multiple">Multiple Choice</option>
                    <option value="boolean">True / False</option>
                    <option value="text">Text Entry</option>
                  </select>
                  <label className="input input-bordered flex items-center gap-2">
                    <span className="text-sm opacity-60">Sec</span>
                    <input
                      type="number"
                      className="w-16 bg-transparent outline-none"
                      value={q.timeLimit}
                      onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  className="input input-bordered input-lg w-full font-display"
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  placeholder="Type your question..."
                />

                <div className="flex items-center gap-3">
                  <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
                    <ImageIcon size={16} /> Upload image
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
                    />
                  </label>
                  {q.image && (
                    <img src={q.image} className="h-16 rounded-lg shadow" alt="" />
                  )}
                </div>

                {q.type === 'multiple' && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIndex) => {
                      const colors = ['bg-error/10', 'bg-info/10', 'bg-warning/10', 'bg-success/10'];
                      return (
                        <div key={oIndex} className={`flex gap-2 items-center p-2 rounded-xl ${colors[oIndex]}`}>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            className="radio radio-primary"
                            checked={q.correctAnswers[0] === opt && opt !== ''}
                            onChange={() => updateQuestion(qIndex, 'correctAnswers', [opt])}
                          />
                          <input
                            type="text"
                            className="input input-bordered input-sm flex-1"
                            placeholder={`Option ${oIndex + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const n = [...q.options];
                              n[oIndex] = e.target.value;
                              updateQuestion(qIndex, 'options', n);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'boolean' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map(v => (
                      <label key={v} className="label cursor-pointer gap-2">
                        <input
                          type="radio"
                          name={`bool-${qIndex}`}
                          className="radio radio-primary"
                          checked={q.correctAnswers[0] === v}
                          onChange={() => updateQuestion(qIndex, 'correctAnswers', [v])}
                        />
                        <span className="label-text font-semibold">{v}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'text' && (
                  <input
                    type="text"
                    className="input input-bordered"
                    value={q.correctAnswers.join(',')}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'correctAnswers', e.target.value.split(',').map(s => s.trim()))
                    }
                    placeholder="Correct answers (comma separated)"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button onClick={addQuestion} className="btn btn-outline btn-primary gap-2">
            <Plus size={18} /> Add Question
          </button>
          <button onClick={handleSave} className="btn btn-primary gap-2">
            <Save size={18} /> Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
