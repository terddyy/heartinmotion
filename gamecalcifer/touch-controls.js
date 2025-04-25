export class TouchControls {
    constructor(player, gameContainer) {
        this.player = player;
        this.gameContainer = gameContainer;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        this.dragThreshold = 5; // Minimum distance to trigger movement
        this.moveSpeed = 4; // Match the game's default speed

        this.initTouchEvents();
    }

    initTouchEvents() {
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.gameContainer.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.gameContainer.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.gameContainer.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isDragging = true;
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Normalize diagonal movement
        if (deltaX !== 0 && deltaY !== 0) {
            const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const normalizedDeltaX = deltaX / magnitude;
            const normalizedDeltaY = deltaY / magnitude;

            this.player.x += normalizedDeltaX * this.moveSpeed;
            this.player.y += normalizedDeltaY * this.moveSpeed;
        } else {
            // Move in single direction
            if (Math.abs(deltaX) > this.dragThreshold) {
                this.player.x += (deltaX / Math.abs(deltaX)) * this.moveSpeed;
            }
            if (Math.abs(deltaY) > this.dragThreshold) {
                this.player.y += (deltaY / Math.abs(deltaY)) * this.moveSpeed;
            }
        }

        // Update touch start position for continuous movement
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;

        // Keep player within game bounds
        this.player.x = Math.max(0, Math.min(this.player.x, this.gameContainer.width - this.player.size));
        this.player.y = Math.max(0, Math.min(this.player.y, this.gameContainer.height - this.player.size));
    }

    handleTouchEnd() {
        this.isDragging = false;
    }

    // Method to enable/disable touch controls
    setEnabled(enabled) {
        this.isDragging = false;
        if (!enabled) {
            this.gameContainer.removeEventListener('touchstart', this.handleTouchStart);
            this.gameContainer.removeEventListener('touchmove', this.handleTouchMove);
            this.gameContainer.removeEventListener('touchend', this.handleTouchEnd);
        } else {
            this.initTouchEvents();
        }
    }
} 