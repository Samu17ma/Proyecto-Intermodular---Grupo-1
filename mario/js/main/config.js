const loadingGif = document.querySelectorAll('.loading-gif');

const mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight * 1.1;
const velocityX = screenWidth / 4.5;
const velocityY = screenHeight / 1.15;
const levelGravity = velocityY * 2;

const config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 0x8585FF,
    parent: 'game',
    preserveDrawingBuffer: true,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: levelGravity },
            debug: false
        }
    },
    scene: {
        key: 'level-1',
        preload: preload,
        create: create,
        update: update
    },
    version: '0.7.3'
};

const worldWidth = screenWidth * 11;
const platformHeight = screenHeight / 5;
const startOffset = screenWidth / 2.5;
const platformPieces = 100;
const platformPiecesWidth = (worldWidth - screenWidth) / platformPieces;
const mushroomsVelocityX = screenWidth / 15;
const goombasVelocityX = screenWidth / 19;

let isLevelOverworld;
let worldHolesCoords = [];
let emptyBlocksList = [];
let player, playerController;
let playerState = 0;
let playerInvulnerable = false;
let playerBlocked = false;
let playerFiring = false;
let playerSpeed = 0.001;
let fireInCooldown = false;
let furthestPlayerPos = 0;
let flagRaised = false;
let score = 0;
let timeLeft = 300;
let levelStarted = false;
let reachedLevelEnd = false;
let smoothedControls;
let gameOver = false;
let gameWinned = false;

const controlKeys = { 
    JUMP: null, 
    DOWN: null, 
    LEFT: null, 
    RIGHT: null, 
    FIRE: null 
};

const game = new Phaser.Game(config);

