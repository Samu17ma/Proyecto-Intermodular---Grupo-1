function create() {
    playerController = {
        time: {
            leftDown: 0,
            rightDown: 0
        },
        direction: {
            positive: true
        },
        speed: {
            run: velocityX,
        }
    };

    this.physics.world.setBounds(0, 0, worldWidth, screenHeight);

    // Create camera
    this.cameras.main.setBounds(0, 0, worldWidth, screenHeight);
    this.cameras.main.isFollowing = false;
    //this.cameras.main.followOffset.set(startOffset / 6, 0);

    initSounds.call(this);

    createAnimations.call(this);
    createPlayer.call(this);
    generateLevel.call(this);
    drawWorld.call(this);
    drawStartScreen.call(this);
    createGoombas.call(this);
    createControls.call(this);
    applySettings.call(this);
}

function createControls() {

    this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
        x: screenWidth * 0.125,
        y: screenHeight / 1.25,
        radius: mobileDevice ? 75 : 0,
        base: this.add.circle(0, 0, mobileDevice ? 50 : 0, 0x0000000, 0.05),
        thumb: this.add.circle(0, 0, mobileDevice ? 25 : 0, 0xcccccc, 0.25),
    });

    // Set control keys
    const keyNames = ['JUMP', 'DOWN', 'LEFT', 'RIGHT', 'FIRE', 'PAUSE'];
    const defaultCodes = [Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.Q, Phaser.Input.Keyboard.KeyCodes.ESC];

    keyNames.forEach((keyName, i) => {
        const keyCode = localStorage.getItem(keyName) ? Number(localStorage.getItem(keyName)) : defaultCodes[i];
        controlKeys[keyName] = this.input.keyboard.addKey(keyCode);
    });

    /*
    controlKeys.PAUSE.on('down', function () {
        if (!this.settingsMenuOpen)
            showSettings.call(this);
        else
            hideSettings.call(this);
    });*/
}

// This will generate a random coordinate, that can't be within a hole
function generateRandomCoordinate(entitie = false, ground = true) {
    const startPos = entitie ? screenWidth * 1.5 : screenWidth;
    const endPos = entitie ? worldWidth - screenWidth * 3 : worldWidth;

    let coordinate = Phaser.Math.Between(startPos, endPos);

    if (!ground) return coordinate;

    for (let hole of worldHolesCoords) {
        if (coordinate >= hole.start - platformPiecesWidth * 1.5 && coordinate <= hole.end) {
            return generateRandomCoordinate.call(this, entitie, ground);
        }
    }

    return coordinate;
}


// World generation
function drawWorld() {
    //Drawing scenery props

    //> Drawing the Sky
    this.add.rectangle(screenWidth, 0, worldWidth, screenHeight, isLevelOverworld ? 0x8585FF : 0x000000).setOrigin(0).depth = -1;

    let propsY = screenHeight - platformHeight;

    if (isLevelOverworld) {
        //> Clouds
        for (i = 0; i < Phaser.Math.Between(Math.trunc(worldWidth / 760), Math.trunc(worldWidth / 380)); i++) {
            let x = generateRandomCoordinate(false, false);
            let y = Phaser.Math.Between(screenHeight / 80, screenHeight / 2.2);
            if (Phaser.Math.Between(0, 10) < 5) {
                this.add.image(x, y, 'cloud1').setOrigin(0).setScale(screenHeight / 1725);
            } else {
                this.add.image(x, y, 'cloud2').setOrigin(0).setScale(screenHeight / 1725);
            }
        }

        //> Mountains
        for (i = 0; i < Phaser.Math.Between(worldWidth / 6400, worldWidth / 3800); i++) {
            let x = generateRandomCoordinate();

            if (Phaser.Math.Between(0, 10) < 5) {
                this.add.image(x, propsY, 'mountain1').setOrigin(0, 1).setScale(screenHeight / 517);
            } else {
                this.add.image(x, propsY, 'mountain2').setOrigin(0, 1).setScale(screenHeight / 517);
            }
        }

        //> Bushes
        for (i = 0; i < Phaser.Math.Between(Math.trunc(worldWidth / 960), Math.trunc(worldWidth / 760)); i++) {
            let x = generateRandomCoordinate();

            if (Phaser.Math.Between(0, 10) < 5) {
                this.add.image(x, propsY, 'bush1').setOrigin(0, 1).setScale(screenHeight / 609);
            } else {
                this.add.image(x, propsY, 'bush2').setOrigin(0, 1).setScale(screenHeight / 609);
            }
        }

        //> Fences
        for (i = 0; i < Phaser.Math.Between(Math.trunc(worldWidth / 4000), Math.trunc(worldWidth / 2000)); i++) {
            let x = generateRandomCoordinate();

            this.add.tileSprite(x, propsY, Phaser.Math.Between(100, 250), 35, 'fence').setOrigin(0, 1).setScale(screenHeight / 863);
        }
    }

    //> Final flag
    this.finalFlagMast = this.add.tileSprite(worldWidth - (worldWidth / 30), propsY, 16, 167, 'flag-mast').setOrigin(0, 1).setScale(screenHeight / 400);
    this.physics.add.existing(this.finalFlagMast);
    this.finalFlagMast.immovable = true;
    this.finalFlagMast.allowGravity = false;
    this.finalFlagMast.body.setSize(3, 167);
    this.physics.add.overlap(player, this.finalFlagMast, null, raiseFlag, this);
    this.physics.add.collider(this.platformGroup.getChildren(), this.finalFlagMast);

    //> Flag
    this.finalFlag = this.add.image(worldWidth - (worldWidth / 30), propsY * 0.93, 'final-flag').setOrigin(0.5, 1);
    this.finalFlag.setScale(screenHeight / 400);

    //> Castle
    this.add.image(worldWidth - (worldWidth / 75), propsY, 'castle').setOrigin(0.5, 1).setScale(screenHeight / 300);
}

function generateLevel() {
    //> Creating the platform

    // pieceStart will be the next platform piece start pos. This value will be modified after each execution
    let pieceStart = screenWidth;
    // This will tell us if last generated piece of platform was empty, to avoid generating another empty piece next to it.
    let lastWasHole = 0;
    // Structures will generate every 2/3 platform pieces
    let lastWasStructure = 0;

    this.platformGroup = this.add.group();
    this.fallProtectionGroup = this.add.group();
    this.blocksGroup = this.add.group();
    this.constructionBlocksGroup = this.add.group();
    this.misteryBlocksGroupCoin = this.add.group();
    this.misteryBlocksGroupMushroom = this.add.group();
    this.misteryBlocksGroupFireflower = this.add.group();
    this.immovableBlocksGroup = this.add.group();
    this.groundCoinsGroup = this.add.group();

    if (!isLevelOverworld) {
        this.blocksGroup.add(this.add.tileSprite(screenWidth, screenHeight - platformHeight / 1.2, 16, screenHeight - platformHeight, 'construction-block').setScale(screenHeight / 345).setOrigin(0, 1));
        this.undergroundRoof = this.add.tileSprite(screenWidth * 1.2, screenHeight / 20, worldWidth / 2.68, 16, 'construction-block').setScale(screenHeight / 345).setOrigin(0);
        this.blocksGroup.add(this.undergroundRoof);
    }

    for (i = 0; i <= platformPieces; i++) {
        // Holes will have a 10% chance of spawning
        let number = 0;

        // Check if its not a hole, this means is not that 20%, is not in the spawn safe area and is not close to the end castle.
        if (pieceStart >= (lastWasHole > 0 || lastWasStructure > 0 || worldWidth - platformPiecesWidth * 4)
            || number <= 0 || pieceStart <= screenWidth * 2 || pieceStart >= worldWidth - screenWidth * 2) {
            lastWasHole--;

            //> Create platform
            let Npiece = this.add.tileSprite(pieceStart, screenHeight, platformPiecesWidth, platformHeight, 'floor-bricks')
                .setScale(2).setOrigin(0, 0.5);
            this.physics.add.existing(Npiece);
            Npiece.body.immovable = true;
            Npiece.body.allowGravity = false;
            Npiece.isPlatform = true;
            Npiece.depth = 2;
            this.platformGroup.add(Npiece);
            // Apply player collision with platform
            this.physics.add.collider(player, Npiece);

            //> Creating world structures

            if (!(pieceStart >= (worldWidth - screenWidth * (isLevelOverworld ? 1 : 1.5))) && pieceStart > (screenWidth + platformPiecesWidth * 2) && lastWasHole < 1 && lastWasStructure < 1) {
                lastWasStructure = generateStructure.call(this, pieceStart);
            }
            else {
                lastWasStructure--;
            }
        } else {
            // Save every hole start and end for later use
            worldHolesCoords.push({
                start: pieceStart,
                end: pieceStart + platformPiecesWidth * 2
            });

            lastWasHole = 2;
            this.fallProtectionGroup.add(this.add.rectangle(pieceStart + platformPiecesWidth * 2, screenHeight - platformHeight, 5, 5).setOrigin(0, 1));
            this.fallProtectionGroup.add(this.add.rectangle(pieceStart, screenHeight - platformHeight, 5, 5).setOrigin(1, 1));
        }
        pieceStart += platformPiecesWidth * 2;
    }

    this.startScreenTrigger = this.add.tileSprite(screenWidth, screenHeight - platformHeight, 32, 28, 'horizontal-tube').setScale(screenHeight / 345).setOrigin(1, 1);
    this.startScreenTrigger.depth = 4;
    this.physics.add.existing(this.startScreenTrigger);
    this.startScreenTrigger.body.allowGravity = false;
    this.startScreenTrigger.body.immovable = true;
    this.physics.add.collider(player, this.startScreenTrigger, startLevel, null, this);

    let invisibleWall2 = this.add.rectangle(screenWidth, screenHeight - platformHeight, 1, screenHeight).setOrigin(0.5, 1);
    this.physics.add.existing(invisibleWall2);
    invisibleWall2.body.allowGravity = false;
    invisibleWall2.body.immovable = true;
    this.physics.add.collider(player, invisibleWall2);
    this.fallProtectionGroup.add(invisibleWall2);

    if (!isLevelOverworld) {
        this.verticalTube = this.add.tileSprite(worldWidth - screenWidth, screenHeight - platformHeight, 32, screenHeight, 'vertical-extra-large-tube').setScale(screenHeight / 345).setOrigin(1, 1);
        this.verticalTube.depth = 2;
        this.physics.add.existing(this.verticalTube);
        this.verticalTube.body.allowGravity = false;
        this.verticalTube.body.immovable = true;
        this.physics.add.collider(player, this.verticalTube);

        this.finalTrigger = this.add.tileSprite(worldWidth - screenWidth * 1.03, screenHeight - platformHeight, 40, 31, 'horizontal-final-tube').setScale(screenHeight / 345).setOrigin(1, 1);
        this.finalTrigger.depth = 2;
        this.physics.add.existing(this.finalTrigger);
        this.finalTrigger.body.allowGravity = false;
        this.finalTrigger.body.immovable = true;
        this.physics.add.collider(player, this.finalTrigger, teleportToLevelEnd, null, this);

        let invisibleWall1 = this.add.rectangle(worldWidth - screenWidth, screenHeight - platformHeight, 1, screenHeight).setOrigin(0.5, 1);
        this.physics.add.existing(invisibleWall1);
        invisibleWall1.body.allowGravity = false;
        invisibleWall1.body.immovable = true;
        this.physics.add.collider(player, invisibleWall1);
        this.fallProtectionGroup.add(invisibleWall1);
    }

    this.fallProtectionGroup.getChildren().forEach(fallProtection => {
        this.physics.add.existing(fallProtection);
        fallProtection.body.allowGravity = false;
        fallProtection.body.immovable = true;
    });

    this.misteryBlocksGroupCoin.getChildren().forEach(misteryBlock => {
        this.physics.add.existing(misteryBlock);
        misteryBlock.body.allowGravity = false;
        misteryBlock.body.immovable = true;
        misteryBlock.depth = 2;
        misteryBlock.anims.play('mistery-block-default', true);
        this.physics.add.collider(player, misteryBlock, revealHiddenBlockCoin, null, this);
    });

        this.misteryBlocksGroupMushroom.getChildren().forEach(misteryBlock => {
        this.physics.add.existing(misteryBlock);
        misteryBlock.body.allowGravity = false;
        misteryBlock.body.immovable = true;
        misteryBlock.depth = 2;
        misteryBlock.anims.play('mistery-block-default', true);
        this.physics.add.collider(player, misteryBlock, revealHiddenBlockMushroom, null, this);
    });

    this.misteryBlocksGroupFireflower.getChildren().forEach(misteryBlock => {
        this.physics.add.existing(misteryBlock);
        misteryBlock.body.allowGravity = false;
        misteryBlock.body.immovable = true;
        misteryBlock.depth = 2;
        misteryBlock.anims.play('mistery-block-default', true);
        this.physics.add.collider(player, misteryBlock, revealHiddenBlockFireflower, null, this);
    });
    
    this.blocksGroup.getChildren().forEach(block => {
        this.physics.add.existing(block);
        block.body.allowGravity = false;
        block.body.immovable = true;
        block.depth = 2;
        this.physics.add.collider(player, block, destroyBlock, null, this);
    });

    this.constructionBlocksGroup.getChildren().forEach(constructionBlock => {
        this.physics.add.existing(constructionBlock);
        constructionBlock.isImmovable = true;
        constructionBlock.body.allowGravity = false;
        constructionBlock.body.immovable = true;
        constructionBlock.depth = 2;
        this.physics.add.collider(player, constructionBlock, destroyBlock, null, this);
    });

    this.immovableBlocksGroup.getChildren().forEach(immovableBlock => {
        this.physics.add.existing(immovableBlock);
        immovableBlock.body.allowGravity = false;
        immovableBlock.body.immovable = true;
        immovableBlock.depth = 2;
        this.physics.add.collider(player, immovableBlock);
    });

    this.groundCoinsGroup.getChildren().forEach(groundCoin => {
        this.physics.add.existing(groundCoin);
        groundCoin.anims.play('ground-coin-default', true);
        groundCoin.body.allowGravity = false;
        groundCoin.body.immovable = true;
        groundCoin.depth = 2;
        this.physics.add.overlap(player, groundCoin, collectCoin, null, this);
    });
}

// Function to draw the start screen
function drawStartScreen() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    this.add.rectangle(0, 0, screenWidth, screenHeight, 0x8585FF).setOrigin(0).depth = -1;

    let platform = this.add.tileSprite(0, screenHeight, screenWidth / 2, platformHeight, 'start-floor-bricks')
        .setScale(2)
        .setOrigin(0, 0.5);

    this.physics.add.existing(platform);
    platform.body.immovable = true;
    platform.body.allowGravity = false;

    this.physics.add.collider(player, platform);

    this.add.image(screenWidth / 50, screenHeight / 3, 'cloud1').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 1.25, screenHeight / 2, 'cloud1').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 1.05, screenHeight / 6.5, 'cloud2').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 3, screenHeight / 3.5, 'cloud2').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 2.65, screenHeight / 2.8, 'cloud2').setScale(screenHeight / 1725);

    this.add.image(screenWidth / 25, screenHeight / 10, 'sign').setOrigin(0).setScale(screenHeight / 350);

    let propsY = screenHeight - platformHeight;
    this.add.image(screenWidth / 50, propsY, 'mountain2').setOrigin(0, 1).setScale(screenHeight / 517);
    this.add.image(screenWidth / 300, propsY, 'mountain1').setOrigin(0, 1).setScale(screenHeight / 517);
    this.add.image(screenWidth / 4, propsY, 'bush1').setOrigin(0, 1).setScale(screenHeight / 609);
    this.add.image(screenWidth / 1.55, propsY, 'bush2').setOrigin(0, 1).setScale(screenHeight / 609);
    this.add.image(screenWidth / 1.5, propsY, 'bush2').setOrigin(0, 1).setScale(screenHeight / 609);
    this.add.tileSprite(screenWidth / 15, propsY, 350, 35, 'fence').setOrigin(0, 1).setScale(screenHeight / 863);

    this.customBlock = this.add.sprite(screenCenterX, screenHeight - (platformHeight * 1.9), 'custom-block').setScale(screenHeight / 345);
    this.customBlock.anims.play('custom-block-default');
    this.physics.add.collider(player, this.customBlock, function() {
        if (player.body.blocked.up) showSettings.call(this);
    }, null, this);

    this.physics.add.existing(this.customBlock);
    this.customBlock.body.allowGravity = false;
    this.customBlock.body.immovable = true;

    this.add.image(screenCenterX, screenHeight - (platformHeight * 1.9), 'gear')
        .setScale(screenHeight / 13000)
        .setInteractive()
        .on('pointerdown', () => showSettings.call(this));

    this.add.image(screenCenterX * 1.12, screenHeight - (platformHeight * 1.5), 'settings-bubble')
        .setScale(screenHeight / 620);

    this.add.sprite(screenCenterX * 1.07, screenHeight - platformHeight, 'npc')
        .setOrigin(0.5, 1)
        .setScale(screenHeight / 365)
        .anims.play('npc-default', true);
}
