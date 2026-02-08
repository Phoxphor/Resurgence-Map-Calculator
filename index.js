const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const mapImg = new Image();
mapImg.src = 'Map.jpg';

/** CONFIG BULL SHIT **/
const PLAYER_SPEED = 48; 
const HUMAN_ERROR_BUFFER = 1.5;
const MIN_ZOOM = 0.2; 
const MAX_ZOOM = 5.0;

/** MASTER LANDMARKS PORT **/
const MASTER_DATA = [{"x":560,"y":316,"type":"EXTRACT","label":"2345, 1375","gx":2345,"gy":1375},{"x":1113,"y":801,"type":"EXTRACT","label":"-1122, -1756","gx":-1122,"gy":-1756},{"x":928.2804180666083,"y":134.0164079713129,"type":"EXTRACT","label":"72, 2448","gx":72,"gy":2448},{"x":723,"y":847,"type":"BRIEF","label":"1119, -2009","gx":1119,"gy":-2009},{"x":669,"y":830,"type":"BLUE","label":"1637, -1912","gx":1637,"gy":-1912},{"x":689,"y":881,"type":"SAFE","label":"1488, -2371","gx":1488,"gy":-2371},{"x":662,"y":966,"type":"EXTRACT","label":"1768, -2815","gx":1768,"gy":-2815},{"x":1087,"y":398,"type":"GREEN","label":"-1209, 728","gx":-1209,"gy":728},{"x":1109,"y":405,"type":"BRIEF","label":"-1589, 755","gx":-1589,"gy":755},{"x":1086.0804180666082,"y":246.8164079713129,"type":"RED","label":"-1048, 1726","gx":-1048,"gy":1726},{"x":1095.4804180666083,"y":223.2164079713129,"type":"SAFE","label":"-1177, 1834","gx":-1177,"gy":1834},{"x":717,"y":426,"type":"RED","label":"1317, 596","gx":1317,"gy":596},{"x":691,"y":324,"type":"BLUE","label":"1488, 1239","gx":1488,"gy":1239},{"x":663,"y":302,"type":"BRIEF","label":"1672, 1378","gx":1672,"gy":1378},{"x":599,"y":228,"type":"RED","label":"2093, 1845","gx":2093,"gy":1845},{"x":596,"y":191,"type":"SAFE","label":"2112, 2078","gx":2112,"gy":2078},{"x":621,"y":136,"type":"BRIEF","label":"1948, 2425","gx":1948,"gy":2425},{"x":504.5359640180383,"y":78.91629194261012,"type":"EXTRACT","label":"2810, 2734","gx":2810,"gy":2734},{"x":756.7680851487163,"y":43.400431199511274,"type":"EXTRACT","label":"975, 2942","gx":975,"gy":2942},{"x":1287.2804180666083,"y":228.6164079713129,"type":"EXTRACT","label":"-2557, 1800","gx":-2557,"gy":1800},{"x":1413.585919310431,"y":480.08240572385085,"type":"EXTRACT","label":"-3347, 218","gx":-3347,"gy":218},{"x":1438.6185303040886,"y":636.1597218485776,"type":"EXTRACT","label":"-3498, -728","gx":-3498,"gy":-728},{"x":1287.5534576139914,"y":743.0059949004499,"type":"EXTRACT","label":"-2492, -1396","gx":-2492,"gy":-1396},{"x":492,"y":540,"type":"GREEN","label":"2797, -123","gx":2797,"gy":-123},{"x":506,"y":551,"type":"BRIEF","label":"2705, -192","gx":2705,"gy":-192},{"x":451,"y":574,"type":"SAFE","label":"3066, -337","gx":3066,"gy":-337},{"x":572,"y":678,"type":"SAFE","label":"2270, -993","gx":2270,"gy":-993},{"x":554,"y":684,"type":"BRIEF","label":"2389, -1031","gx":2389,"gy":-1031},{"x":767,"y":523,"type":"SAFE","label":"988, -16","gx":988,"gy":-16},{"x":687,"y":465,"type":"BRIEF","label":"1514, 350","gx":1514,"gy":350},{"x":1060,"y":505,"type":"BRIEF","label":"-939, 98","gx":-939,"gy":98},{"x":865,"y":578,"type":"BRIEF","label":"343, -362","gx":343,"gy":-362},{"x":1066,"y":693,"type":"BRIEF","label":"-979, -1087","gx":-979,"gy":-1087},{"x":1212.0815966287541,"y":811.8855073646067,"type":"BRIEF","label":"-2005, -1781","gx":-2005,"gy":-1781},{"x":1211.281596628754,"y":804.6855073646068,"type":"SAFE","label":"-1814, -1724","gx":-1814,"gy":-1724},{"x":853,"y":558,"type":"SAFE","label":"422, -236","gx":422,"gy":-236},{"x":1221,"y":534,"type":"SAFE","label":"-1998, -85","gx":-1998,"gy":-85},{"x":741,"y":624,"type":"BLUE","label":"1159, -652","gx":1159,"gy":-652},{"x":1175.8888854980469,"y":587,"type":"BRIEF","label":"-1701, -419","gx":-1701,"gy":-419},{"x":874.8888854980469,"y":184,"type":"LOCATION","label":"Brick House [279, 2124]","gx":279,"gy":2124},{"x":775.8888854980469,"y":214,"type":"LOCATION","label":"Metal Shack [930, 1935]","gx":930,"gy":1935},{"x":628.8888854980469,"y":193,"type":"LOCATION","label":"Dusty Depot [1923, 2162]","gx":1923,"gy":2162},{"x":712.8888854980469,"y":302,"type":"LOCATION","label":"Dig Site [1345, 1380]","gx":1345,"gy":1380},{"x":619.8888854980469,"y":610,"type":"LOCATION","label":"Cross Fire [2068, -457]","gx":2068,"gy":-457},{"x":758.8888854980469,"y":822,"type":"LOCATION","label":"Airfeild [1042, -1901]","gx":1042,"gy":-1901},{"x":934.8888854980469,"y":774,"type":"LOCATION","label":"Watch Tower [-162, -1548]","gx":-162,"gy":-1548},{"x":970.8888854980469,"y":810,"type":"LOCATION","label":"Brick House [-286, -1750]","gx":-286,"gy":-1750},{"x":889.8888854980469,"y":637,"type":"LOCATION","label":"Bridge [180, -627]","gx":180,"gy":-627},{"x":942.8888854980469,"y":541,"type":"LOCATION","label":"Fishing Village [-168, 4]","gx":-168,"gy":4},{"x":1024.129858213574,"y":201.178800791704,"type":"LOCATION","label":"Watch Tower [-707, 2027]","gx":-707,"gy":2027},{"x":1156.0972068320184,"y":372.7052838826638,"type":"LOCATION","label":"Bunker Lift [-1570, 942]","gx":-1570,"gy":942},{"x":981.0344315141286,"y":396.4087627187644,"type":"LOCATION","label":"Barracks [-417, 792]","gx":-417,"gy":792},{"x":1065.9514763863472,"y":406.0244648737524,"type":"LOCATION","label":"Bunker [-976, 732]","gx":-976,"gy":732},{"x":1127.4483800108287,"y":643.3229650993346,"type":"LOCATION","label":"Cabin [-1381, -762]","gx":-1381,"gy":-762},{"x":1070.9556962559316,"y":692.4798218125717,"type":"LOCATION","label":"Watch Tower [-1009, -1071]","gx":-1009,"gy":-1071},{"x":1208.836975166696,"y":570.1970616985249,"type":"LOCATION","label":"Big Town [-1917, -301]","gx":-1917,"gy":-301},{"x":1334.8888854980469,"y":516,"type":"LOCATION","label":"Cabin [-2746, 29]","gx":-2746,"gy":29},{"x":1336.0804180666082,"y":298.0164079713129,"type":"LOCATION","label":"Cabin [-2755, 1413]","gx":-2755,"gy":1413},{"x":1212.281596628754,"y":796.4855073646067,"type":"LOCATION","label":"kill house [-1940, -1724]","gx":-1940,"gy":-1724},{"x":1220.8888854980469,"y":650,"type":"BLUE","label":"BLUE [-1997, -804]","gx":-1997,"gy":-804},{"x":809.0621814446947,"y":306.538871600125,"type":"LOCATION","label":"Cabin [716, 1358]","gx":716,"gy":1358}];

// Load from storage, but if empty, use the master list
let markers = JSON.parse(localStorage.getItem('savedMarkers')) || MASTER_DATA;
if (markers.length === 0) markers = MASTER_DATA;

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

/** THE BUFFERED CLAMP - ALLOWS PEEKING BUT PREVENTS LOSING THE MAP **/
function clampView() {
    const zoomedWidth = mapImg.width * targetView.zoom;
    const zoomedHeight = mapImg.height * targetView.zoom;
    
    // How many pixels MUST remain visible on screen at all times
    const buffer = -100; 

    // Horizontal Limits
    // Max Right: Map's left edge can't go further right than (Canvas Width - Buffer)
    // Max Left: Map's right edge can't go further left than (Buffer)
    const minX = buffer - zoomedWidth;
    const maxX = canvas.width - buffer;

    if (targetView.x < minX) targetView.x = minX;
    if (targetView.x > maxX) targetView.x = maxX;

    // Vertical Limits
    const minY = buffer - zoomedHeight;
    const maxY = canvas.height - buffer;

    if (targetView.y < minY) targetView.y = minY;
    if (targetView.y > maxY) targetView.y = maxY;
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
    clampView();
};

function screenToMap(sx, sy) {
    return { x: (sx - view.x) / view.zoom, y: (sy - view.y) / view.zoom };
}

function getMarkerAtPos(mapX, mapY) {
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
    clampView();
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
            clampView();
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
        targetView.x += e.clientX - lastMouseX;
        targetView.y += e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Apply clamping and force view to target for responsive feel
        clampView();
        view.x = targetView.x;
        view.y = targetView.y;
    }
});

window.addEventListener('mouseup', () => { isDragging = false; });

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    let newZoom = targetView.zoom + scaleAmount;
    if (newZoom < MIN_ZOOM) newZoom = MIN_ZOOM;
    if (newZoom > MAX_ZOOM) newZoom = MAX_ZOOM;

    const mapMouse = screenToMap(mouseX, mouseY);
    targetView.zoom = newZoom;
    view.zoom = newZoom; // Update immediate view for the coord math below
    
    targetView.x = mouseX - mapMouse.x * targetView.zoom;
    targetView.y = mouseY - mapMouse.y * targetView.zoom;
    
    clampView();
    // Match current view to target for zoom responsiveness
    view.x = targetView.x;
    view.y = targetView.y;
}, { passive: false });

function toggleVisibility() { showMarkers = !showMarkers; }

render();

// Made By Phoxphor
// Don't steal my code, don't be a bitch.
// Ps my code is complete dogshit yes i know theres a thousand ways to improve this shut the fuck up.
