class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.animationId = null;
        this.isFullscreen = false;
        this.frameCount = 0;

        // Get DOM elements
        this.scoreDisplay = document.getElementById('scoreValue');
        
        // Set canvas size to match container size
        const container = document.getElementById('gameContainer');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // Add responsive text styling
        this.updateTextSizes();

        // Initialize game objects
        this.initializeGameObjects();

        // Initialize UI buttons
        this.buttons = {
            restart: {
                x: this.canvas.width - 110,
                y: this.canvas.height - 50,
                width: 40,
                height: 40,
                hovered: false
            },
            fullscreen: {
                x: this.canvas.width - 50,
                y: this.canvas.height - 50,
                width: 40,
                height: 40,
                hovered: false
            }
        };

        // Add resize handler
        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.updateTextSizes();
            this.resetCalciferPosition();
            // Update button positions
            this.buttons.restart.x = this.canvas.width - 110;
            this.buttons.restart.y = this.canvas.height - 50;
            this.buttons.fullscreen.x = this.canvas.width - 50;
            this.buttons.fullscreen.y = this.canvas.height - 50;
        });

        // Add mouse event listeners for buttons
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            for (const button of Object.values(this.buttons)) {
                button.hovered = mouseX >= button.x && mouseX <= button.x + button.width &&
                                mouseY >= button.y && mouseY <= button.y + button.height;
            }
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (this.isClickInButton(mouseX, mouseY, this.buttons.restart)) {
                this.restart();
            }
            if (this.isClickInButton(mouseX, mouseY, this.buttons.fullscreen)) {
                this.toggleFullscreen();
            }
        });

        // Load images
        this.backgroundImage = new Image();
        this.backgroundImage.src = './cozy hearth.jpg';
        this.backgroundImage.onerror = () => console.error('Failed to load background image');

        this.calciferImage = new Image();
        this.calciferImage.src = './calcifer.png';
        this.calciferImage.onerror = () => console.error('Failed to load Calcifer image');

        // Add cheat code tracking
        this.cheatKeys = {
            '1': false,
            '4': false
        };
        this.cheatActive = false;
        this.lastCheatToggle = 0;

        // Add pause state
        this.isPaused = false;

        // Add hotkey mapping for power-ups
        this.powerUpHotkeys = {
            'Delete': 'shield',
            'End': 'crystalMagnet',
            'PageDown': 'timeSlow'
        };

        // Event listeners
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && !this.gameStarted && !this.gameOver) {
                this.startGame();
            } else if (e.key === ' ' && this.gameOver) {
                this.restart();
            } else if (e.key === 'p' && this.gameStarted && !this.gameOver) {
                this.togglePause();
            }
            
            // Track cheat keys
            if (this.cheatKeys.hasOwnProperty(e.key)) {
                this.cheatKeys[e.key] = true;
                this.checkCheatActivation();
            }

            // Handle power-up hotkeys
            if (this.gameStarted && !this.gameOver && !this.isPaused) {
                if (this.powerUpHotkeys.hasOwnProperty(e.key)) {
                    this.spawnSpecificPowerUp(this.powerUpHotkeys[e.key]);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            // Track cheat keys release
            if (this.cheatKeys.hasOwnProperty(e.key)) {
                this.cheatKeys[e.key] = false;
            }
        });

        // Start animation loop
        this.animate();

        // Define text colors and styles
        this.textStyles = {
            title: {
                color: '#FFE4B5',
                glowColor: '#ff6b6b',
                font: `${Math.min(this.canvas.width / 30, this.canvas.height / 20)}px 'Segoe UI', serif`,
                shadowBlur: 15
            },
            message: {
                color: '#FFFFFF',
                glowColor: '#ff6b6b',
                font: `${Math.min(this.canvas.width / 40, this.canvas.height / 25)}px 'Segoe UI', serif`,
                shadowBlur: 10
            },
            info: {
                color: '#FFE4B5',
                glowColor: '#ff6b6b',
                font: `${Math.min(this.canvas.width / 45, this.canvas.height / 30)}px 'Segoe UI', serif`,
                shadowBlur: 5
            }
        };

        // Add watermark style
        this.watermarkStyle = {
            color: 'rgba(255, 228, 181, 0.3)', // Semi-transparent warm color
            font: `${Math.min(this.canvas.width / 50, this.canvas.height / 35)}px 'Segoe UI', serif`,
            shadowBlur: 3,
            glowColor: 'rgba(255, 107, 107, 0.2)'
        };

        // Power-up settings
        this.powerUps = {
            types: {
                speedBoost: {
                    color: '#FFD700',
                    symbol: '⚡',
                    duration: 3000,
                    active: false,
                    timer: null
                },
                shield: {
                    color: '#4169E1',
                    symbol: '🛡️',
                    duration: 3000,
                    active: false,
                    timer: null
                },
                crystalMagnet: {
                    color: '#DA70D6',
                    symbol: '🧲',
                    duration: 3000,
                    active: false,
                    timer: null,
                    range: 150
                },
                timeSlow: {
                    color: '#20B2AA',
                    symbol: '⌛',
                    duration: 3000,
                    active: false,
                    timer: null
                }
            },
            spawnRate: 900,
            lastSpawn: 0,
            active: [] // Array to store active power-ups
        };

        // Store original speeds
        this.originalSpeeds = {
            star: 2,
            crystal: 1.5
        };

        // Original movement speed
        this.originalSpeed = 4;

        // Track size increases for score milestones
        this.lastSizeMilestone = 0;
        // Initial size (8% of smaller canvas dimension)
        this.baseCalciferSize = Math.min(this.canvas.width, this.canvas.height) * 0.08;
        // Current size multiplier
        this.currentSizeMultiplier = 1;
        // Growth rate per milestone (80% increase)
        this.growthRate = 0.8;
    }

    initializeGameObjects() {
        // Initialize Calcifer in the center
        this.resetCalciferPosition();
        
        // Game settings - spawn rates
        this.starSpawnRate = 30;  // Spawn a star every 30 frames
        this.crystalSpawnRate = 50;  // Spawn a crystal every 50 frames
        
        // Initialize empty arrays for game objects
        this.stars = [];
        this.crystals = [];
        this.particles = [];
        
        // Reset frame counter
        this.frameCount = 0;

        // Track size increases for score milestones
        this.lastSizeMilestone = 0;
        // Initial size (8% of smaller canvas dimension)
        this.baseCalciferSize = Math.min(this.canvas.width, this.canvas.height) * 0.08;
        // Growth rate per milestone (80% increase)
        this.growthRate = 0.8;
        // Invincibility state
        this.isInvincible = false;
        this.invincibilityFrames = 0;
        this.invincibilityDuration = 120; // 120 frames = 2 seconds at 60fps
    }

    resetCalciferPosition() {
        // Calculate base size if not already set
        if (!this.baseCalciferSize) {
            this.baseCalciferSize = Math.min(this.canvas.width, this.canvas.height) * 0.08;
        }
        
        // Use current size multiplier if it exists, otherwise use base size
        const size = this.baseCalciferSize * (this.currentSizeMultiplier || 1);
        
        // Position Calcifer in the center
        const x = (this.canvas.width - size) / 2;
        const y = (this.canvas.height - size) / 2;
        
        this.calcifer = {
            x: x,
            y: y,
            size: size,
            speed: this.originalSpeed,
            color: '#ff6b6b'
        };
    }

    updateCalciferSize(currentMilestone) {
        // Calculate size multiplier (80% increase per milestone)
        this.currentSizeMultiplier = 1 + (this.growthRate * currentMilestone);
        const newSize = this.baseCalciferSize * this.currentSizeMultiplier;
        
        // Update Calcifer's size
        this.calcifer.size = newSize;
        
        // Center Calcifer after size increase
        this.calcifer.x = (this.canvas.width - this.calcifer.size) / 2;
        this.calcifer.y = (this.canvas.height - this.calcifer.size) / 2;
        
        // Activate invincibility
        this.isInvincible = true;
        this.invincibilityFrames = this.invincibilityDuration;
        
        // Show size increase message
        this.sizeIncreaseMessage = {
            text: `Calcifer grew ${Math.round(this.currentSizeMultiplier * 100)}% of original size!`,
            timer: 60
        };

        // Store the milestone
        this.lastSizeMilestone = currentMilestone;
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.scoreDisplay.textContent = '0';
        
        // Reset size tracking
        this.lastSizeMilestone = 0;
        this.currentSizeMultiplier = 1;
        
        // Reset game objects
        this.resetCalciferPosition();
        this.stars = [];
        this.crystals = [];
        this.particles = [];
        this.frameCount = 0;

        // Reset power-ups
        this.powerUps.lastSpawn = 0;
        this.powerUps.active = [];
        Object.values(this.powerUps.types).forEach(powerUp => {
            powerUp.active = false;
            if (powerUp.timer) clearTimeout(powerUp.timer);
        });
        
        // Reset cheat state
        this.cheatActive = false;
        Object.keys(this.cheatKeys).forEach(key => {
            this.cheatKeys[key] = false;
        });
    }

    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        this.scoreDisplay.textContent = this.score;
        
        // Clear all power-ups
        this.powerUps.active = [];
        Object.values(this.powerUps.types).forEach(powerUp => {
            powerUp.active = false;
            if (powerUp.timer) clearTimeout(powerUp.timer);
        });
        
        // Deactivate cheat if active
        if (this.cheatActive) {
            this.deactivateCheat();
        }
        
        this.stars = [];
        this.crystals = [];
        this.particles = [];
    }

    restart() {
        this.gameOver = false;
        this.startGame();
    }

    update() {
        if (!this.gameStarted || this.gameOver || this.isPaused) return;

        // Update invincibility
        if (this.isInvincible) {
            this.invincibilityFrames--;
            if (this.invincibilityFrames <= 0) {
                this.isInvincible = false;
            }
        }

        // Crystal magnet effect - with range limit when not in cheat mode
        if (this.cheatActive || this.powerUps.types.crystalMagnet.active) {
            this.crystals.forEach(crystal => {
                const dx = this.calcifer.x + this.calcifer.size/2 - (crystal.x + crystal.size/2);
                const dy = this.calcifer.y + this.calcifer.size/2 - (crystal.y + crystal.size/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only apply magnet if in cheat mode or within range
                if (this.cheatActive || distance <= this.powerUps.types.crystalMagnet.range) {
                    const angle = Math.atan2(dy, dx);
                    const magnetSpeed = this.cheatActive ? 8 : 5;
                    crystal.x += Math.cos(angle) * magnetSpeed;
                    crystal.y += Math.sin(angle) * magnetSpeed;
                }
            });
        }

        // Update Calcifer position based on input
        if ((this.keys['ArrowLeft'] || this.keys['a'])) {
            this.calcifer.x -= this.calcifer.speed;
        }
        if ((this.keys['ArrowRight'] || this.keys['d'])) {
            this.calcifer.x += this.calcifer.speed;
        }
        if ((this.keys['ArrowUp'] || this.keys['w'])) {
            this.calcifer.y -= this.calcifer.speed;
        }
        if ((this.keys['ArrowDown'] || this.keys['s'])) {
            this.calcifer.y += this.calcifer.speed;
        }

        // Enforce boundaries
        this.calcifer.x = Math.max(0, Math.min(this.canvas.width - this.calcifer.size, this.calcifer.x));
        this.calcifer.y = Math.max(0, Math.min(this.canvas.height - this.calcifer.size, this.calcifer.y));

        // Spawn stars
        if (this.frameCount % this.starSpawnRate === 0) {
            this.stars.push({
                x: Math.random() * (this.canvas.width - 14),
                y: -14,
                size: 14,
                speed: this.cheatActive ? 1 : (2 + Math.random() * 1.5)
            });
        }

        // Spawn crystals
        if (this.frameCount % this.crystalSpawnRate === 0) {
            this.crystals.push({
                x: Math.random() * (this.canvas.width - 10),
                y: -10,
                size: 10,
                speed: this.cheatActive ? 1 : (1.5 + Math.random() * 1.5),
                rotation: 0
            });
        }

        // Update stars with shield protection
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.y += star.speed;
            // Check for collision and protection (shield, invincibility, or cheat)
            if (this.checkCollision(star) && !this.isInvincible && !this.cheatActive && !this.powerUps.types.shield.active) {
                this.endGame();
                return;
            }
            if (star.y > this.canvas.height) {
                this.stars.splice(i, 1);
            }
        }

        // Spawn power-ups naturally
        if (this.frameCount - this.powerUps.lastSpawn >= this.powerUps.spawnRate) {
            this.powerUps.lastSpawn = this.frameCount;
            this.spawnPowerUp();
        }

        // Update all active power-ups
        for (let i = this.powerUps.active.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps.active[i];
            powerUp.y += powerUp.speed;

            // Check for collection
            if (!powerUp.collected && this.checkCollision(powerUp)) {
                powerUp.collected = true;
                this.activatePowerUp(powerUp.type);
                this.powerUps.active.splice(i, 1);
                continue;
            }

            // Remove if off screen
            if (powerUp.y > this.canvas.height) {
                this.powerUps.active.splice(i, 1);
            }
        }

        // Update crystals
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            crystal.y += crystal.speed;
            crystal.rotation += 0.1;
            if (this.checkCollision(crystal)) {
                this.score += 10;
                this.scoreDisplay.textContent = this.score;
                
                // Check for size increase
                const currentMilestone = Math.floor(this.score / 100);
                if (currentMilestone > this.lastSizeMilestone) {
                    this.updateCalciferSize(currentMilestone);
                }
                
                this.createParticles(crystal.x, crystal.y);
                this.crystals.splice(i, 1);
                continue;
            }
            if (crystal.y > this.canvas.height) {
                this.crystals.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life--;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.size *= 0.95;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update size increase message timer
        if (this.sizeIncreaseMessage) {
            this.sizeIncreaseMessage.timer--;
            if (this.sizeIncreaseMessage.timer <= 0) {
                this.sizeIncreaseMessage = null;
            }
        }

        // Update power-up message
        if (this.powerUpMessage) {
            this.powerUpMessage.timer--;
            if (this.powerUpMessage.timer <= 0) {
                this.powerUpMessage = null;
            }
        }

        this.frameCount++;
    }

    // Draw game objects
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background with zoom out effect
        if (this.backgroundImage.complete) {
            const scale = 0.9;
            const scaledWidth = this.canvas.width * scale;
            const scaledHeight = this.canvas.height * scale;
            const offsetX = (this.canvas.width - scaledWidth) / 2;
            const offsetY = (this.canvas.height - scaledHeight) / 2;
            
            this.ctx.drawImage(
                this.backgroundImage,
                offsetX, offsetY,
                scaledWidth,
                scaledHeight
            );
        }

        // Update glow effect
        this.glowAmount = Math.sin(this.frameCount * 0.05) * 0.5 + 0.5;
        this.frameCount++;

        // Draw watermark in bottom-left corner
        this.drawWatermark();

        if (!this.gameStarted) {
            // Draw semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const centerY = this.canvas.height / 2;
            const spacing = this.canvas.height * 0.08;

            // Draw title
            this.drawText("Calcifer's Adventure", this.canvas.width/2, centerY - spacing * 2, this.textStyles.title);

            // Draw welcome message
            const welcomeText = "Welcome to our magical mini-game!";
            const instructionsText = "Help Calcifer collect magic crystals while avoiding falling stars.";
            
            this.drawText(welcomeText, this.canvas.width/2, centerY - spacing, this.textStyles.message);
            this.drawText(instructionsText, this.canvas.width/2, centerY, this.textStyles.message);

            // Draw controls
            this.drawText("⭐ Use Arrow Keys or WASD to move ⭐", this.canvas.width/2, centerY + spacing * 1.2, this.textStyles.info);
            this.drawText("Press P to Pause Game", this.canvas.width/2, centerY + spacing * 1.8, this.textStyles.info);
            
            // Draw start prompt with pulsing effect
            const pulseAmount = (Math.sin(this.frameCount * 0.05) * 0.5 + 0.5);
            const pulseStyle = {
                ...this.textStyles.message,
                shadowBlur: this.textStyles.message.shadowBlur * pulseAmount
            };
            this.drawText("Press SPACE to Start", this.canvas.width/2, centerY + spacing * 2.5, pulseStyle);
            
            // Draw fullscreen recommendation
            this.drawText("✨ Press fullscreen for the best experience ✨", 
                        this.canvas.width/2, 
                        this.canvas.height - spacing,
                        this.textStyles.info);
        } else if (this.gameOver) {
            // Draw game over overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const centerY = this.canvas.height / 2;
            const spacing = this.canvas.height * 0.08;

            // Draw game over text
            this.drawText('Game Over!', this.canvas.width/2, centerY - spacing, this.textStyles.title);
            this.drawText(`✨ Final Score: ${this.score} ✨`, this.canvas.width/2, centerY, this.textStyles.message);
            
            // Draw restart prompt with pulse effect
            const pulseAmount = (Math.sin(this.frameCount * 0.05) * 0.5 + 0.5);
            const pulseStyle = {
                ...this.textStyles.message,
                shadowBlur: this.textStyles.message.shadowBlur * pulseAmount
            };
            this.drawText('Press SPACE to Play Again', this.canvas.width/2, centerY + spacing, pulseStyle);
        }

        if (this.gameStarted && !this.gameOver) {
            // Draw Calcifer with enhanced effects in cheat mode
            if (this.calciferImage.complete) {
                this.ctx.save();
                
                // Add enhanced glow effect during cheat mode or shield
                if (this.cheatActive) {
                    const glowIntensity = Math.sin(this.frameCount * 0.2) * 20 + 25;
                    const hue = (this.frameCount * 5) % 360;
                    this.ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
                    this.ctx.shadowBlur = glowIntensity;
                    this.ctx.globalAlpha = 0.6 + Math.sin(this.frameCount * 0.2) * 0.4;
                } else if (this.isInvincible || this.powerUps.types.shield.active) {
                    // Enhanced shield visual effect
                    const glowIntensity = Math.sin(this.frameCount * 0.2) * 15 + 20;
                    this.ctx.shadowColor = this.powerUps.types.shield.active ? '#4169E1' : '#ffffff';
                    this.ctx.shadowBlur = glowIntensity;
                } else {
                    this.ctx.shadowColor = '#ff6b6b';
                    this.ctx.shadowBlur = 15;
                }
                
                this.ctx.drawImage(
                    this.calciferImage,
                    this.calcifer.x,
                    this.calcifer.y + Math.sin(this.frameCount * 0.1) * 3,
                    this.calcifer.size,
                    this.calcifer.size
                );
                this.ctx.restore();
            }

            // Draw stars with sparkle effect
            this.ctx.save();
            this.ctx.fillStyle = 'white';
            this.ctx.shadowColor = 'white';
            this.ctx.shadowBlur = 10;
            
            this.stars.forEach(star => {
                this.ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const x = star.x + star.size * Math.cos(angle);
                    const y = star.y + star.size * Math.sin(angle);
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
            });
            this.ctx.restore();

            // Draw crystals with magical glow
            this.ctx.save();
            this.ctx.shadowColor = '#00ff88';
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = '#00ff88';
            
            this.crystals.forEach(crystal => {
                this.ctx.save();
                this.ctx.translate(crystal.x + crystal.size/2, crystal.y + crystal.size/2);
                this.ctx.rotate(crystal.rotation);
                
                this.ctx.beginPath();
                this.ctx.moveTo(-crystal.size/2, 0);
                this.ctx.lineTo(0, -crystal.size);
                this.ctx.lineTo(crystal.size/2, 0);
                this.ctx.lineTo(0, crystal.size);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.restore();
            });
            this.ctx.restore();

            // Draw particles with magical trail effect
            this.ctx.save();
            this.particles.forEach(particle => {
                this.ctx.fillStyle = `rgba(0, 255, 136, ${particle.life/20})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.restore();

            // Draw size increase message if active
            if (this.sizeIncreaseMessage) {
                this.ctx.save();
                const alpha = Math.min(1, this.sizeIncreaseMessage.timer / 30);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.font = `${Math.min(this.canvas.width / 30, this.canvas.height / 20)}px 'Segoe UI', serif`;
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#ff6b6b';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText(
                    this.sizeIncreaseMessage.text,
                    this.canvas.width / 2,
                    this.canvas.height / 3
                );
                this.ctx.restore();
            }

            // Draw all active power-ups
            this.powerUps.active.forEach(powerUp => {
                if (!powerUp.collected) {
                    this.ctx.save();
                    this.ctx.fillStyle = this.powerUps.types[powerUp.type].color;
                    this.ctx.shadowColor = this.powerUps.types[powerUp.type].color;
                    this.ctx.shadowBlur = 15;
                    this.ctx.beginPath();
                    this.ctx.arc(
                        powerUp.x + powerUp.size/2,
                        powerUp.y + powerUp.size/2,
                        powerUp.size/2,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                    
                    // Draw power-up symbol
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = `${powerUp.size * 0.6}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        this.powerUps.types[powerUp.type].symbol,
                        powerUp.x + powerUp.size/2,
                        powerUp.y + powerUp.size/2
                    );
                    this.ctx.restore();
                }
            });

            // Draw active power-up indicators
            let activeCount = 0;
            for (const [type, powerUp] of Object.entries(this.powerUps.types)) {
                if (powerUp.active) {
                    this.ctx.save();
                    this.ctx.fillStyle = powerUp.color;
                    this.ctx.shadowColor = powerUp.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.font = '20px Arial';
                    this.ctx.textAlign = 'right';
                    this.ctx.fillText(
                        powerUp.symbol,
                        this.canvas.width - 20,
                        30 + (activeCount * 30)
                    );
                    this.ctx.restore();
                    activeCount++;
                }
            }

            // Draw power-up message
            if (this.powerUpMessage) {
                this.ctx.save();
                const alpha = Math.min(1, this.powerUpMessage.timer / 30);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.shadowColor = this.powerUpMessage.color;
                this.ctx.shadowBlur = 10;
                this.ctx.font = `${Math.min(this.canvas.width / 30, this.canvas.height / 20)}px 'Segoe UI', serif`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    this.powerUpMessage.text,
                    this.canvas.width / 2,
                    this.canvas.height / 4
                );
                this.ctx.restore();
            }

            // Draw shield effect if active with enhanced visuals
            if (this.powerUps.types.shield.active) {
                this.ctx.save();
                const shieldPulse = Math.sin(this.frameCount * 0.1) * 0.2 + 0.8; // Pulsing effect
                this.ctx.strokeStyle = this.powerUps.types.shield.color;
                this.ctx.lineWidth = 3;
                this.ctx.shadowColor = this.powerUps.types.shield.color;
                this.ctx.shadowBlur = 15;
                this.ctx.globalAlpha = shieldPulse;
                
                // Draw outer shield circle
                this.ctx.beginPath();
                this.ctx.arc(
                    this.calcifer.x + this.calcifer.size/2,
                    this.calcifer.y + this.calcifer.size/2,
                    this.calcifer.size * 0.7,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
                
                // Draw inner shield circle
                this.ctx.beginPath();
                this.ctx.arc(
                    this.calcifer.x + this.calcifer.size/2,
                    this.calcifer.y + this.calcifer.size/2,
                    this.calcifer.size * 0.6,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
                
                this.ctx.restore();
            }
        }

        // Draw UI buttons with magical styling
        this.drawButtons();

        if (this.isPaused) {
            this.showPauseScreen();
        }
    }

    drawButtons() {
        const buttonRadius = 20;
        
        // Common button styling with white text
        const drawButtonBase = (button) => {
            this.ctx.save();
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = button.hovered ? 15 : 10;
            this.ctx.fillStyle = button.hovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(button.x + buttonRadius, button.y + buttonRadius, buttonRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        };

        // Draw restart button
        drawButtonBase(this.buttons.restart);
        this.ctx.save();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;

        // Draw restart icon (circular arrow)
        const centerX = this.buttons.restart.x + buttonRadius;
        const centerY = this.buttons.restart.y + buttonRadius;
        
        // Draw the circular part of the arrow
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, buttonRadius * 0.6, -0.5 * Math.PI, 1.5 * Math.PI);
        this.ctx.stroke();

        // Draw the arrowhead
        const arrowSize = buttonRadius * 0.3;
        const arrowX = centerX;
        const arrowY = centerY - buttonRadius * 0.6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX - arrowSize, arrowY + arrowSize);
        this.ctx.lineTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize);
        this.ctx.stroke();
        this.ctx.restore();

        // Draw fullscreen button
        drawButtonBase(this.buttons.fullscreen);
        this.ctx.save();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        if (!this.isFullscreen) {
            // Draw expand icon
            const x = this.buttons.fullscreen.x + buttonRadius;
            const y = this.buttons.fullscreen.y + buttonRadius;
            const size = buttonRadius * 0.6;

            // Draw corners
            this.ctx.beginPath();
            // Top-left corner
            this.ctx.moveTo(x - size, y - size + size/2);
            this.ctx.lineTo(x - size, y - size);
            this.ctx.lineTo(x - size + size/2, y - size);
            // Top-right corner
            this.ctx.moveTo(x + size - size/2, y - size);
            this.ctx.lineTo(x + size, y - size);
            this.ctx.lineTo(x + size, y - size + size/2);
            // Bottom-right corner
            this.ctx.moveTo(x + size, y + size - size/2);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.lineTo(x + size - size/2, y + size);
            // Bottom-left corner
            this.ctx.moveTo(x - size + size/2, y + size);
            this.ctx.lineTo(x - size, y + size);
            this.ctx.lineTo(x - size, y + size - size/2);
            this.ctx.stroke();
        } else {
            // Draw collapse icon
            const x = this.buttons.fullscreen.x + buttonRadius;
            const y = this.buttons.fullscreen.y + buttonRadius;
            const size = buttonRadius * 0.6;

            // Draw 'X' shape
            this.ctx.beginPath();
            this.ctx.moveTo(x - size, y - size);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.moveTo(x + size, y - size);
            this.ctx.lineTo(x - size, y + size);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    // Check collision between Calcifer and other objects
    checkCollision(obj) {
        // Calculate centers
        const calciferCenterX = this.calcifer.x + this.calcifer.size / 2;
        const calciferCenterY = this.calcifer.y + this.calcifer.size / 2;
        const objCenterX = obj.x + obj.size / 2;
        const objCenterY = obj.y + obj.size / 2;

        // Calculate distance between centers
        const dx = calciferCenterX - objCenterX;
        const dy = calciferCenterY - objCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Use 40% of Calcifer's size as the radius (80% of diameter)
        // This makes the hitbox more accurate to the visible flame
        const calciferRadius = (this.calcifer.size * 0.4);
        const objRadius = obj.size / 2;

        // Return true if the distance is less than the sum of the radii
        return distance < calciferRadius + objRadius;
    }

    // Create particle effects
    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: 3, // Smaller particle size
                life: 15
            });
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    updateTextSizes() {
        const baseSize = Math.min(this.canvas.width / 30, this.canvas.height / 20);
        this.textStyles = {
            title: {
                color: '#FFE4B5',
                glowColor: '#ff6b6b',
                font: `${baseSize}px 'Segoe UI', serif`,
                shadowBlur: 15
            },
            message: {
                color: '#FFFFFF',
                glowColor: '#ff6b6b',
                font: `${baseSize * 0.7}px 'Segoe UI', serif`,
                shadowBlur: 10
            },
            info: {
                color: '#FFE4B5',
                glowColor: '#ff6b6b',
                font: `${baseSize * 0.6}px 'Segoe UI', serif`,
                shadowBlur: 5
            }
        };

        // Update watermark size
        this.watermarkStyle = {
            color: 'rgba(255, 228, 181, 0.3)',
            font: `${baseSize * 0.4}px 'Segoe UI', serif`,
            shadowBlur: 3,
            glowColor: 'rgba(255, 107, 107, 0.2)'
        };
    }

    drawText(text, x, y, style, maxWidth = undefined) {
        this.ctx.save();
        this.ctx.font = style.font;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = style.glowColor;
        this.ctx.shadowBlur = style.shadowBlur;
        this.ctx.fillStyle = style.color;
        this.ctx.fillText(text, x, y, maxWidth);
        this.ctx.restore();
    }

    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    isClickInButton(x, y, button) {
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.isFullscreen = true;
        } else {
            document.exitFullscreen();
            this.isFullscreen = false;
        }
    }

    drawWatermark() {
        const padding = 15;
        this.ctx.save();
        this.ctx.font = this.watermarkStyle.font;
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = this.watermarkStyle.glowColor;
        this.ctx.shadowBlur = this.watermarkStyle.shadowBlur;
        this.ctx.fillStyle = this.watermarkStyle.color;
        this.ctx.fillText('Made by Terd and Gayle', padding, this.canvas.height - padding);
        this.ctx.restore();
    }

    spawnPowerUp() {
        const types = Object.keys(this.powerUps.types);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const powerUp = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            type: randomType,
            size: 30,
            speed: 2,
            collected: false
        };
        this.powerUps.active.push(powerUp);
    }

    activatePowerUp(type) {
        const powerUp = this.powerUps.types[type];
        powerUp.active = true;

        // Clear existing timer if any
        if (powerUp.timer) clearTimeout(powerUp.timer);

        switch (type) {
            case 'speedBoost':
                this.calcifer.speed = this.originalSpeed * 1.7;
                break;
            case 'shield':
                // Shield is handled in collision detection
                break;
            case 'crystalMagnet':
                // Magnet is handled in crystal movement
                break;
            case 'timeSlow':
                this.stars.forEach(star => star.speed *= 0.5);
                this.crystals.forEach(crystal => crystal.speed *= 0.5);
                break;
        }

        // Set deactivation timer
        powerUp.timer = setTimeout(() => {
            this.deactivatePowerUp(type);
        }, powerUp.duration);

        // Show power-up message
        this.showPowerUpMessage(type);
    }

    deactivatePowerUp(type) {
        const powerUp = this.powerUps.types[type];
        powerUp.active = false;

        switch (type) {
            case 'speedBoost':
                this.calcifer.speed = this.originalSpeed;
                break;
            case 'timeSlow':
                this.stars.forEach(star => star.speed = this.originalSpeeds.star + Math.random() * 1.5);
                this.crystals.forEach(crystal => crystal.speed = this.originalSpeeds.crystal + Math.random() * 1.5);
                break;
        }
    }

    showPowerUpMessage(type) {
        const messages = {
            speedBoost: "Speed Boost activated!",
            shield: "Shield activated!",
            crystalMagnet: "Crystal Magnet activated!",
            timeSlow: "Time Slow activated!"
        };
        
// g
//g
        this.powerUpMessage = {
            text: messages[type],
            timer: 60,
            color: this.powerUps.types[type].color
        };
    }

    checkCheatActivation() {
        // Check if both keys are pressed
        if (this.cheatKeys['1'] && this.cheatKeys['4']) {
            // Toggle cheat mode
            if (!this.cheatActive) {
                this.activateCheat();
            } else {
                this.deactivateCheat();
            }
            // Reset key states to prevent rapid toggling
            this.cheatKeys['1'] = false;
            this.cheatKeys['4'] = false;
        }
    }

    activateCheat() {
        if (!this.gameStarted || this.gameOver || this.isPaused) return;
        
        this.cheatActive = true;
        
        // Show message
        this.powerUpMessage = {
            text: "⭐ DUGA NETO CHEATER ⭐",
            timer: 60,
            color: '#FFD700'
        };

        // Activate all power-ups permanently while in cheat mode
        Object.entries(this.powerUps.types).forEach(([type, powerUp]) => {
            // Clear any existing timers
            if (powerUp.timer) {
                clearTimeout(powerUp.timer);
                powerUp.timer = null;
            }

            // Activate the power-up without setting new timers
            powerUp.active = true;

            // Apply power-up effects
            switch (type) {
                case 'speedBoost':
                    this.calcifer.speed = this.originalSpeed * 1.7;
                    break;
                case 'timeSlow':
                    this.stars.forEach(star => star.speed *= 0.5);
                    this.crystals.forEach(crystal => crystal.speed *= 0.5);
                    break;
            }
        });
    }

    deactivateCheat() {
        if (!this.cheatActive) return;
        
        this.cheatActive = false;

        // Show deactivation message
        this.powerUpMessage = {
            text: "Cheat Mode Disabled",
            timer: 60,
            color: '#FFD700'
        };

        // Deactivate all power-ups
        Object.entries(this.powerUps.types).forEach(([type, powerUp]) => {
            powerUp.active = false;
            if (powerUp.timer) {
                clearTimeout(powerUp.timer);
                powerUp.timer = null;
            }

            // Reset effects
            switch (type) {
                case 'speedBoost':
                    this.calcifer.speed = this.originalSpeed;
                    break;
                case 'timeSlow':
                    this.stars.forEach(star => star.speed = this.originalSpeeds.star + Math.random() * 1.5);
                    this.crystals.forEach(crystal => crystal.speed = this.originalSpeeds.crystal + Math.random() * 1.5);
                    break;
            }
        });
    }

    // Add pause toggle method
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            // Show pause message
            this.showPauseScreen();
        }
    }

    // Add pause screen method
    showPauseScreen() {
        this.ctx.save();
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Pause text
        const centerY = this.canvas.height / 2;
        const spacing = this.canvas.height * 0.08;

        this.drawText('GAME PAUSED', this.canvas.width/2, centerY - spacing, {
            ...this.textStyles.title,
            color: '#FFD700'
        });
        this.drawText('Press P to Resume', this.canvas.width/2, centerY + spacing, this.textStyles.message);
        this.ctx.restore();
    }

    spawnSpecificPowerUp(type) {
        const powerUp = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            type: type,
            size: 30,
            speed: 2,
            collected: false
        };
        this.powerUps.active.push(powerUp);
    }
}

// Initialize game when page loads
window.onload = () => new Game(); 