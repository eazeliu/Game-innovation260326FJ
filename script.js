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

    /* 修改說明：初始化時強制重寫屬性，確保 HTML 原始設定失效 */
    sSlider.setAttribute('min', '-720');
    sSlider.setAttribute('max', '720');
    sInput.setAttribute('min', '-720');
    sInput.setAttribute('max', '720');
    
    function limitAndSync(val) {
        let v = parseFloat(val) || 0;
        
        /* 修改說明：除錯監控 */
        /* 如果數值異常（例如超過 720），在 Console 印出追蹤路徑 */
        if (Math.abs(v) > 720) {
            console.warn("偵測到異常數值輸入:", v);
            console.trace(); // 這會告訴你是誰傳了這個數字進來
        }

        if (v > 720) v = 720;
        if (v < -720) v = -720;
        
        velocity = v;
        sInput.value = Math.round(v);
        sSlider.value = v;
    }

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
        velocity = 0;
        sSlider.value = 0;
        sInput.value = 0;
        sDisplay.innerText = 0;
        sSlider.classList.remove('slider-red');
    };

    resetBtn.onclick = () => {
        velocity = 0;          
        currentAngle = 0;   
        outer.style.transform = `rotate(0deg)`;
        inner.style.transform = `rotate(0deg)`;
        sSlider.value = 0;
        sInput.value = 0;
        sDisplay.innerText = 0;
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
    });

    // 5. Animation Looping
    function update(now) {
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        /* 修改說明：屬性防禦邏輯 */
        /* 如果 min/max 被任何外部力量改掉，每幀都強行修正回來 */
        if (sSlider.max !== "720") sSlider.max = "720";
        if (sSlider.min !== "-720") sSlider.min = "-720";

        if (Math.abs(velocity) > 0.01) {
            currentAngle += velocity * deltaTime;
            
            /* 修改說明：防止角度溢出 */
            /* 雖然這不直接導致 2000，但角度過大會造成 transform 渲染壓力 */
            currentAngle %= 360; 

            outer.style.transform = `rotate(${currentAngle}deg)`;
            
            if (isNested) {
                inner.style.transform = `rotate(0deg)`;
            } else {
                inner.style.transform = `rotate(${-currentAngle}deg)`;
            }
            
            velocity *= Math.pow(friction, deltaTime * 60);
            
            sDisplay.innerText = Math.round(Math.abs(velocity));

            if (document.activeElement !== sSlider && document.activeElement !== sInput) {
                sInput.value = Math.round(velocity);
                sSlider.value = velocity;
            }
        } else if (velocity !== 0) {
            velocity = 0;
            sDisplay.innerText = 0;
            /* 修改說明：歸零時同步確保 UI 數值正確 */
            sInput.value = 0;
            sSlider.value = 0;
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
