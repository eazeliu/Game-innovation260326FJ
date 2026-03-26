document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const outer = document.getElementById('outer-wheel');
    const inner = document.getElementById('inner-panel');
    const nestBtn = document.getElementById('nestBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sInput = document.getElementById('speedInput');
    const sSlider = document.getElementById('speedSlider'); 
    const sDisplay = document.getElementById('currentSpeed');
    const modeText = document.getElementById('modeText');
    const bonusVideo = document.getElementById('bonus-bg');
    const bonusTrigger = document.getElementById('bonusTrigger');
    const bonusAssignVideos = document.querySelectorAll('.bonus-assign');

    let currentAngle = 0;
    let velocity = 0;
    let isNested = false;
    let lastTime = performance.now();
    let bonusTimer = null;
    const friction = 0.998;
    const MIN_SPEED = -720;
    const MAX_SPEED = 720;

    // 修改說明：初始化鎖定，防止 2000 出現
    sSlider.min = String(MIN_SPEED);
    sSlider.max = String(MAX_SPEED);
    sInput.min = String(MIN_SPEED);
    sInput.max = String(MAX_SPEED);

    function clampSpeed(val) {
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed)) return 0;
        return Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed));
    }

    function syncSpeedUI(val) {
        const rounded = Math.round(val);
        sInput.value = rounded;
        sSlider.value = val;
        sDisplay.innerText = Math.abs(rounded); // 顯示絕對值
    }

    function limitAndSync(val) {
        const nextVelocity = clampSpeed(val);
        velocity = nextVelocity;
        syncSpeedUI(nextVelocity);
    }

    syncSpeedUI(velocity);

    sSlider.addEventListener('input', (e) => {
        limitAndSync(e.target.value);
    });

    // 2. UI : Sync Speed from Input
    sInput.addEventListener('change', (e) => {
        limitAndSync(e.target.value);
    });

    // 3. Button-Click Logic
    startBtn.onclick = () => {
        limitAndSync(sInput.value);
    };
    
    stopBtn.onclick = () => {
        limitAndSync(0);
        sSlider.classList.remove('slider-red');
    };

    resetBtn.onclick = () => {
        currentAngle = 0;
        outer.style.transform = `rotate(0deg)`;
        inner.style.transform = `rotate(0deg)`;
        limitAndSync(0);
        sSlider.classList.remove('slider-red');
    };

    // 4. Switch Mode
    nestBtn.addEventListener('click', () => {
        isNested = !isNested;
        if (isNested) {
            outer.appendChild(inner);
            nestBtn.innerText = 'Switch to「Unnested」';
            modeText.innerText = 'Mode：巢狀 (Nested)';
        } else {
            container.appendChild(inner);
            nestBtn.innerText = 'Switch to 「Nested」';
            modeText.innerText = 'Mode：獨立 (Unnested)';
        }
        // 修改說明：切換模式時立即強制重繪一次轉向
        applyRotation();
    });

    // 修改說明：封裝旋轉套用邏輯
    function applyRotation() {
        outer.style.transform = `rotate(${currentAngle}deg)`;
        if (isNested) {
            inner.style.transform = `rotate(0deg)`;
        } else {
            inner.style.transform = `rotate(${-currentAngle}deg)`;
        }
    }

    // 5. Animation Looping
    function update(now) {
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        // 修改說明：強制校正 Inspector 可能出現的 2000 異常
        if (sSlider.max !== "720") sSlider.max = "720";
        if (sSlider.min !== "-720") sSlider.min = "-720";

        if (Math.abs(velocity) > 0.01) {
            currentAngle += velocity * deltaTime;
            currentAngle %= 360; 
            
            applyRotation();
            
            velocity *= Math.pow(friction, deltaTime * 60);
            sDisplay.innerText = Math.round(Math.abs(velocity));

            if (document.activeElement !== sSlider && document.activeElement !== sInput) {
                sInput.value = Math.round(velocity);
                sSlider.value = velocity;
            }
        } else if (velocity !== 0) {
            velocity = 0;
            sDisplay.innerText = 0;
            sInput.value = 0;
            sSlider.value = 0;
            applyRotation(); // 停止時確保最後位置精確
        }

        if (velocity > 0) {
            sSlider.classList.add('slider-red');
        } else {
            sSlider.classList.remove('slider-red');
        }

        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    // 6. Bonus 
    function closeBonus() {
        bonusVideo.style.opacity = "0";
        bonusVideo.style.transform = "translate(-50%, -50%) scale(0)";
        bonusVideo.classList.remove('active');

        bonusAssignVideos.forEach(v => {
            v.classList.remove('active'); 
        });

        setTimeout(() => {
            bonusVideo.style.display = 'none';
            bonusVideo.pause();
            bonusVideo.currentTime = 0;
            bonusAssignVideos.forEach(v => {
                v.style.display = 'none';
                v.pause();
                v.currentTime = 0;
            });
            bonusTrigger.innerText = "BONUS";
            bonusTrigger.style.background = "#28a745";
        }, 1000); 
    }

    // 7. Bonus-trigger
    bonusTrigger.onclick = () => {
        if (bonusVideo.classList.contains('active')) {
            if (bonusTimer) clearTimeout(bonusTimer);
            closeBonus();
            return;
        }

        bonusVideo.style.display = 'block';
        bonusVideo.play().catch(e => console.log("Autoplay blocked"));
        
        bonusAssignVideos.forEach(v => {
            v.style.display = 'block';
            v.play().catch(e => console.log("Assign video blocked"));
            setTimeout(() => v.classList.add('active'), 10);
        });

        setTimeout(() => {
            bonusVideo.classList.add('active');
            bonusVideo.style.opacity = "1";
            bonusVideo.style.transform = "translate(-50%, -50%) scale(1)";
        }, 10);

        bonusTrigger.innerText = "RUNNING...";
        bonusTrigger.style.background = "#ff4444";

        bonusTimer = setTimeout(() => {
            closeBonus();
        },6000);
    };

    // FPS Detector
    (function() {
        let fLastTime = performance.now();
        let frameCount = 0;
        const fpsDisplay = document.getElementById('fpsDiv');
        function tick(now) {
            frameCount++;
            if (now - fLastTime >= 500) {
                const fps = Math.round((frameCount * 1000) / (now - fLastTime));
                if (fpsDisplay) {
                    fpsDisplay.innerText = `FPS: ${fps}`;
                    fpsDisplay.style.color = fps < 40 ? '#ff4444' : '#00ff00';
                }
                frameCount = 0;
                fLastTime = now;
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    })();
});
