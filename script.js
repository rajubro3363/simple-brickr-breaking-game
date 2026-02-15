const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let lives = 3;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let gamePaused = true;
let gameOver = false;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

let particles = [];

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 8,
    dx: 3,
    dy: 0
};

// Paddle
let paddle = {
    width: 100,
    height: 14,
    x: canvas.width / 2 - 50
};

// Bricks
const rows = 4;
const cols = 7;
const brickWidth = 70;
const brickHeight = 20;
const padding = 10;
const offsetTop = 40;
const offsetLeft = 35;

let bricks = [];

function createBricks() {
    bricks = [];
    for (let c = 0; c < cols; c++) {
        bricks[c] = [];
        for (let r = 0; r < rows; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}
createBricks();

// Mouse control
document.addEventListener("mousemove", e => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    if (x > 0 && x < canvas.width) {
        paddle.x = x - paddle.width / 2;
    }
});
canvas.addEventListener("mousemove", function (e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Touch control (Mobile support)
// Mobile Touch Control
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);

function handleTouch(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    let x = touch.clientX - rect.left;

    paddle.x = x - paddle.width / 2;

    mouseX = x;
    mouseY = touch.clientY - rect.top;

    e.preventDefault();
}


// Space control
document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        if (gameOver) {
            resetGame();
        } else if (gamePaused) {
            gamePaused = false;
            ball.dy = -3;
        }
    }
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 40;
    ball.dx = 3;
    ball.dy = 0;
    gamePaused = true;
}

function resetGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    createBricks();
    resetBall();
}

// 🔥 Particle System
function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            life: 30,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawText(text) {
    ctx.fillStyle = "#00ffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff";
    ctx.fill();
}

function drawPaddle() {
    const x = paddle.x;
    const y = canvas.height - paddle.height - 5;
    const width = paddle.width;
    const height = paddle.height;
    const radius = 10;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

function drawBricks() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                let bx = c * (brickWidth + padding) + offsetLeft;
                let by = r * (brickHeight + padding) + offsetTop;
                b.x = bx;
                b.y = by;

                let color = `hsl(${r * 60}, 70%, 50%)`;
                ctx.fillStyle = color;
                ctx.fillRect(bx, by, brickWidth, brickHeight);
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            let b = bricks[c][r];
            if (
                b.status === 1 &&
                ball.x > b.x &&
                ball.x < b.x + brickWidth &&
                ball.y > b.y &&
                ball.y < b.y + brickHeight
            ) {
                ball.dy *= -1;
                b.status = 0;
                score++;
                scoreEl.textContent = score;

                createParticles(
                    b.x + brickWidth / 2,
                    b.y + brickHeight / 2,
                    `hsl(${r * 60}, 70%, 50%)`
                );

                if (score === rows * cols) {
                    gamePaused = true;
                    gameOver = true;
                }
            }
        }
    }
}

function updateCanvasLighting() {
    let pinkGlowX = (mouseX - canvas.width / 2) / 8;
    let pinkGlowY = (mouseY - canvas.height / 2) / 8;

    let paddleCenter = paddle.x + paddle.width / 2;
    let blueOffset = (paddleCenter - canvas.width / 2) / 6;

    canvas.style.boxShadow = `
        ${pinkGlowX}px ${pinkGlowY}px 60px rgba(255, 0, 150, 0.6),
        ${blueOffset}px 30px 80px rgba(0, 200, 255, 0.7)
    `;
}


function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    updateParticles();
    updateCanvasLighting();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (gamePaused) {
        drawText(gameOver ? "GAME OVER - Press SPACE" : "Press SPACE to Start");
        requestAnimationFrame(update);
        return;
    }

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx *= -1;
    }

    if (ball.y + ball.dy < ball.radius) {
        ball.dy *= -1;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy *= -1;
        } else {
            lives--;
            livesEl.textContent = lives;

            if (lives === 0) {
                gamePaused = true;
                gameOver = true;
            } else {
                resetBall();
            }
        }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(update);
}

update();


