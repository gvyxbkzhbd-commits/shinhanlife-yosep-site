const API_BASE = (window.BACKEND_URL || window.location.origin).replace(/\/$/,'') + '/api';
document.addEventListener('DOMContentLoaded', ()=>{
  // Diagnosis
  const diagForm = document.getElementById('diagForm');
  const diagResult = document.getElementById('diagResult');
  diagForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const age = Number(document.getElementById('age').value);
    const focus = document.getElementById('focus').value;
    const has = document.getElementById('hasInsurance').value;
    let lines = [];
    if(focus==='driver') lines.push('운전자보험: 형사합의금/벌금/변호사비 중심. KB 등 실제 사례 참고.');
    if(focus==='cancer') lines.push('암보험: 최초진단금 중심 + 필요 시 수술/항암 특약.');
    if(focus==='life') lines.push('종신/생명: 보장금액과 납입기간, 해지환급 구조 비교.');
    if(focus==='health') lines.push('실손/건강: 갱신주기·자기부담률·비급여특약 확인.');
    if(has==='no') lines.unshift('현재 미가입이시라면 필수 보장(사망/입원/수술)부터 점검을 권장합니다.');
    if(age<30) lines.push('젊은층은 낮은 보험료로 핵심 보장 위주 설계를 추천합니다.');
    if(age>=50) lines.push('50세 이상은 진단비·입원비 강화와 갱신 리스크 관리가 중요합니다.');
    diagResult.innerHTML = `<strong>권장 요약:</strong><br>• ` + lines.join('<br>• ') + `<br><br><a class="btn" href="#reserve">상담 예약하기</a>`;
  });

  // Reservations
  const reserveForm = document.getElementById('reserveForm');
  const reserveList = document.getElementById('reserveList');
  async function loadReserves(){
    try{
      const resp = await fetch(`${API_BASE}/reservations`);
      const arr = await resp.json();
      reserveList.innerHTML = arr.length ? arr.map(r=>`<div class="item"><strong>${r.name}</strong> (${r.method}) - ${r.datetime} <br><small>${r.phone} · 메모: ${r.note||'-'}</small></div>`).join('') : '<p>예약이 아직 없습니다.</p>';
    }catch(e){ reserveList.innerHTML = '<p>예약 목록을 불러오지 못했습니다.</p>'; }
  }
  reserveForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = {
      name:document.getElementById('r_name').value,
      phone:document.getElementById('r_phone').value,
      method:document.getElementById('r_method').value,
      datetime:document.getElementById('r_datetime').value,
      note:document.getElementById('r_note').value
    };
    const resp = await fetch(`${API_BASE}/reservations`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    if(resp.ok){ reserveForm.reset(); loadReserves(); alert('예약이 접수되었습니다. 신요섭 설계사가 확인 후 연락드릴게요.'); }
    else{ alert('예약 접수에 실패했습니다.'); }
  });
  loadReserves();

  // Chatbot
  const chatWindow = document.getElementById('chatWindow');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chips = document.querySelectorAll('.chip');
  function addMsg(text, who='bot'){
    const div = document.createElement('div'); div.className = 'msg ' + (who==='user' ? 'user' : 'bot'); div.innerHTML = text;
    chatWindow.appendChild(div); chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  function bestAnswer(q){
    const ql = q.toLowerCase();
    let best = null, score = 0;
    (window.YOR_FAQ||[]).forEach(item=>{
      let s = 0; (item.kw||[]).forEach(k=>{ if(ql.includes(k)) s += 1; });
      if(s>score){ score = s; best = item.ans; }
    });
    if(score===0){
      if(ql.includes('예약')||ql.includes('상담')) return '상담 예약은 아래 <a href="#reserve">상담 예약</a> 섹션에서 가능합니다.';
      if(ql.includes('보장')&&ql.includes('분석')) return '신한라이프 공식 보장분석은 상단 버튼을 이용해 주세요.';
      return '정확한 설계를 위해 <a href="#reserve">상담 예약</a>을 권장드립니다.';
    }
    return best + ' 더 자세한 안내는 <a href="#reserve">상담 예약</a>으로 이어가겠습니다.';
  }
  addMsg('안녕하세요, 요르 상담도우미입니다. 궁금한 점을 물어보세요.');
  chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = chatInput.value.trim(); if(!q) return;
    addMsg(q,'user'); addMsg(bestAnswer(q),'bot'); chatInput.value='';
  });
  chips.forEach(ch=>ch.addEventListener('click',()=>{ chatInput.value = ch.dataset.q; chatForm.dispatchEvent(new Event('submit')); }));

  // Reviews
  const reviewForm = document.getElementById('reviewForm');
  const reviewList = document.getElementById('reviewList');
  async function loadReviews(){
    try{
      const resp = await fetch(`${API_BASE}/reviews`);
      const arr = await resp.json();
      reviewList.innerHTML = arr.length ? arr.map(r=>`<div class="item"><strong>${r.name}</strong> ★${r.rating} <small>· ${r.src||'-'}</small><br>${r.text}</div>`).join('') : '<p>등록된 후기가 없습니다.</p>';
    }catch(e){ reviewList.innerHTML = '<p>후기를 불러오지 못했습니다.</p>'; }
  }
  reviewForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = { 
      name:document.getElementById('rev_name').value, 
      rating:document.getElementById('rev_rating').value, 
      text:document.getElementById('rev_text').value,
      src:document.getElementById('rev_src').value
    };
    const resp = await fetch(`${API_BASE}/reviews`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    if(resp.ok){ reviewForm.reset(); loadReviews(); alert('후기 등록 감사합니다.'); }
    else{ alert('후기 등록에 실패했습니다.'); }
  });
  loadReviews();
});