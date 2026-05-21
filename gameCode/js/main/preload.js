function preload() {
    // Setup progress box, bar, and percent text
    const progressBox = this.add.graphics().fillStyle(0x222222, 1)
        .fillRoundedRect(screenWidth / 2.48, screenHeight / 2 * 1.05, screenWidth / 5.3, screenHeight / 20.7, 10);
    const progressBar = this.add.graphics();
    const percentText = this.make.text({
        x: this.cameras.main.width / 2,
        y: this.cameras.main.height / 2 * 1.25,
        text: '0%',
        style: {
            font: `${screenWidth / 96}px pixel_nums`,
            fill: '#ffffff'
        }
    }).setOrigin(0.5, 0.5);

    // Update progress bar and text on progress
    this.load.on('progress', (value) => {
        percentText.setText(value * 99 >= 99 ? 'Generating world...' : `Loading... ${parseInt(value * 99)}%`);
        progressBar.clear().fillStyle(0xffffff, 1)
            .fillRoundedRect(screenWidth / 2.45, screenHeight / 2 * 1.07, screenWidth / 5.6 * value, screenHeight / 34.5, 5);
    });

    // Clean up on load complete
    this.load.on('complete', () => {
        [progressBar, progressBox, percentText].forEach(item => item.destroy());
        loadingGif.forEach(gif => gif.style.display = 'none');
    });

    // Load Fonts and Plugins
    this.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
    const plugins = ['rexvirtualjoystickplugin', 'rexcheckboxplugin', 'rexsliderplugin', 'rexkawaseblurpipelineplugin'];
    plugins.forEach(plugin => {
        this.load.plugin(plugin, `https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/${plugin}.min.js`, true);
    });

    // Determine level style
    isLevelOverworld = Phaser.Math.Between(0, 100) <= 50;
    const levelStyle = isLevelOverworld ? 'overworld' : 'underground';

    // Utility functions for loading assets
    const loadSpriteSheet = (path, frameWidth, frameHeight) => {
        this.load.spritesheet(path.split('/').pop(), `assets/${path}.png`, { frameWidth, frameHeight });
    };
    const loadImage = (path) => {
        this.load.image(path.split('/').pop(), `assets/${path}.png`);
    };

    // Load entity sprites
    [{ path: 'mario', frameWidth: 18, frameHeight: 16 },
    { path: 'mario-grown', frameWidth: 18, frameHeight: 32 },
    { path: 'mario-fire', frameWidth: 18, frameHeight: 32 },
    { path: `${levelStyle}/goomba`, frameWidth: 16, frameHeight: 16 },
    { path: `Slime`, frameWidth: 16, frameHeight: 16 },
    { path: 'bat', frameWidth: 16, frameHeight: 16 },
    { path: 'koopa', frameWidth: 16, frameHeight: 24 },
    { path: 'shell', frameWidth: 16, frameHeight: 15 },
    { path: 'fireball', frameWidth: 8, frameHeight: 8 },
    { path: 'fireball-explosion', frameWidth: 16, frameHeight: 16 }]
        .forEach(item => loadSpriteSheet(`entities/${item.path}`, item.frameWidth, item.frameHeight));

    // Load collectibles
    [{ path: 'coin', frameWidth: 16, frameHeight: 16 },
    { path: 'underground/ground-coin', frameWidth: 10, frameHeight: 14 },
    { path: `${levelStyle}/fire-flower`, frameWidth: 16, frameHeight: 16 }]
        .forEach(item => loadSpriteSheet(`collectibles/${item.path}`, item.frameWidth, item.frameHeight));

    // Load animated blocks
    [{ path: `${levelStyle}/brick-debris`, frameWidth: 8, frameHeight: 8 },
    { path: `${levelStyle}/mistery-block`, frameWidth: 16, frameHeight: 16 },
    { path: 'overworld/custom-block', frameWidth: 16, frameHeight: 16 }]
        .forEach(item => loadSpriteSheet(`blocks/${item.path}`, item.frameWidth, item.frameHeight));

    // Load animated hud
    [{ path: 'npc', frameWidth: 16, frameHeight: 24 }]
        .forEach(hud => loadSpriteSheet(`hud/${hud.path}`, hud.frameWidth, hud.frameHeight));

    // Load mushrooms
    ['live', 'super']
        .forEach(item => loadImage(`collectibles/${item}-mushroom`));

    // Load normal scenery
    ['castle', 'flag-mast', 'final-flag', 'sign']
        .forEach(item => loadImage(`scenery/${item}`));

    // Load overworld scenery
    ['cloud1', 'cloud2', 'mountain1', 'mountain2', 'fence', 'bush1', 'bush2']
        .forEach(item => loadImage(`scenery/overworld/${item}`));

    // Load specific scenery
    ['floor-bricks']
        .forEach(item => loadImage(`scenery/${levelStyle}/${item}`));
    ['start-floor-bricks']
        .forEach(item => loadImage(`scenery/overworld/${item}`));

    // Load tubes
    ['horizontal', 'horizontal-final', 'vertical-small', 'vertical-medium', 'vertical-large', 'vertical-extra-large']
        .forEach(item => loadImage(`scenery/${item}-tube`));

    // Load HUD
    ['gear', 'settings-bubble']
        .forEach(item => loadImage(`hud/${item}`));

    // Load static blocks
    ['block', 'empty-block', 'immovable-block']
        .forEach(item => loadImage(`blocks/${levelStyle}/${item}`));
    ['construction-block']
        .forEach(item => loadImage(`blocks/underground/${item}`));
    

    // Load sounds (music and effects)
    this.sounds = [
        { path: 'music/overworld/overworld.mp3', volume: 0.15 },
        { path: 'music/underground/underground.mp3', volume: 0.15 },
        { path: `music/${levelStyle}/hurry-up.mp3`, volume: 0.15 },
        { path: 'music/game-over.mp3', volume: 0.3 },
        { path: 'music/win.wav', volume: 0.3 },
        { path: 'effects/jump.mp3', volume: 0.1 },
        { path: 'effects/coin.mp3', volume: 0.2 },
        { path: 'effects/power-up-appears.mp3', volume: 0.2 },
        { path: 'effects/consume-power-up.mp3', volume: 0.2 },
        { path: 'effects/power-down.mp3', volume: 0.3 },
        { path: 'effects/goomba-stomp.wav', volume: 1 },
        { path: 'effects/flagpole.mp3', volume: 0.3 },
        { path: 'effects/fireball.mp3', volume: 0.3 },
        { path: 'effects/kick.mp3', volume: 0.3 },
        { path: 'effects/time-warning.mp3', volume: 0.2 },
        { path: 'effects/pause.wav', volume: 0.17 },
        { path: 'effects/block-bump.wav', volume: 0.3 },
        { path: 'effects/break-block.wav', volume: 0.5 },
        { path: Phaser.Math.Between(0, 100) < 98 ? 'effects/here-we-go.mp3' : 'effects/cursed/here-we-go.mp3', volume: 0.17 }
    ];

    const generateKey = path => path.split('/').pop().split('.')[0].replace(/-./g, match => match.charAt(1).toUpperCase()) + 'Sound';
    this.sounds.forEach(sound => {
        sound.key = generateKey(sound.path);
        this.load.audio(sound.key, `assets/sound/${sound.path}`);
    });
}

function initSounds() {
    this.sounds.forEach(sound => {
        this[sound.key] = this.sound.add(sound.key, { volume: sound.volume });
    });
    this.overworldSound.play({ loop: -1 });
}

function createAnimations() {
    const singleFrameAnimations = [
        { key: 'idle', target: 'mario', frame: 0 },
        { key: 'hurt', target: 'mario', frame: 4 },
        { key: 'jump', target: 'mario', frame: 5 },
        { key: 'grown-mario-idle', target: 'mario-grown', frame: 0 },
        { key: 'grown-mario-crouch', target: 'mario-grown', frame: 4 },
        { key: 'grown-mario-jump', target: 'mario-grown', frame: 5 },
        { key: 'fire-mario-idle', target: 'mario-fire', frame: 0 },
        { key: 'fire-mario-crouch', target: 'mario-fire', frame: 4 },
        { key: 'fire-mario-jump', target: 'mario-fire', frame: 5 },
        { key: 'fire-mario-throw', target: 'mario-fire', frame: 6 },
        { key: 'goomba-idle', target: 'goomba', frame: 1 },
        { key: 'goomba-hurt', target: 'goomba', frame: 2 },
        { key: 'koopa-idle', target: 'koopa', frame: 1 },
        { key: 'koopa-hurt', target: 'koopa', frame: 0 },
        { key: 'koopa-shell', target: 'koopa', frame: 1 },
        { key: 'slime-idle', target: 'Slime', frame: 2 },
        { key: 'slime-hurt', target: 'Slime', frame: 7 },
        { key: 'bat-idle', target: 'bat', frame: 0},
        { key: 'bat-hurt', target: 'bat', frame: 0},
        { key: 'fireball-left-down', target: 'fireball', frame: 0 },
        { key: 'fireball-left-up', target: 'fireball', frame: 1 },
        { key: 'fireball-right-down', target: 'fireball', frame: 2 },
        { key: 'fireball-right-up', target: 'fireball', frame: 3 },
        { key: 'fireball-explosion-1', target: 'fireball-explosion', frame: 0 },
        { key: 'fireball-explosion-2', target: 'fireball-explosion', frame: 1 },
        { key: 'fireball-explosion-3', target: 'fireball-explosion', frame: 2 },
    ];

    const multiFrameAnimations = [
        { key: 'run', target: 'mario', start: 3, end: 1, frameRate: 12, repeat: -1 },
        { key: 'grown-mario-run', target: 'mario-grown', start: 3, end: 1, frameRate: 12, repeat: -1 },
        { key: 'fire-mario-run', target: 'mario-fire', start: 3, end: 1, frameRate: 12, repeat: -1 },
        { key: 'goomba-walk', target: 'goomba', start: 0, end: 1, frameRate: 8, repeat: -1 },
        { key: 'koopa-walk', target: 'koopa', start: 0, end: 1, frameRate: 8, repeat: -1 },
        { key: 'slime-walk', target: 'Slime', start: 0, end: 7, frameRate: 8, repeat: -1 },
        { key: 'bat-fly', target: 'bat', start: 0, end: 1, frameRate: 8, repeat: -1},
        { key: 'coin-default', target: 'coin', start: 0, end: 3, frameRate: 10, repeat: -1 },
        { key: 'ground-coin-default', target: 'ground-coin', start: 2, end: 0, frameRate: 5, repeat: -1, repeatDelay: 5 },
        { key: 'mistery-block-default', target: 'mistery-block', start: 2, end: 0, frameRate: 5, repeat: -1, repeatDelay: 5 },
        { key: 'custom-block-default', target: 'custom-block', start: 2, end: 0, frameRate: 5, repeat: -1, repeatDelay: 5 },
        { key: 'brick-debris-default', target: 'brick-debris', start: 0, end: 3, frameRate: 4, repeat: -1 },
        { key: 'fire-flower-default', target: 'fire-flower', start: 0, end: 3, frameRate: 6, repeat: -1 },
        { key: 'npc-default', target: 'npc', start: 0, end: 1, frameRate: 2, repeat: -1, repeatDelay: 10 },
    ];

    singleFrameAnimations.forEach(({ key, target, frame }) => {
        this.anims.create({
            key,
            frames: [{ key: target, frame }]
        });
    });

    multiFrameAnimations.forEach(({ key, target, start, end, frameRate, repeat, repeatDelay = 0 }) => {
        this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(target, { start, end }),
            frameRate,
            repeat,
            repeatDelay
        });
    });
}

