// 실습 코스 화면 — github.studydev.com(「GitHub 첫걸음」)의 레슨 형식을 따른다(사용자 요청, 2026-11-20).
// 왼쪽 레슨 목록 카드 · 파란 머리 띠와 레슨 뱃지 · 지금 어디쯤 · 핵심과 용어 · 실습 시작 · 체크리스트(스스로 체크 → 다 하면 뱃지) ·
// 막혔을 때 · 더 알아보기 · 메모 · 남은 단계와 이전/다음. 진행은 이 브라우저(localStorage)에만 남는다.
// 코스 둘: vibe = 바이브 코딩 실습(practice/labs.data.js, AI 에게 말로 시키기), basics = GitHub 직접 익히기(course/basics.data.js, 확장판, GitHub 웹에서 직접)
// 필요한 전역: LABS·LAB_META·NOTES·BASICS·Comic·Flow. 모양은 course.css(.v-course 아래).
(function () {
const B = window.BASICS;
const KEY = 'vibe-course:v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
let st = Object.assign({done: {}, notes: {}, gid: ''}, load());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* 저장이 막혀도 화면은 동작 */ } };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ko = o => o == null ? '' : typeof o === 'string' ? o : (o.ko ?? o.en ?? '');
const ID_RE = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
// 원본 사이트의 글 표기: **굵게**, `코드`(누르면 복사), [글](주소), {id} = 내 GitHub 아이디
function rich(raw) {
  return esc(ko(raw).replace(/\{id\}/g, st.gid || '내아이디'))
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code class="cc" data-copy="$1" title="누르면 복사">$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
const ICON = name => { const parts = B.ICONS[name] || B.ICONS.flag; return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${parts.map(([t, a]) => `<${t} ${Object.entries(a).map(([k, v]) => `${k}="${esc(v)}"`).join(' ')}/>`).join('')}</svg>`; };
const hex = (glyph, on, mark = '', big = false) => `<span class="hex ${on ? 'on' : ''} ${big ? 'big' : ''}">${ICON(glyph)}${mark !== '' ? `<i>${esc(mark)}</i>` : ''}</span>`;
const epName = ep => ep === 'E' ? '에필로그' : `${ep}화`;
const noteOf = ep => NOTES.find(n => n.ep === ep);

// ── 두 코스를 같은 모양의 레슨 목록으로 ──
const VIBE_GLYPH = {0: 'flag', 1: 'clock', 2: 'book', 3: 'globe', 4: 'doc', 5: 'merge', 6: 'review', 7: 'award', 8: 'cloud', 9: 'trophy'};
const TERM_KEY = {commit: 'commit', repository: 'repository', branch: 'branch', 'pull request, PR': 'pr', merge: 'merge', issue: 'issue', Pages: 'pages', Actions: 'actions', Codespace: 'codespaces', release: 'release', review: 'review', conflict: 'conflict', label: 'label'};
const blankName = ep => (LAB_META.BLANKS[ep] || '').replace(/^(빈칸 \d · |\+ )/, '');
const COURSES = {
  vibe: {
    id: 'vibe', route: 'lab', home: 'labs', title: '바이브 코딩 실습', sub: '웹툰 한 화, 실습 하나 · AI 에게 말로 시키기',
    lessons: () => LABS.map(L => ({
      id: L.id, no: L.id, kind: L.ep ? `실습 ${L.id}` : '시작 전', t: L.title, s: L.ep ? `${epName(L.ep)} · ${blankName(L.ep)}` : '워크숍 전에 집에서', glyph: VIBE_GLYPH[L.id],
      badge: {n: L.ep ? blankName(L.ep) : '준비 완료', mark: L.id}, optional: !L.required,
      steps: L.steps.map((s, i) => ({key: `v${L.id}-${i}`, i, t: s.t, min: s.min})), L})),
    final: {n: '바이브 코딩 완주', glyph: 'trophy', mark: '★'},
  },
  basics: {
    id: 'basics', route: 'basics', home: 'basics', title: 'GitHub 직접 익히기', sub: '확장판 · 브라우저에서 GitHub 기본 기능을 직접 · 「GitHub 첫걸음」',
    lessons: () => B.LESSONS.map(l => { const bd = B.BADGES.find(b => b.lesson === l.id) || {}; return {
      id: l.id, no: l.no, kind: `레슨 ${l.no}`, t: ko(l.t), s: ko(l.s), glyph: l.glyph, badge: {n: ko(bd.n), mark: bd.mark}, optional: false,
      steps: l.parts.flatMap(p => p.steps.map(s => ({key: s.id, t: s.t, how: s.how, term: s.term, idForm: s.idForm, mod: p.mod}))), l}; }),
    final: (() => { const f = B.BADGES.find(b => b.id === 'final') || {}; return {n: ko(f.n) || 'GitHub 완주자', glyph: f.g || 'trophy', mark: '★'}; })(),
  },
};
const stats = ls => { const n = ls.steps.length, d = ls.steps.filter(s => st.done[s.key]).length; return {n, d, complete: n > 0 && d === n}; };
function progress(c) {
  const ls = c.lessons().filter(l => !l.optional);
  const n = ls.reduce((a, l) => a + l.steps.length, 0), d = ls.reduce((a, l) => a + stats(l).d, 0);
  return {pct: n ? Math.round(d / n * 100) : 0, lessons: ls.filter(l => stats(l).complete).length, total: ls.length, complete: ls.every(l => stats(l).complete)};
}
const overall = () => { const a = progress(COURSES.vibe), b = progress(COURSES.basics); return Math.round((a.pct + b.pct) / 2); };

// ── 왼쪽 카드 ──
function side(c, cur) {
  const p = progress(c);
  return `<aside class="cr-side"><a class="cr-back" href="#/${c.home}">← 코스 홈</a><h2>${esc(c.title)}</h2>
    <div class="cr-prog"><span>코스 진행률</span><b>${p.pct}%</b></div><div class="cr-bar"><i style="width:${p.pct}%"></i></div>
    <ol class="cr-lessons">${c.lessons().map(ls => { const s = stats(ls); return `<li><a class="${ls.id === cur ? 'on' : ''} ${s.complete ? 'done' : ''}" href="#/${c.route}/${ls.id}">${hex(ls.glyph, s.complete)}<span><small>${esc(ls.kind)}${ls.optional ? ' · 선택' : ''}</small><b>${esc(ls.t)}</b></span><em>${s.d}/${s.n}</em></a></li>`; }).join('')}
      <li><a class="${cur === 'record' ? 'on' : ''}" href="#/record">${hex(c.final.glyph, p.complete)}<span><small>마무리</small><b>내 학습 기록</b></span></a></li></ol></aside>`;
}

// ── 레슨 화면 ──
function hero(c, ls, plan, goal) {
  const s = stats(ls);
  return `<section class="cr-hero"><div><p class="crumb"><a href="#/${c.home}">코스 홈</a> › ${esc(ls.kind)}</p><h1>${esc(ls.t)}</h1><p class="goal">${goal}</p>
      <div class="chips">${plan.map(([i, t]) => `<span>${i} ${esc(t)}</span>`).join('')}</div></div>
    <div class="cr-badge ${s.complete ? 'on' : ''}"><small>레슨 뱃지</small>${hex(ls.glyph, s.complete, ls.badge.mark, true)}<b>${esc(ls.badge.n)}</b><em>${s.complete ? '✓ 획득' : `🔒 ${esc(ls.kind)} 마치기`}</em></div></section>`;
}
const card = (icon, title, body, aside = '') => `<section class="cr-card"><h3><span class="ic">${icon}</span>${title}${aside ? `<small>${aside}</small>` : ''}</h3>${body}</section>`;
function checklist(ls, howOf) {
  return `<ol class="cr-check">${ls.steps.map(s => `<li class="${st.done[s.key] ? 'done' : ''}"><label><input type="checkbox" data-step="${esc(s.key)}" ${st.done[s.key] ? 'checked' : ''}><span class="t">${typeof s.t === 'string' ? esc(s.t) : rich(s.t)}${s.min ? ` <small>약 ${s.min}분</small>` : ''}</span></label>${howOf(s)}</li>`).join('')}</ol>`;
}
function footer(c, ls) {
  const all = c.lessons(), i = all.findIndex(x => x.id === ls.id), prev = all[i - 1], next = all[i + 1], left = stats(ls).n - stats(ls).d;
  return `<section class="cr-foot"><span class="n">${left}</span><div><b>${left ? `필수 단계 ${left}개 남음` : '이 레슨 완료 🎉'}</b><small>${left ? '모두 체크하면 뱃지에 불이 켜져요.' : '뱃지를 받았어요. 다음으로 가 볼까요?'}</small></div>${next ? `<a class="primary" href="#/${c.route}/${next.id}">다음 레슨 →</a>` : '<a class="primary" href="#/record">내 기록 보기 →</a>'}</section>
    <nav class="cr-pn">${prev ? `<a href="#/${c.route}/${prev.id}">← 이전 · ${esc(prev.t)}</a>` : '<span></span>'}${next ? `<a href="#/${c.route}/${next.id}">${esc(next.t)} · 다음 →</a>` : ''}</nav>`;
}
const extra = (stuck, learn, key) => card('🧰', '더 보기', `<details class="cr-more"><summary>🧯 막혔을 때 (${stuck.length})</summary><dl>${stuck.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl></details>
  <details class="cr-more"><summary>📚 더 알아보기 (${learn.length})</summary><ul class="cr-learn">${learn.join('')}</ul></details>
  <details class="cr-more"><summary>✍️ 메모 (선택)</summary><textarea data-memo="${esc(key)}" rows="4" placeholder="이 레슨에서 기억할 것, 막혔던 곳…">${esc(st.notes[key] || '')}</textarea><small>메모는 이 브라우저에만 저장돼요.</small></details>`);

function vibeLesson(ls) {
  const L = ls.L, n = L.ep ? noteOf(L.ep) : null, c = COURSES.vibe;
  const nodes = ['1', '2', '3', '4', '5', '6', '7', '8', 'E'].map((ep, k) => `<a class="cr-node ${ep === L.ep ? 'on' : ''}" href="#/lab/${LABS.find(x => x.ep === ep).id}"><span class="no">${ep === 'E' ? '+' : ep}</span><b>${esc(blankName(ep))}</b><small>${esc(Comic.BLANKS[k]?.[1] || 'Release')}</small></a>`).join('<i class="arr">›</i>');
  const terms = n ? n.term.map(([k, e]) => { const t = B.TERMS[TERM_KEY[e]]; return t ? `<details class="cr-term"><summary><b>${esc(k)}</b> <small>${esc(e)}</small></summary><p>${esc(ko(t.d))}</p>${t.a ? `<p class="a">비유: ${esc(ko(t.a))}</p>` : ''}</details>` : `<span class="cr-term"><b>${esc(k)}</b> <small>${esc(e)}</small></span>`; }).join('') : '';
  const done = new Set(ls.steps.filter(s => st.done[s.key]).map(s => s.i));
  const how = s => `<details class="cr-how"><summary>어떻게 — AI 에게 할 말과 결과</summary><div class="v-flow">${L.steps[s.i].scene ? Flow.scene(L.steps[s.i].scene) : ''}${Flow.stepHtml(L, s.i)}</div></details>`;
  return `${hero(c, ls, [['📖', L.ep ? `웹툰 ${epName(L.ep)} 2분` : '워크숍 전'], ['🧪', L.min ? `실습 ${L.min}분` : L.when], ['✅', `확인 ${L.steps.length}단계`]],
      L.ep ? `웹툰 ${epName(L.ep)}에서 서윤이 한 일을, 내 AI 도구에 말로 시켜서 그대로 해 봅니다.` : '실습에 쓸 도구와 계정을 워크숍 전에 준비합니다.')}
    ${card('🧭', '지금 어디쯤', `<div class="cr-flow nine">${nodes}</div>`, L.ep ? '밝은 칸 = 이번 실습이 채우는 빈칸' : '시작 전 — 아직 채운 빈칸 없음')}
    ${n ? card('💡', '핵심', `<p class="key">${esc(n.what)}</p><details class="cr-more"><summary>더 보기 — 내가 정할 것</summary><p>${esc(n.decide)}</p>${(L.notes || []).map(x => `<p>${esc(x)}</p>`).join('')}</details><h4>이 실습의 용어</h4><div class="cr-terms">${terms}</div>`) : ''}
    ${card('🚀', '실습 시작', `<p>${esc(L.now)}</p><div class="cr-start">${L.ep ? `<a class="btn" href="#/ep/${L.ep}">📖 웹툰 ${epName(L.ep)} 읽기</a>` : ''}<a class="btn primary" href="weekend-places-kit.zip" download>📦 시작 키트</a>${L.ep ? `<button type="button" class="btn" data-open-note="${L.ep}">📒 도현의 GitHub Tips</button>` : ''}<a class="btn" href="#/flow/${L.id}">💬 대화로 한 줄씩 따라 하기</a></div><p class="hint">내 AI 도구 창과 이 페이지를 나란히 두고, 한 단계를 마칠 때마다 체크하세요.</p>`)}
    ${card('✅', '체크리스트', checklist(ls, how), '필수 · 모두 체크하면 뱃지')}
    ${card('🗺', '지금 어디에 무엇이 있나', `<div class="v-flow">${Flow.statusHtml(L, done)}</div>`, '체크한 단계까지의 모습')}
    ${extra((L.stuck || []).map(([a, b]) => [esc(a), esc(b)]), (n?.links || []).map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).concat((L.measured?.ok || []).length ? [`<li class="m">실측: ${(L.measured.ok || []).map(esc).join(' · ')}</li>`] : []), `vibe-${L.id}`)}
    ${footer(c, ls)}`;
}

function basicsLesson(ls) {
  const l = ls.l, c = COURSES.basics;
  const nodes = B.FLOW.map((f, k) => `<span class="cr-node ${l.nodes.includes(f.id) ? 'on' : ''}"><span class="no">${String(k + 1).padStart(2, '0')}</span><span class="em">${f.i}</span><b>${esc(ko(f.n))}</b><small>${esc(ko(f.d))}</small><em>${esc(f.l)}</em></span>`).join('<i class="arr">›</i>');
  const terms = (l.terms || []).map(k => { const t = B.TERMS[k]; return t ? `<details class="cr-term"><summary><b>${esc(t.en)}</b> <small>${esc(t.ko)}</small></summary><p>${esc(ko(t.d))}</p>${t.a ? `<p class="a">비유: ${esc(ko(t.a))}</p>` : ''}</details>` : ''; }).join('');
  const mods = [...new Set(l.parts.map(p => p.mod).filter(Boolean))].map(m => B.MODS[m]);
  const tpl = m => `https://github.com/new?${new URLSearchParams({template_owner: 'skills-kr', template_name: m.repo, owner: '@me', name: 'skills-' + m.repo, description: m.kr, visibility: 'public'})}`;
  const start = mods.length ? mods.map(m => `<div class="cr-ex"><div><small>실습</small><b>${esc(ko(m.t))}</b><em>${m.min}분 · 한글판 skills-kr</em></div><div class="cr-start">
      <a class="btn" href="${esc(`${B.SITE}/learn/${m.repo}.html`)}" target="_blank" rel="noopener">📖 이론 슬라이드</a><a class="btn primary" href="${esc(tpl(m))}" target="_blank" rel="noopener">🚀 실습 복사</a>
      ${st.gid ? `<a class="btn" href="https://github.com/${esc(st.gid)}/skills-${esc(m.repo)}" target="_blank" rel="noopener">📂 내 실습 저장소</a>` : '<a class="btn ghost" href="#/basics/prep">📂 아이디를 저장하면 내 저장소 바로가기</a>'}</div></div>`).join('')
    : '<p>이 레슨은 GitHub 웹사이트에서 계정을 준비하고 둘러봐요.</p>';
  const how = s => `${s.how ? `<details class="cr-how"><summary>방법</summary><p>${rich(s.how)}</p>${s.term && B.TERMS[s.term] ? `<p class="term">📖 ${esc(B.TERMS[s.term].en)} — ${esc(ko(B.TERMS[s.term].d))}</p>` : ''}</details>` : ''}${s.idForm ? `<form class="cr-id" data-idform><input name="gid" value="${esc(st.gid)}" placeholder="GitHub 아이디" autocomplete="username" spellcheck="false"><button class="btn primary">저장</button></form>` : ''}`;
  const opt = (l.optional || []).length ? `<div class="cr-opt"><h4>○ 선택</h4><p class="hint">건너뛰어도 돼요 — 진행률과 뱃지에 들어가지 않아요.</p><ul>${l.optional.map(o => `<li><b>${rich(o.t)}</b>${o.how ? `<details class="cr-how"><summary>방법</summary><p>${rich(o.how)}</p></details>` : ''}</li>`).join('')}</ul></div>` : '';
  const learn = (l.res || []).map(k => B.LIB[k]).filter(Boolean).map(r => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(ko(r.t))}</a><small>${esc(r.by)} · ${esc(ko(r.m))}</small></li>`);
  return `${hero(c, ls, l.plan.map(([i, t]) => [i, ko(t)]), esc(ko(l.goal)))}
    ${l.nodes.length ? card('🧭', '지금 어디쯤', `<div class="cr-flow seven">${nodes}</div>`, '밝은 칸 = 이번 레슨') : ''}
    ${card('💡', '핵심', `<p class="key">${esc(ko(l.key))}</p><details class="cr-more"><summary>더 보기</summary><p>${esc(ko(l.more))}</p></details>${terms ? `<h4>이 레슨의 용어</h4><div class="cr-terms">${terms}</div>` : ''}`)}
    ${card('🚀', '실습 시작', `<p class="hint">🧪 실습은 GitHub 의 내 실습 저장소에서 해요(새 탭). 끝낸 단계는 이 페이지로 돌아와 체크하세요.</p>${start}`)}
    ${card('✅', '체크리스트', checklist(ls, how) + opt, '필수 · 모두 체크하면 뱃지')}
    ${extra((l.stuck || []).map(([a, b]) => [rich(a), rich(b)]), learn, `basics-${l.id}`)}
    ${footer(c, ls)}`;
}

// ── 코스 홈 · 뱃지 · 내 기록 ──
function courseHome(c) {
  const p = progress(c);
  const tiles = c.lessons().map(ls => { const s = stats(ls); return `<a class="cr-tile ${s.complete ? 'done' : ''} ${ls.optional ? 'opt' : ''}" href="#/${c.route}/${ls.id}">${hex(ls.glyph, s.complete, ls.badge.mark)}<span><small>${esc(ls.kind)}${ls.optional ? ' · 선택' : ''}</small><b>${esc(ls.t)}</b><em>${esc(ls.s)}</em></span><i>${s.d}/${s.n}</i></a>`; }).join('');
  const next = c.lessons().find(ls => !ls.optional && !stats(ls).complete) || c.lessons()[0];
  return `<div class="cr-wrap single"><main class="cr-main"><section class="cr-hero home"><div><p class="crumb">${c.id === 'basics' ? '확장판' : '실습'}</p><h1>${esc(c.title)}</h1><p class="goal">${esc(c.sub)}</p>
      <div class="chips">${(c.id === 'basics' ? ['설치 없음', '실제 GitHub 에서 직접', '단계마다 스스로 체크', '기록은 내 브라우저에'] : ['내 AI 도구로', '웹툰과 같은 순서', '단계마다 스스로 체크', '기록은 내 브라우저에']).map(t => `<span>${t}</span>`).join('')}</div>
      <div class="cr-start"><a class="btn white" href="#/${c.route}/${next.id}">${p.pct ? '이어서 하기' : '시작하기'} →</a></div></div>
      <div class="cr-badge ${p.complete ? 'on' : ''}"><small>코스 진행률</small><b class="pct">${p.pct}%</b><em>레슨 ${p.lessons}/${p.total} · 뱃지 ${p.lessons}</em></div></section>
    ${c.id === 'basics' ? card('ℹ️', '이 코스는', `<p>바이브 코딩 실습이 "AI 에게 말로 시키기"라면, 이 확장판은 <b>GitHub 웹사이트에서 직접</b> 기본 기능(브랜치·커밋·PR·마크다운·Pages·리뷰·충돌·Copilot)을 손으로 익히는 과정이에요. 레슨마다 준비된 실습 저장소(GitHub Skills 한글판 skills-kr)를 내 계정으로 복사하면, 안내 봇이 이슈에 단계별 안내를 올리고 결과를 확인해 줘요.</p><p class="hint">원본: <a href="${esc(B.SOURCE_URL || B.source)}" target="_blank" rel="noopener">「GitHub 첫걸음」 github.studydev.com</a> · 실습 교재 GitHub Skills(MIT) 한글판 skills-kr</p>`) : ''}
    ${card('📚', '레슨', `<div class="cr-tiles">${tiles}</div>`)}
    ${c.id === 'vibe' && window.Cards ? card('⏱', '워크숍 120분', `<div class="v-lab"><section class="plan">${Cards.plan().replace(/<div class="toc">[\s\S]*$/, '').replace(/<h2>/, '<p><b>').replace(/<\/h2>/, '</b></p>')}</section></div>`, '필수 실습 + 웹툰 읽기 + 여유') : ''}</main></div>`;
}
function badges() {
  const row = c => { const ls = c.lessons(); const p = progress(c); return `<h4>${esc(c.title)}</h4><div class="cr-badges">${ls.map(x => `<div class="${stats(x).complete ? 'on' : ''}">${hex(x.glyph, stats(x).complete, x.badge.mark, true)}<b>${esc(x.badge.n)}</b><small>${stats(x).complete ? '✓ 획득' : `🔒 ${esc(x.kind)}`}</small></div>`).join('')}<div class="${p.complete ? 'on' : ''}">${hex(c.final.glyph, p.complete, c.final.mark, true)}<b>${esc(c.final.n)}</b><small>${p.complete ? '✓ 획득' : '🔒 모든 필수 레슨'}</small></div></div>`; };
  return `<div class="cr-wrap single"><main class="cr-main"><section class="cr-hero home"><div><p class="crumb">뱃지</p><h1>모은 뱃지</h1><p class="goal">레슨의 필수 단계를 모두 체크하면 그 레슨의 뱃지가 켜져요.</p></div></section>${card('🏅', '뱃지', row(COURSES.vibe) + row(COURSES.basics))}</main></div>`;
}
function record() {
  const sum = c => { const p = progress(c); return `<div class="cr-sum"><b>${esc(c.title)}</b><div class="cr-bar"><i style="width:${p.pct}%"></i></div><small>${p.pct}% · 레슨 ${p.lessons}/${p.total}</small></div>`; };
  const memos = Object.entries(st.notes).filter(([, v]) => v.trim()).map(([k, v]) => `<li><b>${esc(k)}</b><p>${esc(v)}</p></li>`).join('');
  return `<div class="cr-wrap single"><main class="cr-main"><section class="cr-hero home"><div><p class="crumb">내 기록</p><h1>내 학습 기록</h1><p class="goal">이 브라우저에만 저장돼요. 다른 기기에서는 이어지지 않아요.</p></div><div class="cr-badge"><small>전체 진행률</small><b class="pct">${overall()}%</b></div></section>
    ${card('📈', '진행률', sum(COURSES.vibe) + sum(COURSES.basics))}
    ${card('🪪', '내 GitHub 아이디', `<form class="cr-id" data-idform><input name="gid" value="${esc(st.gid)}" placeholder="GitHub 아이디" autocomplete="username" spellcheck="false"><button class="btn primary">저장</button></form><p class="hint">저장하면 확장판 레슨마다 '내 실습 저장소' 바로가기가 생겨요.</p>`)}
    ${card('✍️', '메모', memos ? `<ul class="cr-memos">${memos}</ul>` : '<p class="hint">아직 메모가 없어요.</p>')}
    ${card('🧹', '기록 지우기', '<button type="button" class="btn" data-reset>이 브라우저의 체크·메모·아이디 지우기</button>')}</main></div>`;
}

// ── 그리기와 이벤트 ──
let mounted = null;
function lessonView(cid, id) {
  const c = COURSES[cid], ls = c.lessons().find(x => x.id === id);
  if (!ls) return courseHome(c);
  return `<div class="cr-wrap">${side(c, id)}<main class="cr-main">${cid === 'vibe' ? vibeLesson(ls) : basicsLesson(ls)}</main></div>`;
}
function render(el, view) { mounted = {el, view}; el.innerHTML = `<div class="v-course">${view()}</div>`; window.onCourseChange?.(); }
const rerender = () => { if (mounted?.el.isConnected) { const y = scrollY; render(mounted.el, mounted.view); scrollTo(0, y); } };
document.addEventListener('change', e => {
  const cb = e.target.closest('.v-course [data-step]');
  if (cb) { cb.checked ? (st.done[cb.dataset.step] = 1) : delete st.done[cb.dataset.step]; save(); rerender(); }
});
document.addEventListener('input', e => { const m = e.target.closest('.v-course [data-memo]'); if (m) { st.notes[m.dataset.memo] = m.value; save(); } });
document.addEventListener('submit', e => {
  const f = e.target.closest('.v-course [data-idform]'); if (!f) return; e.preventDefault();
  const v = f.gid.value.trim();
  if (v && !ID_RE.test(v)) { f.gid.setCustomValidity('영문·숫자·하이픈, 39자까지'); f.gid.reportValidity(); return; }
  st.gid = v; if (v) st.done['p-id'] = 1; save(); rerender();
});
document.addEventListener('click', e => {
  const r = e.target.closest('.v-course [data-reset]');
  if (r && confirm('이 브라우저에 저장된 체크·메모·아이디를 지울까요?')) { st = {done: {}, notes: {}, gid: ''}; save(); rerender(); }
  const cc = e.target.closest('.v-course code.cc[data-copy]');
  if (cc) navigator.clipboard?.writeText(cc.dataset.copy).then(() => { cc.classList.add('ok'); setTimeout(() => cc.classList.remove('ok'), 900); }, () => {});
});
window.Course = {
  lesson: (el, cid, id) => render(el, () => lessonView(cid, id)),
  home: (el, cid) => render(el, () => courseHome(COURSES[cid])),
  badges: el => render(el, badges), record: el => render(el, record),
  overall, progress: cid => progress(COURSES[cid]), has: (cid, id) => COURSES[cid].lessons().some(x => x.id === id),
  title: (cid, id) => COURSES[cid].lessons().find(x => x.id === id)?.t || '',
};
})();
