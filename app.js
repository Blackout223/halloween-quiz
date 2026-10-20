/* The Haunted Pub Quiz – host and quizzer app (vanilla JS, no build step)
 *
 * Multiplayer uses PeerJS (WebRTC): the host's browser opens a room with a short code and
 * quizzers' phones connect straight to it. Questions never leave the host's device, and
 * quizzers' phones never download the question file.
 */
(function () {
  'use strict';

  const STORAGE_HOST = 'hauntedPubQuiz.host.v3';
  const STORAGE_PLAYER = 'hauntedPubQuiz.player.v3';
  const STORAGE_ROLE = 'hauntedPubQuiz.role';
  const PEER_PREFIX = 'haunted-pub-quiz-';
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const MAX_NAME = 24;
  const MAX_ANSWER = 120;

  const app = document.getElementById('app');
  const srStatus = document.getElementById('sr-status');
  const printRoot = document.getElementById('print-root');
  const newGameBtn = document.getElementById('new-game-btn');
  const roleBtn = document.getElementById('role-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const footer = document.querySelector('.site-footer');

  /* ---------------- Shared helpers ---------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const announce = (msg) => { srStatus.textContent = ''; setTimeout(() => { srStatus.textContent = msg; }, 30); };
  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } },
    del(key) { try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ } }
  };
  const cleanText = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  const randomId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const makeCode = () => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  const peerAvailable = () => typeof window.Peer === 'function';
  const peerIdFor = (code) => PEER_PREFIX + code.toLowerCase();
  const isLocalName = (h) => /^(localhost|127(\.\d+){3}|\[?::1\]?|0\.0\.0\.0)$/i.test(h) || /\.localhost$/i.test(h);
  // True when this copy is opened from the computer itself, so its own address is no use to phones.
  const isLocalCopy = location.protocol === 'file:' || isLocalName(location.hostname);
  // Turn what the host typed ("yourname.github.io/quiz") into a clean page address, or null.
  function parseSiteUrl(s) {
    const text = cleanText(s, 300);
    if (!text) return null;
    try {
      const u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
      if (!/^https?:$/.test(u.protocol) || isLocalName(u.hostname) || !u.hostname.includes('.')) return null;
      u.search = '';
      u.hash = '';
      return u.href;
    } catch (e) { return null; }
  }

  function toggleFullscreen() {
    const doc = document;
    const el = doc.documentElement;
    try {
      if (!(doc.fullscreenElement || doc.webkitFullscreenElement)) {
        const p = (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
        if (p && p.catch) p.catch(() => {});
      } else {
        const p = (doc.exitFullscreen || doc.webkitExitFullscreen || function () {}).call(doc);
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) { /* fullscreen not supported */ }
  }

  /* ---------------- Answer checking ---------------- */
  // Lower-case, strip accents, punctuation and a leading "the/a/an".
  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/&/g, ' and ').replace(/[‘’'`´]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
      .replace(/^(the|a|an) /, '');
  }
  function candidatesFor(q) {
    const out = new Set();
    [q.answer].concat(q.acceptAlso || []).forEach((a) => {
      out.add(norm(a));
      const m = String(a).match(/^(.*?)\s*\((.*)\)\s*$/);   // "Cucurbitaceae (the gourd family)"
      if (m) { out.add(norm(m[1])); out.add(norm(m[2])); }
    });
    out.delete('');
    return [...out];
  }
  function distance(a, b) {
    if (a === b) return 0;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  }
  // Returns { ok, close }: ok = counts as correct; close = worth a manual look.
  function autoMark(q, text) {
    const t = norm(text);
    if (!t) return { ok: false, close: false };
    let close = false;
    for (const c of candidatesFor(q)) {
      if (t === c) return { ok: true, close: false };
      if (/^\d+$/.test(c)) continue;                         // years and numbers must be exact
      const tol = c.length <= 4 ? 0 : c.length <= 8 ? 1 : 2;  // small typos allowed
      const d = distance(t, c);
      if (d <= tol) return { ok: true, close: false };
      if (d <= tol + 2 || (c.length >= 4 && (` ${t} `.includes(` ${c} `) || ` ${c} `.includes(` ${t} `)))) close = true;
    }
    return { ok: false, close };
  }

  /* ---------------- Role selection ---------------- */
  const params = new URLSearchParams(location.search);
  const joinParam = cleanText(params.get('join'), 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  let role = joinParam ? 'player' : store.get(STORAGE_ROLE);

  function chooseRole(next) {
    role = next;
    if (role) store.set(STORAGE_ROLE, role); else store.del(STORAGE_ROLE);
    boot();
  }

  function viewLanding() {
    return `
    <section class="stage" aria-labelledby="landing-title">
      <h2 class="round-title" id="landing-title" tabindex="-1">Who's here?</h2>
      <p class="lede">Pick your part for tonight's quiz.</p>
      <div class="role-grid">
        <button type="button" class="role-card" data-action="pickHost">
          <span class="role-emoji" aria-hidden="true">🧙</span>
          <span class="role-name">Host</span>
          <span class="role-desc">Run the quiz, read out the questions and reveal the answers.</span>
        </button>
        <button type="button" class="role-card" data-action="pickPlayer">
          <span class="role-emoji" aria-hidden="true">👻</span>
          <span class="role-name">Quizzer</span>
          <span class="role-desc">Join with your name and type your answers on your phone.</span>
        </button>
      </div>
    </section>`;
  }

  function setChrome(opts) {
    newGameBtn.hidden = !opts.newGame;
    roleBtn.hidden = !opts.role;
    fullscreenBtn.hidden = !!opts.noFullscreen;
    footer.hidden = !opts.keys;
  }

  /* =====================================================================
     HOST
     ===================================================================== */
  const Host = (function () {
    let ROUNDS = [];
    let QUESTIONS = [];
    let state = null;
    let lastPhase = null;
    let peer = null;
    const conns = new Map();            // pid -> DataConnection
    const net = { status: 'off', retry: null };

    const roundById = (id) => ROUNDS.find((r) => r.id === id) || { id, title: id, emoji: '❔', description: '' };
    const questionsFor = (id) => QUESTIONS.filter((q) => q.round === id);
    const enabledRounds = () => state.rounds.filter((r) => r.on && questionsFor(r.id).length).map((r) => r.id);
    const currentRoundId = () => state.playOrder[state.roundIdx];
    const currentQs = () => questionsFor(currentRoundId());
    const isFinalRound = (idx) => idx === state.playOrder.length - 1;
    const multi = () => state.mode === 'multi';

    // Where quizzers should go: the address typed in the lobby, then QUIZ_SETTINGS.siteUrl,
    // then this page's own address (unless it's opened from this computer).
    function siteBase() {
      const settings = window.QUIZ_SETTINGS || {};
      return parseSiteUrl(state.siteUrl) || parseSiteUrl(settings.siteUrl) ||
        (isLocalCopy ? null : location.href.split(/[?#]/)[0]);
    }
    function joinUrl() {
      const base = siteBase();
      return base ? `${base}?join=${state.code}` : null;
    }

    function defaultState() {
      return {
        phase: 'setup',        // setup | lobby | intro | question | reveal | roundEnd | final
        mode: 'multi',         // multi (quizzers on phones) | paper
        rounds: ROUNDS.map((r) => ({ id: r.id, on: true })),
        playOrder: [],
        roundIdx: 0,
        qIdx: 0,
        revealIdx: 0,
        clues: 1,
        code: '',
        siteUrl: '',           // public address of the quiz, typed in the lobby
        players: {},           // pid -> { name, answers: { roundId: [text…] } }
        marks: {},             // roundId -> { qIndex: { pid: true|false } } host overrides
        locked: {}             // roundId -> true once answers are revealed
      };
    }

    function load() {
      const fresh = defaultState();
      const saved = store.get(STORAGE_HOST);
      if (!saved || typeof saved !== 'object') return fresh;
      const s = Object.assign(fresh, saved);
      const known = ROUNDS.map((r) => r.id);
      const rounds = Array.isArray(saved.rounds) ? saved.rounds.filter((r) => r && known.includes(r.id)) : [];
      known.forEach((id) => { if (!rounds.some((r) => r.id === id)) rounds.push({ id, on: true }); });
      s.rounds = rounds;
      s.playOrder = Array.isArray(s.playOrder) ? s.playOrder.filter((id) => known.includes(id)) : [];
      if (!['setup', 'lobby'].includes(s.phase) && !s.playOrder.length) s.phase = 'setup';
      if (s.mode !== 'paper') s.mode = 'multi';
      s.roundIdx = Math.min(Math.max(0, s.roundIdx | 0), Math.max(0, s.playOrder.length - 1));
      const n = questionsFor(s.playOrder[s.roundIdx]).length;
      s.qIdx = Math.min(Math.max(0, s.qIdx | 0), Math.max(0, n - 1));
      s.revealIdx = Math.min(Math.max(0, s.revealIdx | 0), Math.max(0, n - 1));
      ['players', 'marks', 'locked'].forEach((k) => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
      return s;
    }
    let saveTimer = null;
    const save = () => store.set(STORAGE_HOST, state);
    const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 500); };

    /* ----- Scores ----- */
    const answerOf = (pid, roundId, qi) => (((state.players[pid] || {}).answers || {})[roundId] || [])[qi] || '';
    function markOf(pid, roundId, qi) {
      const o = ((state.marks[roundId] || {})[qi] || {})[pid];
      if (o === true || o === false) return { ok: o, manual: true, close: false };
      const m = autoMark(questionsFor(roundId)[qi], answerOf(pid, roundId, qi));
      return { ok: m.ok, manual: false, close: m.close };
    }
    function roundScore(pid, roundId) {
      return questionsFor(roundId).reduce((sum, _, qi) => sum + (markOf(pid, roundId, qi).ok ? 1 : 0), 0);
    }
    // Rounds whose answers have been revealed count towards the score.
    const scoredRounds = () => state.playOrder.filter((id) => state.locked[id]);
    function standings() {
      const done = scoredRounds();
      return Object.keys(state.players).map((pid) => ({
        pid,
        name: state.players[pid].name,
        total: done.reduce((s, id) => s + roundScore(pid, id), 0)
      })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    }
    function ranked(rows) {
      let rank = 0;
      let prev = null;
      return rows.map((r, i) => {
        if (r.total !== prev) { rank = i + 1; prev = r.total; }
        return Object.assign({ rank }, r);
      });
    }

    /* ----- Networking ----- */
    function online(pid) {
      const c = conns.get(pid);
      return !!(c && c.open);
    }
    function openRoom() {
      if (!multi() || !peerAvailable() || peer) return;
      if (!state.code) { state.code = makeCode(); save(); }
      net.status = 'connecting';
      peer = new window.Peer(peerIdFor(state.code), { debug: 0 });
      peer.on('open', () => { net.status = 'online'; updateNetUI(); broadcast(); });
      peer.on('connection', (c) => {
        c.on('data', (d) => onData(c, d));
        c.on('close', () => { if (c.pid && conns.get(c.pid) === c) conns.delete(c.pid); updateNetUI(); });
        c.on('error', () => {});
      });
      peer.on('disconnected', () => {
        net.status = 'connecting';
        updateNetUI();
        setTimeout(() => { if (peer && !peer.destroyed) { try { peer.reconnect(); } catch (e) { /* retry below */ } } }, 2000);
      });
      peer.on('error', (err) => {
        const type = err && err.type;
        if (type === 'peer-unavailable') return;            // a quizzer left mid-connect
        net.status = type === 'unavailable-id' ? 'reclaiming' : 'error';
        updateNetUI();
        // After a refresh the old room can stay reserved for a few seconds: try the same code again.
        try { peer.destroy(); } catch (e) { /* ignore */ }
        peer = null;
        clearTimeout(net.retry);
        net.retry = setTimeout(openRoom, type === 'unavailable-id' ? 4000 : 6000);
      });
    }
    function closeRoom() {
      clearTimeout(net.retry);
      conns.forEach((c) => { try { c.close(); } catch (e) { /* ignore */ } });
      conns.clear();
      if (peer) { try { peer.destroy(); } catch (e) { /* ignore */ } }
      peer = null;
      net.status = 'off';
    }

    function onData(c, d) {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'hello') {
        const pid = cleanText(d.pid, 40);
        const name = cleanText(d.name, MAX_NAME);
        if (!pid || !name) return;
        const existing = conns.get(pid);
        if (existing && existing !== c) { try { existing.close(); } catch (e) { /* ignore */ } }
        c.pid = pid;
        conns.set(pid, c);
        if (!state.players[pid]) state.players[pid] = { name, answers: {} };
        state.players[pid].name = name;
        save();
        sendState(pid);
        if (state.phase === 'lobby' || state.phase === 'final') render(); else updateNetUI();
        announce(`${name} joined.`);
      } else if (d.t === 'answer' && c.pid && state.players[c.pid]) {
        const roundId = currentRoundId();
        const qi = Number(d.q);
        if (d.round !== roundId || state.locked[roundId]) return;
        if (!['intro', 'question'].includes(state.phase)) return;
        if (!Number.isInteger(qi) || qi < 0 || qi > state.qIdx || qi >= currentQs().length) return;
        const p = state.players[c.pid];
        p.answers[roundId] = p.answers[roundId] || [];
        p.answers[roundId][qi] = cleanText(d.text, MAX_ANSWER);
        saveSoon();
        updateNetUI();
      }
    }

    function playerPhase() {
      switch (state.phase) {
        case 'intro': return 'intro';
        case 'question': return state.locked[currentRoundId()] ? 'locked' : 'question';
        case 'reveal': case 'roundEnd': return 'locked';
        case 'final': return 'final';
        default: return 'lobby';
      }
    }
    function stateFor(pid) {
      const phase = playerPhase();
      const roundId = currentRoundId();
      const meta = roundId ? roundById(roundId) : null;
      const msg = {
        t: 'state',
        phase,
        name: (state.players[pid] || {}).name || '',
        round: meta ? { id: roundId, idx: state.roundIdx, count: state.playOrder.length, title: meta.title, emoji: meta.emoji, qCount: currentQs().length } : null,
        qIdx: state.qIdx,
        myAnswers: roundId ? ((state.players[pid] || {}).answers || {})[roundId] || [] : []
      };
      if (phase === 'final') {
        msg.board = ranked(standings()).map((r) => ({ rank: r.rank, name: r.name, total: r.total, me: r.pid === pid }));
        msg.max = state.playOrder.reduce((s, id) => s + questionsFor(id).length, 0);
      }
      return msg;
    }
    function sendState(pid) {
      const c = conns.get(pid);
      if (c && c.open) { try { c.send(stateFor(pid)); } catch (e) { /* dropped connection */ } }
    }
    function broadcast() { if (multi()) conns.forEach((_, pid) => sendState(pid)); }

    function netPill() {
      if (!multi()) return '';
      const total = Object.keys(state.players).length;
      const on = Object.keys(state.players).filter(online).length;
      const label = {
        off: 'Room closed', connecting: 'Connecting…', reclaiming: 'Reopening room…',
        error: 'Connection problem, retrying…', online: `Room ${esc(state.code)}`
      }[net.status] || 'Connecting…';
      return `<span class="net-pill is-${net.status}" id="net-pill"><span class="dot" aria-hidden="true"></span>${label} · <span id="net-count">${on}/${total}</span> quizzers</span>`;
    }
    function answeredCount() {
      const roundId = currentRoundId();
      return Object.keys(state.players).filter((pid) => answerOf(pid, roundId, state.qIdx).trim()).length;
    }
    function updateNetUI() {
      const pill = document.getElementById('net-pill');
      if (pill) pill.outerHTML = netPill();
      const ans = document.getElementById('answered');
      if (ans) ans.textContent = `${answeredCount()}/${Object.keys(state.players).length} answered`;
      if (state.phase === 'lobby') {
        const list = document.getElementById('lobby-players');
        if (list) list.outerHTML = lobbyPlayers();
      }
    }

    /* ----- Rendering ----- */
    const views = { setup: viewSetup, lobby: viewLobby, intro: viewIntro, question: viewQuestion, reveal: viewReveal, roundEnd: viewRoundEnd, final: viewFinal };

    function render(focusSelector) {
      app.innerHTML = (views[state.phase] || viewSetup)();
      document.body.dataset.phase = state.phase;
      setChrome({ newGame: state.phase !== 'setup', role: state.phase === 'setup', keys: true });
      if (state.phase === 'lobby') drawQr();

      let target = focusSelector ? app.querySelector(focusSelector) : null;
      if (!target || target.disabled) target = app.querySelector('[data-autofocus]') || app.querySelector('h2');
      if (target && (focusSelector || lastPhase !== state.phase || target.hasAttribute('data-autofocus'))) {
        target.focus({ preventScroll: true });
      }
      if (lastPhase !== state.phase) window.scrollTo(0, 0);
      lastPhase = state.phase;
      save();
      broadcast();
    }

    function viewSetup() {
      const order = enabledRounds();
      const rounds = state.rounds.map((r, i) => {
        const meta = roundById(r.id);
        const count = questionsFor(r.id).length;
        const pos = order.indexOf(r.id);
        const tag = pos > -1 ? `<span class="round-order">R${pos + 1}</span>` : '';
        return `
        <li class="round-row ${r.on ? '' : 'is-off'}">
          <input type="checkbox" id="round-${esc(r.id)}" data-round="${i}" ${r.on ? 'checked' : ''} ${count ? '' : 'disabled'}>
          <label for="round-${esc(r.id)}">${tag}<span aria-hidden="true">${meta.emoji}</span> ${esc(meta.title)}
            <span class="muted">(${count} Q${count === 1 ? '' : 's'})</span></label>
          <span class="move">
            <button type="button" class="btn-icon" data-action="moveRound" data-i="${i}" data-dir="-1"
              aria-label="Move ${esc(meta.title)} earlier" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-icon" data-action="moveRound" data-i="${i}" data-dir="1"
              aria-label="Move ${esc(meta.title)} later" ${i === state.rounds.length - 1 ? 'disabled' : ''}>↓</button>
          </span>
        </li>`;
      }).join('');

      const modeOpt = (v, title, desc) => `
        <label class="mode-option">
          <input type="radio" name="mode" value="${v}" ${state.mode === v ? 'checked' : ''}>
          <span><strong>${title}</strong><span class="muted">${desc}</span></span>
        </label>`;

      return `
      <section class="setup setup-narrow" aria-labelledby="setup-title">
        <div class="setup-intro">
          <h2 id="setup-title" tabindex="-1">Set up the quiz</h2>
          <p class="muted">Choose how people play, then pick your rounds.</p>
        </div>
        <form id="setup-form" class="panel" novalidate>
          <fieldset>
            <legend>How are people playing?</legend>
            <div class="mode-list">
              ${modeOpt('multi', '📱 Quizzers join on their phones', 'They enter a name, type answers, and the scores add up automatically.')}
              ${modeOpt('paper', '📝 Pen and paper', 'You read the questions out; everyone keeps their own score.')}
            </div>
            ${state.mode === 'multi' && !peerAvailable() ? '<p class="form-error">The multiplayer service could not load. Check the internet connection and refresh.</p>' : ''}
          </fieldset>
          <fieldset>
            <legend>Rounds and order</legend>
            <p class="hint">Tick the rounds to play and use the arrows to set the order.</p>
            <ol class="round-list">${rounds}</ol>
          </fieldset>
          <p class="form-error" id="setup-error" role="alert"></p>
          <div class="setup-actions">
            <div class="print-actions">
              <button type="button" class="btn btn-small btn-ghost" data-action="printSheets">🖨 Print answer sheet</button>
              <button type="button" class="btn btn-small btn-ghost" data-action="printKey">🔑 Print host answer key</button>
            </div>
            <button type="submit" class="btn btn-primary btn-big">${state.mode === 'multi' ? 'Open the room 🚪' : 'Start quiz 🎃'}</button>
          </div>
        </form>
      </section>`;
    }

    function lobbyPlayers() {
      const pids = Object.keys(state.players);
      if (!pids.length) return '<ul class="player-list" id="lobby-players"><li class="muted">No quizzers yet…</li></ul>';
      return `<ul class="player-list" id="lobby-players">${pids.map((pid) => `
        <li class="player-chip ${online(pid) ? 'is-online' : ''}">
          <span class="dot" aria-hidden="true"></span><span>${esc(state.players[pid].name)}</span>
          <span class="sr-only">${online(pid) ? 'connected' : 'not connected'}</span>
          <button type="button" class="btn-icon btn-tiny" data-action="removePlayer" data-pid="${esc(pid)}" aria-label="Remove ${esc(state.players[pid].name)}">✕</button>
        </li>`).join('')}</ul>`;
    }

    function viewLobby() {
      const link = joinUrl();
      const typedBad = state.siteUrl && !parseSiteUrl(state.siteUrl);
      const siteField = `
        <form id="site-form" class="site-form" novalidate>
          <label for="site-url">Quiz web address</label>
          <span class="site-row">
            <input id="site-url" name="site-url" class="input" type="url" inputmode="url" autocomplete="url" spellcheck="false"
              placeholder="https://yourname.github.io/halloween-quiz/" value="${esc(state.siteUrl || '')}" aria-describedby="site-hint">
            <button type="submit" class="btn btn-small btn-ghost">Use</button>
          </span>
          <span class="hint" id="site-hint">${typedBad
            ? '<span class="form-error">That doesn\'t look like a public web address. Use the one quizzers can open, like your GitHub Pages link.</span>'
            : 'The address quizzers open on their phones. The QR code and link use it.'}</span>
        </form>`;
      return `
      <section class="stage lobby" aria-labelledby="lobby-title">
        <p class="eyebrow">Quizzers, join on your phone</p>
        <h2 class="round-title" id="lobby-title" tabindex="-1">Room ${esc(state.code)}</h2>
        ${netPill()}
        ${!link ? `<p class="notice">This copy is running on your computer, so its address won't work on phones. Enter the quiz's online address below (for example your GitHub Pages link) and the QR code will point there.</p>` : ''}
        <div class="lobby-grid">
          <div class="qr-box" id="qr" role="img" aria-label="QR code for the join link"></div>
          <div class="join-steps">
            ${link ? `
            <p>Scan the code, or open:</p>
            <p class="join-link"><a href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a></p>
            <button type="button" class="btn btn-small btn-ghost" data-action="copyLink">📋 Copy link</button>` : ''}
            <p class="muted">Or open the quiz, choose <strong>Quizzer</strong> and enter <strong>${esc(state.code)}</strong>.</p>
            ${siteField}
          </div>
        </div>
        <h3 class="lobby-sub">Joined</h3>
        ${lobbyPlayers()}
        <div class="nav-row">
          <button type="button" class="btn btn-ghost" data-action="prev">← Setup</button>
          <button type="button" class="btn btn-primary btn-big" data-action="next" data-autofocus>Start quiz 🎃</button>
        </div>
      </section>`;
    }
    function drawQr() {
      const box = document.getElementById('qr');
      if (!box) return;
      const link = joinUrl();
      if (!link) { box.innerHTML = '<span class="qr-empty">Enter the quiz web address to show the QR code</span>'; return; }
      if (typeof window.QRCode !== 'function') { box.innerHTML = '<span class="qr-empty">QR code unavailable</span>'; return; }
      try {
        // eslint-disable-next-line no-new
        new window.QRCode(box, { text: link, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff' });
      } catch (e) { box.innerHTML = '<span class="muted">QR code unavailable</span>'; }
    }

    function viewIntro() {
      const meta = roundById(currentRoundId());
      const final = isFinalRound(state.roundIdx) && state.playOrder.length > 1;
      return `
      <section class="stage" aria-labelledby="round-title">
        ${netPill()}
        <p class="eyebrow">Round ${state.roundIdx + 1} of ${state.playOrder.length}${final ? ' · Final round' : ''}</p>
        <div class="big-emoji" aria-hidden="true">${meta.emoji}</div>
        <h2 class="round-title" id="round-title" tabindex="-1">${esc(meta.title)}</h2>
        <p class="lede">${esc(meta.description)}</p>
        <p class="muted">${currentQs().length} questions · answers revealed at the end of the round</p>
        <div class="nav-row">
          <button type="button" class="btn btn-ghost" data-action="prev">← Back</button>
          <button type="button" class="btn btn-primary btn-big" data-action="next" data-autofocus>Start round →</button>
        </div>
      </section>`;
    }

    const emojiClue = (q, small) => (q.emoji
      ? `<p class="q-emoji ${small ? 'is-small' : ''}" role="img" aria-label="Emoji puzzle: ${esc(q.emoji)}">${esc(q.emoji)}</p>` : '');

    function progressDots(current, total, label) {
      let dots = '';
      for (let i = 0; i < total; i++) dots += `<span class="q-dot ${i < current ? 'is-done' : ''} ${i === current ? 'is-current' : ''}"></span>`;
      return `<div class="q-progress" role="img" aria-label="${label} ${current + 1} of ${total}">${dots}</div>`;
    }

    function viewQuestion() {
      const qs = currentQs();
      const q = qs[state.qIdx];
      const meta = roundById(currentRoundId());
      const last = state.qIdx === qs.length - 1;
      const clues = Array.isArray(q.clues) ? q.clues : [];
      const moreClues = clues.length && state.clues < clues.length;
      const clueList = clues.length ? `
        <ol class="clues" aria-label="Clues">
          ${clues.map((c, i) => (i < state.clues
            ? `<li class="clue ${i === state.clues - 1 && i > 0 ? 'is-new' : ''}"><span class="clue-num">Clue ${i + 1}</span><span>${esc(c)}</span></li>`
            : `<li class="clue is-hidden"><span class="clue-num">Clue ${i + 1}</span><span>…</span></li>`)).join('')}
        </ol>` : '';

      let nextBtn;
      if (moreClues) nextBtn = '<button type="button" class="btn btn-green btn-big" data-action="next" data-autofocus>Next clue →</button>';
      else if (!last) nextBtn = '<button type="button" class="btn btn-primary btn-big" data-action="next" data-autofocus>Next question →</button>';
      else nextBtn = '<button type="button" class="btn btn-green btn-big pulse" data-action="reveal" data-autofocus aria-keyshortcuts="R">Reveal answers (R)</button>';

      return `
      <section class="stage question-card" aria-labelledby="q-heading">
        <div class="q-meta">
          <p class="eyebrow">${meta.emoji} ${esc(meta.title)}</p>
          ${progressDots(state.qIdx, qs.length, 'Question')}
          ${multi() ? `<span class="answered-pill" id="answered" aria-live="off">${answeredCount()}/${Object.keys(state.players).length} answered</span>` : ''}
        </div>
        <h2 class="q-number" id="q-heading" tabindex="-1">Question ${state.qIdx + 1}</h2>
        ${emojiClue(q)}
        <p class="q-text ${q.question.length > 150 ? 'is-long' : ''}">${esc(q.question)}</p>
        ${clueList}
        <div class="nav-row">
          <button type="button" class="btn btn-ghost" data-action="prev" aria-keyshortcuts="ArrowLeft">← Back</button>
          <span class="spacer"></span>
          ${nextBtn}
        </div>
      </section>`;
    }

    function markingList(roundId, qi) {
      const pids = Object.keys(state.players);
      if (!pids.length) return '';
      const rows = pids.map((pid) => {
        const text = answerOf(pid, roundId, qi);
        const m = markOf(pid, roundId, qi);
        const status = m.ok ? 'is-right' : 'is-wrong';
        const note = m.manual ? 'set by you' : m.close ? 'close: check' : 'auto';
        return `
        <li class="mark-row ${status} ${!m.manual && m.close ? 'is-close' : ''}">
          <span class="mark-name">${esc(state.players[pid].name)}</span>
          <span class="mark-answer">${text ? esc(text) : '<em class="muted">no answer</em>'}</span>
          <span class="mark-note">${note}</span>
          <button type="button" class="mark-btn" data-action="toggleMark" data-pid="${esc(pid)}" data-q="${qi}"
            aria-pressed="${m.ok}" aria-label="${esc(state.players[pid].name)}: marked ${m.ok ? 'correct' : 'wrong'}. Click to change.">${m.ok ? '✓' : '✗'}</button>
        </li>`;
      }).join('');
      return `
      <div class="marking panel">
        <h3>Quizzers' answers <span class="muted">(tap ✓/✗ to change a mark)</span></h3>
        <ul class="mark-list">${rows}</ul>
      </div>`;
    }

    function viewReveal() {
      const qs = currentQs();
      const q = qs[state.revealIdx];
      const roundId = currentRoundId();
      const meta = roundById(roundId);
      const last = state.revealIdx === qs.length - 1;
      const also = (q.acceptAlso || []).filter(Boolean);
      const clues = Array.isArray(q.clues) && q.clues.length
        ? `<ol class="reveal-clues">${q.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : '';
      return `
      <section class="stage reveal-card" aria-labelledby="a-heading">
        <div class="q-meta">
          <p class="eyebrow">Answers · ${meta.emoji} ${esc(meta.title)}</p>
          ${progressDots(state.revealIdx, qs.length, 'Answer')}
        </div>
        <h2 class="q-number" id="a-heading" tabindex="-1">Question ${state.revealIdx + 1}</h2>
        ${emojiClue(q, true)}
        <p class="reveal-q">${esc(q.question)}</p>
        ${clues}
        <p class="answer-label">Answer</p>
        <p class="answer">${esc(q.answer)}</p>
        ${also.length ? `<p class="accept"><strong>Also accept:</strong> ${also.map(esc).join(' · ')}</p>` : ''}
        ${q.explanation ? `<p class="explanation">${esc(q.explanation)}</p>` : ''}
        ${multi() ? markingList(roundId, state.revealIdx) : ''}
        <div class="nav-row">
          <button type="button" class="btn btn-ghost" data-action="prev">← Back</button>
          <span class="spacer"></span>
          ${last
            ? '<button type="button" class="btn btn-green btn-big" data-action="next" data-autofocus>Finish round →</button>'
            : '<button type="button" class="btn btn-primary btn-big" data-action="next" data-autofocus>Next answer →</button>'}
        </div>
      </section>`;
    }

    function scoreList(rows, max) {
      if (!rows.length) return '<p class="muted">No quizzers joined.</p>';
      const top = Math.max(1, max || 0, ...rows.map((r) => r.total));
      return `<ol class="board-list">${ranked(rows).map((r) => `
        <li class="board-item ${r.rank === 1 && r.total > 0 ? 'is-leader' : ''}">
          <span class="bar-fill" style="width:${(r.total / top) * 100}%"></span>
          <span class="board-rank">${r.rank}</span>
          <span class="board-name">${esc(r.name)}</span>
          <span class="board-total">${r.total}<span class="sr-only"> points</span></span>
        </li>`).join('')}</ol>`;
    }

    function viewRoundEnd() {
      const meta = roundById(currentRoundId());
      const last = isFinalRound(state.roundIdx);
      const nextMeta = !last ? roundById(state.playOrder[state.roundIdx + 1]) : null;
      return `
      <section class="stage" aria-labelledby="end-title">
        <p class="eyebrow">Round ${state.roundIdx + 1} of ${state.playOrder.length} complete</p>
        <div class="big-emoji" aria-hidden="true">${meta.emoji}</div>
        <h2 class="round-title" id="end-title" tabindex="-1">End of ${esc(meta.title)}</h2>
        <p class="lede">${multi() ? 'Scores are kept secret until the end of the quiz.' : 'Mark your answers and write down your score for this round.'}</p>
        ${multi() && Object.keys(state.players).length ? `
          <details class="peek panel">
            <summary>Host only: peek at the scores so far</summary>
            ${scoreList(standings())}
          </details>` : ''}
        <div class="nav-row">
          <button type="button" class="btn btn-ghost" data-action="prev">← Back to answers</button>
          ${last
            ? '<button type="button" class="btn btn-green btn-big" data-action="next" data-autofocus>Final results 🏆</button>'
            : `<button type="button" class="btn btn-primary btn-big" data-action="next" data-autofocus>Next: ${nextMeta.emoji} ${esc(nextMeta.title)} →</button>`}
        </div>
      </section>`;
    }

    function viewFinal() {
      if (!multi() || !Object.keys(state.players).length) {
        return `
        <section class="stage" aria-labelledby="final-title">
          <div class="winner">
            <div class="trophy" aria-hidden="true">🏆</div>
            <p class="eyebrow">That's the end of the quiz!</p>
            <h2 class="winner-name" id="final-title" tabindex="-1">Add up your scores</h2>
            <p class="lede" style="margin:0 auto">The highest total wins. Happy Halloween! 🎃</p>
          </div>
          <div class="nav-row">
            <button type="button" class="btn btn-ghost" data-action="prev">← Back</button>
            <button type="button" class="btn btn-primary btn-big" data-action="newGame" data-autofocus>New quiz ↺</button>
          </div>
        </section>`;
      }
      const rows = standings();
      const best = rows[0].total;
      const winners = rows.filter((r) => r.total === best);
      const max = state.playOrder.reduce((s, id) => s + questionsFor(id).length, 0);
      const done = scoredRounds();
      const head = done.map((id) => `<th scope="col">${roundById(id).emoji}<span class="sr-only"> ${esc(roundById(id).title)}</span></th>`).join('');
      const body = rows.map((r) => `
        <tr><th scope="row">${esc(r.name)}</th>${done.map((id) => `<td>${roundScore(r.pid, id)}</td>`).join('')}<td class="total">${r.total}</td></tr>`).join('');
      return `
      <section class="board" aria-labelledby="final-title">
        <div class="winner">
          <div class="trophy" aria-hidden="true">${winners.length > 1 ? '👻' : '🏆'}</div>
          <p class="eyebrow">${winners.length > 1 ? "It's a tie!" : 'And the winner is…'}</p>
          <h2 class="winner-name" id="final-title" tabindex="-1">${winners.map((w) => esc(w.name)).join(' &amp; ')}</h2>
          <p class="lede" style="margin:0 auto">${best} out of ${max}</p>
        </div>
        ${scoreList(rows, max)}
        <div class="table-wrap panel">
          <table class="breakdown">
            <caption class="sr-only">Points per round</caption>
            <thead><tr><th scope="col">Quizzer</th>${head}<th scope="col">Total</th></tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        <div class="nav-row">
          <button type="button" class="btn btn-ghost" data-action="prev">← Back</button>
          <span class="spacer"></span>
          <button type="button" class="btn btn-primary btn-big" data-action="newGame" data-autofocus>New quiz ↺</button>
        </div>
      </section>`;
    }

    /* ----- Navigation ----- */
    function startFromSetup() {
      const order = enabledRounds();
      if (!order.length) { document.getElementById('setup-error').textContent = 'Pick at least one round.'; return; }
      state.playOrder = order;
      state.roundIdx = 0;
      state.qIdx = 0;
      state.revealIdx = 0;
      state.clues = 1;
      state.marks = {};
      state.locked = {};
      Object.values(state.players).forEach((p) => { p.answers = {}; });
      if (multi()) {
        state.phase = 'lobby';
        openRoom();
      } else {
        closeRoom();
        state.phase = 'intro';
      }
      render();
    }

    function enterQuestion(idx, showAllClues) {
      state.qIdx = idx;
      const q = currentQs()[idx];
      const n = q && Array.isArray(q.clues) ? q.clues.length : 0;
      state.clues = showAllClues ? n : Math.min(1, n);
      state.phase = 'question';
      render();
    }

    function next() {
      const qs = currentQs();
      switch (state.phase) {
        case 'lobby': state.phase = 'intro'; render(); break;
        case 'intro': enterQuestion(0, false); break;
        case 'question': {
          const q = qs[state.qIdx];
          if (Array.isArray(q.clues) && state.clues < q.clues.length) {
            state.clues += 1;
            render();
            announce(`Clue ${state.clues}: ${q.clues[state.clues - 1]}`);
          } else if (state.qIdx < qs.length - 1) {
            enterQuestion(state.qIdx + 1, false);
          } else {
            const btn = app.querySelector('[data-action="reveal"]');
            if (btn) btn.focus();
            announce('Last question. Press R to reveal the answers.');
          }
          break;
        }
        case 'reveal':
          if (state.revealIdx < qs.length - 1) state.revealIdx += 1;
          else state.phase = 'roundEnd';
          render();
          break;
        case 'roundEnd':
          if (isFinalRound(state.roundIdx)) state.phase = 'final';
          else { state.roundIdx += 1; state.qIdx = 0; state.revealIdx = 0; state.phase = 'intro'; }
          render();
          break;
        default: break;
      }
    }

    function prev() {
      const qs = currentQs();
      switch (state.phase) {
        case 'lobby': state.phase = 'setup'; render(); break;
        case 'intro':
          if (state.roundIdx > 0) { state.roundIdx -= 1; state.phase = 'roundEnd'; }
          else state.phase = multi() ? 'lobby' : 'setup';
          render();
          break;
        case 'question':
          if (state.qIdx > 0) enterQuestion(state.qIdx - 1, true);
          else { state.phase = 'intro'; render(); }
          break;
        case 'reveal':
          if (state.revealIdx > 0) { state.revealIdx -= 1; render(); }
          else enterQuestion(qs.length - 1, true);
          break;
        case 'roundEnd': state.revealIdx = qs.length - 1; state.phase = 'reveal'; render(); break;
        case 'final': state.phase = 'roundEnd'; render(); break;
        default: break;
      }
    }

    function reveal() {
      if (state.phase !== 'question') return;
      const last = state.qIdx === currentQs().length - 1;
      if (!last && !window.confirm('Reveal the answers now? There are still questions left in this round.')) return;
      state.locked[currentRoundId()] = true;   // quizzers can't change this round's answers any more
      state.revealIdx = 0;
      state.phase = 'reveal';
      render();
    }

    function newGame() {
      if (state.phase !== 'final' && state.phase !== 'setup' &&
          !window.confirm('Start a new quiz? Answers and scores from this one will be cleared.')) return;
      state.phase = 'setup';
      state.playOrder = [];
      state.roundIdx = 0;
      state.qIdx = 0;
      state.revealIdx = 0;
      state.marks = {};
      state.locked = {};
      Object.values(state.players).forEach((p) => { p.answers = {}; });
      render();
    }

    /* ----- Printing ----- */
    function printRounds() { return state.phase !== 'setup' && state.playOrder.length ? state.playOrder : enabledRounds(); }
    function buildSheet() {
      const list = printRounds();
      return `
        <section class="sheet">
          <div class="print-head">
            <h1>🎃 The Haunted Pub Quiz</h1>
            <p class="team-line">Name: <strong>&nbsp;</strong></p>
          </div>
          <div class="sheet-rounds">
            ${list.map((id, i) => {
              let lines = '';
              for (let k = 0; k < questionsFor(id).length; k++) lines += '<li></li>';
              return `
              <div class="sheet-round">
                <h2>Round ${i + 1}: ${esc(roundById(id).title)}</h2>
                <ol class="sheet-lines">${lines}</ol>
                <p class="sheet-score">Round score: ______</p>
              </div>`;
            }).join('')}
          </div>
          <p class="sheet-total">Total: __________</p>
        </section>`;
    }
    function buildKey() {
      const list = printRounds();
      return `
        <div class="print-head"><h1>🔑 Host answer key</h1><p>The Haunted Pub Quiz</p></div>
        ${list.map((id, i) => `
          <section class="key-round">
            <h2>Round ${i + 1}: ${esc(roundById(id).title)}</h2>
            <ol class="key-list">
              ${questionsFor(id).map((q) => `
                <li>
                  <p class="key-q">${q.emoji ? `<span class="key-emoji">${esc(q.emoji)}</span> ` : ''}${esc(q.question)}<span class="key-diff">${esc(q.difficulty)}</span></p>
                  ${Array.isArray(q.clues) && q.clues.length ? `<ol class="key-clues">${q.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ol>` : ''}
                  <p class="key-a">Answer: ${esc(q.answer)}</p>
                  ${(q.acceptAlso || []).length ? `<p class="key-also"><em>Also accept:</em> ${q.acceptAlso.map(esc).join('; ')}</p>` : ''}
                  ${q.explanation ? `<p class="key-expl">${esc(q.explanation)}</p>` : ''}
                </li>`).join('')}
            </ol>
          </section>`).join('')}`;
    }
    function printDoc(kind) { printRoot.innerHTML = kind === 'sheet' ? buildSheet() : buildKey(); window.print(); }

    /* ----- Host actions ----- */
    const actions = {
      next, prev, reveal, newGame,
      printSheets: () => printDoc('sheet'),
      printKey: () => printDoc('key'),
      moveRound(btn) {
        const i = Number(btn.dataset.i);
        const dir = Number(btn.dataset.dir);
        const j = i + dir;
        if (j < 0 || j >= state.rounds.length) return;
        const [r] = state.rounds.splice(i, 1);
        state.rounds.splice(j, 0, r);
        render(`[data-action="moveRound"][data-i="${j}"][data-dir="${dir}"]`);
        if (document.activeElement && document.activeElement.disabled !== false) {
          const o = app.querySelector(`[data-action="moveRound"][data-i="${j}"][data-dir="${-dir}"]`);
          if (o) o.focus();
        }
        announce(`${roundById(r.id).title} moved to position ${j + 1}.`);
      },
      toggleMark(btn) {
        const pid = btn.dataset.pid;
        const qi = Number(btn.dataset.q);
        const roundId = currentRoundId();
        const now = markOf(pid, roundId, qi).ok;
        state.marks[roundId] = state.marks[roundId] || {};
        state.marks[roundId][qi] = state.marks[roundId][qi] || {};
        state.marks[roundId][qi][pid] = !now;
        render(`[data-action="toggleMark"][data-pid="${CSS.escape(pid)}"][data-q="${qi}"]`);
      },
      removePlayer(btn) {
        const pid = btn.dataset.pid;
        const p = state.players[pid];
        if (!p || !window.confirm(`Remove ${p.name} from the quiz?`)) return;
        const c = conns.get(pid);
        if (c) { try { c.send({ t: 'removed' }); } catch (e) { /* ignore */ } setTimeout(() => { try { c.close(); } catch (e) { /* ignore */ } }, 300); }
        conns.delete(pid);
        delete state.players[pid];
        render();
      },
      copyLink() {
        const link = joinUrl();
        if (!link) return;
        const done = () => announce('Link copied.');
        try {
          if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, () => window.prompt('Copy this link:', link));
          else window.prompt('Copy this link:', link);
        } catch (e) { window.prompt('Copy this link:', link); }
      }
    };

    function onChange(t) {
      if (t.dataset.round != null) {
        state.rounds[Number(t.dataset.round)].on = t.checked;
        render(`#${CSS.escape(t.id)}`);
      } else if (t.id === 'site-url') {
        if (cleanText(t.value, 300) !== (state.siteUrl || '')) setSiteUrl(t.value);
      } else if (t.name === 'mode') {
        state.mode = t.value === 'paper' ? 'paper' : 'multi';
        if (state.mode === 'paper') closeRoom();
        render(`input[name="mode"][value="${state.mode}"]`);
      }
    }
    function setSiteUrl(value) {
      const typed = cleanText(value, 300);
      state.siteUrl = parseSiteUrl(typed) || typed;
      render(parseSiteUrl(typed) ? '[data-action="next"]' : '#site-url');
    }
    function onSubmit(form) {
      if (form.id === 'setup-form') startFromSetup();
      else if (form.id === 'site-form') setSiteUrl(document.getElementById('site-url').value);
    }
    function onKey(e) {
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'ArrowLeft': e.preventDefault(); prev(); break;
        case 'r': case 'R': reveal(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        default: break;
      }
    }

    function loadQuestions() {
      return new Promise((resolve, reject) => {
        if (Array.isArray(window.QUIZ_QUESTIONS)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'data/questions.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('questions'));
        document.head.appendChild(s);
      });
    }

    async function start() {
      app.innerHTML = '<p class="stage muted">Summoning the questions…</p>';
      try { await loadQuestions(); } catch (e) { /* handled below */ }
      ROUNDS = Array.isArray(window.QUIZ_ROUNDS) ? window.QUIZ_ROUNDS : [];
      QUESTIONS = Array.isArray(window.QUIZ_QUESTIONS) ? window.QUIZ_QUESTIONS : [];
      if (!QUESTIONS.length) {
        app.innerHTML = '<p class="panel">No questions found. Check that data/questions.js is next to index.html.</p>';
        return;
      }
      state = load();
      if (multi() && state.phase !== 'setup') openRoom();
      render();
    }

    function leave() { closeRoom(); }

    return { start, actions, onChange, onSubmit, onKey, leave };
  })();

  /* =====================================================================
     QUIZZER
     ===================================================================== */
  const Player = (function () {
    let me = null;                   // { pid, name, code, answers: { roundId: [text…] } }
    let peer = null;
    let conn = null;
    let host = null;                 // latest state message from the host
    let status = 'idle';             // idle | connecting | online | lost | notfound | removed | unavailable
    let retryTimer = null;
    let shownKey = '';
    const sendTimers = {};

    function load() {
      const saved = store.get(STORAGE_PLAYER);
      me = saved && typeof saved === 'object' ? saved : {};
      if (!me.pid) me.pid = randomId();
      if (!me.answers || typeof me.answers !== 'object') me.answers = {};
      if (joinParam && joinParam !== me.code) { me.code = joinParam; me.answers = {}; }
      save();
    }
    const save = () => store.set(STORAGE_PLAYER, me);

    /* ----- Networking ----- */
    function connect() {
      clearTimeout(retryTimer);
      if (!peerAvailable()) { status = 'unavailable'; render(); return; }
      status = 'connecting';
      render();
      const go = () => {
        if (conn) { try { conn.close(); } catch (e) { /* ignore */ } }
        conn = peer.connect(peerIdFor(me.code), { reliable: true });
        conn.on('open', () => {
          status = 'online';
          conn.send({ t: 'hello', pid: me.pid, name: me.name });
          render();
        });
        conn.on('data', onHost);
        conn.on('close', () => { if (status !== 'removed') { status = 'lost'; render(); retry(); } });
        conn.on('error', () => {});
      };
      if (peer && !peer.destroyed && peer.open) { go(); return; }
      if (peer) { try { peer.destroy(); } catch (e) { /* ignore */ } }
      peer = new window.Peer({ debug: 0 });
      peer.on('open', go);
      peer.on('disconnected', () => { setTimeout(() => { if (peer && !peer.destroyed) { try { peer.reconnect(); } catch (e) { /* ignore */ } } }, 2000); });
      peer.on('error', (err) => {
        if (status === 'removed') return;
        status = err && err.type === 'peer-unavailable' ? (host ? 'lost' : 'notfound') : 'lost';
        render();
        retry();
      });
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, 4000);
    }
    function disconnect() {
      clearTimeout(retryTimer);
      if (conn) { try { conn.close(); } catch (e) { /* ignore */ } }
      if (peer) { try { peer.destroy(); } catch (e) { /* ignore */ } }
      conn = null;
      peer = null;
      host = null;
    }

    function onHost(d) {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'removed') {
        status = 'removed';
        disconnect();
        me.code = '';
        save();
        render();
        return;
      }
      if (d.t !== 'state') return;
      host = d;
      // Keep the host and this phone in step: resend anything the host is missing.
      if (d.phase === 'question' && d.round) {
        const local = me.answers[d.round.id] || [];
        const remote = Array.isArray(d.myAnswers) ? d.myAnswers : [];
        for (let i = 0; i <= Math.min(d.qIdx, d.round.qCount - 1); i++) {
          if (local[i] && local[i] !== remote[i]) sendAnswer(d.round.id, i, local[i]);
          else if (!local[i] && remote[i]) { me.answers[d.round.id] = local; local[i] = remote[i]; }
        }
        save();
      }
      render();
    }

    function sendAnswer(roundId, qi, text) {
      if (conn && conn.open) { try { conn.send({ t: 'answer', round: roundId, q: qi, text }); } catch (e) { /* resent on reconnect */ } }
    }

    /* ----- Rendering ----- */
    function statusLine() {
      const map = {
        connecting: ['is-connecting', 'Connecting to the quiz…'],
        online: ['is-online', `Connected to room ${esc(me.code)}`],
        lost: ['is-error', 'Connection lost, reconnecting… (your answers are saved on this phone)'],
        notfound: ['is-error', `Can't find room ${esc(me.code)} yet. Check the code with your host; trying again…`],
        unavailable: ['is-error', 'The quiz connection service could not load. Check your internet and refresh.']
      };
      const s = map[status];
      return s ? `<p class="net-pill ${s[0]}" role="status"><span class="dot" aria-hidden="true"></span>${s[1]}</p>` : '';
    }

    function viewJoin(error) {
      return `
      <section class="setup setup-narrow" aria-labelledby="join-title">
        <div class="setup-intro">
          <h2 id="join-title" tabindex="-1">Join the quiz</h2>
          <p class="muted">Enter your name and the room code shown by the host.</p>
        </div>
        <form id="join-form" class="panel join-form" novalidate>
          <label for="join-name">Your name</label>
          <input id="join-name" class="input input-big" type="text" maxlength="${MAX_NAME}" autocomplete="nickname" value="${esc(me.name || '')}" required ${me.name ? '' : 'data-autofocus'}>
          <label for="join-code">Room code</label>
          <input id="join-code" class="input input-big input-code" type="text" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(me.code || '')}" required ${me.name && !me.code ? 'data-autofocus' : ''}>
          <p class="form-error" id="join-error" role="alert">${error ? esc(error) : ''}</p>
          <button type="submit" class="btn btn-primary btn-big" ${me.name && me.code ? 'data-autofocus' : ''}>Join 👻</button>
        </form>
      </section>`;
    }

    function answersList(roundId, upTo, editable) {
      const list = me.answers[roundId] || [];
      let html = '';
      for (let i = 0; i <= upTo; i++) {
        html += editable
          ? `<li><label for="ans-${i}" class="ans-label">Q${i + 1}</label>
              <input id="ans-${i}" class="input" type="text" maxlength="${MAX_ANSWER}" autocomplete="off" data-answer="${i}" value="${esc(list[i] || '')}"></li>`
          : `<li><span class="ans-label">Q${i + 1}</span><span class="ans-text">${list[i] ? esc(list[i]) : '<em class="muted">no answer</em>'}</span></li>`;
      }
      return `<ol class="my-answers">${html}</ol>`;
    }

    function viewWaiting() {
      if (!host) {
        return `
        <section class="stage player" aria-labelledby="wait-title">
          ${statusLine()}
          <h2 class="player-title" id="wait-title" tabindex="-1">Hi ${esc(me.name)}!</h2>
          <p class="lede">Hold tight…</p>
          <button type="button" class="btn btn-ghost btn-small" data-action="leaveRoom">Change name or room</button>
        </section>`;
      }
      const r = host.round;
      switch (host.phase) {
        case 'intro':
          return `
          <section class="stage player" aria-labelledby="p-title">
            ${statusLine()}
            <p class="eyebrow">Round ${r.idx + 1} of ${r.count}</p>
            <div class="big-emoji" aria-hidden="true">${esc(r.emoji)}</div>
            <h2 class="player-title" id="p-title" tabindex="-1">${esc(r.title)}</h2>
            <p class="lede">Get ready: the host is about to read the first question.</p>
          </section>`;
        case 'question': {
          const qi = Math.min(host.qIdx, r.qCount - 1);
          const current = (me.answers[r.id] || [])[qi] || '';
          return `
          <section class="stage player" aria-labelledby="p-title">
            ${statusLine()}
            <p class="eyebrow">${esc(r.emoji)} ${esc(r.title)} · Round ${r.idx + 1} of ${r.count}</p>
            <h2 class="q-number" id="p-title" tabindex="-1">Question ${qi + 1}</h2>
            <form id="answer-form" class="panel answer-form" novalidate>
              <label for="ans-current" class="sr-only">Your answer to question ${qi + 1}</label>
              <input id="ans-current" class="input input-big" type="text" maxlength="${MAX_ANSWER}" autocomplete="off"
                placeholder="Type your answer…" data-answer="${qi}" value="${esc(current)}" data-autofocus>
              <p class="saved-note" id="saved-note" aria-live="polite">${current ? 'Saved ✓' : 'Listen to the host, then type your answer.'}</p>
            </form>
            ${qi > 0 ? `
            <details class="panel earlier">
              <summary>Change an earlier answer in this round</summary>
              ${answersList(r.id, qi - 1, true)}
            </details>` : ''}
          </section>`;
        }
        case 'locked':
          return `
          <section class="stage player" aria-labelledby="p-title">
            ${statusLine()}
            <p class="eyebrow">${esc(r.emoji)} ${esc(r.title)}</p>
            <h2 class="player-title" id="p-title" tabindex="-1">Answers locked 🔒</h2>
            <p class="lede">The host is revealing the answers. Scores are announced at the end!</p>
            <div class="panel">${answersList(r.id, r.qCount - 1, false)}</div>
          </section>`;
        case 'final': {
          const board = Array.isArray(host.board) ? host.board : [];
          const mine = board.find((b) => b.me);
          return `
          <section class="board player" aria-labelledby="p-title">
            <div class="winner">
              <div class="trophy" aria-hidden="true">🏆</div>
              <p class="eyebrow">Final scores</p>
              <h2 class="player-title" id="p-title" tabindex="-1">${mine ? (mine.rank === 1 ? 'You won! 🎉' : `You came ${ordinal(mine.rank)}`) : 'The results are in'}</h2>
              ${mine ? `<p class="lede" style="margin:0 auto">${mine.total} out of ${host.max}</p>` : ''}
            </div>
            <ol class="board-list">${board.map((b) => `
              <li class="board-item ${b.me ? 'is-leader' : ''}">
                <span class="board-rank">${b.rank}</span>
                <span class="board-name">${esc(b.name)}${b.me ? ' (you)' : ''}</span>
                <span class="board-total">${b.total}</span>
              </li>`).join('')}</ol>
          </section>`;
        }
        default:
          return `
          <section class="stage player" aria-labelledby="p-title">
            ${statusLine()}
            <div class="big-emoji" aria-hidden="true">🎃</div>
            <h2 class="player-title" id="p-title" tabindex="-1">You're in, ${esc(me.name)}!</h2>
            <p class="lede">Waiting for the host to start the quiz…</p>
            <button type="button" class="btn btn-ghost btn-small" data-action="leaveRoom">Change name or room</button>
          </section>`;
      }
    }
    const ordinal = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    function render(error) {
      setChrome({ newGame: false, role: !me.code || status === 'removed', keys: false, noFullscreen: true });
      document.body.dataset.phase = 'player';
      if (!me.name || !me.code || status === 'removed') {
        if (shownKey === 'join' && !error) return;
        shownKey = 'join';
        app.innerHTML = viewJoin(error || (status === 'removed' ? 'The host removed you from that quiz.' : ''));
        focusAuto();
        return;
      }
      // Only rebuild the screen when something visible changed, so typing isn't interrupted.
      const key = host ? [host.phase, host.round && host.round.id, host.qIdx, status].join('|') : `wait|${status}`;
      if (key === shownKey) return;
      const prevPhase = shownKey.split('|')[0];
      shownKey = key;
      app.innerHTML = viewWaiting();
      if (host && host.phase === 'question' && prevPhase !== 'question') announce('New question.');
      focusAuto();
    }
    function focusAuto() {
      const t = app.querySelector('[data-autofocus]') || app.querySelector('h2');
      if (t) t.focus({ preventScroll: true });
    }

    /* ----- Quizzer events ----- */
    const actions = {
      leaveRoom() {
        disconnect();
        me.code = '';
        status = 'idle';
        save();
        shownKey = '';
        render();
      }
    };
    function onInput(t) {
      if (t.dataset.answer == null || !host || !host.round) return;
      const roundId = host.round.id;
      const qi = Number(t.dataset.answer);
      me.answers[roundId] = me.answers[roundId] || [];
      me.answers[roundId][qi] = cleanText(t.value, MAX_ANSWER);
      save();
      const note = document.getElementById('saved-note');
      if (note && t.id === 'ans-current') note.textContent = 'Saving…';
      clearTimeout(sendTimers[qi]);
      sendTimers[qi] = setTimeout(() => {
        sendAnswer(roundId, qi, me.answers[roundId][qi]);
        const n = document.getElementById('saved-note');
        if (n && t.id === 'ans-current') n.textContent = status === 'online' ? 'Saved ✓' : 'Saved on this phone, sending when reconnected';
      }, 350);
    }
    function onSubmit(form) {
      if (form.id === 'join-form') {
        const name = cleanText(document.getElementById('join-name').value, MAX_NAME);
        const code = cleanText(document.getElementById('join-code').value, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!name) { render('Please enter your name.'); return; }
        if (code.length !== 5) { render('The room code has 5 letters or numbers.'); return; }
        if (code !== me.code) me.answers = {};
        me.name = name;
        me.code = code;
        status = 'idle';
        save();
        shownKey = '';
        connect();
      } else if (form.id === 'answer-form') {
        const input = document.getElementById('ans-current');
        if (input) { onInput(input); input.blur(); }
      }
    }

    function start() {
      load();
      shownKey = '';
      if (me.name && me.code) connect(); else render();
    }
    function leave() { disconnect(); }

    return { start, actions, onInput, onSubmit, leave };
  })();

  /* ---------------- Wiring ---------------- */
  const common = {
    pickHost: () => chooseRole('host'),
    pickPlayer: () => chooseRole('player'),
    switchRole() {
      Host.leave();
      Player.leave();
      if (joinParam) history.replaceState(null, '', location.pathname);
      chooseRole(null);
    },
    fullscreen: toggleFullscreen
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const name = btn.dataset.action;
    const fn = common[name] || (role === 'host' ? Host.actions[name] : role === 'player' ? Player.actions[name] : null);
    if (fn) { e.preventDefault(); fn(btn); }
  });
  app.addEventListener('change', (e) => { if (role === 'host') Host.onChange(e.target); });
  app.addEventListener('input', (e) => { if (role === 'player') Player.onInput(e.target); });
  app.addEventListener('submit', (e) => {
    e.preventDefault();
    if (role === 'host') Host.onSubmit(e.target); else if (role === 'player') Player.onSubmit(e.target);
  });
  document.addEventListener('keydown', (e) => {
    if (role !== 'host' || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
    Host.onKey(e);
  });
  window.addEventListener('afterprint', () => { printRoot.innerHTML = ''; });

  function boot() {
    if (role === 'host') Host.start();
    else if (role === 'player') Player.start();
    else {
      setChrome({ newGame: false, role: false, keys: false });
      document.body.dataset.phase = 'landing';
      app.innerHTML = viewLanding();
      const h = app.querySelector('h2');
      if (h) h.focus({ preventScroll: true });
    }
  }
  boot();
})();
