const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const rooms = new Map();

function code() { return Math.random().toString(36).slice(2, 6).toUpperCase(); }
function roomState(room) { return { code: room.code, phase: room.phase, players: room.players, round: room.round, word: room.word, definitions: room.definitions, votes: room.votes, timer: room.timer, minister: room.minister, title: room.title }; }
function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); }
function read(req) { return new Promise(resolve => { let body = ''; req.on('data', c => body += c); req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); } }); }); }
function createRoom(name) {
  const room = { code: code(), phase: 'lobby', round: 1, word: 'SANDWICH', definitions: ['A tactical pillow for emergency naps', 'The State-approved shape of rebellion', 'Two breads holding a licensed thought', 'A tiny portable parliament'], votes: {}, timer: 10, minister: null, title: 'Citizen of Acceptable Taste', players: [{ id: Math.random().toString(36).slice(2), name: name || 'Host', score: 0, host: true }] };
  rooms.set(room.code, room); return room;
}
function findPlayer(room, id) { return room.players.find(p => p.id === id); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return fs.createReadStream(path.join(root, 'index.html')).pipe(res); }
  if (req.method === 'GET' && url.pathname === '/app.js') { res.writeHead(200, { 'Content-Type': 'application/javascript' }); return fs.createReadStream(path.join(root, 'app.js')).pipe(res); }
  if (req.method === 'GET' && url.pathname === '/style.css') { res.writeHead(200, { 'Content-Type': 'text/css' }); return fs.createReadStream(path.join(root, 'style.css')).pipe(res); }
  const body = await read(req);
  if (req.method === 'POST' && url.pathname === '/api/create') { const room = createRoom(body.name); return json(res, 200, { ...roomState(room), id: room.players[0].id }); }
  if (req.method === 'POST' && url.pathname === '/api/join') { const room = rooms.get((body.code || '').toUpperCase()); if (!room) return json(res, 404, { error: 'That regime does not exist yet.' }); const p = { id: Math.random().toString(36).slice(2), name: body.name || 'Anonymous Citizen', score: 0, host: false }; room.players.push(p); return json(res, 200, { ...roomState(room), id: p.id }); }
  const match = url.pathname.match(/^\/api\/room\/([A-Z0-9]+)$/);
  if (req.method === 'GET' && match) { const room = rooms.get(match[1]); return room ? json(res, 200, roomState(room)) : json(res, 404, { error: 'Room vanished.' }); }
  if (req.method === 'POST' && url.pathname === '/api/action') { const room = rooms.get((body.code || '').toUpperCase()); const player = room && findPlayer(room, body.id); if (!room || !player) return json(res, 404, { error: 'Session expired.' });
    if (body.action === 'start' && player.host) { room.phase = 'ballot'; room.minister = room.players[Math.floor(Math.random() * room.players.length)].id; room.timer = 10; }
    if (body.action === 'vote' && room.phase === 'ballot') { room.votes[player.id] = body.choice; }
    if (body.action === 'reveal' && player.host) { Object.entries(room.votes).forEach(([id, choice]) => { const p = findPlayer(room, id); if (+choice === 2) p.score += 3; }); const m = findPlayer(room, room.minister); if (m) m.score += 2; room.phase = 'reveal'; }
    if (body.action === 'clues' && player.host) { room.phase = 'clues'; room.timer = 45; }
    if (body.action === 'finish' && player.host) { room.players.sort((a,b) => b.score-a.score); room.phase = 'final'; room.title = 'Supreme Minister of Silly Laws'; }
    return json(res, 200, roomState(room));
  }
  json(res, 404, { error: 'Not found' });
});
server.listen(process.env.PORT || 3000, () => console.log('Democracy is listening on port ' + (process.env.PORT || 3000)));
