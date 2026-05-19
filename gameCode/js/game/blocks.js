function revealHiddenBlockCoin(player, block) {
    if (!player.body.blocked.up) return;

    this.blockBumpSound.play();
    if (emptyBlocksList.includes(block)) return;

    emptyBlocksList.push(block);
    block.anims.stop();
    block.setTexture('empty-block');
    animateBlock.call(this, block, screenHeight / 34.5);

    handleCoin.call(this, block);
}

function revealHiddenBlockMushroom(player, block) {
    if (!player.body.blocked.up) return;

    this.blockBumpSound.play();
    if (emptyBlocksList.includes(block)) return;

    emptyBlocksList.push(block);
    block.anims.stop();
    block.setTexture('empty-block');
    animateBlock.call(this, block, screenHeight / 34.5, () => {
        handlePowerUp.call(this, block, 'super-mushroom', mushroomsVelocityX, consumeMushroom);
    });
}

function revealHiddenBlockFireflower(player, block) {
    if (!player.body.blocked.up) return;
    
    this.blockBumpSound.play();
    if (emptyBlocksList.includes(block)) return;
    emptyBlocksList.push(block);
    
    block.anims.stop();
    block.setTexture('empty-block');
    animateBlock.call(this, block, screenHeight / 34.5, () => {
        handlePowerUp.call(this, block, 'fire-flower', 0, consumeFireflower);
    });
}

function animateBlock(block, offsetY, onComplete) {
    const originalY = block.y;
    this.tweens.add({
        targets: block,
        duration: 75,
        y: originalY - offsetY,
        onComplete: () => {
            this.tweens.add({
                targets: block,
                duration: 75,
                y: originalY,
                onComplete: () => {
                    if (typeof onComplete === 'function') onComplete();
                }
            });
        }
    });
}

function handleCoin(block) {
    addToScore.call(this, 200, block);
    this.coinSound.play();
    let coin = this.physics.add.sprite(block.getBounds().x, block.getBounds().y, 'coin')
        .setScale(screenHeight / 357).setOrigin(0).anims.play('coin-default');
    animateAndDestroy.call(this, coin, screenHeight / 8.25);
}

function handlePowerUp(block, sprite, velocityX, consumeCallback) {
    this.powerUpAppearsSound.play();

    const blockBounds = block.getBounds();
    const scale = screenHeight / 345;

    const powerUp = this.physics.add
    .sprite(0, 0, sprite)
    .setScale(scale)
    .setOrigin(0, 0);
    
    powerUp.body.setSize(powerUp.displayWidth-2, powerUp.displayHeigh-2 );
    powerUp.body.setOffset(0, 0);

    
    powerUp.body.setCollideWorldBounds(true);

    if (sprite === 'super-mushroom') {
        powerUp.setPosition(
            blockBounds.centerX - powerUp.displayWidth,
            blockBounds.y - powerUp.displayHeight - 4
        );
        powerUp.body.allowGravity = true;
        powerUp.body.immovable = false;
        powerUp.setBounce(0, 0);
        powerUp.setVelocityX(Phaser.Math.Between(0, 10) <= 4 ? velocityX : -velocityX);
    } else {
        powerUp.setPosition(
            blockBounds.centerX - powerUp.displayWidth / 2,
            blockBounds.y - powerUp.displayHeight - 7
        );
        powerUp.body.allowGravity = false;
        powerUp.body.immovable = true;
        powerUp.setBounce(0.2, 0);
    }

    this.physics.add.overlap(player, powerUp, consumeCallback, null, this);
    addPowerUpColliders.call(this, powerUp);
}

function animateAndDestroy(sprite, offsetY) {
    this.tweens.add({
        targets: sprite,
        duration: 250,
        y: sprite.y - offsetY,
        onComplete: () => {
            this.tweens.add({
                targets: sprite,
                duration: 250,
                y: sprite.y + offsetY,
                onComplete: () => {
                    sprite.destroy();
                }
            });
        }
    });
}

function animateAndMove(sprite, velocityX) {
    if (sprite.body) {
        if (velocityX !== 0) {
            sprite.body.setVelocityX(Phaser.Math.Between(0, 10) <= 4 ? velocityX : -velocityX);
        }
    } else {
        if (velocityX !== 0) {
            sprite.setVelocityX(Phaser.Math.Between(0, 10) <= 4 ? velocityX : -velocityX);
        }
    }
}

function addPowerUpColliders(powerUp) {
    const groups = [
        this.misteryBlocksGroupCoin,
        this.misteryBlocksGroupMushroom,
        this.misteryBlocksGroupFireflower,
        this.blocksGroup,
        this.platformGroup,
        this.immovableBlocksGroup,
        this.constructionBlocksGroup
    ];
    groups.forEach(group => {
        if (!group) return;
        this.physics.add.collider(powerUp, group);
    });
}

function destroyBlock(player, block) {
    if (!player.body.blocked.up) return;

    this.blockBumpSound.play();
    if (playerState === 0 && !block.isImmovable) {
        animateBlock.call(this, block, screenHeight / 69);
    } else if (playerState > 0 && !(controlKeys.DOWN.isDown || this.joyStick.down)) {
        this.breakBlockSound.play();
        addToScore.call(this, 50);
        drawDestroyedBlockParticles.call(this, block);
        block.destroy();
    }
}

function drawDestroyedBlockParticles(block) {
    let particles = generateParticles(block);
    particles.forEach(particle => {
        this.physics.add.sprite(particle.x, particle.y, 'brick-debris').anims.play('brick-debris-default', true)
            .setVelocityY(particle.velocityY).setVelocityX(particle.velocityX).setScale(screenHeight / 517).depth = 4;
    });
    setTimeout(() => disableParticles.call(this, particles), 3000);
}

function generateParticles(block) {
    let playerBounds = player.getBounds();
    let blockBounds = block.getBounds();
    return [
        { x: playerBounds.left, y: blockBounds.y, velocityY: -(screenHeight / 3.45), velocityX: -(screenWidth / 25.6) },
        { x: playerBounds.right, y: blockBounds.y, velocityY: -(screenHeight / 3.45), velocityX: screenWidth / 25.6 },
        { x: playerBounds.left, y: blockBounds.y + block.height * 2.35, velocityY: -(screenHeight / 2.6), velocityX: -(screenWidth / 25.6) },
        { x: playerBounds.right, y: blockBounds.y + block.height * 2.35, velocityY: -(screenHeight / 2.6), velocityX: screenWidth / 25.6 }
    ];
}

function disableParticles(particles) {
    particles.forEach(particle => {
        this.physics.world.disableBody(particle.x, particle.y);
    });
}
