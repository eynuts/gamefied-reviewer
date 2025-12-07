import React, { useMemo, useState, useEffect } from "react";
import "./AdventureMap.css";
import { FaChevronLeft } from "react-icons/fa";

/*
 Full AdventureMap.jsx
 - Keeps your original layout, SVG path, side panel, and progress UI.
 - Adds behavior:
    * Wrong click => only clicked button shows red, shakes, fades (300ms), then removed for that level.
    * Correct click => only clicked button shows green, then proceeds to next level.
 - Tracks removed choices by index (stable).
 - Disables input during short animations to avoid cheating.
*/

export default function AdventureMap({ questions = [], onBack }) {
  // core state
  const [currentLevel, setCurrentLevel] = useState(0);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(""); // "correct" | "wrong" | ""
  const [removedIndices, setRemovedIndices] = useState([]); // indices removed for the open level
  const [isAnimating, setIsAnimating] = useState(false);
  const [wrongPickedIndex, setWrongPickedIndex] = useState(null);
  const [correctPickedIndex, setCorrectPickedIndex] = useState(null);

  // Normalize questions (preserves your original structure)
  const normalized = useMemo(() => {
    return (questions || []).map((q, i) => ({
      id: q.id ?? i,
      question: q.question ?? q.text ?? `Question ${i + 1}`,
      choices: q.choices ?? q.options ?? [],
      correct: q.correct ?? q.answer ?? null,
    }));
  }, [questions]);

  // Build positions for nodes (zig-zag)
  const positions = useMemo(() => {
    const n = Math.max(1, normalized.length);
    const gap = 80 / Math.max(1, n - 1);
    return normalized.map((_, i) => {
      const left = 10 + gap * i;
      const topBase = 38;
      const amplitude = 18;
      const top =
        topBase +
        amplitude * Math.sin((i / Math.max(1, n - 1)) * Math.PI * 2);
      return { left: `${left}%`, top: `${top}%` };
    });
  }, [normalized]);

  // Reset modal state when level changes
  useEffect(() => {
    setShowModal(false);
    setSelectedQuestion(null);
    setAnswerStatus("");
    setRemovedIndices([]);
    setIsAnimating(false);
    setWrongPickedIndex(null);
    setCorrectPickedIndex(null);
  }, [currentLevel]);

  // Open current level only
  const openLevel = (index) => {
    if (index !== currentLevel) return;
    const q = normalized[index];
    if (!q) return;

    setSelectedQuestion(q);
    setShowModal(true);
    setAnswerStatus("");
    setRemovedIndices([]);
    setWrongPickedIndex(null);
    setCorrectPickedIndex(null);
  };

  // Helper: determine correct index (0..n-1) if possible
  const getCorrectIndex = (q) => {
    if (!q) return -1;
    const correct = q.correct;
    if (typeof correct === "string" && /^[A-D]$/i.test(correct.trim())) {
      return correct.trim().toUpperCase().charCodeAt(0) - 65;
    }
    if (typeof correct === "string") {
      const idx = q.choices.findIndex(
        (opt) => typeof opt === "string" && opt.trim() === correct.trim()
      );
      if (idx >= 0) return idx;
    }
    return -1;
  };

  // Main answer handler accepts index (0..3)
  const checkAnswerByIndex = (idx) => {
    if (!selectedQuestion || isAnimating) return;

    const correctIdx = getCorrectIndex(selectedQuestion);
    let isCorrect = false;

    if (correctIdx >= 0) {
      isCorrect = idx === correctIdx;
    } else {
      // fallback: compare texts
      const rawCorrect = selectedQuestion.correct;
      if (typeof rawCorrect === "string") {
        isCorrect =
          (selectedQuestion.choices[idx] || "").trim() === rawCorrect.trim();
      }
    }

    if (isCorrect) {
      // Correct: show green only on clicked button, then advance
      setAnswerStatus("correct");
      setCorrectPickedIndex(idx);
      setIsAnimating(true);

      // mark completed
      setCompletedLevels((prev) =>
        prev.includes(currentLevel) ? prev : [...prev, currentLevel]
      );

      // after short delay, advance
      setTimeout(() => {
        setIsAnimating(false);
        setAnswerStatus("");
        setCorrectPickedIndex(null);
        setRemovedIndices([]); // clear for next level
        setShowModal(false);

        if (currentLevel < normalized.length - 1) {
          setCurrentLevel((c) => c + 1);
        } else {
          // final completion behavior
          setTimeout(() => {
            alert("🎉 Adventure Completed!");
            if (onBack) onBack();
          }, 200);
        }
      }, 900); // green visible for 900ms
    } else {
      // Wrong: show red only on clicked button, shake + fade out, then remove index
      setAnswerStatus("wrong");
      setWrongPickedIndex(idx);
      setIsAnimating(true);

      // Start fade/animation: user sees red & shake
      // After fade-out duration (300ms) remove the choice index for this level
      const FADE_MS = 300;
      setTimeout(() => {
        setRemovedIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
        // clear wrong highlight after removal
        setWrongPickedIndex(null);
        setAnswerStatus("");
        setIsAnimating(false);
      }, FADE_MS + 120); // small buffer so animation completes (total ~420ms)
    }
  };

  // Build SVG path for positions (smooth curve)
  const svgPath = useMemo(() => {
    if (positions.length === 0) return "";
    const points = positions.map((p) => {
      const x = parseFloat(p.left);
      const y = parseFloat(p.top);
      return { x, y };
    });

    let d = "";
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (i === 0) d += `M ${p.x},${p.y}`;
      else {
        const prev = points[i - 1];
        const cx = (prev.x + p.x) / 2;
        const cy = (prev.y + p.y) / 2;
        d += ` Q ${cx},${cy} ${p.x},${p.y}`;
      }
    }
    return d;
  }, [positions]);

  // Guard: no questions
  if (!Array.isArray(normalized) || normalized.length === 0) {
    return (
      <div className="adventure-wrap">
        <header className="adventure-header">
          <div className="brand">
            <div className="brand-badge">🎓</div>
            <div className="brand-text">
              <div className="brand-title">LevelUp Scholar</div>
              <div className="brand-sub">Adventure Path</div>
            </div>
          </div>
        </header>
        <main style={{ padding: 40 }}>
          <p style={{ color: "var(--muted)" }}>No questions available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="adventure-wrap">
      {/* Header */}
      <header className="adventure-header">
        <div className="brand">
          <div className="brand-badge">🎓</div>
          <div className="brand-text">
            <div className="brand-title">LevelUp Scholar</div>
            <div className="brand-sub">Adventure Path</div>
          </div>
        </div>

        <div className="header-actions">
          <button className="back-btn" onClick={() => onBack && onBack()}>
            <FaChevronLeft /> Back
          </button>
        </div>
      </header>

      {/* Main map area */}
      <main className="adventure-main">
        {/* Map stage */}
        <div className="map-stage">
          <svg
            className="map-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={svgPath} className="map-path-bg" />
            <path d={svgPath} className="map-path" />
          </svg>

          {/* Level nodes */}
          {positions.map((pos, i) => {
            const isCurrent = i === currentLevel;
            const isCompleted = completedLevels.includes(i);
            return (
              <div
                key={i}
                className={`map-node ${isCurrent ? "current" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
                style={{ left: pos.left, top: pos.top }}
                onClick={() => openLevel(i)}
              >
                <div className="node-icon">
                  {isCompleted ? "✅" : isCurrent ? "🔹" : i + 1}
                </div>
                <div className="node-label">Lv {i + 1}</div>
              </div>
            );
          })}
        </div>

        {/* Side panel */}
        <div className="adventure-side">
          <div className="progress-card">
            <h4>Adventure Progress</h4>
            <p>
              Level {currentLevel + 1} / {Math.max(1, normalized.length)}
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((completedLevels.length +
                      (completedLevels.includes(currentLevel) ? 1 : 0)) /
                      Math.max(1, normalized.length)) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="side-actions">
              <button
                className="hint-btn"
                onClick={() =>
                  alert("Hint: eliminate wrong choices — but no auto-reveals.")
                }
              >
                Hint
              </button>

              <button
                className="skip-btn"
                onClick={() => {
                  setCompletedLevels((prev) =>
                    prev.includes(currentLevel) ? prev : [...prev, currentLevel]
                  );
                  if (currentLevel < normalized.length - 1)
                    setCurrentLevel((c) => c + 1);
                }}
              >
                Skip
              </button>
            </div>
          </div>

          <div className="instructions-card">
            <h5>How to play</h5>
            <ol>
              <li>Click the glowing level (🔹) to answer its question.</li>
              <li>Answer correctly to unlock the next level.</li>
              <li>If wrong, the clicked answer will disappear for that level.</li>
            </ol>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedQuestion && (
        <div className="modal-overlay">
          <div
            className={`modal-card ${
              answerStatus === "wrong" && isAnimating ? "shake" : ""
            }`}
          >
            <div className="modal-head">
              <h3>Question {currentLevel + 1}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  if (!isAnimating) {
                    setShowModal(false);
                    setSelectedQuestion(null);
                    setRemovedIndices([]);
                    setWrongPickedIndex(null);
                    setCorrectPickedIndex(null);
                    setAnswerStatus("");
                  }
                }}
              >
                ✕
              </button>
            </div>

            <p className="modal-question">{selectedQuestion.question}</p>

            <div className="modal-choices">
              {selectedQuestion.choices.map((c, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isRemoved = removedIndices.includes(idx);
                const showCorrect =
                  answerStatus === "correct" && correctPickedIndex === idx;
                const showWrong = wrongPickedIndex === idx && answerStatus === "wrong";

                // ClassName logic:
                // - removed => visually faded & disabled (CSS: .removed)
                // - showWrong => only the clicked wrong shows red/shake (CSS: .wrong)
                // - showCorrect => only clicked correct shows green (CSS: .correct)
                const btnClass = [
                  "choice-btn",
                  isRemoved ? "removed" : "",
                  showWrong ? "wrong" : "",
                  showCorrect ? "correct" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    disabled={isRemoved || isAnimating}
                    onClick={() => {
                      if (isRemoved || isAnimating) return;

                      // Use numeric index check
                      checkAnswerByIndex(idx);
                    }}
                  >
                    <div className="choice-left">{letter}</div>
                    <div className="choice-text">
                      {isRemoved ? "❌ Removed" : c}
                    </div>
                  </button>
                );
              })}
            </div>

            {answerStatus === "correct" && (
              <div className="modal-result correct">Correct! 🎉</div>
            )}
            {answerStatus === "wrong" && (
              <div className="modal-result wrong">Wrong — try again ❌</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
