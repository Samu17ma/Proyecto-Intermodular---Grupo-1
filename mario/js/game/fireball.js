function throwFireball() {
    this.fireballSound.play();
    player.anims.play('fire-mario-throw');
    playerFiring = true;
    fireInCooldown = true;

    setTimeout(() => playerFiring = false, 100);
    setTimeout(() => fireInCooldown = false, 350);

    let fireball = createFireball.call(this);
    setupFireballCollisions.call(this, fireball);

    setTimeout(() => destroyFireball.call(this, fireball), 3000);
}

function createFireball() {
    let fireball = this.physics.add.sprite(
        player.getBounds().x + (player.width * 1.15), 
        player.getBounds().y + (player.height / 1.25), 
        'fireball'
    ).setScale(screenHeight / 345);

    fireball.allowGravity = true;
    fireball.dead = false;

    if (playerController.direction.positive) {
        fireball.setVelocityX(velocityX * 1.3);
        fireball.isVelocityPositive = true;
        fireball.anims.play('fireball-right-down');
    } else {
        fireball.setVelocityX(-velocityX * 1.3);
        fireball.isVelocityPositive = false;
        fireball.anims.play('fireball-left-down');
    }

    updateFireballAnimation.call(this, fireball);
    return fireball;
}

function setupFireballCollisions(fireball) {
    let groups = [
        this.blocksGroup, this.misteryBlocksGroupCoin, this.misteryBlocksGroupMushroom, this.misteryBlocksGroupFireflower, 
        this.platformGroup, this.goombasGroup, this.immovableBlocksGroup, this.constructionBlocksGroup
    ];

    groups.forEach(group => {
        if (group === this.goombasGroup) {
            this.physics.add.overlap(fireball, group.getChildren(), fireballCollides, null, this);
        } else {
            this.physics.add.collider(fireball, group.getChildren(), fireballBounce, null, this);
        }
    });
}

function destroyFireball(fireball) {
    fireball.dead = true;
    this.tweens.add({
        targets: fireball,
        duration: 100,
        alpha: { from: 1, to: 0 },
    });
    setTimeout(() => fireball.destroy(), 100);
}

function fireballCollides(fireball, entity) {
    if (fireball.exploded || fireball.dead) return;

    fireball.exploded = true;
    fireball.dead = true;
    fireball.body.moves = false;

    explodeFireball.call(this, fireball);
    this.kickSound.play();

    entity.anims.play('goomba-idle', true).flipY = true;
    entity.dead = true;
    this.goombasGroup.remove(entity);
    entity.setVelocityX(0);
    entity.setVelocityY(-velocityY * 0.4);

    setTimeout(() => {
        this.tweens.add({
            targets: entity,
            duration: 750,
            y: screenHeight * 1.1
        });
    }, 400);

    addToScore.call(this, 100, entity);
    setTimeout(() => entity.destroy(), 1250);
}

function explodeFireball(fireball) {
    fireball.anims.play('fireball-explosion-1', true);
    const explosionSequence = [
        ['fireball-explosion-2', 50],
        ['fireball-explosion-3', 35],
        [null, 45]
    ];

    const playNextAnimation = () => {
        if (!explosionSequence.length || !fireball) {
            fireball?.destroy();
            return;
        }
        const [animation, delay] = explosionSequence.shift();
        if (animation) fireball.anims.play(animation, true);
        setTimeout(playNextAnimation, delay);
    };

    playNextAnimation();
}

function updateFireballAnimation(fireball) {
    if (fireball.exploded || fireball.dead) return;

    const animation = fireball.body.velocity.y > 0 ? 
        (fireball.isVelocityPositive ? 'fireball-right-up' : 'fireball-left-up') :
        (fireball.isVelocityPositive ? 'fireball-right-down' : 'fireball-left-down');

    fireball.anims.play(animation);

    setTimeout(() => updateFireballAnimation.call(this, fireball), 250);
}

function fireballBounce(fireball, collider) {
    if (collider.isPlatform || !collider.isPlatform) {
        if (fireball.body.blocked.left || fireball.body.blocked.right) {
            fireball.exploded = true;
            fireball.dead = true;
            fireball.body.moves = false;
            this.blockBumpSound.play();
            explodeFireball.call(this, fireball);
            return;
        }
    }

    if (fireball.body.blocked.down) 
        fireball.setVelocityY(-levelGravity / 3.45);

    if (fireball.body.blocked.up) 
        fireball.setVelocityY(levelGravity / 3.45);

    if (fireball.body.blocked.left) {
        fireball.isVelocityPositive = false;
        fireball.setVelocityX(velocityX * 1.3);
    }

    if (fireball.body.blocked.right) {
        fireball.isVelocityPositive = true;
        fireball.setVelocityX(-velocityX * 1.3);
    }
}
