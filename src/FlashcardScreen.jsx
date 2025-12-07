// FlashcardScreen.jsx
import React, { useState, useEffect } from "react";
import "./FlashcardScreen.css";
import { FaArrowLeft } from "react-icons/fa";

export default function FlashcardScreen({ questions, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="flashcard-container">
        <h2>No flashcards available.</h2>
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> Back
        </button>
      </div>
    );
  }

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const handleFlip = () => {
    if (animating) return;
    setAnimating(true);
    setFlipped(!flipped);
    setTimeout(() => {
      setAnimating(false);
    }, 800); // match CSS transition duration
  };

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % questions.length);
      setAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (animating) return;
    setAnimating(true);
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
      setAnimating(false);
    }, 300);
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  // --- Helper: Remove leading A/B/C/D from answer ---
  const cleanAnswer = (answer) => answer.replace(/^[A-D]\.\s*/, "");

  return (
    <div className="flashcard-container">
      {/* Back button */}
      <button className="back-btn" onClick={onBack}>
        <FaArrowLeft /> Back
      </button>

      {/* Flashcard */}
      <div className="flashcard" onClick={handleFlip}>
        <div className={`card-inner ${flipped ? "flipped" : ""}`}>
          <div className="card-front">
            <p>{questions[currentIndex].question}</p>
          </div>
          <div className="card-back">
  <p>{cleanAnswer(questions[currentIndex].answer)}</p>
</div>

        </div>
      </div>

      {/* Progress Bar */}
      <div className="flashcard-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Controls */}
      <div className="flashcard-controls">
        <button onClick={handlePrev} disabled={questions.length <= 1 || animating}>
          Prev
        </button>
        <button onClick={handleNext} disabled={questions.length <= 1 || animating}>
          Next
        </button>
      </div>
    </div>
  );
}
