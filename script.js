document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素引用
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

    // Variant
    let currentAngle = 0;
    let velocity = 0;
    let isNested = false;
    let lastTime = performance.now();
    let bonusTimer = null;
    const friction = 0.998; 

    // 1.Control
    sSlider.addEventListener('input', (e) => {
        velocity = parseFloat(e.target.value);
        sInput.value = Math.round(velocity);
    });

    sInput.addEventListener('change', (e) => {
        let val = Math.min(Math.max(parseFloat(e.target.value) || 0, -720), 720);
        velocity = val;
        sInput.value = val;
        sSlider.value = val;
    });

    // 2. Button
    startBtn.onclick = () => {
        velocity = Math.min(Math.max(parseFloat(sInput.value) || 0, -720), 720);
        sSlider.value = velocity;
    };

    stopBtn.onclick = () => {
        velocity = 0;
        updateUISpeed(0);
    };

    resetBtn.onclick = () => {
        velocity = 0;
        currentAngle = 0;
        outer.style.transform = `rotate(0deg)`;
        inner.style.transform = `rotate(0deg)`;
        updateUISpeed(0);
    };

    nestBtn.addEventListener('click', () => {
        isNested = !isNested;
        if (isNested) {
            outer.appendChild(inner); 
            nestBtn.innerText = 'Switch to Unnested';
            modeText.innerText = 'Mode：Nested (巢狀)';
        } else {
            container.appendChild(inner); 
            nestBtn.innerText = 'Switch to Nested';
            modeText.innerText = 'Mode：Unnested (獨立)';
        }
    });

    // 3. Animation
    function update(now) {
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        if (Math.abs(velocity) > 0.01) {
            currentAngle += velocity * deltaTime;
            
            outer.style.transform = `rotate(${currentAngle}deg)`;
            
            if (!isNested) {
                inner.style.transform = `rotate(${-currentAngle}deg)`; 
            } else {
                inner.style.transform = `rotate(0deg)`;
            }

            velocity *= Math.pow(friction, deltaTime * 60);
            updateUISpeed(velocity);
        } else if (velocity !== 0) {
            velocity = 0;
            updateUISpeed(0);
        }

        if (velocity > 0) sSlider.classList.add('slider-red');
        else sSlider.classList.remove('slider-red');

        requestAnimationFrame(update);
    }

    function updateUISpeed(val) {
        const rounded = Math.round(val);
        sDisplay.innerText = Math.abs(rounded);
        if (document.activeElement !== sInput) sInput.value = rounded;
        if (document.activeElement !== sSlider) sSlider.value = val;
    }

    // 4. Bonus
    function closeBonus() {
        bonusVideo.classList.remove('active');
        bonusAssignVideos.forEach(v => v.classList.remove('active'));

        setTimeout(() => {
            bonusVideo.pause();
            bonusVideo.currentTime = 0;
            bonusAssignVideos.forEach(v => {
                v.pause();
                v.currentTime = 0;
            });
            bonusTrigger.innerText = "BONUS";
            bonusTrigger.style.background = "#ffbf3e";
        }, 1000);
    }

    bonusTrigger.onclick = () => {
        if (bonusVideo.classList.contains('active')) {
            clearTimeout(bonusTimer);
            closeBonus();
            return;
        }


        bonusVideo.classList.add('active');
        bonusVideo.play().catch(() => {});
        
        bonusAssignVideos.forEach(v => {
            v.classList.add('active');
            v.play().catch(() => {});
        });

        bonusTrigger.innerText = "RUNNING...";
        bonusTrigger.style.background = "#ff4444";

        bonusTimer = setTimeout(closeBonus, 5000);
    };

    // 5. FPS detect
    (function initFPS() {
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

    requestAnimationFrame(update);
});
