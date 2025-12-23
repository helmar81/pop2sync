import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchQuizQuestions } from '../services/geminiService';
import { QuizQuestion } from '../types';
import Footer from './Footer';

type GameState = 'INTRO' | 'LOADING' | 'PLAYING' | 'FINISHED';

const Quiz: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const startGame = async () => {
    setGameState('LOADING');
    try {
      const data = await fetchQuizQuestions();
      setQuestions(data);
      setScore(0);
      setCurrentIndex(0);
      setGameState('PLAYING');
    } catch (err) {
      console.error("Failed to start quiz", err);
      // Fallback handled in service, but safety net here
      setGameState('INTRO');
    }
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState('FINISHED');
    }
  };

  const getButtonClass = (option: string) => {
    const baseClass = "w-full p-4 rounded-xl text-left transition-all duration-200 border border-slate-700 relative overflow-hidden group ";
    
    if (!isAnswered) {
      return baseClass + "bg-slate-800 hover:bg-slate-700 hover:border-slate-600 text-slate-200";
    }

    const correct = questions[currentIndex].correctAnswer;
    
    if (option === correct) {
      return baseClass + "bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    }

    if (option === selectedOption && option !== correct) {
      return baseClass + "bg-red-500/20 border-red-500 text-slate-300 opacity-75";
    }

    return baseClass + "bg-slate-800/50 text-slate-500 border-slate-800 opacity-50";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-3xl"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        {/* Header */}
        <div className="p-6 flex justify-between items-center z-10">
             <Link
                to="/"
                className="px-4 py-2 bg-slate-800/50 text-slate-300 text-sm font-medium border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 backdrop-blur-sm"
              >
                <span>←</span> Exit Quiz
              </Link>
              <div className="font-bold text-slate-500 tracking-widest text-xs uppercase">PopSync Trivia</div>
        </div>

        <main className="flex-grow flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-2xl mx-auto">
            
            {gameState === 'INTRO' && (
                <div className="text-center animate-slide-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3 hover:rotate-6 transition-transform">
                        <span className="text-4xl">🧠</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Geo Master Quiz</h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                        Test your knowledge about world populations, capitals, and demographics with AI-generated questions.
                    </p>
                    <button 
                        onClick={startGame}
                        className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg hover:shadow-white/20 active:scale-95"
                    >
                        Start Challenge
                    </button>
                </div>
            )}

            {gameState === 'LOADING' && (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-mono text-sm">Generating questions with Gemini...</p>
                </div>
            )}

            {gameState === 'PLAYING' && (
                <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Question {currentIndex + 1} of {questions.length}</span>
                        <span className="text-xs font-mono text-slate-500">Score: {score}</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-snug min-h-[4rem]">
                        {questions[currentIndex].question}
                    </h2>

                    <div className="space-y-3 mb-8">
                        {questions[currentIndex].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                disabled={isAnswered}
                                className={getButtonClass(option)}
                            >
                                <span className="font-medium">{option}</span>
                                {isAnswered && option === questions[currentIndex].correctAnswer && (
                                    <span className="absolute right-4 text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                )}
                                {isAnswered && option === selectedOption && option !== questions[currentIndex].correctAnswer && (
                                    <span className="absolute right-4 text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {isAnswered && (
                        <div className="animate-slide-up">
                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border-l-4 border-indigo-500">
                                <p className="text-indigo-200 text-sm leading-relaxed">
                                    <span className="font-bold block mb-1 text-indigo-400 text-xs uppercase">Explanation</span>
                                    {questions[currentIndex].explanation}
                                </p>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                            >
                                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {gameState === 'FINISHED' && (
                <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl text-center animate-slide-up">
                    <div className="inline-block p-4 rounded-full bg-slate-800 mb-6">
                        <span className="text-4xl">{score > 3 ? '🏆' : '🎯'}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                    <p className="text-slate-400 mb-6">
                        You scored <span className="text-white font-bold text-xl">{score}</span> out of <span className="text-white font-bold text-xl">{questions.length}</span>
                    </p>
                    
                    <div className="w-full bg-slate-800 rounded-full h-3 mb-8 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                            style={{ width: `${(score / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={startGame}
                            className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                            Play Again
                        </button>
                        <Link
                            to="/"
                            className="w-full py-3.5 text-slate-400 font-medium hover:text-white transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            )}

        </main>
        
        <div className="w-full relative z-10">
             <Footer />
        </div>
    </div>
  );
};

export default Quiz;