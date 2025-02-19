/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
ctx.font = "50px Impact";

let ravenTime = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];

class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.delete = false;
    this.image = new Image();
    this.image.src = "assets/raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.flapTime = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    this.color = `rgb(${[...this.randomColors]})`;
    this.hasTrail = Math.random() > 0.5;
  }

  update(deltaTime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = -this.directionY;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.delete = true;
    this.flapTime += deltaTime;
    if (this.flapTime > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame ++;
      this.flapTime = 0;
      if (this.hasTrail) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }

  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "assets/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "assets/boom.wav";
    this.frameTime = 0;
    this.frameInterval = 200;
    this.delete = false;
  }

  update(deltaTime) {
    if (this.frame === 0) this.sound.play();
    this.frameTime += deltaTime;
    if (this.frameTime > this.frameInterval) {
      this.frame++;
      this.frameTime = 0;
      if (this.frame > 5) this.delete = true;
    }
  }

  draw() {
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size / 4, this.size, this.size);
  }
}

let particles = [];
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 50 - 25;
    this.y = y + this.size / 3 + Math.random() * 50 - 25;
    this.radius = Math.random() * this.size / 10;
    this.maxRadius = Math.random() * 20 + 35;
    this.delete = false;
    this.speedX = Math.random() + 0.5;
    this.color = color;
  }

  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius - 5) this.delete = true;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 55, 80);
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.fillText("Your Score was: " + score, canvas.width / 2, canvas.height / 2 + 50);
  ctx.fillStyle = "white";
  ctx.fillText("GAME OVER", canvas.width / 2 + 5, canvas.height / 2 + 5);
  ctx.fillText("Your Score was: " + score, canvas.width / 2 + 5, canvas.height / 2 + 55);
}

window.addEventListener("click", (evt) => {
  const clickedPixelColor = collisionCtx.getImageData(evt.x, evt.y, 1, 1);
  const pixelColor = clickedPixelColor.data;
  ravens.forEach((obj) => {
    if (obj.randomColors[0] === pixelColor[0] &&
        obj.randomColors[1] === pixelColor[1] &&
        obj.randomColors[2] === pixelColor[2]) {
      // collision detected
      obj.delete = true;
      score++;
      explosions.push(new Explosion(obj.x, obj.y, obj.width));
      console.log(explosions)
    }
  })
});

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  ravenTime += deltaTime;
  if (ravenTime > ravenInterval) {
    ravens.push(new Raven());
    ravenTime = 0;
    ravens.sort((a, b) => {
      return a.width - b.width;
    })
  }
  drawScore();
  [...particles, ...ravens, ...explosions].forEach((obj) => obj.update(deltaTime));
  [...particles, ...ravens, ...explosions].forEach((obj) => obj.draw());
  ravens = ravens.filter((obj) => !obj.delete);
  explosions = explosions.filter((obj) => !obj.delete);
  particles = particles.filter((obj) => !obj.delete);
  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}
animate(0);