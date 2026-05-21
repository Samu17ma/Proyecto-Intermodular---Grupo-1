function createPlayer() {
    player = this.physics.add.sprite(startOffset, screenHeight - platformHeight, 'mario')
        .setOrigin(1)
        .setBounce(0,0)
        .setCollideWorldBounds(true)
        .setScale(screenHeight / 376);
    player.depth = 3;
    player.smooth = 0;
}

function decreasePlayerState() {
    if (playerState <= 0) {
        gameOver = true;
        gameOverFunc.call(this);
        return;
    }

    playerBlocked = true;
    this.physics.pause();
    this.anims.pauseAll();
    this.powerDownSound.play();

    const anim1 = playerState === 2 ? 'fire-mario-idle' : 'grown-mario-idle';
    const anim2 = playerState === 2 ? 'grown-mario-idle' : 'idle';

    applyPlayerInvulnerability.call(this, 3000);
    player.anims.play(anim2);

    let i = 0;
    const interval = setInterval(() => {
        i++;
        player.anims.play(i % 2 === 0 ? anim2 : anim1);
        if (i > 5) clearInterval(interval);
    }, 100);

    playerState--;

    setTimeout(() => {
        this.physics.resume();
        this.anims.resumeAll();
        playerBlocked = false;
        updateTimer.call(this);
    }, 1000);
}

function applyPlayerInvulnerability(time) {
    const blinkAnim = this.tweens.add({
        targets: player,
        duration: 100,
        alpha: { from: 1, to: 0.2 },
        ease: 'Linear',
        repeat: -1,
        yoyo: true
    });

    playerInvulnerable = true;
    setTimeout(() => {
        playerInvulnerable = false;
        blinkAnim.stop();
        player.alpha = 1;
    }, time);
}

function updatePlayer(delta) {
    if (playerBlocked && flagRaised) {
        handleWinAnimation.call(this);
        return;
    }

    if (player.body.blocked.up) player.setVelocityY(0);
    if (player.body.blocked.left || player.body.blocked.right) player.setVelocityX(0);

    if (player.y > screenHeight - 10 || timeLeft <= 0) {
        gameOver = true;
        gameOverFunc.call(this);
        return;
    }

    if (playerBlocked) return;

    handlePlayerControls.call(this, delta);
}

function handleWinAnimation() {
    player.setVelocityX(screenWidth / 8.5);
    const runAnim = playerState === 0 ? 'run' :
                    playerState === 1 ? 'grown-mario-run' : 'fire-mario-run';
    player.anims.play(runAnim, true).flipX = false;

    if (player.x >= worldWidth - (worldWidth / 75)) {
        this.tweens.add({ targets: player, duration: 75, alpha: 0 });
    }

    setTimeout(() => {
        gameWinned = true;
        player.destroy();
        winScreen.call(this);
    }, 5000);
}

function moveLeft(delta) {
    if (player.smooth > 0) player.smooth = 0;
    player.smooth -= playerSpeed * 3.5;
    if (player.smooth < -1) player.smooth = -1;
    playerController.time.rightDown += delta;
}

function moveRight(delta) {
    if (player.smooth < 0) player.smooth = 0;
    player.smooth += playerSpeed * 3.5;
    if (player.smooth > 1) player.smooth = 1;
    playerController.time.leftDown += delta;
}

function handlePlayerControls(delta) {
    if ((controlKeys.JUMP.isDown || this.joyStick.up) && player.body.touching.down) {
        this.jumpSound.play();
        const jumpVelocity = playerState > 0 && (controlKeys.DOWN.isDown || this.joyStick.down) ? -velocityY / 1.25 : -velocityY;
        player.setVelocityY(jumpVelocity);
    }

    let newVelocityX;
    if (controlKeys.LEFT.isDown || this.joyStick.left) {
        moveLeft.call(this, delta);
        newVelocityX = getUpdatedVelocity(false);
    } else if (controlKeys.RIGHT.isDown || this.joyStick.right) {
        moveRight.call(this, delta);
        newVelocityX = getUpdatedVelocity(true);
    } else {
        handleIdleState.call(this);
        return;
    }

    player.setVelocityX(newVelocityX);
}

function getUpdatedVelocity(isMovingRight) {
    const direction = isMovingRight ? 1 : -1;
    const targetVelocityX = direction * playerController.speed.run;
    const oldVelocityX = player.body.velocity.x;
    const newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, direction * player.smooth);

    if (!playerFiring) {
        const runAnim = playerState === 0 ? 'run' :
                        playerState === 1 ? 'grown-mario-run' : 'fire-mario-run';
        player.anims.play(runAnim, true).flipX = !isMovingRight;
    }

    playerController.direction.positive = isMovingRight;
    return newVelocityX;
}

function handleIdleState() {
    if (player.body.velocity.x !== 0) player.smooth = 0;
    if (player.body.touching.down) player.setVelocityX(0);

    if (!(controlKeys.JUMP.isDown || this.joyStick.up) && !playerFiring) {
        const idleAnim = playerState === 0 ? 'idle' :
                         playerState === 1 ? 'grown-mario-idle' : 'fire-mario-idle';
        player.anims.play(idleAnim, true);
    }

    if (playerState > 0 && (controlKeys.DOWN.isDown || this.joyStick.down)) {
        handleCrouchState.call(this);
    } else {
        resetPlayerSize();
    }

    if (player.body.touching.down && playerState === 2 && controlKeys.FIRE.isDown && !fireInCooldown) {
        throwFireball.call(this);
    }

    if (!player.body.touching.down) applyJumpAnimation();
}

function handleCrouchState() {
    const crouchAnim = playerState === 1 ? 'grown-mario-crouch' : 'fire-mario-crouch';
    player.anims.play(crouchAnim, true);

    if (player.body.touching.down) player.setVelocityX(0);

    player.body.setSize(14, 22).setOffset(2, 10);
}

function resetPlayerSize() {
    if (playerState > 0) player.body.setSize(14, 32).setOffset(2, 0);
    else player.body.setSize(14, 16).setOffset(1.3, 0.5);
}

function applyJumpAnimation() {
    const jumpAnim = playerState === 0 ? 'jump' :
                     playerState === 1 ? 'grown-mario-jump' : 'fire-mario-jump';
    player.anims.play(jumpAnim, true);
}
