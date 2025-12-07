import React, { useState } from "react";
import "./Home.css";
import {
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaQuestion,
  FaLightbulb,
  FaShieldAlt,
  FaSearch,
  FaGoogle,
} from "react-icons/fa";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export default function Home({ onGenerate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [user, setUser] = useState(null);

  // ---------------- Google Sign-In ----------------
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (err) {
      alert("Sign-in failed: " + err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign-out failed:", err.message);
    }
  };

  // ---------------- File Upload ----------------
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  // ---------------- Mode Selection ----------------
  const handleStartGame = (modeName) => {
    setSelectedMode(modeName);
  };

  // ---------------- Generate Reviewer ----------------
  const handleGenerateReviewer = async () => {
    if (!selectedFile || !selectedMode) {
      alert("Please select both a file and a game mode.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", selectedMode);
    formData.append("count", questionCount);

    try {
      // ✅ Use environment variable for backend URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backendUrl}/api/generate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server Error");
      }

      const result = await response.json();
      const questions = result.questions;

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI returned empty or invalid questions.");
      }

      console.log("Questions received:", questions);

      // ⭐ Send data to App.jsx
      if (onGenerate) {
        onGenerate(selectedFile, selectedMode, questions);
      }
    } catch (error) {
      setError(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isReadyToGenerate = selectedFile && selectedMode;
  const isDisabled = !isReadyToGenerate || isGenerating;

  // ---------------- Render ----------------
  return (
    <div className="home-container">
      <div className="card">

        {/* HEADER */}
        <header className="card-header">
          <div className="brand">
            <div className="brand-badge">🎓</div>
            <div className="brand-text">
              <div className="brand-title">LevelUp Scholar</div>
              <div className="brand-sub">Gamified Reviewer Generator</div>
            </div>
          </div>

          <div className="user-info">
            <FaSearch style={{ fontSize: "18px", color: "var(--muted)", cursor: "pointer" }} />
            <div className="user-details">
              {user ? (
                <>
                  <div className="user-name">{user.displayName}</div>
                  <div className="user-handle">{user.email}</div>
                </>
              ) : (
                <>
                  <div className="user-name">Guest</div>
                  <div className="user-handle">Not signed in</div>
                </>
              )}
            </div>
            <div
              className="user-avatar"
              onClick={user ? handleSignOut : handleGoogleSignIn}
              style={{ cursor: "pointer" }}
            >
              {user ? user.displayName[0] : <FaGoogle />}
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="card-body">
          <div className="left">
            <div className="upload-card">
              <div className="upload-title">UPLOAD YOUR STUDY MATERIALS!</div>
              <div className="upload-sub">(DOCX · PDF)</div>

              <label htmlFor="file" className="dropzone" tabIndex={0}>
                <div className="drop-inner">
                  {selectedFile ? (
                    <div className="drop-icon" style={{ color: "var(--green)" }}>✅</div>
                  ) : (
                    <div className="drop-icon">☁️</div>
                  )}
                  <div className="drop-text">
                    {selectedFile ? (
                      <span style={{ color: "var(--green)" }}>{selectedFile.name}</span>
                    ) : (
                      <span>Drag & Drop or <span className="linkish">Browse File</span></span>
                    )}
                  </div>
                  <div className="drop-hint">PDF, DOCX supported</div>
                </div>
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleFileChange}
                />
              </label>

              {error && (
                <div className="error-message" style={{ color: "var(--red)", marginTop: "10px" }}>
                  {error}
                </div>
              )}

              <div className="file-types">
                <div className="ft"><FaFilePdf /> <span>PDF</span></div>
                <div className="ft"><FaFileWord /> <span>DOCX</span></div>
                <div className="ft disabled"><FaFilePowerpoint /> <span>PPTX</span></div>
              </div>

              <div className="count-section">
                <label>Number of Questions:</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="count-select"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
            </div>
          </div>

          <div className="right">
            <div className="modes-title">CHOOSE YOUR GAME MODE!</div>
            <div className="modes">

              {/* Quiz Challenge */}
              <div className={`mode-card mode-quiz ${selectedMode === "Quiz Challenge" ? "selected" : ""}`}>
                <div className="mode-icon"><FaQuestion /></div>
                <div className="mode-head">Quiz Challenge</div>
                <div className="mode-desc">Timed multiple-choice battle.</div>
                <button
                  className="mode-btn"
                  onClick={() => handleStartGame("Quiz Challenge")}
                >
                  {selectedMode === "Quiz Challenge" ? "SELECTED" : "SELECT"}
                </button>
              </div>

              {/* Flashcard Frenzy */}
              <div className={`mode-card mode-flash ${selectedMode === "Flashcard Frenzy" ? "selected" : ""}`}>
                <div className="mode-icon"><FaLightbulb /></div>
                <div className="mode-head">Flashcard Frenzy</div>
                <div className="mode-desc">Spaced reps, quick recall.</div>
                <button
                  className="mode-btn"
                  onClick={() => handleStartGame("Flashcard Frenzy")}
                >
                  {selectedMode === "Flashcard Frenzy" ? "SELECTED" : "SELECT"}
                </button>
              </div>

              {/* Adventure Path */}
              <div className={`mode-card mode-adventure ${selectedMode === "Adventure Path" ? "selected" : ""}`}>
                <div className="mode-icon"><FaShieldAlt /></div>
                <div className="mode-head">Adventure Path</div>
                <div className="mode-desc">Progress map and levels.</div>
                <button
                  className="mode-btn"
                  onClick={() => handleStartGame("Adventure Path")}
                >
                  {selectedMode === "Adventure Path" ? "SELECTED" : "SELECT"}
                </button>
              </div>

            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="card-footer">
          <button
            className="generate-btn"
            onClick={handleGenerateReviewer}
            disabled={isDisabled}
          >
            {isGenerating ? "GENERATING..." : "GENERATE YOUR REVIEWER!"}
          </button>
        </footer>
      </div>
    </div>
  );
}
