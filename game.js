const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1920;
canvas.height = 1152;

const world = {
    settings: {
        width: 15000,
        height: 15000,
        RENDER_PADDING: 200,

        biomeSettings: {
            visibleX: 0,
            visibleY: 0,
            visibleWidth: 0,
            visibleHeight: 0,

            update(camera) {
                this.visibleX = Math.max(0, camera.x - world.settings.RENDER_PADDING);
                this.visibleY = Math.max(0, camera.y - world.settings.RENDER_PADDING);
                this.visibleWidth = Math.min(
                    world.settings.width - this.visibleX,
                    camera.width + world.settings.RENDER_PADDING * 2
                );
                this.visibleHeight = Math.min(
                    world.settings.height - this.visibleY,
                    camera.height + world.settings.RENDER_PADDING * 2
                );
            }
        },

        gridSettings: {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,

            update(camera) {
                this.startX = Math.floor((camera.x - world.settings.RENDER_PADDING) / 90) * 90;
                this.startY = Math.floor((camera.y - world.settings.RENDER_PADDING) / 90) * 90;
                this.endX = Math.ceil((camera.x + camera.width + world.settings.RENDER_PADDING) / 90) * 90;
                this.endY = Math.ceil((camera.y + camera.height + world.settings.RENDER_PADDING) / 90) * 90;
            }
        }
    },

    biomes: [
        { name: "default forest", x: 0, y: 0, width: 15000, height: 15000, backgroundColor: "#788f57" },
        { name: "winter", x: 0, y: 0, width: 15000, height: 3000, backgroundColor: "#ccccdf" },
        { name: "first river", x: 0, y: 3000, width: 15000, height: 750, backgroundColor: "#2c8c9c" },
        { name: "top forest", x: 0, y: 4800, width: 15000, height: 950, backgroundColor: "#779736" },
        { name: "second river", x: 0, y: 5750, width: 15000, height: 1000, backgroundColor: "#3465aa" },
        { name: "bottom forest", x: 0, y: 6750, width: 15000, height: 950, backgroundColor: "#779736" },
        { name: "desert", x: 0, y: 9000, width: 15000, height: 3000, backgroundColor: "#b88454" }
    ],

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
};

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
        this.maxSpeed = 5;
        this.acceleration = 0.5;
        this.friction = 0.90;
        this.velocityX = 0;
        this.velocityY = 0;

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
            textures.skins.basic[1].img,
            -this.rightHandDistanceX - this.size/2,
            this.rightHandDistanceY - this.size/2,
            this.handSize,
            this.handSize
        );

        ctx.drawImage(
            textures.skins.basic[1].img,
            this.leftHandDistanceX - this.size/2,
            this.leftHandDistanceY - this.size/2,
            this.handSize,
            this.handSize
        );

        ctx.drawImage(
            textures.skins.basic[0].img,
            -this.size/2,
            -this.size/2,
            this.size,
            this.size
        );

        ctx.restore();
    }
}

class LocalPlayer extends Player {
    update(deltaTime) {
        const timeScale = 60;

        if (keys["KeyW"]) this.velocityY -= this.acceleration * deltaTime * timeScale;
        if (keys["KeyS"]) this.velocityY += this.acceleration * deltaTime * timeScale;
        if (keys["KeyA"]) this.velocityX -= this.acceleration * deltaTime * timeScale;
        if (keys["KeyD"]) this.velocityX += this.acceleration * deltaTime * timeScale;

        const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (currentSpeed > this.maxSpeed) {
            this.velocityX = (this.velocityX / currentSpeed) * this.maxSpeed;
            this.velocityY = (this.velocityY / currentSpeed) * this.maxSpeed;
        }

        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        if (Math.abs(this.velocityX) < 0.05) this.velocityX = 0;
        if (Math.abs(this.velocityY) < 0.05) this.velocityY = 0;

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.x = Math.max(-15, Math.min(this.x, world.settings.width));
        this.y = Math.max(-15, Math.min(this.y, world.settings.height));

        this.updateCenters();
    }
}

class OtherPlayer extends Player {
    constructor() {
        super();
        this.targetX = 0;
        this.targetY = 0;
        this.targetAngle = 0;
    }

    update(deltaTime) {
        this.x += (this.targetX - this.x) * 0.3 * deltaTime * 60;
        this.y += (this.targetY - this.y) * 0.3 * deltaTime * 60;
        this.angle += (this.targetAngle - this.angle) * 0.3 * deltaTime * 60;

        this.updateCenters();
    }
}

const player = new LocalPlayer();
const otherPlayers = new Map();

const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,

    update() {
        const targetX = player.centerX - this.width/2;
        const targetY = player.centerY - this.height/2;

        this.x += (targetX - this.x) * 0.12;
        this.y += (targetY - this.y) * 0.12;
    }
};

const textures = {
    skins: {
        basic: [
            { img: new Image(), src: "images/skins/body01.png" },
            { img: new Image(), src: "images/skins/arm01.png" }
        ],
    }
};

const keys = {};
const mouse = { x: 0, y: 0 };

const ws = new WebSocket('wss://cyan-llamas-cover.loca.lt');


const MESSAGE_TYPES = {
    PING: 'ping',
    PONG: 'pong',
    PLAYER_UPDATE: 'playerUpdate',
    PLAYER_MOVE: 'playerMove',
    PLAYER_LEFT: 'playerLeft'
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === MESSAGE_TYPES.PONG) ping = Date.now() - lastPingTime;

    else if (data.type === MESSAGE_TYPES.PLAYER_MOVE) {
        let otherPlayer = otherPlayers.get(data.playerId);

        if (!otherPlayer) {
            otherPlayer = new OtherPlayer();
            otherPlayers.set(data.playerId, otherPlayer);
        }

        otherPlayer.targetX = data.x;
        otherPlayer.targetY = data.y;
        otherPlayer.targetAngle = data.angle;
    }

    else if (data.type === MESSAGE_TYPES.PLAYER_LEFT) {
        otherPlayers.delete(data.playerId);
    }
};
let ping = 0;
let lastPingTime = 0;

setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        lastPingTime = Date.now();
        ws.send(JSON.stringify({type: 'ping'}));
    }
    document.getElementById('ping').textContent = ping;
}, 500);

window.addEventListener("keydown", (event) => { keys[event.code] = true; });
window.addEventListener("keyup", (event) => { keys[event.code] = false; });
window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    player.angle = Math.atan2(mouse.y - player.screenCenterY, mouse.x - player.screenCenterX);
});

let lastTime = 0;
function gameLoop(currentTime) {
    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    player.update(deltaTime);
    otherPlayers.forEach(otherPlayer => {
        otherPlayer.update(deltaTime);
    });

    camera.update();

    player.updateScreenPosition(camera);
    otherPlayers.forEach(otherPlayer => {
        otherPlayer.updateScreenPosition(camera);
    });

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: MESSAGE_TYPES.PLAYER_UPDATE,
            x: player.x,
            y: player.y,
            angle: player.angle
        }));
    }

    world.draw(camera);
    player.draw();
    otherPlayers.forEach(otherPlayer => {
        if (otherPlayer.isVisible(camera)) otherPlayer.draw();
    });

    requestAnimationFrame(gameLoop);
}

let loadedCount = 0;
const allTextures = [...textures.skins.basic];

allTextures.forEach(texture => {
    texture.img.onload = () => {
        loadedCount++;
        if (loadedCount === allTextures.length) gameLoop();
    };
    texture.img.src = texture.src;

});
