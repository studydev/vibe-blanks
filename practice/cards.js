// 실습 카드 그리기. practice/cards.html(미리 보기)과 site/(조립)가 함께 쓴다. 모양은 practice/cards.css(.v-lab 아래).
// 필요한 전역: LABS·LAB_META(practice/labs.data.js). 그림 경로·노트 링크는 Cards.setAsset / Cards.setNoteLink 로 바꾼다.
(function () {
let A = p => p;                                           // 그림 경로 ('../art/cut/ep1-02.png' 처럼 practice/ 기준)
let noteLink = ep => `../notes/notes.html?ep=${ep}`;      // 카드 끝 "도현의 노트" 링크
const {HANDS, BLANKS, READ_MIN, req} = window.LAB_META;
const NAME = {seoyun: '서윤', dohyun: '도현', sua: '수아', junho: '준호'};
const NUM = '①②③④⑤⑥⑦⑧⑨⑩';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// <내 GitHub 아이디> 같은 자리는 노란 표시
const ph = s => esc(s).replace(/&lt;([^&]{1,40}?)&gt;/g, '<mark class="ph">&lt;$1&gt;</mark>');
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, ' ');
const epName = ep => ep === 'E' ? '에필로그' : ep + '화';

// 120분 막대: 화마다 읽기 + 필수 실습, 남는 시간은 여유
function plan() {
  const segs = [];
  for (const L of LABS.filter(L => L.ep)) {
    segs.push(['read', READ_MIN - (L.ep === 'E' ? 1 : 0), L.ep === 'E' ? '끝' : L.ep + '화']);
    if (L.required) segs.push(['lab', L.min, '실습 ' + L.id]);
  }
  const used = segs.reduce((a, s) => a + s[1], 0);
  segs.push(['spare', 120 - used, '여유 ' + (120 - used) + '분']);
  const opt = LABS.filter(L => !L.required && L.min);
  return `<h2>워크숍 120분 — 필수 실습 ${req}분 + 웹툰 읽기 ${used - req}분 + 여유 ${120 - used}분</h2>
    <div class="bar">${segs.map(([c, m, t]) => `<span class="seg-${c}" style="flex:${m}" title="${t} ${m}분">${m >= 5 ? t : ''}</span>`).join('')}</div>
    <div class="legend"><span><i style="background:#e6ebf3"></i>웹툰 읽기(화마다 약 ${READ_MIN}분)</span><span><i style="background:var(--req)"></i>필수 실습</span>
      <span><i style="background:repeating-linear-gradient(135deg,#fff 0 3px,#dde2ea 3px 6px)"></i>MCP 연결이 막힐 때의 여유</span>
      <span>선택(집에서 이어 하기): ${opt.map(L => `실습 ${L.id} ${L.min}분`).join(' · ')}</span></div>
    <div class="toc">${LABS.map(L => `<a class="${L.required ? '' : 'opt'}" href="#lab-${L.id}">실습 ${L.id} · ${esc(L.title)}</a>`).join('')}</div>`;
}

// 단계 옆의 웹툰 장면: 그 컷의 그림 + 그 컷의 글(누가 무엇을 말했나)
function scene(sc) {
  if (!sc) return '';
  const who = b => (b.who || '').split(':')[0];
  const ln = b => {
    const w = who(b);
    const tag = b.k === 'in' ? '서윤 → AI' : b.k === 'ai' ? 'AI' : b.k === 'nar' ? '' : b.k === 'think' ? `${NAME[w] || '서윤'}(속마음)` : NAME[w] || '';
    return `<p class="ln k-${b.k}">${tag ? `<span class="who" style="--c:var(--${b.k === 'ai' ? 'ai' : w || 'seoyun'})">${tag}</span>` : ''}${fmt(b.t)}</p>`;
  };
  return `<figure class="scene"><img src="${A(sc.img)}" alt="" loading="lazy"><figcaption><span class="sc-lbl">웹툰 ${sc.label}</span>${sc.lines.map(ln).join('')}</figcaption></figure>`;
}

// 겉: 웹툰 장면 · AI 에게(입력) · 내 손(짧게) · 이때 뜨는 권한 · 이렇게 되면 성공(기대 결과)
// 접힘(자세히): 내 손 자세히, AI 가 쓰는 손, 볼 것, 참고, 도구별 설정 — 나중에 펼쳐서 배우는 용도
function step(s) {
  const asks = (s.asks || []).map(a => `<div class="ask"><div class="ask-h">AI 에게${a.to ? ` <span class="to">${esc(a.to)}</span>` : ''}<button type="button" data-copy="${esc(a.text)}">복사</button></div><p>${ph(a.text)}</p></div>`).join('');
  const doBox = s.do ? `<div class="do">${ph(s.do)}</div>` : '';
  const perm = s.perm ? `<div class="perm"><div class="perm-h">이때 뜨는 권한</div>${s.perm.map(([w, what]) => `<div class="perm-r"><b>${esc(w)}</b><span>${ph(what)}</span></div>`).join('')}</div>` : '';
  const more = [];
  if (s.me) more.push(`<p><b>내 손</b>${ph(s.me).replace(/\n/g, '<br>')}</p>`);
  if (s.hands) more.push(`<div class="hands">${s.hands.map(([h, w]) => `<span class="hand h-${h}"><b>${HANDS[h]}</b>${h === 'me' ? esc(w) : `<code>${esc(w)}</code>`}</span>`).join('')}</div>`);
  if (s.watch) more.push(`<p class="watch"><b>볼 것</b>${ph(s.watch)}</p>`);
  if (s.note) more.push(`<p class="note"><b>참고</b>${esc(s.note)}</p>`);
  for (const [l, c] of s.code || []) more.push(`<div class="lbl">${esc(l)}</div><pre>${ph(c)}</pre>`);
  return `<li><h3>${esc(s.t)}${s.min ? `<span class="min">${s.min}분</span>` : ''}</h3>
    <div class="row ${s.scene ? 'with-scene' : ''}">${scene(s.scene)}<div class="body">
    ${s.meFirst ? doBox : ''}${asks}${s.meFirst ? '' : doBox}${perm}
    ${s.check ? `<p class="check"><b>이렇게 되면 성공</b>${ph(s.check)}</p>` : ''}
    ${more.length ? `<details class="more"><summary>자세히</summary>${more.join('')}</details>` : ''}</div></div></li>`;
}

function card(L) {
  const m = L.measured || {};
  const extra = [
    L.notes ? `<div class="notes">${L.notes.map(n => `<p>· ${esc(n)}</p>`).join('')}</div>` : '',
    L.stuck ? `<h4>막혔을 때</h4><dl>${L.stuck.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>` : '',
    `<p><b>끝나면 남는 것</b> ${esc(L.left)}</p>`,
    `<p class="measured">${(m.ok || []).map(x => `<span class="ok">✓ 실측 ${esc(x)}</span>`).join('')}${(m.tbd || []).map(x => `<span class="tbd">TBD ${esc(x)}</span>`).join('')}</p>`].join('');
  return `<article class="lab ${L.required ? '' : 'opt'}" id="lab-${L.id}">
    <header><span class="num">실습 ${L.id}</span><h2>${esc(L.title)}</h2>
      <div class="chips"><span class="chip ${L.required ? 'req' : ''}">${L.required ? '필수' : '선택'}</span><span class="chip">${L.min ? '약 ' + L.min + '분' : esc(L.when)}</span>${L.ep ? `<span class="chip blank"><i>${L.ep === 'E' ? '+' : L.ep}</i>${esc(BLANKS[L.ep].replace(/^(빈칸 \d · |\+ )/, ''))}</span>` : ''}</div></header>
    <div class="top ${L.cut ? '' : 'no-thumb'}">${L.cut ? `<figure class="thumb"><img src="${A(`../art/cut/${L.cut}.png`)}" alt="" loading="lazy"><figcaption>${epName(L.ep)}을 다 읽은 자리</figcaption></figure>` : ''}
    <p class="now"><b>지금 상황</b>${esc(L.now)}</p></div>
    <ol class="steps">${L.steps.map(step).join('')}</ol>
    <details class="stuck"><summary>더 알아보기 — 막혔을 때 · 주의 · 실측</summary>${extra}</details>
    ${L.ep ? `<p class="tonote"><a href="${noteLink(L.ep)}" data-note="${L.ep}">📒 도현의 GitHub Tips — ${esc(BLANKS[L.ep].replace(/^(빈칸 \d · |\+ )/, ''))} 정확히 알아보기 →</a></p>` : ''}
  </article>`;
}

function bindCopy() { document.addEventListener('click', e => {
  const b = e.target.closest('button[data-copy]');
  if (!b) return;
  const text = b.dataset.copy;
  const done = () => { b.textContent = '복사됨'; setTimeout(() => (b.textContent = '복사'), 1200); };
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(done, () => {
    const t = Object.assign(document.createElement('textarea'), {value: text}); document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); done();
  });
});
}
window.Cards = {plan, card, bindCopy, setAsset: fn => { A = fn; }, setNoteLink: fn => { noteLink = fn; }};
})();
