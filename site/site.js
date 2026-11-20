// 조립된 사이트: 표지 → 웹툰 한 화 → (도현의 노트) → 실습 → 다음 화. 주소는 #/… 로 나눈다(파일로 열어도 동작).
// 진행(읽은 화, 마친 실습)은 이 브라우저에만 저장한다(localStorage, 없으면 저장 없이 동작).
(function () {
const EPS = ['1', '2', '3', '4', '5', '6', '7', '8', 'E'];
const PART = {1: '1부 이어 가기', 2: '1부 이어 가기', 3: '1부 이어 가기', 4: '1부 이어 가기', 5: '2부 넓혀 가기', 6: '2부 넓혀 가기', 7: '2부 넓혀 가기', 8: '2부 넓혀 가기', E: '에필로그'};
const FEATURE = Object.fromEntries(Comic.BLANKS.map(([, f], i) => [String(i + 1), f]).concat([['E', 'Release']]));
const epName = ep => ep === 'E' ? '에필로그' : `${ep}화`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const blankName = ep => Comic.TITLE[ep][1].replace(/^빈칸 \d · /, '');
const labOf = ep => LABS.find(L => L.ep === ep);
const noteOf = ep => NOTES.find(n => n.ep === ep);

// 그림: 원본 PNG 경로 → 웹용 WebP 사본
const ASSET = p => 'img/' + p.replace(/^\.\.\/art\//, '').replace(/\.png$/, '.webp');
Comic.setAsset(ASSET); Cards.setAsset(ASSET); Notes.setAsset(ASSET);
Cards.setNoteLink(ep => `#/note/${ep}`); Notes.setLabLink(id => `#/lab/${id}`);
Cards.bindCopy();
Flow.setAsset(ASSET); Flow.setNoteLink(ep => `#/note/${ep}`);
window.onFlowDone = id => mark('labs', id);
const pill = () => { const v = Course.overall(); document.getElementById('prog-pct').textContent = v + '%'; document.getElementById('prog-bar').style.width = v + '%'; };
window.onCourseChange = pill;
const toolSel = document.getElementById('tool');
toolSel.value = Flow.tool(); toolSel.addEventListener('change', () => Flow.setTool(toolSel.value));

// 진행 저장
const KEY = 'vibe-blanks:v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {read: [], labs: []}; } catch { return {read: [], labs: []}; } };
const save = st => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* 저장 못 해도 읽기는 된다 */ } };
let state = load();
const isRead = ep => state.read.includes(ep);
function mark(kind, id, on = true) {
  const set = new Set(state[kind]); on ? set.add(id) : set.delete(id);
  state = {...state, [kind]: [...set]}; save(state); dots();
}

function dots() {
  document.getElementById('dots').innerHTML = EPS.map(ep => `<a href="#/ep/${ep}" class="dot ${isRead(ep) ? 'on' : ''} ${ep === 'E' ? 'plus' : ''}" title="${esc(Comic.TITLE[ep][1])}${isRead(ep) ? ' — 채움' : ''}"><span>${ep === 'E' ? '+' : ep}</span></a>`).join('');
}

// ── 화면들 ──
const CAST = [
  ['seoyun', '서윤', '28세, 회사 기획자. 코딩은 배운 적 없다. 늘 "어디 갈지 정하는 사람".', '주인공. 곤란을 겪고, 묻고, AI 에게 시키고, 정한다'],
  ['dohyun', '도현', '28세, 서윤의 대학 때부터 절친. 웹 개발자 7년 차.', '쉬운 비유로 방법만 알려 준다. 코드는 대신 만들지 않는다'],
  ['sua', '수아', '28세, 아이디어가 많고 사진과 분위기를 중요하게 본다.', '기능 요청 담당. "사진도!", "비 오면 실내만"'],
  ['junho', '준호', '29세, 행동파. 이번 여행의 총무. 늘 휴대폰으로 써 본다.', '버그 제보 담당. "제주 누르면 텅 비어"'],
  ['ai', 'AI', '서윤이 쓰는 AI 코딩 도구. Copilot·Claude Code·Codex 중 무엇이든.', '서윤의 말을 듣고 실제로 일한다'],
];
function home() {
  const blank = ep => `<a class="blk ${isRead(ep) ? 'on' : ''} ${ep === 'E' ? 'plus' : ''}" href="#/ep/${ep}">
      <span class="no">${ep === 'E' ? '+' : ep}</span><span class="nm">${esc(blankName(ep))}</span><span class="fn">${esc(FEATURE[ep])}</span>
      <span class="ep">${epName(ep)} 「${esc(Comic.TITLE[ep][0])}」</span>${isRead(ep) ? '<span class="ok">✓ 채움</span>' : ''}</a>`;
  const next = EPS.find(e => !isRead(e)) || '1';
  const quote = (LINES['3-8'] || []).find(b => b.k === 'say') || {t: ''};
  return `<section class="overview-hero">
      <div class="hero-editorial"><p class="eyebrow"><i></i>바이브 코딩, 그다음</p>
        <h1>바이브 코딩의<br><span>빈칸</span></h1>
        <div class="hero-copy"><p>AI 에게 말로 앱을 만드는 건 이제 어렵지 않습니다.</p><p>그런데 바이브 코딩에는 아무도 말해 주지 않는 빈칸이 있습니다.</p>
          <p>잘 되던 버전이 사라지고, 파일은 집 PC 에만 있고, 대화창을 새로 열면 AI 는 어제 일을 모릅니다.</p>
          <p>「주말 어디갈까」를 만드는 서윤의 열흘을 웹툰으로 따라가 보세요.</p></div>
        <div class="hero-actions"><a class="primary" href="#/ep/${next}">${state.read.length ? '이어서 읽기' : '1화부터 읽기'}</a><a class="ghost" href="#/labs">실습 바로 하기</a><a class="ghost" href="weekend-places-kit.zip" download>시작 키트</a></div>
        <p class="hero-note">책장처럼 넘기며 웹툰 한 화를 읽고, 그 화의 실습을 내 AI 도구로 따라 합니다. 혼자서 할 수 있게 짰습니다.</p></div>
      <figure class="hero-webtoon"><img src="img/cut/ep3-08.webp" alt="브런치 식당에서 각자 휴대폰으로 앱을 여는 네 친구"><figcaption><b>“${esc(quote.t.replace(/\n/g, ' '))}”</b><span>친구의 한마디가 다음 기능이 된다.</span></figcaption></figure>
    </section>
    <section class="outcome-band"><span>이 웹툰에서 따라갈 것</span><b>나 혼자 쓰던 앱</b><i aria-hidden="true">→</i><b>어디서든 이어 가고, 함께 쓰고, AI 여럿과 키우는 서비스</b><em>DB 없이 · JSON · Pages</em></section>
    <section class="sect"><h2>빈칸 여덟 개 <small>${state.read.length ? `${state.read.filter(e => e !== 'E').length} / 8 채움` : '화를 읽을 때마다 하나씩 채워집니다'}</small></h2>
      <p class="part-lbl">1부 이어 가기 — 일이 끊기는 빈칸</p><div class="blks">${['1', '2', '3', '4'].map(blank).join('')}</div>
      <p class="part-lbl">2부 넓혀 가기 — 혼자서는 좁은 빈칸</p><div class="blks">${['5', '6', '7', '8'].map(blank).join('')}</div>
      <div class="blks one">${blank('E')}</div></section>
    <section class="sect"><h2>등장인물</h2><div class="cast">${CAST.map(([k, n, who, role]) => `<div class="person">${k === 'ai' ? '<span class="face ai">✦</span>' : `<img class="face" style="--c:var(--${k})" src="img/ref/char-${k}-face.webp" alt="">`}<div><b>${n}</b><p>${esc(who)}</p><small>${esc(role)}</small></div></div>`).join('')}</div>
      <p class="motto">방법은 도현이, 손은 AI 가, 결정은 서윤이.</p></section>
    <section class="sect how"><h2>이렇게 진행해요</h2><ol class="how-steps"><li><span>01</span><b>웹툰 한 화</b>약 2분. 서윤이 바이브 코딩으로 앱을 만들다 막힌 순간과, 그걸 풀어 가는 이야기</li><li><span>02</span><b>직접 해 보기</b>서윤이 바이브 코딩하듯 나도 AI 도구에게 따라서 해 보기</li><li><span>03</span><b>📒 도현의 GitHub Tips</b>궁금하면 정확한 설명. 나중에 펼쳐 봐도 된다</li></ol>
      <p><a href="#/labs">실습 전체와 120분 시간표 →</a></p></section>`;
}

// ── 웹툰 책장: 한 쪽 = 컷 하나. 넓은 화면은 두 쪽 펼침(가운데를 축으로 3D 로 넘어감), 좁은 화면은 한 쪽씩 ──
// 책 하나에 모든 화가 이어진다: 화마다 컷 8개 + 끝 펼침면(왼쪽: 이번 화에서 채운 빈칸·도현의 노트, 오른쪽: 직접 해 보기)
const ITEMS = EPS.flatMap(ep => [...SHOTS.filter(s => s.id.split('-')[0] === ep).map(s => ({ep, kind: 'cut', s})), {ep, kind: 'end-l'}, {ep, kind: 'end-r'}]);
const blankBox = ep => `<i>${ep === 'E' ? '+' : ep}</i>`;
function endLeft(ep) {
  const n = noteOf(ep), say = n.lines.find(b => b.who === 'dohyun') || n.lines[0];
  if (ep === 'E') return `<div class="end-in"><p class="end-k">에필로그 끝</p><p class="end-lbl">바이브 코딩의 빈칸, 다 채웠다</p>
    <div class="end-all">${EPS.map(e => `<span class="${isRead(e) || e === 'E' ? 'on' : ''}">${blankBox(e)}<b>${esc(blankName(e))}</b></span>`).join('')}</div>
    <button type="button" class="btn note-btn" data-open-note="E">📒 도현의 GitHub Tips — ${esc(n.title)}</button></div>`;
  return `<div class="end-in"><p class="end-k">${epName(ep)} 끝</p><p class="end-lbl">이번 화에서 채운 빈칸</p>
    <div class="end-blank">${blankBox(ep)}<b>${esc(blankName(ep))}</b><small>${esc(FEATURE[ep])}</small></div>
    <figure class="end-say"><img src="img/ref/char-dohyun-face.webp" alt=""><blockquote>${esc(say.t.replace(/\*\*/g, '').replace(/\n/g, ' '))}</blockquote></figure>
    <p class="end-what">정확히는 — <b>${esc(n.title)}</b></p>
    <button type="button" class="btn note-btn" data-open-note="${ep}">📒 도현의 GitHub Tips 펼치기</button></div>`;
}
function endRight(ep) {
  const L = labOf(ep), next = EPS[EPS.indexOf(ep) + 1];
  return `<div class="end-in"><p class="end-k">직접 해 보기</p><h3>실습 ${L.id}<br>${esc(L.title)}</h3>
    <p class="end-chips"><span class="${L.required ? 'req' : ''}">${L.required ? '필수' : '선택'}</span><span>약 ${L.min}분</span></p>
    <ol class="end-steps">${L.steps.map(s => `<li>${esc(s.t)}</li>`).join('')}</ol>
    <a class="btn primary" href="#/lab/${L.id}">실습 ${L.id} 시작 →</a>
    <p class="end-next">${next ? `실습을 마치면 다음 장으로 — ${epName(next)} 「${esc(Comic.TITLE[next][0])}」` : '<a href="#/">처음으로 — 다 채운 빈칸 보기</a>'}</p></div>`;
}
const pageHtml = (it, k) => `<section class="bk-page ${it.kind}" data-k="${k}" data-ep="${it.ep}" hidden>${it.kind === 'cut' ? Comic.panel(it.s) : it.kind === 'end-l' ? endLeft(it.ep) : endRight(it.ep)}<span class="bk-folio">${k + 1}</span></section>`;

function bookView() {
  return `<section class="ep-head bk-head"><p class="eyebrow" id="bk-part"></p><h1 id="bk-title"></h1><span class="chip-blank" id="bk-blank"></span></section>
    <div class="book">
      <div class="bk-stage v-comic" id="bk-stage" tabindex="0" aria-roledescription="만화책" aria-label="웹툰. 왼쪽·오른쪽 화살표 키나 화면 왼쪽·오른쪽을 눌러 넘깁니다.">${ITEMS.map(pageHtml).join('')}</div>
      <div class="bk-bar"><button type="button" class="bk-nav" data-turn="-1"><span aria-hidden="true">‹</span> 앞 장</button><span class="bk-mid"><button type="button" class="bk-play" id="bk-play" aria-pressed="false" title="대사 듣기 (스페이스)"><span class="ic">▶</span><span class="tx">듣기</span></button><label class="bk-rate" title="재생 속도">속도 <input type="range" id="bk-rate" min="0.75" max="2" step="0.05"><output id="bk-rate-v"></output></label><span class="bk-count" id="bk-count" aria-live="polite"></span></span><button type="button" class="bk-nav" data-turn="1">다음 장 <span aria-hidden="true">›</span></button></div>
      <div class="bk-progress" aria-hidden="true"><i id="bk-progress"></i></div>
      <nav class="bk-toc" aria-label="화 목록">${EPS.map(e => `<button type="button" data-go="${e}">${e === 'E' ? '에필로그' : e + '화'}</button>`).join('')}</nav>
    </div>`;
}

const Book = (() => {
  const wide = matchMedia('(min-width: 900px)');
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stage = null, pages = [], cur = 0, spread = true, flipping = null;
  const align = i => spread ? i - (i % 2) : i;
  const visible = i => (spread ? [i, i + 1] : [i]).filter(k => k < pages.length);
  const paint = () => { const v = visible(cur); pages.forEach((p, k) => { p.hidden = !v.includes(k); }); };
  function measure() {           // 숨은 쪽까지 말풍선 자리를 잡아 둔다(넘길 때 복제본이 바로 보이게)
    stage.classList.add('measuring'); Comic.layoutAll(stage); stage.classList.remove('measuring');
  }
  function settle() { if (!flipping) return; const f = flipping; flipping = null; f.anims.forEach(a => a.cancel()); f.leaf.remove(); }
  function mode() {
    settle();
    spread = wide.matches;
    stage.classList.toggle('spread', spread); stage.classList.toggle('single', !spread);
    pages.forEach((p, k) => { p.classList.toggle('slot-l', spread && k % 2 === 0); p.classList.toggle('slot-r', spread && k % 2 === 1); });
    cur = align(cur); paint(); measure(); meta();
  }
  function flip(from, to) {     // 이전 판(github-study)의 책장 넘김과 같은 방식
    const fwd = to > from, [a, b, c, d] = [from, from + 1, to, to + 1];
    const under = fwd ? [a, d] : [c, b];
    pages.forEach((p, k) => { p.hidden = !under.includes(k); });
    const leaf = document.createElement('div');
    leaf.className = `bk-leaf ${fwd ? 'leaf-r' : 'leaf-l'}`; leaf.inert = true; leaf.setAttribute('aria-hidden', 'true');
    const face = (k, back) => {
      const f = document.createElement('div'); f.className = `bk-face${back ? ' back' : ''}`;
      if (pages[k]) { const cl = pages[k].cloneNode(true); cl.hidden = false; cl.classList.remove('slot-l', 'slot-r'); f.append(cl); }
      const sh = document.createElement('i'); sh.className = 'bk-shade'; f.append(sh); return f;
    };
    const front = face(fwd ? b : a, false), back = face(fwd ? c : d, true);
    leaf.append(front, back); stage.append(leaf);
    const opt = {duration: 700, easing: 'cubic-bezier(.4, .05, .25, 1)'};
    const anims = [leaf.animate([{transform: 'rotateY(0deg)'}, {transform: `rotateY(${fwd ? -180 : 180}deg)`}], opt),
      front.lastChild.animate([{opacity: 0}, {opacity: .35}], opt), back.lastChild.animate([{opacity: .35}, {opacity: 0}], opt)];
    const f = {anims, leaf}; flipping = f;
    anims[0].onfinish = () => { if (flipping === f) { flipping = null; leaf.remove(); paint(); } };
  }
  function meta() {
    const v = visible(cur), ep = pages[cur].dataset.ep;
    document.getElementById('bk-part').textContent = PART[ep];
    document.getElementById('bk-title').textContent = `${epName(ep)} 「${Comic.TITLE[ep][0]}」`;
    document.getElementById('bk-blank').innerHTML = `${blankBox(ep)}${esc(blankName(ep))} · ${esc(FEATURE[ep])}`;
    document.getElementById('bk-count').textContent = `${epName(ep)} · ${v.map(k => k + 1).join('–')} / ${pages.length}쪽`;
    document.getElementById('bk-progress').style.width = `${((v.at(-1) + 1) / pages.length) * 100}%`;
    document.querySelector('[data-turn="-1"]').disabled = cur === 0;
    document.querySelector('[data-turn="1"]').disabled = v.at(-1) >= pages.length - 1;
    for (const b of document.querySelectorAll('.bk-toc [data-go]')) b.setAttribute('aria-current', String(b.dataset.go === ep));
    document.title = `${epName(ep)} 「${Comic.TITLE[ep][0]}」 · 바이브 코딩의 빈칸`;
    try { history.replaceState(null, '', `#/ep/${ep}`); } catch { /* 파일로 열면 막힐 수 있음 */ }
    for (const k of v) if (pages[k].classList.contains('end-l')) mark('read', pages[k].dataset.ep);
    for (const k of visible(align(v.at(-1) + 1)).concat(v)) pages[k]?.querySelectorAll('img').forEach(im => { im.loading = 'eager'; });   // 다음 장 그림 미리 받기
  }
  function show(i, instant = false) {
    i = align(Math.max(0, Math.min(pages.length - 1, i)));
    if (i === cur && !instant) return;
    const from = cur; cur = i; settle();
    if (instant || reduce() || from === i) paint();
    else if (spread) flip(from, i);
    else { paint(); const p = pages[i]; p.classList.remove('turn-fwd', 'turn-back'); void p.offsetWidth; p.classList.add(i > from ? 'turn-fwd' : 'turn-back'); }
    meta();
    window.Player?.onPage();
  }
  const turn = d => { const before = cur; show(cur + d * (spread ? 2 : 1)); return cur !== before; };
  const openPages = () => visible(cur).map(k => pages[k]);
  function mount(view) {
    view.innerHTML = bookView(); view.dataset.view = 'book';
    stage = document.getElementById('bk-stage'); pages = [...stage.querySelectorAll('.bk-page')]; cur = 0;
    mode();
    document.fonts.ready.then(measure);
    stage.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      const r = stage.getBoundingClientRect(); turn(e.clientX < r.left + r.width / 2 ? -1 : 1);
    });
    let sx = null;
    stage.addEventListener('pointerdown', e => { sx = e.clientX; });
    stage.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50) { e.preventDefault(); turn(e.clientX < sx ? 1 : -1); } sx = null; });
    view.querySelector('.book').addEventListener('click', e => {
      const t = e.target.closest('[data-turn]'); if (t) turn(Number(t.dataset.turn));
      const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go, true);
    });
  }
  function go(ep, instant = true) { const i = pages.findIndex(p => p.dataset.ep === ep); if (i >= 0) show(i, instant); }
  wide.addEventListener('change', () => { if (stage?.isConnected) mode(); });
  let t = 0;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (stage?.isConnected) measure(); }, 150); });
  document.addEventListener('keydown', e => {
    if (!stage?.isConnected || !document.getElementById('drawer').hidden || e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
  });
  return {mount, go, turn, openPages, flipping: () => !!flipping, active: () => !!stage?.isConnected};
})();

// ── 대사 듣기: 펼친 쪽의 대사를 말풍선 순서대로 → 다 끝나면 다음 장으로 넘기며 이어서 ──
// 음성: Azure Speech MAI 음성(art/voice.mjs 배역·감정, node scripts/build-voice.mjs → site/audio/*.m4a, art/voice.data.js)
const Player = (() => {
  const audio = new Audio(); audio.preload = 'auto';
  const KEY = 'vibe-voice:v1';
  let rate = (() => { try { return Number(JSON.parse(localStorage.getItem(KEY))?.rate) || 1.2; } catch { return 1.2; } })();
  let playing = false, queue = [], idx = 0, timer = 0, lit = null, seq = 0;
  const btn = () => document.getElementById('bk-play');
  function ui() {
    const b = btn(); if (!b) return;
    b.setAttribute('aria-pressed', String(playing)); b.querySelector('.ic').textContent = playing ? '❚❚' : '▶'; b.querySelector('.tx').textContent = playing ? '멈춤' : '듣기';
    const r = document.getElementById('bk-rate'), v = document.getElementById('bk-rate-v');
    if (r) { r.value = rate; v.textContent = `${rate.toFixed(2).replace(/0$/, '')}×`; }
  }
  function light(el) { lit?.classList.remove('speaking'); lit = el; el?.classList.add('speaking'); }
  // 펼친 쪽들의 대사: 왼쪽 쪽 → 오른쪽 쪽, 컷 안에서는 말풍선 순서
  function build() {
    return Book.openPages().flatMap(pg => {
      const panel = pg.querySelector('.panel[data-id]'); if (!panel) return [];
      const bubs = panel.querySelectorAll('.bub');
      return (VOICE.clips[panel.dataset.id] || []).map((c, i) => c && {...c, el: bubs[i]}).filter(Boolean);
    });
  }
  function step() {
    clearTimeout(timer); light(null);
    if (!playing) return;
    if (idx >= queue.length) {      // 이 펼침면 끝 → 다음 장 (대사 없는 화 끝 쪽은 잠깐 머문다)
      timer = setTimeout(() => { if (playing && !Book.turn(1)) stop(); }, queue.length ? 450 / rate : 2600);
      return;
    }
    const c = queue[idx++], my = ++seq; light(c.el);
    let moved = false;
    const go = ms => { if (moved || my !== seq || !playing) return; moved = true; timer = setTimeout(step, ms); };
    // 소리를 못 내도(불러오기 실패·해독기 없음) 대사 길이만큼 말풍선을 밝혀 두고 다음으로 — 자동 재생이 막혔을 때만 멈춘다
    audio.onended = () => go(220 / rate);
    audio.onerror = () => go(c.d * 1000 / rate);
    audio.src = `audio/${c.f}`; audio.playbackRate = rate;
    audio.play().catch(err => { if (err?.name === 'NotAllowedError') stop(); else go(c.d * 1000 / rate); });
  }
  function start() { if (!Book.active()) return; playing = true; ui(); queue = build(); idx = 0; step(); }
  function stop() { playing = false; seq++; clearTimeout(timer); audio.pause(); light(null); ui(); }
  function onPage() {             // 손으로 넘겨도, 자동으로 넘겨도 새 펼침면의 처음부터
    ui();
    if (!playing) return;
    seq++; clearTimeout(timer); audio.pause(); light(null);
    timer = setTimeout(() => { queue = build(); idx = 0; step(); }, Book.flipping() ? 760 : 120);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#bk-play')) playing ? stop() : start();
  });
  document.addEventListener('input', e => {
    if (e.target.id !== 'bk-rate') return;
    rate = Number(e.target.value); audio.playbackRate = rate; ui();
    try { localStorage.setItem(KEY, JSON.stringify({rate})); } catch { /* 저장 못 해도 된다 */ }
  });
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || !Book.active() || e.target.closest('input, textarea, select, button, a') || !document.getElementById('drawer').hidden) return;
    e.preventDefault(); playing ? stop() : start();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
  window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/ep/')) stop(); });
  return {start, stop, onPage, playing: () => playing, audio};
})();
window.Player = Player;

function labs() {
  const tile = L => `<a class="lab-tile ${L.required ? '' : 'opt'} ${state.labs.includes(L.id) ? 'done' : ''}" href="#/lab/${L.id}"><span class="big-n">${L.id}</span>
    <span class="t"><small>${L.ep ? `웹툰 ${epName(L.ep)} · ${esc(blankName(L.ep))}` : '시작 전'}</small><b>${esc(L.title)}</b><em>${L.required ? '필수' : '선택'} · ${L.min ? `약 ${L.min}분` : esc(L.when)}${state.labs.includes(L.id) ? ' · ✓ 마침' : ''}</em></span></a>`;
  return `<div class="v-flow"><div class="band"><span>직접 해 보기 <b>「주말 어디갈까」</b></span><span>내가 한 말 → AI 가 한 일 → 바뀐 결과 <i>내 AI 도구로 그대로 따라 하기</i></span></div></div>
    <section class="labs-page"><p class="eyebrow"><i></i>실습</p><h1>웹툰 한 화, 실습 하나</h1>
      <p class="lead">서윤이 바이브 코딩하듯 나도 AI 도구에게 따라서 해 봅니다. 실습 0 은 워크숍 전에 집에서, 필수 실습만으로 120분 안에 끝나게 짰습니다.</p>
      <div class="lab-grid">${LABS.map(tile).join('')}</div>
      <div class="v-lab"><section class="plan">${Cards.plan().replace(/<div class="toc">[\s\S]*$/, '')}</section></div></section>`;
}

function notePage(ep) {
  return `<nav class="note-toc">${EPS.map(e => `<a href="#/note/${e}" aria-current="${e === ep}">${e === 'E' ? '+' : e} ${esc(noteOf(e).title)}</a>`).join('')}</nav><p class="crumb"><a href="#/ep/${ep}">← ${epName(ep)} 웹툰으로</a></p><div class="v-note">${Notes.note(noteOf(ep))}</div>`;
}

// ── 노트 서랍 ──
const drawer = document.getElementById('drawer'), scrim = document.getElementById('scrim');
let lastFocus = null;
function openNote(ep) {
  document.getElementById('drawer-body').innerHTML = Notes.note(noteOf(ep));
  lastFocus = document.activeElement;
  drawer.hidden = scrim.hidden = false; document.body.classList.add('noscroll');
  document.getElementById('drawer-close').focus();
}
function closeNote() {
  if (drawer.hidden) return;
  drawer.hidden = scrim.hidden = true; document.body.classList.remove('noscroll');
  lastFocus?.focus?.();
}
document.getElementById('drawer-close').addEventListener('click', closeNote);
scrim.addEventListener('click', closeNote);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNote(); });
document.addEventListener('click', e => {
  const n = e.target.closest('[data-open-note], a[data-note]');
  if (n) { e.preventDefault(); openNote(n.dataset.openNote || n.dataset.note); return; }
  const d = e.target.closest('[data-lab-done]');
  if (d) { const id = d.dataset.labDone, on = !state.labs.includes(id); mark('labs', id, on); d.classList.toggle('done', on); d.textContent = on ? '✓ 마쳤어요' : '실습을 마쳤어요'; }
});

// ── 주소 ──
function setView(v) {
  document.body.dataset.view = v;
  const on = {book: 'nav-ep', lab: 'nav-lab', labs: 'nav-lab', flow: 'nav-lab', basics: 'nav-basics', note: 'nav-note', badges: 'nav-badges', record: 'nav-record'}[v];
  for (const a of document.querySelectorAll('.main-nav a')) a.setAttribute('aria-current', String(a.id === on));
}
function route() {
  closeNote();
  const [, kind = '', id = ''] = (location.hash.match(/^#\/([a-z]+)(?:\/([\w-]+))?/) || []);
  const view = document.getElementById('view');
  let title = '바이브 코딩의 빈칸';
  if (kind === 'ep' && EPS.includes(id)) {
    if (!Book.active()) { Book.mount(view); window.scrollTo(0, 0); }
    Book.go(id); dots(); setView('book'); return;
  }
  view.dataset.view = '';
  if (kind === 'lab' && Course.has('vibe', id)) { Course.lesson(view, 'vibe', id); title = `실습 ${id} · ${Course.title('vibe', id)}`; }
  else if (kind === 'flow' && LABS.some(L => L.id === id)) { view.innerHTML = Flow.view(id); Flow.mount(view, id); title = `대화로 따라 하기 · 실습 ${id}`; }
  else if (kind === 'labs') { Course.home(view, 'vibe'); title = `바이브 코딩 실습 · ${title}`; }
  else if (kind === 'basics' && id && Course.has('basics', id)) { Course.lesson(view, 'basics', id); title = `${Course.title('basics', id)} · GitHub 직접 익히기`; }
  else if (kind === 'basics') { Course.home(view, 'basics'); title = `GitHub 직접 익히기 · ${title}`; }
  else if (kind === 'badges') { Course.badges(view); title = `뱃지 · ${title}`; }
  else if (kind === 'record') { Course.record(view); title = `내 기록 · ${title}`; }
  else if (kind === 'note' && noteOf(id)) { view.innerHTML = notePage(id); title = `도현의 GitHub Tips · ${noteOf(id).title}`; }
  else view.innerHTML = home();
  document.title = title;
  setView(['lab', 'labs', 'flow', 'basics', 'badges', 'record', 'note'].includes(kind) ? kind : 'home'); pill();
  if (location.hash !== '' && location.hash !== '#/') { window.scrollTo(0, 0); view.focus({preventScroll: true}); }
  dots();
}
window.addEventListener('hashchange', route);
route();
})();
