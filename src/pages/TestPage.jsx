import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const mainBgVideo = new URL('../../videos/main-bg.mp4', import.meta.url).href;
const wheelImage = new URL('../../img/Lucky Wheel_Simplified_v2.png', import.meta.url).href;
const wheelLoopVideo = new URL('../../videos/wheel-loop.webm', import.meta.url).href;
const wheelBgVideo = new URL('../../videos/wheel-bg.mp4', import.meta.url).href;
const bonusBgVideo = new URL('../../videos/wheel-particle.webm', import.meta.url).href;
const bonusAssignVideo = new URL('../../videos/seven-effect.webm', import.meta.url).href;

export default function TestPage() {
  const containerRef = useRef(null);
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const bonusVideoRef = useRef(null);
  const bonusAssignRefs = useRef([]);

  const [speedInput, setSpeedInput] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [modeText, setModeText] = useState('Mode：Unnested');
  const [isNested, setIsNested] = useState(false);
  const [bonusButtonText, setBonusButtonText] = useState('BONUS');
  const [bonusButtonBg, setBonusButtonBg] = useState('#28a745');
  const [bonusActive, setBonusActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [sliderRed, setSliderRed] = useState(false);

  const velocityRef = useRef(0);
  const angleRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const bonusTimerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !outerRef.current || !innerRef.current) return;

    if (isNested) {
      outerRef.current.appendChild(innerRef.current);
    } else {
      containerRef.current.appendChild(innerRef.current);
    }
  }, [isNested]);

  useEffect(() => {
    let frameId = 0;
    const friction = 0.993;

    const tick = (now) => {
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (Math.abs(velocityRef.current) > 0.01) {
        angleRef.current += velocityRef.current * deltaTime;
        if (outerRef.current) outerRef.current.style.transform = `rotate(${angleRef.current}deg)`;
        if (innerRef.current) innerRef.current.style.transform = `rotate(${-angleRef.current}deg)`;
        velocityRef.current *= Math.pow(friction, deltaTime * 60);

        setCurrentSpeed(Math.round(velocityRef.current));
        setSpeedInput(Math.round(velocityRef.current));
        setSliderValue(velocityRef.current);
        setSliderRed(velocityRef.current > 0);
      } else if (velocityRef.current !== 0) {
        velocityRef.current = 0;
        setCurrentSpeed(0);
        setSpeedInput(0);
        setSliderValue(0);
        setSliderRed(false);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let fpsFrameId = 0;

    const tickFps = (now) => {
      frameCount += 1;
      if (now - lastFpsTime >= 500) {
        const computedFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        setFps(computedFps);
        frameCount = 0;
        lastFpsTime = now;
      }
      fpsFrameId = requestAnimationFrame(tickFps);
    };

    fpsFrameId = requestAnimationFrame(tickFps);
    return () => cancelAnimationFrame(fpsFrameId);
  }, []);

  const handleSpeedInputChange = (event) => {
    const value = Number(event.target.value) || 0;
    velocityRef.current = value;
    setSpeedInput(value);
    setSliderValue(value);
    setCurrentSpeed(Math.round(value));
    setSliderRed(value > 0);
  };

  const handleSliderChange = (event) => {
    const value = Number(event.target.value) || 0;
    velocityRef.current = value;
    setSliderValue(value);
    setSpeedInput(Math.round(value));
    setCurrentSpeed(Math.round(value));
    setSliderRed(value > 0);
  };

  const handleStart = () => {
    velocityRef.current = Number(speedInput) || 0;
    setSliderValue(velocityRef.current);
    setCurrentSpeed(Math.round(velocityRef.current));
    setSliderRed(velocityRef.current > 0);
  };

  const handleStop = () => {
    velocityRef.current = 0;
    setSliderValue(0);
    setSpeedInput(0);
    setCurrentSpeed(0);
    setSliderRed(false);
  };

  const handleReset = () => {
    velocityRef.current = 0;
    angleRef.current = 0;
    if (outerRef.current) outerRef.current.style.transform = 'rotate(0deg)';
    if (innerRef.current) innerRef.current.style.transform = 'rotate(0deg)';
    setSliderValue(0);
    setSpeedInput(0);
    setCurrentSpeed(0);
    setSliderRed(false);
  };

  const toggleMode = () => {
    const nextState = !isNested;
    setIsNested(nextState);
    setModeText(nextState ? 'Mode：巢狀 (Nested)' : 'Mode：Unnested');
  };

  const closeBonus = () => {
    if (bonusTimerRef.current) {
      clearTimeout(bonusTimerRef.current);
    }

    setBonusActive(false);
    setBonusButtonText('BONUS');
    setBonusButtonBg('#28a745');

    if (bonusVideoRef.current) {
      bonusVideoRef.current.pause();
      bonusVideoRef.current.currentTime = 0;
    }

    bonusAssignRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  const toggleBonus = () => {
    if (bonusActive) {
      closeBonus();
      return;
    }

    setBonusActive(true);
    setBonusButtonText('RUNNING...');
    setBonusButtonBg('#ff4444');

    if (bonusVideoRef.current) {
      bonusVideoRef.current.play().catch(() => {});
    }

    bonusAssignRefs.current.forEach((video) => {
      if (video) {
        video.play().catch(() => {});
      }
    });

    bonusTimerRef.current = setTimeout(() => {
      closeBonus();
    }, 5000);
  };

  return (
    <div className="test-page-shell">
      <Link className="back-link" to="/grid-anchor">
        ← 進入 Grid Anchor
      </Link>

    {/*
    <video className="main-bg-video" autoPlay muted loop playsInline>
        <source src={mainBgVideo} type="video/mp4" />
      </video>
      */}

      <div className="ui-overlay">
        <div className="control-row">
          speed (°/s):
          <input type="number" id="speedInput" value={speedInput} onChange={handleSpeedInputChange} />
          <button id="startBtn" onClick={handleStart}>SET</button>
          <button id="stopBtn" className="btn-stop" onClick={handleStop}>STOP</button>
          <button id="resetBtn" className="btn-reset" onClick={handleReset}>RESET</button>
        </div>

        <div className="control-row">
          <input
            type="range"
            id="speedSlider"
            min="-2000"
            max="2000"
            value={sliderValue}
            onChange={handleSliderChange}
            className={sliderRed ? 'slider-red' : ''}
            style={{ width: '100%' }}
          />
        </div>

        <div className="control-row">
          Attach Style:
          <button id="nestBtn" className="btn-mode" onClick={toggleMode}>
            {isNested ? 'Switch to「Unnested」' : 'Switch to nested'}
          </button>
        </div>

        <div className="control-row">
          <div className="status-info">
            Speed: <span id="currentSpeed">{currentSpeed}</span> °/s <br />
            <small id="modeText">{modeText}</small>
            <div id="fpsDiv">FPS: {fps}</div>
          </div>
          <div className="status-info">
            <button id="bonusTrigger" style={{ background: bonusButtonBg }} onClick={toggleBonus}>
              {bonusButtonText}
            </button>
          </div>
        </div>
      </div>

      <div id="canvas-container" ref={containerRef}>
        <div id="outer-wheel" ref={outerRef} style={{ backgroundImage: `url(${wheelImage})` }}>
          <div id="outer-wheel-UI" style={{ backgroundImage: `url(${wheelImage})` }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <video
                key={index}
                className={`bonus-assign v-${index === 0 ? '12' : index === 1 ? '3' : index === 2 ? '5' : '8'}${bonusActive ? ' active' : ''}`}
                muted
                playsInline
                loop
                src={bonusAssignVideo}
                style={{ display: bonusActive ? 'block' : 'none' }}
                ref={(element) => {
                  bonusAssignRefs.current[index] = element;
                }}
              />
            ))}
          </div>
        </div>

        <div id="inner-panel" ref={innerRef}>
          <div className="inner-content">
            <div className="text" data-text="1000x">1000x</div>
            <div className="mode-indicator">bonus assigned</div>
          </div>

          <video className="inner-video" autoPlay muted loop playsInline style={{ width: '400px', height: '400px', position: 'absolute', left: '100px', top: '100px', zIndex: 1005 }}>
            <source src={wheelLoopVideo} type="video/webm" />
          </video>

          <video id="bonus-bg" ref={bonusVideoRef} muted loop playsInline style={{ display: bonusActive ? 'block' : 'none', opacity: bonusActive ? '1' : '0', transform: bonusActive ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)' }}>
            <source src={bonusBgVideo} type="video/webm" />
          </video>

          <video className="inner-video" autoPlay muted loop playsInline style={{ width: '600px', height: '600px', position: 'absolute', left: '0px', top: '0px', zIndex: 991 }}>
            <source src={wheelBgVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
