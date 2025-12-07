import React, { useState } from 'react';
import Home from './Home';
import ConfigScreen from './ConfigScreen';
import QuizScreen from './QuizScreen';
import FlashcardScreen from './FlashcardScreen';
import AdventureMap from './AdventureMap';
import './Home.css';

export default function App() {
const [view, setView] = useState('home');

const [generationData, setGenerationData] = useState({
    mode: '',
    file: null,
    questions: []
});

const [quizConfig, setQuizConfig] = useState({});

// ⭐ Called by Home.jsx AFTER AI generates questions
const handleGenerate = (file, mode, generatedQuestions) => {
    setGenerationData({
        file,
        mode,
        questions: generatedQuestions
    });

    // ⭐ ROUTE BASED ON SELECTED GAME MODE
    if (mode === "Flashcard Frenzy") {
        setView('flashcard');
    } 
    else if (mode === "Adventure Path") {
        setView('adventure');
    } 
    else {
        setView('config');
    }
};

const handleStartGame = (config) => {
    setQuizConfig(config);
    setView('game');
};

const handleBackToConfig = () => setView('config');
const handleBackToHome = () => setView('home');

let CurrentViewComponent;

switch (view) {
    case 'home':
        CurrentViewComponent = <Home onGenerate={handleGenerate} />;
        break;

    case 'config':
        CurrentViewComponent = (
            <ConfigScreen
                generatedMode={generationData.mode}
                generatedQuestions={generationData.questions}
                onStartGame={handleStartGame}
                onBack={handleBackToHome}
            />
        );
        break;

    case 'game':
        CurrentViewComponent = (
            <QuizScreen
                difficulty={quizConfig.diff}
                questionCount={quizConfig.count}
                mode={generationData.mode}
                quizQuestions={generationData.questions}
                onBackToConfig={handleBackToConfig}
            />
        );
        break;

    case 'flashcard':
        CurrentViewComponent = (
            <FlashcardScreen
                questions={generationData.questions}
                onBack={handleBackToHome}
            />
        );
        break;

    case 'adventure':
        CurrentViewComponent = (
            <AdventureMap
                questions={generationData.questions}
                onBack={handleBackToHome}
            />
        );
        break;

    default:
        CurrentViewComponent = (
            <div className="card">
                <h1>404 | Screen Not Found</h1>
            </div>
        );
}

return (
    <div className="app-container">
        {CurrentViewComponent}
    </div>
);


}
