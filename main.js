
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 500;

const mainbox = document.getElementById('mainbox');
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

let i = 0;

const pauseButton = document.getElementById('pause-button');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeHelpButton = document.getElementById('close-help-button');


// Pause button functionality
pauseButton.addEventListener('click', () => {
  togglePause();
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause'; // Toggle button text
});

// Help button functionality
helpButton.addEventListener('click', () => {
  isPaused = true; // Pause the game when showing help
  pauseButton.textContent = 'Resume';
  helpModal.style.display = 'block'; // Show help modal
});

// Close help modal
closeHelpButton.addEventListener('click', () => {
  helpModal.style.display = 'none';
  isPaused = false;// Resume the game
  togglePause();
  animate(); // Continue game animation
});


const startButton = document.getElementById('start-button'); // Get the start button element
let gameStarted = false; // Flag to check if the game has started

const coinImage = new Image();
coinImage.src = 'coin.png'; // Replace with your coin image

let timer = 500; // Timer value (starts full)
let maxTimer = 500; // Maximum timer value
let timerDecrement = 0.5; // How fast the timer decreases

const foodImage = new Image();
foodImage.src = 'food.png'; // Replace with your food image file path
const foods = []; // Array to hold food items
const foodSpawnInterval = 9000; // Time interval in milliseconds to spawn new food
const foodWidth = 50; // Width of the food
const foodHeight = 40; // Height of the food

function spawnFood() {
  const food = {
    x: CANVAS_WIDTH + Math.random() * 300, // Random x-position beyond the canvas
    y: Math.random() * 300 + 100, // Random y-position within a range
    collected: false, // Flag to check if the food is collected
  };
  foods.push(food);

  // Remove food if it goes off-screen
  foods.forEach((item, index) => {
    if (item.x < -foodWidth) {
      foods.splice(index, 1);
    }
  });
}

// Call spawnFood() every few seconds
setInterval(spawnFood, foodSpawnInterval);

const eating = new Audio('eating.mp3');
eating.preload = 'auto'; // Preload the sound to ensure it's ready to play

function drawFood() {
  foods.forEach((food) => {
    if (!food.collected) {
      ctx.drawImage(foodImage, food.x, food.y, foodWidth, foodHeight);
      food.x -= speed; // Move food to the left with the game's speed

      // Check collision with the player
      if (
        isColliding(20, dogY - 100, 150, 200, food.x, food.y, foodWidth, foodHeight)
      ) {
        food.collected = true;// Mark as collected
        eating.play();
        timer = maxTimer; // Reset timer on food collection
        score += 10; // Increase score for collecting food
        updateScore(); // Update score display
      }
    }
  });
}


function drawTimer() {
  // Draw the background of the timer
  ctx.fillStyle = 'gray';
  ctx.fillRect(20, 5, 100, 20); // Position and size of the timer bar

  // Draw the current timer value
  const timerWidth = (timer / maxTimer) * 100; // Scale the width based on the timer value
  ctx.fillStyle = 'green';
  ctx.fillRect(20, 5, timerWidth, 20);
}



// Generate multiple coins dynamically
const numCoins = 10; // Number of coins
const coins = Array.from({ length: numCoins }, () => ({
  x: CANVAS_WIDTH + Math.random() * 5500, // Random starting X position
  y: Math.random() * 200 + 100, // Random Y position
  collected: false,
}));

// Ensure coins respawn after being collected
function resetCoin(coin) {
  coin.x = CANVAS_WIDTH + Math.random() * 500;
  coin.y = Math.random() * 200 + 100;
  coin.collected = false;
}

function drawCoins() {
  coins.forEach((coin) => {
    if (!coin.collected) {
      ctx.drawImage(coinImage, coin.x, coin.y, 40, 40);
      coin.x -= speed; // Move coins left

      // Reset coin position if it goes off-screen
      if (coin.x < -40) {
        resetCoin(coin);
      }
    }
  });
}

const particles = [];

// Create particles
function createParticle(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      size: Math.random() * 5 + 2,
      lifetime: 50,
      xVelocity: (Math.random() - 0.5) * 2,
      yVelocity: (Math.random() - 0.5) * 2,
    });
  }
}

// Draw particles
function drawParticles() {
  particles.forEach((particle, index) => {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    particle.x += particle.xVelocity;
    particle.y += particle.yVelocity;
    particle.size *= 0.95; // Shrink particle
    particle.lifetime--;

    if (particle.lifetime <= 0) {
      particles.splice(index, 1); // Remove expired particles
    }
  });
}


let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Save high score
function saveHighScore() {
  highScores.push(score);
  highScores.sort((a, b) => b - a); // Sort scores in descending order
  highScores = highScores.slice(0, 5); // Keep top 5 scores
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

// Display high scores
function displayHighScores() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('High Scores:', CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2 + 50);

  highScores.forEach((highScore, index) => {
    ctx.fillText(`${index + 1}. ${highScore}`, CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2 + 80 + index * 20);
  });
}

function gameOverScreen() {
  pauseButton.style.display = 'none';
  helpButton.style.display = 'none';
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'red';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center'; // Center-align text
  ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 120);

  saveHighScore(); // Save current score before displaying
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('High Scores:', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

  // Display high scores
  highScores.forEach((highScore, index) => {
    ctx.fillText(`${index + 1}. ${highScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10 + index * 20);
  });

  // Show restart instructions
  ctx.fillText('Press Restart to Play Again!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 150);
  restartButton.addEventListener('click', restartGame);

}

let isPaused = false;

// Toggle pause
function togglePause() {
  isPaused = !isPaused;

  if (!isPaused) {
    animate(); // Resume game
  }
}


const coinSound = new Audio('coin.mp3');
coinSound.preload = 'auto'; // Preload the sound to ensure it's ready to play

// Check coin collection
function checkCoinCollection() {
  coins.forEach((coin) => {
    if (
      isColliding(20, dogY - 100, 150, 200, coin.x, coin.y, 40, 40) &&
      !coin.collected
    ) {
      coin.collected = true;
      coinSound.play();
      score += 5; // Increase score
      updateScore();
      createParticle(coin.x, coin.y); // Trigger particle effect
      coinSound.currentTime = 0; // Reset the sound to the beginning before playing again


    }
  });
}

// Function to start the game
function startGame() {
  gameStarted = true;
  startButton.style.display = 'none'; // Hide the start button
  pauseButton.style.display = 'inline-block'; // Show the pause button
  helpButton.style.display = 'inline-block'; // Show the help button

  bgsound.loop = true; // Loop background sound
  bgsound.play(); // Play background music
  animate(); // Start the game animation
}

startButton.addEventListener('click', startGame);


const rotateMessage = document.querySelector('.rotate-message');

// Check and apply screen orientation on load
function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    // Portrait mode
    canvas.style.display = 'none';
    mainbox.style.display = 'none';
    rotateMessage.style.display = 'block';
    
  
  } else {
    // Landscape mode
    canvas.style.display = 'block';
    mainbox.style.display = 'block';

    rotateMessage.style.display = 'none';
  }
}

// Listen for orientation changes
window.addEventListener('resize', checkOrientation);

// Initial check
checkOrientation();


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

canvas.addEventListener('mousedown', () => {
  if (!isJumping) {
    jumpSound.play(); // Play jump sound
    velocityY = -12; // Initial upward velocity for the jump
    isJumping = true;
    frameY = 1; // Adjust animation frame
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

  helpButton.style.display = 'block';
  pauseButton.style.display = 'block';
  
  coins.forEach(resetCoin);

  // Update  display
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
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw the background images
  ctx.drawImage(bg, x, 0, bgWidth, CANVAS_HEIGHT);
  ctx.drawImage(bg, x2, 0, bgWidth, CANVAS_HEIGHT);

  // Move the background positions to create a scrolling effect
  x -= speed;
  x2 -= speed;

  // Reset background positions for seamless looping
  if (x <= -bgWidth) x = x2 + bgWidth - speed;
  if (x2 <= -bgWidth) x2 = x + bgWidth - speed;
  
  timer -= timerDecrement; // Decrease timer
  if (timer <= 0) {
    gameOver = true; // End the game if the timer runs out
  }
  drawTimer(); // Draw the timer slider


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

  ctx.drawImage(enemyImage, dogX + i, enemyY, enemyWidth, enemyHeight);
  ctx.drawImage(enemyImage, dogX2 + i, enemyY, enemyWidth, enemyHeight);

  // Move the enemies
  dogX -= speed;
  dogX2 -= speed;
  
 

  // Reset enemy positions for seamless looping
  if (dogX < -CANVAS_WIDTH) {
    dogX = CANVAS_WIDTH;
    score++;
    updateScore();
    increaseSpeed(); // Increase the speed when score increases

  }
  if (dogX2 < -CANVAS_WIDTH) {
    dogX2 = CANVAS_WIDTH;
    score++;
    updateScore();
    increaseSpeed(); // Increase the speed when score increases

  }
  
  if (gameOver) {
    gameOverScreen();
    return;
  }

  if (isPaused) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    return;
  }
  
  // Check for collisions
  if (
    (isColliding(playerX, playerY, playerWidth, playerHeight, dogX, enemyY, enemyWidth, enemyHeight) ||
    isColliding(playerX, playerY, playerWidth, playerHeight, dogX2, enemyY, enemyWidth, enemyHeight)) &&
    !isJumping // Only end the game if the player is not jumping
  ) {
    gameOver = true; // Stop the game if a collision is detected and the player is not jumping
  }
//  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw and update everything
//  drawBackground(); // Scrolling background
  drawCoins(); // Coins
  drawFood();
  drawParticles(); // Particle effects
  checkCoinCollection(); // Check coin collisions
//  drawPlayer(); // Player sprite
//  drawEnemies(); // Enemies
//  checkCollisions(); // Collision detection
//  updateScore(); // Update score display

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
  ctx.font = '40px Impact';
  ctx.textAlign = 'center'; // Center the text horizontally
  ctx.fillText('Press Start Game to Begin!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 200);
};
