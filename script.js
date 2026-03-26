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

    const friction = 0.998; 



sSlider.addEventListener('input', (e) => {

    velocity = parseFloat(e.target.value); 

    sInput.value = Math.round(velocity); 

});



sInput.addEventListener('change', (e) => {

    let val = parseFloat(e.target.value) || 0;

    if (val > 720) val = 720;

    if (val < -720) val = -720;

    

    velocity = val;

    sInput.value = val;

    sSlider.value = val;

});



startBtn.onclick = () => {

    let val = parseFloat(sInput.value) || 0;

    velocity = Math.min(Math.max(val, -720), 720);

    sSlider.value = velocity;

    sInput.value = velocity;

};



stopBtn.onclick = () => {

    velocity = 0;

    sSlider.value = 0;

    sInput.value = 0;

    sDisplay.innerText = 0;

};



resetBtn.onclick = () => {

    velocity = 0;          

    currentAngle = 0;   

    outer.style.transform = `rotate(0deg)`;

    inner.style.transform = `rotate(0deg)`;

    sSlider.value = 0;

    sInput.value = 0;

};



function update() {

    if (Math.abs(velocity) > 0.1) {

        velocity *= friction;

    } else {

        velocity = 0;

    }



    currentAngle += velocity / 60;



    outer.style.transform = `rotate(${currentAngle}deg)`;

    if (isNested) {

        inner.style.transform = `rotate(${currentAngle}deg)`;

    }



    if (document.activeElement !== sSlider) {

        sSlider.value = velocity;

        sInput.value = Math.round(velocity);

    }

    

    sDisplay.innerText = Math.abs(Math.round(velocity));



    requestAnimationFrame(update);

}



requestAnimationFrame(update);



    



   //Button-Click Logic (也需要更新)

startBtn.onclick = () => {

    let val = parseFloat(sInput.value) || 0;

    velocity = Math.min(val, 720);

    sSlider.value = velocity;

    sInput.value = velocity;
