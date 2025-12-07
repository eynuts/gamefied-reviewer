import React, { useState, useEffect } from 'react';
import './QuizScreen.css';
import { FaPlay, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const TIME_PER_QUESTION = 15;

const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

function QuizScreen({ 
    difficulty = "Medium", 
    questionCount = 5, 
    mode = "Quiz Challenge", 
    quizQuestions = [],
    onBackToConfig
}) {
    const [questionsForQuiz, setQuestionsForQuiz] = useState(null); // null until initialized
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [userAnswer, setUserAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizStatus, setQuizStatus] = useState('active'); // 'active' | 'finished'

    // Initialize questions only once on mount
    useEffect(() => {
        if (!quizQuestions || quizQuestions.length === 0) {
            setQuestionsForQuiz([]);
            setQuizStatus('finished');
        } else {
            const shuffled = shuffleArray(quizQuestions).slice(0, questionCount);
            setQuestionsForQuiz(shuffled);
        }
    }, [quizQuestions, questionCount]);

    const currentQuestion = questionsForQuiz ? questionsForQuiz[currentQuestionIndex] : null;
    const totalQuestions = questionsForQuiz ? questionsForQuiz.length : 0;

    // Timer
    useEffect(() => {
        if (!currentQuestion || quizStatus !== 'active' || isAnswered) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === 1) {
                    clearInterval(timer);
                    handleAnswer(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestion, quizStatus, isAnswered]);

    const handleAnswer = (selectedOption) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setUserAnswer(selectedOption);

        if (selectedOption === currentQuestion.answer) setScore(prev => prev + 1);

        setTimeout(handleNextQuestion, 2000);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setUserAnswer(null);
            setTimeLeft(TIME_PER_QUESTION);
        } else {
            setQuizStatus('finished');
        }
    };

    const renderQuizContent = () => {
        if (!questionsForQuiz) return <p>Loading questions...</p>;

        if (quizStatus === 'finished') {
            return (
                <div className="quiz-finished">
                    <h2>Quiz Completed!</h2>
                    <p>You finished the <strong>{mode}</strong> on <strong>{difficulty}</strong> difficulty.</p>
                    <div className="final-score">
                        Your Score: <span className="score-number">{score} / {totalQuestions}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="reset-btn" onClick={() => window.location.reload()}>
                            Start New Review
                        </button>
                        {onBackToConfig && (
                            <button className="reset-btn" onClick={onBackToConfig}>
                                Back to Config
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        if (!currentQuestion) {
            return (
                <div className="quiz-loading">
                    <h2>Loading Error</h2>
                    <p>No valid questions were passed. Please go back and generate a new reviewer.</p>
                    <button className="reset-btn" onClick={() => window.location.reload()}>Go to Home</button>
                </div>
            );
        }

        return (
            <div className="question-content">
                <div className="question-header">
                    <span className="question-number">Question {currentQuestionIndex + 1} / {totalQuestions}</span>
                    <div className="timer">
                        <FaHourglassHalf /> Time Left: <span className={timeLeft <= 5 ? 'time-low' : ''}>{timeLeft}s</span>
                    </div>
                </div>

                <div className="question-body">
                    <p className="question-text">{currentQuestion.question}</p>
                </div>

                <div className="options-grid">
                    {currentQuestion.options.map((option, index) => {
                        let buttonClass = "option-btn";
                        if (isAnswered) {
                            if (option === currentQuestion.answer) buttonClass += " correct";
                            else if (option === userAnswer) buttonClass += " incorrect";
                        }

                        const Icon = isAnswered 
                            ? (option === currentQuestion.answer ? FaCheckCircle : (option === userAnswer ? FaTimesCircle : null))
                            : null;

                        return (
                            <button
                                key={index}
                                className={buttonClass}
                                onClick={() => handleAnswer(option)}
                                disabled={isAnswered}
                            >
                                {Icon && <Icon className="answer-icon" />}
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="quiz-wrapper">
            <div className="card-quiz">
                <header className="quiz-header">
                    <FaPlay className="header-icon" />
                    <h1>{mode} Session</h1>
                    <div className="quiz-details">
                        <span>Difficulty: <strong>{difficulty}</strong></span>
                        <span>Score: <strong>{score}</strong></span>
                    </div>
                </header>

                <main className="quiz-body">
                    {renderQuizContent()}
                </main>
            </div>
        </div>
    );
}

export default QuizScreen;
