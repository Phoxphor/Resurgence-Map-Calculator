const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const mapImg = new Image();
mapImg.src = 'Map.jpg';

/** CONFIG BULL SHIT **/
const PLAYER_SPEED = 48; 
const HUMAN_ERROR_BUFFER = 1.5;
const MIN_ZOOM = 0.2; 
const MAX_ZOOM = 5.0;

let markers = JSON.parse(localStorage.getItem('savedMarkers')) || [];
let showMarkers = true;
let mouseX = 0, mouseY = 0;

let isWaitingForLocationClick = false;
let pendingAirdropCalculation = false; 

let searchTargetType = null; 
let activeTarget = null; 
let pulseEndTime = 0;
let mapConfig = { active: false, scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };

let view = { x: 0, y: 0, zoom: 0.8 };
let targetView = { x: 0, y: 0, zoom: 0.8 }; 
let isDragging = false;       
let lastMouseX = 0, lastMouseY = 0;

const colors = { 
    GREEN: '#6AD44C', BLUE: '#4C92D4', RED: '#EB564F', 
    SAFE: '#F3E57A', BRIEF: '#714E2E', EXTRACT: '#AD30D3', 
    LOCATION: '#ffffff', AIRDROP: '#ffff00', PLAYER: '#00ffff' 
};

/** HELPER FUNCTIONS **/
function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getCleanName(label) {
    if (!label) return "";
    return label.split('[')[0].split(/[0-9-]/)[0].trim();
}

mapImg.onload = () => { 
    canvas.width = window.innerWidth - 280; 
    canvas.height = window.innerHeight;
    extractCoords(); 
    saveAndRender(); 
};

window.onresize = () => {
    canvas.width = window.innerWidth - 280;
    canvas.height = window.innerHeight;
};

function screenToMap(sx, sy) {
    return { x: (sx - view.x) / view.zoom, y: (sy - view.y) / view.zoom };
}

// fixed a issue where hitbox logic capped to prevent "super-grabbing" when zoomed out.
function getMarkerAtPos(mapX, mapY) {
    // Clamp the radius so it doesn't become huge when zoomed out :3
    const baseRadius = 30; 
    const hitRadius = Math.min(baseRadius / view.zoom, 60); 
    
    const candidates = markers.filter(m => Math.sqrt((mapX - m.x)**2 + (mapY - m.y)**2) < hitRadius);
    if (candidates.length === 0) return null;
    
    const priority = candidates.find(m => m.type === 'PLAYER' || m.type === 'AIRDROP');
    if (priority) return priority;
    return candidates[0];
}

function zoomToFit(p1, p2) {
    const padding = 200; 
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);
    let zoomX = (canvas.width - padding) / (dx || 1);
    let zoomY = (canvas.height - padding) / (dy || 1);
    let newZoom = Math.min(zoomX, zoomY, 1.2); 
    newZoom = Math.max(newZoom, MIN_ZOOM);
    targetView.zoom = newZoom;
    targetView.x = (canvas.width / 2) - (centerX * newZoom);
    targetView.y = (canvas.height / 2) - (centerY * newZoom);
}

function updateTacticalHUD(player, target) {
    const statusBox = document.getElementById('cal-info');
    activeTarget = target;
    pulseEndTime = Date.now() + 15000; 
    const distToTarget = Math.sqrt((player.gx - target.gx)**2 + (player.gy - target.gy)**2);
    const direction = getDirection(player, target);
    const rawSeconds = Math.round((distToTarget / PLAYER_SPEED) * HUMAN_ERROR_BUFFER);
    const readableTime = formatTime(rawSeconds);
    
    statusBox.innerHTML = `<strong>OBJECTIVE:</strong><br>${getCleanName(target.label)}<br><strong>BEARING:</strong> ${direction.toUpperCase()}<br><strong>RANGE:</strong> ${Math.round(distToTarget)}M<br><strong>ETA:</strong> ${readableTime}`;
    zoomToFit(player, target);
}

function getDirection(from, to) {
    const dNorth = to.gx - from.gx; 
    const dEast = to.gy - from.gy;   
    let angle = Math.atan2(dEast, dNorth) * (180 / Math.PI); 
    if (angle < 0) angle += 360;
    const dirs = ["North", "North East", "East", "South East", "South", "South West", "West", "North West"];
    return dirs[Math.round(angle / 45) % 8];
}

function extractCoords() {
    markers.forEach(m => {
        const parts = m.label.match(/-?\d+(\.\d+)?/g);
        if (parts && parts.length >= 2) { 
            m.gx = parseFloat(parts[0]); 
            m.gy = parseFloat(parts[1]); 
        }
    });
}

function getGameCoords(mx, my) {
    if (mapConfig.active) return { x: Math.round(mx * mapConfig.scaleX + mapConfig.offsetX), y: Math.round(my * mapConfig.scaleY + mapConfig.offsetY), calibrated: true };
    return { x: 0, y: 0, calibrated: false };
}

function getPixelFromGame(gx, gy) {
    if (!mapConfig.active) return null;
    return { x: (gx - mapConfig.offsetX) / mapConfig.scaleX, y: (gy - mapConfig.offsetY) / mapConfig.scaleY };
}

/** CORE ACTIONS **/
function addAirdrop() {
    const input = prompt("Enter Airdrop Coords (X, Y):");
    if (!input) return;
    const p = input.match(/-?\d+(\.\d+)?/g);
    if (p && p.length >= 2) {
        const gx = parseFloat(p[0]), gy = parseFloat(p[1]);
        const mPos = getPixelFromGame(gx, gy) || {x: mapImg.width/2, y: mapImg.height/2};
        const airdropMark = { x: mPos.x, y: mPos.y, type: 'AIRDROP', label: `Airdrop [${gx}, ${gy}]`, gx, gy, timestamp: Date.now() };
        markers.push(airdropMark);
        saveAndRender();
        const player = markers.find(m => m.type === 'PLAYER');
        if (player) {
            updateTacticalHUD(player, airdropMark);
        } else {
            pendingAirdropCalculation = true; 
            isWaitingForLocationClick = true;
            targetView.zoom = 1.2;
            targetView.x = (canvas.width / 2) - (airdropMark.x * 1.2);
            targetView.y = (canvas.height / 2) - (airdropMark.y * 1.2);
            document.getElementById('cal-info').innerText = "AIRDROP ADDED. CLICK YOUR POSITION.";
        }
    }
}

function findNearest() {
    pendingAirdropCalculation = false;
    isWaitingForLocationClick = true;
    activeTarget = null;
    document.getElementById('cal-info').innerText = "CLICK YOUR POSITION...";
}

function showObjectiveMenu() {
    const statusBox = document.getElementById('cal-info');
    statusBox.innerHTML = `<strong>SELECT OBJECTIVE:</strong><div class="obj-list"></div>`;
    const list = statusBox.querySelector('.obj-list');
    const types = [
        { id: 'GREEN', label: 'Green Crate' }, { id: 'BLUE', label: 'Blue Crate' },
        { id: 'RED', label: 'Red Crate' }, { id: 'SAFE', label: 'Safe' },
        { id: 'BRIEF', label: 'Briefcase' }, { id: 'EXTRACT', label: 'Extraction' }
    ];
    types.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'obj-btn';
        btn.style.color = colors[t.id];
        btn.innerText = t.label;
        btn.onclick = () => selectObjective(t.id);
        list.appendChild(btn);
    });
}

function selectObjective(type) {
    searchTargetType = type;
    const playerMark = markers.find(m => m.type === 'PLAYER');
    if (!playerMark) return;
    const candidates = markers.filter(mark => mark.type === searchTargetType && mark.gx !== undefined);
    if (candidates.length > 0) {
        let nearest = candidates[0];
        let minDist = Infinity;
        candidates.forEach(c => {
            const d = Math.sqrt((playerMark.gx - c.gx)**2 + (playerMark.gy - c.gy)**2);
            if (d < minDist) { minDist = d; nearest = c; }
        });
        updateTacticalHUD(playerMark, nearest);
    } else {
        document.getElementById('cal-info').innerText = `NO ${type} FOUND`;
        setTimeout(() => showObjectiveMenu(), 2000);
    }
}

function saveAndRender() { 
    const truths = markers.filter(m => m.gx !== undefined && m.gy !== undefined);
    if (truths.length >= 2) {
        let sXp = 0, sYp = 0, sXg = 0, sYg = 0;
        truths.forEach(m => { sXp += m.x; sYp += m.y; sXg += m.gx; sYg += m.gy; });
        const aXp = sXp/truths.length, aYp = sYp/truths.length, aXg = sXg/truths.length, aYg = sYg/truths.length;
        let numX = 0, denX = 0, numY = 0, denY = 0;
        truths.forEach(m => {
            numX += (m.x - aXp) * (m.gx - aXg); denX += (m.x - aXp)**2;
            numY += (m.y - aYp) * (m.gy - aYg); denY += (m.y - aYp)**2;
        });
        mapConfig.scaleX = numX / (denX || 1); mapConfig.scaleY = numY / (denY || 1);
        mapConfig.offsetX = aXg - (aXp * mapConfig.scaleX); mapConfig.offsetY = aYg - (aYp * mapConfig.scaleY);
        mapConfig.active = true;
    }
    localStorage.setItem('savedMarkers', JSON.stringify(markers)); 
}

function render() {
    const lerp = 0.03; 
    if (!isDragging) {
        view.zoom += (targetView.zoom - view.zoom) * lerp;
        view.x += (targetView.x - view.x) * lerp;
        view.y += (targetView.y - view.y) * lerp;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(view.x, view.y);
    ctx.scale(view.zoom, view.zoom);
    ctx.drawImage(mapImg, 0, 0);

    const mapMouse = screenToMap(mouseX, mouseY);
    const hovered = getMarkerAtPos(mapMouse.x, mapMouse.y);
    const g = getGameCoords(mapMouse.x, mapMouse.y);

    markers.forEach(m => {
        const isCurrentlyPulsing = (m === activeTarget && Date.now() < pulseEndTime);
        const isAlwaysVisible = (m.type === 'PLAYER' || m.type === 'AIRDROP' || isCurrentlyPulsing);

        if (showMarkers || isAlwaysVisible) {
            if (isCurrentlyPulsing) {
                const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
                ctx.beginPath();
                ctx.arc(m.x, m.y, (10 + pulse * 30) / view.zoom, 0, Math.PI * 2);
                ctx.strokeStyle = colors[m.type];
                ctx.lineWidth = 4 / view.zoom;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(m.x, m.y, 8 / view.zoom, 0, Math.PI * 2);
            ctx.fillStyle = colors[m.type];
            ctx.fill();
            ctx.strokeStyle = isCurrentlyPulsing ? "white" : "rgba(255,255,255,0.8)";
            ctx.lineWidth = 2 / view.zoom;
            ctx.stroke();

            // Fixed a issue where only show labels if showMarkers is ON or if it's a priority icon
            if (showMarkers || m.type === 'PLAYER' || m.type === 'AIRDROP' || isCurrentlyPulsing) {
                if (m === hovered || isCurrentlyPulsing || m.type === 'PLAYER') {
                    ctx.font = `bold ${14 / view.zoom}px sans-serif`;
                    ctx.fillStyle = "white";
                    ctx.fillText(getCleanName(m.label), m.x + (12 / view.zoom), m.y - (12 / view.zoom));
                }
            }
        }
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let hudText = isWaitingForLocationClick ? "CLICK YOUR POSITION" : `X: ${g.x}, Y: ${g.y}`;
    let hudColor = isWaitingForLocationClick ? "#00ffff" : "#6AD44C";

    if (hovered && hovered.gx !== undefined) {
        hudText = `LOCKED: ${hovered.gx}, ${hovered.gy}`;
        hudColor = colors[hovered.type];
    }

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(mouseX+15, mouseY+15, ctx.measureText(hudText).width+12, 25);
    ctx.fillStyle = hudColor;
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(hudText, mouseX+21, mouseY+32);

    requestAnimationFrame(render);
}

/** INPUT HANDLERS **/
canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const mapPos = screenToMap(sx, sy);
    const m = getMarkerAtPos(mapPos.x, mapPos.y);

    if (e.button === 0) {
        if (isWaitingForLocationClick) {
            const myC = getGameCoords(mapPos.x, mapPos.y);
            const playerMark = { x: mapPos.x, y: mapPos.y, type: 'PLAYER', label: "Me", gx: myC.x, gy: myC.y, timestamp: Date.now() };
            markers = markers.filter(mark => mark.type !== 'PLAYER');
            markers.push(playerMark);
            isWaitingForLocationClick = false;
            if (pendingAirdropCalculation) {
                const lastDrop = markers.filter(mark => mark.type === 'AIRDROP').pop();
                if (lastDrop) updateTacticalHUD(playerMark, lastDrop);
                pendingAirdropCalculation = false;
            } else {
                showObjectiveMenu();
            }
            saveAndRender();
            return;
        }
    }

    if (e.button === 1 || (e.button === 0)) {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }

    if (e.button === 2) {
        e.preventDefault();
        if (m && (m.type === 'AIRDROP' || m.type === 'PLAYER')) {
            markers = markers.filter(mark => mark !== m);
            if (activeTarget === m) activeTarget = null;
            saveAndRender();
        }
    }
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
    if (isDragging) {
        view.x += e.clientX - lastMouseX;
        view.y += e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        targetView.x = view.x;
        targetView.y = view.y;
    }
});

window.addEventListener('mouseup', () => { isDragging = false; });

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    let newZoom = view.zoom + scaleAmount;
    if (newZoom < MIN_ZOOM) newZoom = MIN_ZOOM;
    if (newZoom > MAX_ZOOM) newZoom = MAX_ZOOM;
    const mapMouse = screenToMap(mouseX, mouseY);
    view.zoom = newZoom;
    view.x = mouseX - mapMouse.x * view.zoom;
    view.y = mouseY - mapMouse.y * view.zoom;
    targetView.zoom = view.zoom;
    targetView.x = view.x;
    targetView.y = view.y;
}, { passive: false });

function toggleVisibility() { showMarkers = !showMarkers; }

render();