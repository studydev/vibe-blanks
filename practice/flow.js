// 실습 체험 화면 — 이전 판 github-study 의 #story(대화로 체험하기) 구성을 따른다.
// 왼쪽: 화별 실습 목차 · 가운데: "다음 ▶" 으로 한 줄씩 펼치는 대화(지금 상황 → 내가 AI 에게 → AI 가 한 일 → 권한 → 결과)
// 오른쪽: 지금 어디에 무엇이 있나(내 컴퓨터 · GitHub · 공개 사이트) + 미리 보기 앱(내 컴퓨터 / 친구가 보는 앱)
// 필요한 전역: LABS·LAB_META(labs.data.js), KIT_PLACES(places.data.js). 모양은 flow.css(.v-flow 아래).
(function () {
const TOOLS = {copilot: 'Copilot', claude: 'Claude Code', codex: 'Codex'};
const HAND = {file: ['내 컴퓨터 · 파일', 'local'], term: ['내 컴퓨터 · 터미널', 'local'], mcp: ['MCP → GitHub', 'mcp'], me: ['내가 직접', 'me']};
const MCP_DESC = {get_me: '연결된 내 GitHub 계정을 읽는다', create_repository: 'GitHub 에 새 저장소를 만든다', list_commits: '저장소의 커밋 기록을 읽는다',
  actions_list: '게시·검사(Actions) 실행 기록을 읽는다', issue_write: '이슈를 만들거나 고친다', list_issues: '이슈 목록을 읽는다', issue_read: '이슈 하나를 읽는다',
  create_pull_request: 'PR 을 연다', pull_request_read: 'PR 의 바뀐 파일·검사 결과를 읽는다', merge_pull_request: 'PR 을 main 에 합친다',
  pull_request_review_write: 'PR 에 검토 의견을 남긴다', get_job_logs: '실패한 검사의 기록(로그)을 읽는다', get_latest_release: '최신 릴리스를 읽는다'};
const BASE = {pc: {app: '없음', git: '아직 없음', commits: '없음', branch: '—', ai: 'GitHub 에 손이 닿지 않음', cs: '없음'},
  gh: {account: '—', repo: '없음', issues: '없음', prs: '없음', checks: '없음', release: '없음'},
  site: {url: '없음 — 아직 나만 볼 수 있다', shows: '—'}, app: {local: {}, site: {}}};
const ROWS = {pc: [['app', '앱'], ['git', 'git'], ['commits', '커밋'], ['branch', '가지 · 폴더'], ['ai', 'AI 의 GitHub 연결'], ['cs', '빌린 컴퓨터']],
  gh: [['account', '계정'], ['repo', '저장소'], ['issues', '이슈'], ['prs', 'PR'], ['checks', '검사 · 보호'], ['release', '릴리스']],
  site: [['url', '주소'], ['shows', '보이는 것']]};
const JEJU = [{region: '제주', name: '성산일출봉', desc: '해 뜨는 분화구, 아침 일찍', kind: 'mountain', indoor: false},
  {region: '제주', name: '협재 해수욕장', desc: '물빛이 맑은 바다', kind: 'beach', indoor: false},
  {region: '제주', name: '한라산 영실 코스', desc: '짧게 오르는 한라산', kind: 'mountain', indoor: false}];

let A = p => p, noteLink = ep => `../notes/notes.html?ep=${ep}`, kitBase = '../kit/weekend-places/';
const KEY = 'vibe-flow:v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const store = Object.assign({line: {}, tool: 'copilot', tab: 'local'}, load());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* 저장 못 해도 된다 */ } };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ph = s => esc(s).replace(/&lt;([^&]{1,40}?)&gt;/g, '<mark class="ph">&lt;$1&gt;</mark>');
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, ' ');
const ai = () => TOOLS[store.tool] || 'AI';
const epName = ep => ep === 'E' ? '에필로그' : `${ep}화`;
const blank = L => (LAB_META.BLANKS[L.ep] || '').replace(/^(빈칸 \d · |\+ )/, '');

// ── 상태: 앞 실습은 모두 마친 것으로, 이 실습은 펼친 결과까지 ──
function apply(st, set) {
  for (const [k, v] of Object.entries(set || {})) { const [a, b] = k.split('.'); if (a === 'app') st.app[b] = {...st.app[b], ...v}; else st[a][b] = v; }
}
function stateAt(L, done) {      // done: 앞에서부터 단계 수(대화 화면) 또는 체크한 단계 번호 Set(레슨 화면)
  const st = structuredClone(BASE), changed = new Set();
  const has = i => typeof done === 'number' ? i < done : done.has(i);
  const last = typeof done === 'number' ? done - 1 : Math.max(-1, ...done);
  for (const X of LABS) {
    if (X.id === L.id) { X.steps.forEach((s, i) => { if (!has(i)) return; apply(st, s.set); if (i === last) Object.keys(s.set || {}).forEach(k => changed.add(k)); }); break; }
    X.steps.forEach(s => apply(st, s.set));
  }
  return {st, changed};
}

// ── 한 실습의 줄들 ──
function linesOf(L) {
  const out = [{k: 'scene'}];
  L.steps.forEach((s, i) => {
    out.push({k: 'step', i});
    if (s.meFirst && s.do) out.push({k: 'do', i});
    (s.asks || []).forEach((a, j) => out.push({k: 'me', i, j}));
    if ((s.hands || []).some(([h]) => h !== 'me')) out.push({k: 'calls', i});
    if (!s.meFirst && s.do) out.push({k: 'do', i});
    if (s.perm) out.push({k: 'perm', i});
    out.push({k: 'result', i});
  });
  out.push({k: 'end'});
  return out;
}
const scene = sc => sc ? `<figure class="mini"><img src="${A(sc.img)}" alt="" loading="lazy"><figcaption><b>웹툰 ${esc(sc.label)}</b>${sc.lines.slice(0, 2).map(b => `<span>${fmt(b.t)}</span>`).join('')}</figcaption></figure>` : '';
function call([h, w]) {
  const [label, cls] = HAND[h] || [h, 'local'];
  const tool = w.split(/[\s(×]/)[0];
  const body = h === 'mcp' ? `<span class="tool">${esc(tool)}</span><span class="tool-desc">${esc(MCP_DESC[tool] || '')}${w.length > tool.length ? ' ' + esc(w.slice(tool.length).trim()) : ''}</span>` : `<span class="call-name">${esc(w)}</span>`;
  return `<div class="call hand-${cls}"><div class="call-h"><span class="hand">${label}</span>${h === 'mcp' || h === 'term' ? '<span class="approve">승인 창</span>' : ''}</div><div class="call-t">${body}</div></div>`;
}
function lineHtml(L, ln, isNew) {
  const s = L.steps[ln.i], nw = isNew ? ' new' : '';
  switch (ln.k) {
    case 'scene': return `<p class="line scene${nw}">${esc(L.now)}</p>`;
    case 'step': return `<div class="line step-h${nw}" id="fl-step-${ln.i}"><span class="n">${ln.i + 1}</span><div class="t"><b>${esc(s.t)}</b>${s.min ? `<small>약 ${s.min}분</small>` : ''}</div>${scene(s.scene)}</div>`;
    case 'me': { const a = s.asks[ln.j]; return `<div class="line${nw}"><div class="msg me"><div class="who">나 → ${esc(ai())}${a.to ? ` · ${esc(a.to)}` : ''}</div><div class="body">${ph(a.text)}</div><button type="button" class="copy" data-copy="${esc(a.text)}">복사</button></div></div>`; }
    case 'do': return `<div class="line${nw}"><div class="call hand-me"><div class="call-h"><span class="hand">✋ 내가 직접</span></div><div class="call-t"><span class="call-do">${ph(s.do)}</span></div></div></div>`;
    case 'calls': return `<div class="line calls${nw}"><div class="who">${esc(ai())} 이 하는 일</div>${s.hands.filter(([h]) => h !== 'me').map(call).join('')}</div>`;
    case 'perm': return `<div class="line note perm${nw}"><b>🔑 이때 뜨는 권한</b>${s.perm.map(([w, what]) => `<div class="perm-r"><span>${esc(w)}</span><span>${ph(what)}</span></div>`).join('')}</div>`;
    case 'result': {
      const more = [];
      if (s.me) more.push(`<p><b>내 손</b> ${ph(s.me).replace(/\n/g, '<br>')}</p>`);
      if (s.watch) more.push(`<p><b>볼 것</b> ${ph(s.watch)}</p>`);
      if (s.note) more.push(`<p><b>참고</b> ${esc(s.note)}</p>`);
      for (const [l, c] of s.code || []) more.push(`<div class="lbl">${esc(l)}</div><pre class="code">${ph(c)}</pre>`);
      return `<div class="line${nw}"><div class="msg ai result"><div class="who">결과</div><div class="body"><b>✓ 이렇게 되면 성공</b>${ph(s.check)}${more.length ? `<details class="more"><summary>자세히</summary>${more.join('')}</details>` : ''}</div></div></div>`;
    }
    case 'end': {
      const i = LABS.indexOf(L), nextEp = L.ep ? ['1', '2', '3', '4', '5', '6', '7', '8', 'E'][['1', '2', '3', '4', '5', '6', '7', '8', 'E'].indexOf(L.ep) + 1] : '1';
      const m = L.measured || {};
      return `<div class="line lesson${nw}"><h3>✓ 실습 ${L.id} 끝 — ${esc(L.title)}</h3>
        <dl><dt>남는 것</dt><dd>${esc(L.left)}</dd>${L.notes ? `<dt>알아 둘 것</dt><dd>${L.notes.map(esc).join('<br>')}</dd>` : ''}</dl>
        ${L.stuck ? `<details class="more"><summary>막혔을 때</summary><dl>${L.stuck.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></details>` : ''}
        <details class="more"><summary>실측 (실제로 해 본 결과)</summary><p class="measured">${(m.ok || []).map(x => `<span class="ok">✓ ${esc(x)}</span>`).join('')}${(m.tbd || []).map(x => `<span class="tbd">TBD ${esc(x)}</span>`).join('')}</p></details>
        <div class="next-row">${nextEp ? `<a class="primary" href="#/ep/${nextEp}">${epName(nextEp)} 읽기 →</a>` : `<a class="primary" href="#/">처음으로 →</a>`}${L.ep ? `<a class="ghost" href="${noteLink(L.ep)}" data-note="${L.ep}">📒 도현의 노트</a>` : ''}${LABS[i + 1] ? `<a class="ghost" href="#/lab/${LABS[i + 1].id}">다음 실습 ${LABS[i + 1].id}</a>` : ''}</div></div>`;
    }
  }
  return '';
}

// ── 미리 보기 앱 (키트 데이터로 그린다) ──
function miniApp(f, where) {
  if (!f.on) return `<div class="empty-phone">${where === 'local' ? '아직 앱이 없음' : '아직 공개 주소가 없음<br><small>친구는 열 수 없다</small>'}</div>`;
  const region = f.region || '서울';
  let list = region === '제주' ? (f.jeju ? JEJU : []) : KIT_PLACES.places.filter(p => p.region === region);
  if (f.songjeong) list = list.map(p => p.name === '송정 해수욕장' ? {...p, indoor: false} : p);
  if (f.gwangalli) list = list.map(p => p.name === '광안리 해수욕장' ? {...p, indoor: false} : p);
  if (f.indoorOn) list = list.filter(p => p.indoor);                     // 흔한 방식: 글자 "false" 도 참으로 통과
  const url = where === 'local' ? 'localhost:8000' : '내아이디.github.io/weekend-places';
  return `<div class="url">${url}</div><div class="app ${f.broken ? 'broken-app' : ''}"><h5>주말 어디갈까</h5>
    <div class="regions">${KIT_PLACES.regions.map(r => `<span class="${r === region ? 'on' : ''}">${r}</span>`).join('')}</div>
    ${f.indoor ? `<div class="rain"><span class="tog ${f.indoorOn ? 'on' : ''}">☂ 실내만</span></div>` : ''}
    <ul class="cards">${list.length ? list.map(p => `<li>${f.photos ? `<img class="ph" src="${kitBase}images/${p.kind}.svg" alt="">` : ''}<b>${esc(p.name)}</b>${f.indoor && p.indoor ? '<span class="io">실내</span>' : ''}</li>`).join('') : '<li class="none">장소가 없어요</li>'}</ul></div>`;
}
function status(L, done) {
  const {st, changed} = stateAt(L, done);
  const doneAttr = typeof done === 'number' ? `n${done}` : [...done].join(',');
  const place = (key, icon, title, tag) => `<section class="place ${key}"><h4>${icon} ${title}${tag || ''}</h4><ul>${ROWS[key].filter(([k]) => key !== 'pc' || k !== 'cs' || st.pc.cs !== '없음').map(([k, label]) => `<li class="${changed.has(`${key}.${k}`) ? 'changed' : ''}"><span>${label}</span><b>${esc(st[key][k])}</b></li>`).join('')}</ul></section>`;
  const tab = store.tab === 'site' ? 'site' : 'local';
  const appChanged = changed.has(`app.${tab}`);
  return `<details open class="fl-status" data-lab="${L.id}" data-done="${doneAttr}"><summary>지금 어디에 무엇이 있나</summary>
    <div class="hands-legend"><span class="hand">파일</span><span class="hand">터미널</span><span class="hand hand-mcp">MCP</span><span class="hand hand-me">내 손</span></div>
    <div class="places">${place('pc', '💻', '내 컴퓨터')}<div class="wire">git push ↑ · git pull ↓</div>${place('gh', '☁️', 'GitHub', st.gh.repo === '없음' ? ' <span class="tag off">저장소 전</span>' : '')}<div class="wire">main → Pages</div>${place('site', '🌐', '공개 사이트')}</div>
    <div class="preview"><div class="preview-tabs" role="tablist"><button type="button" role="tab" data-fl-tab="local" aria-selected="${tab === 'local'}">내 컴퓨터에서 보이는 앱</button><button type="button" role="tab" data-fl-tab="site" aria-selected="${tab === 'site'}">친구가 보는 앱</button></div>
      <div class="phone ${appChanged ? 'changed' : ''}">${miniApp(st.app[tab], tab)}</div></div>
    <p class="fineprint">실습을 순서대로 했을 때의 모습입니다. 저장소 이름·번호는 사람마다 다를 수 있습니다.</p></details>`;
}

// ── 화면 ──
let root = null, L = null, lines = [], line = 0, shown = 0;
function nav() {
  return LABS.map(X => {
    const on = X.id === L.id;
    const head = X.ep ? `<div class="part-h">웹툰 ${epName(X.ep)} 「${esc(window.Comic ? Comic.TITLE[X.ep][0] : '')}」<small>${esc(blank(X))}</small></div>` : '<div class="part-h">시작 전<small>워크숍 전에 집에서</small></div>';
    const steps = on ? `<ol class="steps">${X.steps.map((s, i) => `<li><button type="button" class="${doneSteps() > i ? 'seen' : ''} ${curStep() === i ? 'on' : ''}" data-fl-step="${i}"><span class="ttl">${esc(s.t)}</span>${s.min ? `<span class="when">약 ${s.min}분</span>` : ''}</button></li>`).join('')}</ol>` : '';
    return `<li class="part">${head}<a class="lab-link ${on ? 'on' : ''} ${X.required ? '' : 'opt'}" href="#/lab/${X.id}"><span class="lab-n">실습 ${X.id}</span>${esc(X.title)}<small>${X.required ? '필수' : '선택'}${X.min ? ` · 약 ${X.min}분` : ''}</small></a>${steps}</li>`;
  }).join('');
}
const doneSteps = () => lines.slice(0, line + 1).filter(x => x.k === 'result').length;
const curStep = () => { for (let k = line; k >= 0; k--) if (lines[k].i !== undefined) return lines[k].i; return -1; };
function head() {
  return `<div class="ep-head"><div class="ep-top"><span class="big-n">${L.id}</span><div><small>${L.ep ? `웹툰 ${epName(L.ep)}와 이어지는 실습 · <span class="chip-blank"><i>${L.ep === 'E' ? '+' : L.ep}</i>${esc(blank(L))}</span>` : '워크숍 전 준비'}</small><h2>${esc(L.title)}</h2></div>
    <span class="meta">${L.required ? '필수' : '선택'} · ${L.min ? `약 ${L.min}분` : esc(L.when)}</span></div></div>`;
}
function render(scroll = true) {
  const chat = root.querySelector('#fl-chat');
  chat.innerHTML = head() + lines.slice(0, line + 1).map((ln, k) => lineHtml(L, ln, k > shown)).join('');
  shown = line;
  root.querySelector('#fl-nav').innerHTML = nav();
  root.querySelector('#fl-status').innerHTML = status(L, doneSteps());
  const last = line >= lines.length - 1;
  root.querySelector('#fl-progress').textContent = `실습 ${L.id} · ${Math.max(curStep() + 1, 0)}/${L.steps.length}단계 · ${line + 1}/${lines.length}`;
  root.querySelector('[data-fl="next"]').disabled = last;
  root.querySelector('[data-fl="all"]').disabled = last;
  root.querySelector('[data-fl="prev"]').disabled = line === 0;
  store.line[L.id] = line; save();
  if (last && window.onFlowDone) window.onFlowDone(L.id);
  if (scroll) chat.lastElementChild?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
}
function go(to) { line = Math.max(0, Math.min(lines.length - 1, to)); render(); }
function view(id) {
  return `<div class="v-flow"><div class="band"><span>직접 해 보기 <b>「주말 어디갈까」</b></span><span>내가 한 말 → AI 가 한 일 → 바뀐 결과 <i>내 AI 도구로 그대로 따라 하기</i></span></div>
    <div class="layout"><nav class="episodes" aria-label="실습 목차"><ol id="fl-nav"></ol></nav>
      <section class="chat-wrap" aria-label="실습 진행"><div id="fl-chat" class="chat" aria-live="polite"></div>
        <div class="controls"><button type="button" class="ghost" data-fl="prev">◀ 이전 단계</button><span id="fl-progress" class="progress"></span><button type="button" class="ghost" data-fl="all">끝까지 펼치기</button><button type="button" class="primary" data-fl="next">다음 ▶</button></div></section>
      <aside class="status" id="fl-status" aria-label="지금 상태"></aside></div></div>`;
}
function mount(el, id) {
  root = el; L = LABS.find(x => x.id === id); lines = linesOf(L);
  line = Math.min(store.line[id] ?? 0, lines.length - 1); shown = line;
  render(false);
}
// 누르기는 문서에 한 번만 건다(화면을 다시 열 때마다 걸면 한 번 눌러도 여러 줄이 넘어간다)
document.addEventListener('click', e => {
    if (!root?.isConnected || !root.contains(e.target)) return;
    const b = e.target.closest('[data-fl]');
    if (b) {
      const a = b.dataset.fl;
      if (a === 'next') go(line + 1);
      else if (a === 'all') go(lines.length - 1);
      else if (a === 'prev') { const cur = curStep(); const start = lines.findIndex(x => x.k === 'step' && x.i === Math.max(cur - (lines[line].k === 'step' ? 1 : 0), 0)); go(start > 0 && start < line ? start : 0); }
    }
    const st = e.target.closest('[data-fl-step]');
    if (st) go(lines.findIndex(x => x.k === 'result' && x.i === Number(st.dataset.flStep)));
});
document.addEventListener('click', e => {
  const tb = e.target.closest('[data-fl-tab]'), box = tb?.closest('.fl-status');
  if (!box) return;
  store.tab = tb.dataset.flTab; save();
  const X = LABS.find(x => x.id === box.dataset.lab), d = box.dataset.done;
  box.outerHTML = status(X, d.startsWith('n') ? Number(d.slice(1)) : new Set(d ? d.split(',').map(Number) : []));
});
// 레슨 화면에서 쓰는 조각: 한 단계의 대화(내 말 → AI 가 하는 일 → 권한 → 결과)와 상태 상자
function stepHtml(L, i) { return linesOf(L).filter(x => x.i === i && x.k !== 'step').map(x => lineHtml(L, x, false)).join(''); }
function key(e) {
  if (!root?.isConnected || e.target.closest('input, textarea, select')) return;
  if (e.key === 'ArrowRight' || (e.key === 'Enter' && !e.target.closest('a, button'))) { e.preventDefault(); go(line + 1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(line - 1); }
}
document.addEventListener('keydown', key);
window.Flow = {view, mount, TOOLS, stepHtml, statusHtml: (L, doneSet) => status(L, doneSet), scene, setAsset: fn => { A = fn; }, setNoteLink: fn => { noteLink = fn; }, setKitBase: b => { kitBase = b; },
  tool: () => store.tool, setTool: t => { store.tool = t; save(); if (root?.isConnected) render(false); }};
})();
