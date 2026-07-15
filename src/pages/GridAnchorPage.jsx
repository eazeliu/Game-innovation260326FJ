import { useState } from 'react';
import { Link } from 'react-router-dom';

const cols = 39;
const rows = 24;

function clampValue(key, value) {
  const limits = {
    circleSize: 1800,
    xPosition: 1920,
    yPosition: 1200
  };

  return Math.max(0, Math.min(limits[key], value));
}

export default function GridAnchorPage() {
  const [circleSize, setCircleSize] = useState(1200);
  const [xPosition, setXPosition] = useState(600);
  const [yPosition, setYPosition] = useState(600);

  const updateValue = (key, nextValue) => {
    const value = clampValue(key, nextValue);
    if (key === 'circleSize') setCircleSize(value);
    if (key === 'xPosition') setXPosition(value);
    if (key === 'yPosition') setYPosition(value);
  };

  return (
    <div className="stage">
      <Link className="back-link" to="/">
        ← 回到首頁
      </Link>

      <div className="grid" role="grid" aria-label="Numbered grid">
        {Array.from({ length: rows * cols }).map((_, index) => {
          const x = index % cols;
          const y = Math.floor(index / cols);
          return (
            <div key={`${x}-${y}`} className="cell">
              {`${x},${y}`}
            </div>
          );
        })}
      </div>

      <div
        className="guide-circle"
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          left: `${xPosition}px`,
          top: `${yPosition}px`
        }}
      />

      <aside className="control-panel">
        <h2>Circle Controls</h2>

        <div className="control-group">
          <label className="control-label" htmlFor="circleSize">
            Circle size
          </label>
          <div className="control-row">
            <button className="control-btn" onClick={() => updateValue('circleSize', circleSize - 1)}>
              −
            </button>
            <input
              id="circleSize"
              className="control-input"
              type="number"
              min="0"
              step="1"
              value={circleSize}
              onChange={(event) => updateValue('circleSize', Number(event.target.value))}
            />
            <button className="control-btn" onClick={() => updateValue('circleSize', circleSize + 1)}>
              +
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label" htmlFor="xPosition">
            x position
          </label>
          <div className="control-row">
            <button className="control-btn" onClick={() => updateValue('xPosition', xPosition - 1)}>
              −
            </button>
            <input
              id="xPosition"
              className="control-input"
              type="number"
              min="0"
              step="1"
              value={xPosition}
              onChange={(event) => updateValue('xPosition', Number(event.target.value))}
            />
            <button className="control-btn" onClick={() => updateValue('xPosition', xPosition + 1)}>
              +
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label" htmlFor="yPosition">
            y position
          </label>
          <div className="control-row">
            <button className="control-btn" onClick={() => updateValue('yPosition', yPosition - 1)}>
              −
            </button>
            <input
              id="yPosition"
              className="control-input"
              type="number"
              min="0"
              step="1"
              value={yPosition}
              onChange={(event) => updateValue('yPosition', Number(event.target.value))}
            />
            <button className="control-btn" onClick={() => updateValue('yPosition', yPosition + 1)}>
              +
            </button>
          </div>
        </div>

        <p className="control-help">
          這個圓圈會跟隨這三個參數更新，並以白色 30% 透明效果顯示。
        </p>
      </aside>
    </div>
  );
}
