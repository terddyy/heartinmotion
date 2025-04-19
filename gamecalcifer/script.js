const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");
const gameOverScreen = document.getElementById("game-over");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const scoreboard = document.getElementById("scoreboard");
const tryAgainButton = document.getElementById("try-again");
const exitFullscreenBtn = document.getElementById("exit-fullscreen");
let score = 0;
let spawnInterval = 500; // Start with 0.5 seconds
let calciferSpeed = 1000; // Start with 1 second to catch
let gameInterval;

// Add image preload check at the start of the script
window.addEventListener('load', function() {
    const testImage = new Image();
    testImage.onerror = function() {
        console.error('Failed to load Calcifer image');
        alert('Failed to load Calcifer image. Please check if calcifer.png exists in the correct location.');
    };
    testImage.src = '/gamecalcifer/calcifer.png';
});

function resetGame() {
  score = 0;
  scoreDisplay.textContent = score;
  spawnInterval = 500;
  calciferSpeed = 1000;
  gameArea.innerHTML = '';
  gameOverScreen.classList.add("hidden");
}

function endGame() {
  clearInterval(gameInterval);
  finalScoreDisplay.textContent = score;
  gameOverScreen.classList.remove("hidden");
  gameArea.classList.add("hidden");
  scoreboard.classList.add("hidden");
}

function spawnCalcifer() {
  const calcifer = document.createElement("div");
  calcifer.classList.add("calcifer");
  
  // Random position
  const maxX = gameArea.clientWidth - 120;
  const maxY = gameArea.clientHeight - 120;
  calcifer.style.left = Math.random() * maxX + "px";
  calcifer.style.top = Math.random() * maxY + "px";
  
  gameArea.appendChild(calcifer);
  
  // Remove after animation
  setTimeout(() => {
    if (calcifer.parentElement) {
      calcifer.classList.add("missed");
      setTimeout(() => calcifer.remove(), 300);
    }
  }, calciferSpeed);
  
  calcifer.addEventListener("click", () => {
    score++;
    scoreDisplay.textContent = score;
    calcifer.classList.add("caught");
    setTimeout(() => calcifer.remove(), 300);
    
    // Increase difficulty
    if (score % 5 === 0 && calciferSpeed > 400) {
      calciferSpeed -= 50;
      spawnInterval = Math.max(200, spawnInterval - 25);
    }
  });
}

function startGame() {
  resetGame();
  startScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");
  scoreboard.classList.remove("hidden");
  gameInterval = setInterval(spawnCalcifer, spawnInterval);
  setTimeout(endGame, 30000); // Game lasts 30 seconds
}

// Add start button functionality
startButton.addEventListener("click", startGame);

// Add try again button functionality
tryAgainButton.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

// Handle fullscreen functionality
exitFullscreenBtn.addEventListener('click', () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
  if (document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement) {
    exitFullscreenBtn.style.display = 'block';
  } else {
    exitFullscreenBtn.style.display = 'none';
  }
}
