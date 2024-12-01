
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 500;

const bg = new Image();
bg.src = 'bg.png';

const playerImage = new Image();
playerImage.src = 'dog.jpg';

const enemyImage = new Image();
enemyImage.src = 'enemy.png';

const startScreenImage = new Image();
startScreenImage.src = 'startscreen.png'; // Replace with your image file path
let speed = 5; // Initial speed of the game


const bgWidth = 736; // Actual width of the background image
let x = 0; // Position of the first background
let x2 = bgWidth; // Position of the second background

const spriteWidth = 575;
const spriteHeight = 523;

let frameX = 0;
let frameY = 3;

let gameFrame = 0;
const staggerFrames = 5;

let dogY = 300; // Initial y-position of the dog
let dogX = 600;
let dogX2 = 1200;
let velocityY = 0; // Vertical velocity
const gravity = 0.5; // Simulated gravity
let isJumping = false; // Prevent repeated jumps

let gameOver = false;
let score = 0;

const startButton = document.getElementById('start-button'); // Get the start button element
let gameStarted = false; // Flag to check if the game has started

// Function to start the game
function startGame() {
  gameStarted = true;
  startButton.style.display = 'none'; // Hide the start button
  bgsound.loop = true; // Loop background sound
  bgsound.play(); // Play background music
  animate(); // Start the game animation
}

startButton.addEventListener('click', startGame);






const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');

let touchStartY = 0; // Starting Y position of the touch
let touchEndY = 0; // Ending Y position of the touch

// Event listener for touch start
canvas.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY; // Record the Y position where the touch started
});

// Event listener for touch end
canvas.addEventListener('touchend', (e) => {
  touchEndY = e.changedTouches[0].clientY; // Record the Y position where the touch ended

  // Check if the swipe was an upward swipe
  if (touchStartY - touchEndY > 50 && !isJumping) { // Threshold to detect a swipe
    jumpSound.play(); // Play jump sound
    velocityY = -12; // Initial upward velocity for the jump
    isJumping = true;
    frameY = 1;
  }
});
// **Add background music and jump sound**
const jumpSound = new Audio('jump.mp3'); // Replace with your jump sound file
const bgsound = new Audio('bgmusic.mp3');

function restartGame() {
  // Reset game variables to initial states
  gameOver = false;
  dogX = 600;
  dogX2 = 1200;
  dogY = 300;
  velocityY = 0;
  isJumping = false;
  score = 0;
  x = 0;
  x2 = bgWidth;
  gameFrame = 0;
  speed = 5;

  // Update score display
  updateScore();

  // Restart the animation loop
  animate();
}
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Event listener for keydown
function keydownHandler(event) {
  if (event.code === 'ArrowUp' && !isJumping) {
    jumpSound.play(); // Play jump sound
    velocityY = -12; // Initial upward velocity for the jump
    isJumping = true;
    frameY = 1;
  }
}

window.addEventListener("keydown", keydownHandler);

// Function to detect collision
function isColliding(playerX, playerY, playerWidth, playerHeight, enemyX, enemyY, enemyWidth, enemyHeight) {
  return (
    playerX + 50 < enemyX + enemyWidth &&
    playerX + playerWidth > enemyX + 50 &&
    playerY < enemyY + enemyHeight &&
    playerY + playerHeight > enemyY
  );
}

function animate() {
  if (gameOver) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over!', CANVAS_WIDTH / 2 , CANVAS_HEIGHT / 2);
    restartButton.addEventListener('click', restartGame);

    return;
  }
  
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw the background images
  ctx.drawImage(bg, x, 0, bgWidth, CANVAS_HEIGHT);
  ctx.drawImage(bg, x2, 0, bgWidth, CANVAS_HEIGHT);

  // Move the background positions to create a scrolling effect
  x -= speed;
  x2 -= speed;

  // Reset background positions for seamless looping
  if (x <= -bgWidth) x = x2 + bgWidth;
  if (x2 <= -bgWidth) x2 = x + bgWidth;

  // Handle dog jumping physics
  dogY += velocityY; // Update the dog's vertical position
  velocityY += gravity; // Apply gravity

  // Prevent the dog from falling below the ground
  if (dogY >= 300) {
    dogY = 300;
    velocityY = 0;
    isJumping = false;
    frameY = 3;
  }

  // Animate the dog sprite
  const position = Math.floor(gameFrame / staggerFrames) % 6;
  frameX = position * spriteWidth;

  // Draw the dog
  const playerWidth = 150;
  const playerHeight = 200;
  const playerX = 20;
  const playerY = dogY - 100;
  ctx.drawImage(playerImage, frameX, frameY * spriteHeight, spriteWidth, spriteHeight, playerX, playerY, playerWidth, playerHeight);

  // Draw the enemies
  const enemyWidth = 70;
  const enemyHeight = 60;
  const enemyY = 330;

  ctx.drawImage(enemyImage, dogX, enemyY, enemyWidth, enemyHeight);
  ctx.drawImage(enemyImage, dogX2, enemyY, enemyWidth, enemyHeight);

  // Move the enemies
  dogX -= speed;
  dogX2 -= speed;
 

  // Reset enemy positions for seamless looping
  if (dogX < -CANVAS_WIDTH) {
    dogX = 600;
    score++;
    updateScore();
    increaseSpeed(); // Increase the speed when score increases

  }
  if (dogX2 < -CANVAS_WIDTH) {
    dogX2 = 600;
    score++;
    updateScore();
    increaseSpeed(); // Increase the speed when score increases

  }
  // Check for collisions
  if (
    (isColliding(playerX, playerY, playerWidth, playerHeight, dogX, enemyY, enemyWidth, enemyHeight) ||
    isColliding(playerX, playerY, playerWidth, playerHeight, dogX2, enemyY, enemyWidth, enemyHeight)) &&
    !isJumping // Only end the game if the player is not jumping
  ) {
    gameOver = true; // Stop the game if a collision is detected and the player is not jumping
  }

  gameFrame++;

  requestAnimationFrame(animate);
}
function increaseSpeed() {
  if (score % 3 === 0) { // Increase speed every 5 points
    speed += 0.5; // Increment speed gradually
  }
}
// Wait for the start screen image to load before drawing
startScreenImage.onload = function() {
  // Draw the start screen image on the canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear any previous content
  ctx.drawImage(startScreenImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Draw the image

  // Draw the "Press Start to Begin!" text over the image
  ctx.fillStyle = 'white'; // Make the text stand out
  ctx.font = '20px Arial';
  ctx.textAlign = 'center'; // Center the text horizontally
  ctx.fillText('Press Start to Begin!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 200);
};
