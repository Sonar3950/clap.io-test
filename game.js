const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1920;
canvas.height = 1152;

class World {
    constructor() {
        this.settings = {
            width: 15000,
            height: 15000,
            RENDER_PADDING: 200,

            biomeSettings: {
                visibleX: 0,
                visibleY: 0,
                visibleWidth: 0,
                visibleHeight: 0,

                update: (camera) => {
                    this.settings.biomeSettings.visibleX = Math.max(0, camera.x - this.settings.RENDER_PADDING);
                    this.settings.biomeSettings.visibleY = Math.max(0, camera.y - this.settings.RENDER_PADDING);
                    this.settings.biomeSettings.visibleWidth = Math.min(
                        this.settings.width - this.settings.biomeSettings.visibleX,
                        camera.width + this.settings.RENDER_PADDING * 2
                    );
                    this.settings.biomeSettings.visibleHeight = Math.min(
                        this.settings.height - this.settings.biomeSettings.visibleY,
                        camera.height + this.settings.RENDER_PADDING * 2
                    );
                }
            },

            gridSettings: {
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,

                update: (camera) => {
                    this.settings.gridSettings.startX = Math.floor((camera.x - this.settings.RENDER_PADDING) / 90) * 90;
                    this.settings.gridSettings.startY = Math.floor((camera.y - this.settings.RENDER_PADDING) / 90) * 90;
                    this.settings.gridSettings.endX = Math.ceil((camera.x + camera.width + this.settings.RENDER_PADDING) / 90) * 90;
                    this.settings.gridSettings.endY = Math.ceil((camera.y + camera.height + this.settings.RENDER_PADDING) / 90) * 90;
                }
            }
        };

        this.biomes = [
            { name: "default forest", x: 0, y: 0, width: 15000, height: 15000, backgroundColor: "#788f57" },
            { name: "winter", x: 0, y: 0, width: 15000, height: 3000, backgroundColor: "#ccccdf" },
            { name: "first river", x: 0, y: 3000, width: 15000, height: 750, backgroundColor: "#2c8c9c" },
            { name: "top forest", x: 0, y: 4800, width: 15000, height: 950, backgroundColor: "#779736" },
            { name: "second river", x: 0, y: 5750, width: 15000, height: 1000, backgroundColor: "#3465aa" },
            { name: "bottom forest", x: 0, y: 6750, width: 15000, height: 950, backgroundColor: "#779736" },
            { name: "desert", x: 0, y: 9000, width: 15000, height: 3000, backgroundColor: "#b88454" }
        ];
    }

    draw(camera) {
        this.settings.biomeSettings.update(camera);
        this.settings.gridSettings.update(camera);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const biome of this.biomes) {
            if (biome.x < this.settings.biomeSettings.visibleX + this.settings.biomeSettings.visibleWidth &&
                biome.x + biome.width > this.settings.biomeSettings.visibleX &&
                biome.y < this.settings.biomeSettings.visibleY + this.settings.biomeSettings.visibleHeight &&
                biome.y + biome.height > this.settings.biomeSettings.visibleY) {

                ctx.fillStyle = biome.backgroundColor;
                ctx.fillRect(
                    biome.x - camera.x,
                    biome.y - camera.y,
                    biome.width,
                    biome.height
                );
            }
        }

        ctx.strokeStyle = "rgba(59, 60, 54, 0.1)";
        ctx.lineWidth = 5;

        for (let x = this.settings.gridSettings.startX; x <= this.settings.gridSettings.endX; x += 90) {
            ctx.beginPath();
            ctx.moveTo(x - camera.x, this.settings.gridSettings.startY - camera.y);
            ctx.lineTo(x - camera.x, this.settings.gridSettings.endY - camera.y);
            ctx.stroke();
        }

        for (let y = this.settings.gridSettings.startY; y <= this.settings.gridSettings.endY; y += 90) {
            ctx.beginPath();
            ctx.moveTo(this.settings.gridSettings.startX - camera.x, y - camera.y);
            ctx.lineTo(this.settings.gridSettings.endX - camera.x, y - camera.y);
            ctx.stroke();
        }
    }
}

class Player {
    constructor(x = 100, y = 100) {
        this.x = x;
        this.y = y;
        this.centerX = 0;
        this.centerY = 0;
        this.screenX = 0;
        this.screenY = 0;
        this.screenCenterX = 0;
        this.screenCenterY = 0;
        this.angle = 0;
        this.size = 70;
        this.handSize = 30;
        this.leftHandDistanceX = 40;
        this.rightHandDistanceX = -40;
        this.leftHandDistanceY = -5;
        this.rightHandDistanceY = 45;

        this.updateCenters();
    }

    updateCenters() {
        this.centerX = this.x + this.size/2;
        this.centerY = this.y + this.size/2;
    }

    updateScreenPosition(camera) {
        this.screenX = this.x - camera.x;
        this.screenY = this.y - camera.y;
        this.screenCenterX = this.screenX + this.size/2;
        this.screenCenterY = this.screenY + this.size/2;
    }

    isVisible(camera) {
        return this.x < camera.x + camera.width + 100 &&
            this.x + this.size > camera.x - 100 &&
            this.y < camera.y + camera.height + 100 &&
            this.y + this.size > camera.y - 100;
    }

    draw() {
        ctx.save();
        ctx.translate(this.screenCenterX, this.screenCenterY);
        ctx.rotate(this.angle);

        ctx.drawImage(
            gameManager.textures.skins.basic[1].img,
            -this.rightHandDistanceX - this.size/2,
            this.rightHandDistanceY - this.size/2,
            this.handSize,
            this.handSize
        );

        ctx.drawImage(
            gameManager.textures.skins.basic[1].img,
            this.leftHandDistanceX - this.size/2,
            this.leftHandDistanceY - this.size/2,
            this.handSize,
            this.handSize
        );

        ctx.drawImage(
            gameManager.textures.skins.basic[0].img,
            -this.size/2,
            -this.size/2,
            this.size,
            this.size
        );

        ctx.restore();
    }
}

class LocalPlayer extends Player {
    constructor(x = 100, y = 100) {
        super(x, y);
        this.targetX = x;
        this.targetY = y;
    }

    update(deltaTime) {
        const input = {
            up: gameManager.keys["KeyW"],
            down: gameManager.keys["KeyS"],
            left: gameManager.keys["KeyA"],
            right: gameManager.keys["KeyD"]
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'playerInput', input, angle: this.angle }));
        }


        const lerpFactor = 0.18;
        this.x += (this.targetX - this.x) * lerpFactor;
        this.y += (this.targetY - this.y) * lerpFactor;
        this.updateCenters();
    }
}

class OtherPlayer extends Player {
    constructor() {
        super();
        this.targetX = 0;
        this.targetY = 0;
        this.targetAngle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    update(deltaTime) {
        const lerpFactor = 0.3;
        this.x += (this.targetX - this.x) * lerpFactor;
        this.y += (this.targetY - this.y) * lerpFactor;
        this.angle += (this.targetAngle - this.angle) * lerpFactor;

        this.updateCenters();
    }
}

class GameManager {
    constructor(canvas, world, player) {
        this.canvas = canvas;
        this.world = world;
        this.player = player;

        this.camera = {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            update: () => {
                const targetX = player.x + player.size/2 - this.camera.width/2;
                const targetY = player.y + player.size/2 - this.camera.height/2;
                this.camera.x += (targetX - this.camera.x) * 0.12;
                this.camera.y += (targetY - this.camera.y) * 0.12;
            }
        };

        this.keys = {};
        this.mouse = { x: 0, y: 0 };

        this.textures = {
            skins: {
                basic: [
                    { img: new Image(), src: "images/skins/body01.png" },
                    { img: new Image(), src: "images/skins/arm01.png" }
                ],
            }
        };

        this.setupEventListeners();
    }

    loadTextures(callback) {
        let loadedCount = 0;
        const allTextures = [...this.textures.skins.basic];

        allTextures.forEach(texture => {
            texture.img.onload = () => {
                loadedCount++;
                if (loadedCount === allTextures.length) callback();
            };
            texture.img.src = texture.src;
        });
    }

    setupEventListeners() {
        window.addEventListener("keydown", (event) => {
            this.keys[event.code] = true;
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.code] = false;
        });

        window.addEventListener("mousemove", (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            this.player.angle = Math.atan2(
                this.mouse.y - this.player.screenCenterY,
                this.mouse.x - this.player.screenCenterX
            );
        });
    }
}

const world = new World();
const player = new LocalPlayer();
const otherPlayers = new Map();
const gameManager = new GameManager(canvas, world, player);

const ws = new WebSocket('wss://cute-trains-repair.loca.lt');
let ping = 0;
let lastPingTime = 0;

const MESSAGE_TYPES = {
    PING: 'ping',
    PONG: 'pong',
    PLAYER_UPDATE: 'playerUpdate',
    PLAYER_MOVE: 'playerMove',
    PLAYER_LEFT: 'playerLeft'
};

let myPlayerId = null;

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'PLAYER_ID') {
        myPlayerId = data.playerId;
        console.log('Мой ID:', myPlayerId);
    }
    else if (data.type === MESSAGE_TYPES.PONG) {
        ping = Date.now() - lastPingTime;
    }
    else if (data.type === MESSAGE_TYPES.PLAYER_MOVE) {
        if (data.playerId === myPlayerId) {
            player.targetX = data.x;
            player.targetY = data.y;
        }
        else {
            let otherPlayer = otherPlayers.get(data.playerId);
            if (!otherPlayer) {
                otherPlayer = new OtherPlayer();
                otherPlayers.set(data.playerId, otherPlayer);
            }
            otherPlayer.targetX = data.x;
            otherPlayer.targetY = data.y;
            otherPlayer.targetAngle = data.angle;
            otherPlayer.velocityX = data.velocityX || 0;
            otherPlayer.velocityY = data.velocityY || 0;
        }
    }
    else if (data.type === MESSAGE_TYPES.PLAYER_LEFT) {
        otherPlayers.delete(data.playerId);
    }
};

setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        lastPingTime = Date.now();
        ws.send(JSON.stringify({type: 'ping'}));
    }
    document.getElementById('ping').textContent = ping;
}, 500);

let lastTime = 0;
function gameLoop(currentTime) {

    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    player.update(deltaTime);
    otherPlayers.forEach(otherPlayer => {
        otherPlayer.update(deltaTime);
    });

    gameManager.camera.update();

    player.updateScreenPosition(gameManager.camera);
    otherPlayers.forEach(otherPlayer => {
        otherPlayer.updateScreenPosition(gameManager.camera);
    });

    world.draw(gameManager.camera);
    player.draw();
    otherPlayers.forEach(otherPlayer => {
        if (otherPlayer.isVisible(gameManager.camera)) otherPlayer.draw();
    });

    requestAnimationFrame(gameLoop);
}

gameManager.loadTextures(() => {
    gameLoop();
})
