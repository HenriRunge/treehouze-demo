(() => {
  const app = document.getElementById('app');
  const restart = document.getElementById('restart-demo');

  const state = {
    surface: 'home',
    messages: [],
    scenario: null,
    journeyStarted: false,
    awaiting: null,
    activePrompt: null,
    selectedDistrict: 'Charlottenburg',
    night: { activities:'', size:4, dietary:'', food:'', vibe:'' },
    sponsor: { event:'', audience:'', support:'' },
    talentBrief: '',
    timers: [],
    modal: null
  };

  const $ = (sel, root=document) => root.querySelector(sel);
  const now = () => new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
  const statusNow = () => now().replace(/\s?[AP]M$/i,'');
  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const rich = (s='') => esc(s).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  const sleepCall = (ms, fn) => { const id = setTimeout(fn, ms); state.timers.push(id); };
  const clearTimers = () => { state.timers.forEach(clearTimeout); state.timers=[]; };

  function icon(name, cls='') {
    const a=`class="${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"`;
    const icons={
      ellipsis:`<svg ${a}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>`,
      camera:`<svg ${a} stroke-width="1.8"><path d="M4 7.8h3l1.4-2h7.2l1.4 2h3v10.7H4z"/><circle cx="12" cy="13" r="3.4"/></svg>`,
      plus:`<svg ${a} stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
      search:`<svg ${a} stroke-width="2"><circle cx="10.5" cy="10.5" r="6.3"/><path d="m15.2 15.2 4.3 4.3"/></svg>`,
      archive:`<svg ${a} stroke-width="1.8"><path d="M4 7h16v13H4zM3 4h18v4H3zM9 12h6"/></svg>`,
      back:`<svg ${a}><path d="M15 4 7 12l8 8"/></svg>`,
      video:`<svg ${a} stroke-width="1.8"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>`,
      phone:`<svg ${a} stroke-width="1.8"><path d="M7.2 3.6 4.7 5.2c-1.1.7-.8 3.4.8 6.1 1.7 3 4.6 5.9 7.6 7.6 2.7 1.6 5.4 1.9 6.1.8l1.6-2.5-4.6-3.1-1.9 2c-2.2-1.1-5.3-4.2-6.4-6.4l2-1.9z"/></svg>`,
      smile:`<svg ${a} stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="M8.6 14.2c.9 1.1 2 1.6 3.4 1.6s2.5-.5 3.4-1.6"/><circle cx="9" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".8" fill="currentColor" stroke="none"/></svg>`,
      mic:`<svg ${a} fill="currentColor" stroke="none"><path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Zm-6-4a1 1 0 0 1 2 0 4 4 0 0 0 8 0 1 1 0 1 1 2 0 6 6 0 0 1-5 5.92V20h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.58A6 6 0 0 1 6 10.5Z"/></svg>`,
      send:`<svg ${a} fill="currentColor" stroke="none"><path d="M3.6 4.1 21 11.3c.8.3.8 1.4 0 1.7L3.6 20.1c-.7.3-1.4-.4-1.1-1.1l2.1-5.3 9.1-1.6-9.1-1.6-2.1-5.3c-.3-.7.4-1.4 1.1-1.1Z"/></svg>`,
      updates:`<svg ${a} stroke-width="1.7"><circle cx="12" cy="12" r="7" stroke-dasharray="2.3 2.4"/><circle cx="12" cy="12" r="2"/></svg>`,
      calls:`<svg ${a} stroke-width="1.7"><path d="M6.3 4.6 4.1 6c-.9.6-.5 3 .9 5.3 1.5 2.6 4.1 5.2 6.7 6.7 2.3 1.4 4.7 1.8 5.3.9l1.4-2.2-4.1-2.8-1.7 1.8c-2-1-4.7-3.7-5.7-5.7l1.8-1.7z"/></svg>`,
      communities:`<svg ${a} stroke-width="1.6"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3.5 19c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5M14.5 14.5c2.8 0 4.7 1.4 5 4.5"/></svg>`,
      chats:`<svg ${a} stroke-width="1.7"><path d="M4 5.5h16v11H9l-4.5 3 .7-3H4z"/></svg>`,
      user:`<svg ${a} stroke-width="1.7"><circle cx="12" cy="8" r="3.3"/><path d="M5.5 20c.5-4.1 2.7-6.2 6.5-6.2s6 2.1 6.5 6.2"/><circle cx="12" cy="12" r="10"/></svg>`
    };
    return icons[name]||'';
  }

  function resetAll() {
    clearTimers();
    Object.assign(state, {
      surface:'home', messages:[], scenario:null, journeyStarted:false, awaiting:null,
      activePrompt:null, selectedDistrict:'Charlottenburg',
      night:{activities:'',size:4,dietary:'',food:'',vibe:''},
      sponsor:{event:'',audience:'',support:''}, talentBrief:'', modal:null
    });
    render();
  }
  restart.addEventListener('click', resetAll);

  function phone(content, cls='') {
    return `<div class="phone-shell"><div class="screen ${cls}">${statusbar()}${content}</div></div>`;
  }
  function statusbar() {
    return `<div class="statusbar"><span class="status-time">${statusNow()}</span><span class="dynamic-island"></span><span class="status-right"><span class="cellular"><i></i><i></i><i></i><i></i></span><span class="wifi"><i></i></span><span class="battery"></span></span></div>`;
  }

  function render() {
    if (state.surface === 'home') renderHome();
    else if (state.surface === 'inbox') renderInbox();
    else renderChat();
  }

  function renderHome() {
    const apps = [
      ['FaceTime','◉','green'],['Calendar','28','white'],['Photos','✿','white'],['Camera','●','gray'],
      ['Mail','✉','blue'],['Maps','⌖','white'],['Weather','☀','blue'],['Notes','≡','white'],
    ];
    const grid = apps.map(([n,i,c]) => `<button class="app-icon-wrap" type="button"><span class="app-icon ${c}">${i}</span><span class="app-name">${n}</span></button>`).join('') +
      `<button class="app-icon-wrap" id="open-whatsapp" type="button"><span class="app-icon whatsapp-icon"></span><span class="app-name">WhatsApp</span></button>` +
      `<button class="app-icon-wrap" type="button"><span class="app-icon black">◷</span><span class="app-name">Clock</span></button>` +
      `<button class="app-icon-wrap" type="button"><span class="app-icon white">N</span><span class="app-name">News</span></button>` +
      `<button class="app-icon-wrap" type="button"><span class="app-icon blue">A</span><span class="app-name">App Store</span></button>`;
    app.innerHTML = phone(`<div class="home-grid">${grid}</div><div class="home-dock"><span class="app-icon green">☎</span><span class="app-icon blue">◉</span><span class="app-icon red">♫</span><span class="app-icon gray">●</span></div>`,'home');
    $('#open-whatsapp').onclick = () => { state.surface='inbox'; render(); };
  }

  function avatar(name, img=null, logo=false) {
    return `<div class="thread-avatar ${logo?'logo':''}">${img?`<img src="${img}" alt="">`:esc(name[0])}</div>`;
  }
  function thread(name, preview, time, opts={}) {
    return `<button class="thread" type="button" ${opts.id?`id="${opts.id}"`:''}>${avatar(name,opts.img,opts.logo)}<div class="thread-content"><div class="thread-row"><span class="thread-name">${esc(name)}</span><span class="thread-time">${esc(time)}</span></div><div class="thread-preview">${esc(preview)}</div></div></button>`;
  }
  function renderInbox() {
    app.innerHTML = phone(`
      <div class="inbox">
        <div class="inbox-top">
          <div class="top-icons"><button id="go-home" class="top-icon" type="button">${icon('ellipsis')}</button><div class="top-right-icons"><button class="top-icon" type="button">${icon('camera')}</button><button class="top-icon plus" type="button">${icon('plus')}</button></div></div>
          <div class="inbox-title">Chats</div>
          <div class="searchbar">${icon('search')}<span>Ask Meta AI or Search</span></div>
          <div class="chips"><span class="chip active">All</span><span class="chip">Unread 6</span><span class="chip">Favorites</span><span class="chip">Groups</span><span class="chip round">＋</span></div>
        </div>
        <div class="inbox-list">
          <div class="archived"><span class="archived-icon">${icon('archive')}</span><span>Archived</span></div>
          ${thread('Treehouze','Whatever you want to do — I can help you organize it.','15:01',{id:'open-treehouze',img:'assets/treehouze-logo.png',logo:true})}
          ${thread('Tom','Sounds good','14:52')}
          ${thread('Monique',"How's Berlin treating you?",'Yesterday')}
        </div>
        <div class="inbox-bottom">
          <div class="bottom-nav">
            <button class="nav-item"><span class="nav-ico">${icon('updates')}</span>Updates</button>
            <button class="nav-item"><span class="nav-ico">${icon('calls')}</span>Calls</button>
            <button class="nav-item communities"><span class="nav-ico">${icon('communities')}</span><span>Communities</span></button>
            <button class="nav-item active"><span class="nav-ico">${icon('chats')}<span class="nav-badge">6</span></span>Chats</button>
            <button class="nav-item"><span class="nav-ico">${icon('user')}</span>You</button>
          </div>
          <div class="home-indicator-row"><span class="home-indicator"></span></div>
        </div>
      </div>`,'');
    $('#open-treehouze').onclick = () => { state.surface='chat'; render(); setTimeout(focusComposer,100); };
    $('#go-home').onclick = () => { state.surface='home'; render(); };
  }

  function renderChat() {
    const feed = state.messages.map(renderMessage).join('');
    const typing=isTyping();
    app.innerHTML = phone(`
      <div class="chat">
        <div class="chat-head">
          <button id="back" class="back-btn" type="button">${icon('back')}</button>
          <div class="chat-avatar"><img src="assets/treehouze-logo.png" alt="Treehouze"></div>
          <div class="chat-title"><div class="chat-name">Treehouze <span class="verified">✓</span></div><div class="chat-subtitle ${typing?'typing':''}">${typing?'typing…':'Business account'}</div></div>
          <div class="chat-actions"><button class="head-action" type="button">${icon('video')}</button><button class="head-action" type="button">${icon('phone')}</button></div>
        </div>
        <div id="chat-feed" class="chat-feed">
          <div class="day-chip">Today</div>
          <div class="security-card">This business uses a secure service from Meta to manage this chat. Tap to learn more.</div>
          ${feed}
          <div id="feed-bottom"></div>
        </div>
        <form id="composer" class="composer">
          <button class="plus-button" type="button">${icon('plus')}</button>
          <div class="input-wrap"><input id="composer-input" autocomplete="off" placeholder="Message" ${composerEnabled()?'':'disabled'}><span class="sticker">${icon('smile')}</span></div>
          <button class="circle-button" type="button">${icon('camera')}</button>
          <button id="send" class="send-button mic" type="submit">${icon('mic')}</button>
        </form>
        <div class="composer-home"><span class="home-indicator"></span></div>
        ${state.modal?renderModal():''}
      </div>`,'');
    $('#back').onclick = () => { clearTimers(); resetChat(); state.surface='inbox'; render(); };
    $('#composer').onsubmit = e => { e.preventDefault(); sendTyped(); };
    const input=$('#composer-input');
    if(input){input.addEventListener('input',updateSendVisual); updateSendVisual();}
    document.querySelectorAll('[data-reply]').forEach(btn => btn.onclick = () => chooseReply(btn.dataset.reply));
    document.querySelectorAll('[data-contact]').forEach(btn => btn.onclick = () => { state.modal={type:'contact',name:btn.dataset.contact,via:btn.dataset.via||'Treehouze'}; renderChat(); });
    document.querySelectorAll('[data-location]').forEach(btn => btn.onclick = () => { state.modal={type:'location',name:btn.dataset.location,address:btn.dataset.address||''}; renderChat(); });
    const close = $('#modal-close'); if(close) close.onclick=()=>{state.modal=null;renderChat();};
    requestAnimationFrame(scrollBottom);
  }

  function updateSendVisual(){
    const input=$('#composer-input'), btn=$('#send'); if(!input||!btn)return;
    const can=composerEnabled() && input.value.trim().length>0;
    btn.classList.toggle('mic',!can); btn.innerHTML=can?icon('send'):icon('mic');
  }

  function renderMessage(m) {
    if (m.type==='separator') return `<div class="separator">${esc(m.text)}</div>`;
    if (m.type==='typing') return ``;
    if (m.type==='text') {
      const user=m.from==='user';
      return `<div class="msg-row ${user?'outgoing':'incoming'}"><div class="bubble ${m.quote?'has-quote':''}">${m.quote?`<div class="quote">${rich(m.quote)}</div>`:''}<span class="bubble-text">${rich(m.text)}</span><span class="bubble-footer"><span class="time">${m.time||now()}</span>${user?'<span class="checks"></span>':''}</span></div></div>`;
    }
    if (m.type==='interactive') {
      return `<div class="msg-row incoming"><div class="interactive"><div class="interactive-prompt"><span>${rich(m.prompt)}</span><span class="bubble-footer"><span class="time">${m.time||now()}</span></span></div>${m.options.map(o=>{const active=state.activePrompt===m.prompt;return `<button class="reply-btn ${m.selected===o.id?'selected':''}" type="button" ${active?`data-reply="${esc(o.id)}"`:'disabled'}><span class="reply-arrow">↩</span><span class="reply-label">${esc(o.label)}</span><span></span></button>`}).join('')}</div></div>`;
    }
    if (m.type==='contact') {
      const img = m.name==='Marie'?'assets/marie.jpg':m.name==='Beni'?'assets/beni.jpg':null;
      return `<div class="msg-row incoming"><div class="contact-card"><div class="contact-top" data-contact="${esc(m.name)}" data-via="${esc(m.via||'Treehouze')}"><div class="contact-avatar">${img?`<img src="${img}" alt="">`:esc(m.name[0])}</div><div class="contact-name">${esc(m.name)}</div><div class="contact-chevron">›</div></div><div class="card-time">${now()}</div><div class="card-divider"></div><button class="card-action" data-contact="${esc(m.name)}" data-via="${esc(m.via||'Treehouze')}">Message</button></div></div>`;
    }
    if (m.type==='location') return `<div class="msg-row incoming"><button class="location-card" type="button" data-location="${esc(m.name)}" data-address="${esc(m.address)}"><div class="map"><span class="park a"></span><span class="park b"></span><span class="road-v"></span><span class="map-label a">PAPPELALLEE</span><span class="map-label b">SCHÖNHAUSER ALLEE</span><span class="pin"></span></div><div class="location-info"><span class="location-time">${now()}</span><div class="location-title">${esc(m.name)}</div><div class="location-address">${esc(m.address).replace(/ · /g,', ')}</div></div></button></div>`;
    if (m.type==='calendar') return `<div class="msg-row incoming"><div class="calendar-card"><div class="calendar-main"><div class="calendar-icon">▦</div><div class="calendar-copy"><div class="calendar-title">${esc(m.title)}</div><div class="calendar-sub">${esc(m.subtitle)}</div></div></div><div class="calendar-divider"></div><a class="calendar-btn" download="${esc(m.filename)}" href="${calendarDataUrl(m)}">Share plan</a></div></div>`;
    return '';
  }

  function resetChat() {
    state.messages=[]; state.scenario=null; state.journeyStarted=false; state.awaiting=null; state.activePrompt=null; state.modal=null;
  }
  function composerEnabled(){ return !state.journeyStarted || !!state.awaiting; }
  function focusComposer(){ const input=$('#composer-input'); if(input&&!input.disabled) input.focus(); }
  function isTyping(){ return state.messages.some(m=>m.type==='typing'); }
  function scrollBottom(){ const feed=$('#chat-feed'); if(feed) feed.scrollTop=feed.scrollHeight; }

  function renderMessage(m) {
    if (m.type==='separator') return `<div class="separator">${esc(m.text)}</div>`;
    if (m.type==='typing') return `<div class="msg-row incoming"><div class="bubble typing-bubble"><i></i><i></i><i></i></div></div>`;
    if (m.type==='text') return `<div class="msg-row ${m.from==='user'?'outgoing':'incoming'}"><div class="bubble">${m.quote?`<div class="quote">${rich(m.quote)}</div>`:''}${rich(m.text)}<span class="time">${m.time||now()}${m.from==='user'?' ✓✓':''}</span></div></div>`;
    if (m.type==='interactive') {
      return `<div class="msg-row incoming"><div class="interactive"><div class="interactive-prompt">${rich(m.prompt)}<span class="time">${m.time||now()}</span></div>${m.options.map(o=>`<button class="reply-btn" type="button" data-reply="${esc(o.id)}"><span class="reply-arrow">↩</span>${esc(o.label)}</button>`).join('')}</div></div>`;
    }
    if (m.type==='contact') {
      const img = m.name==='Marie'?'assets/marie.jpg':m.name==='Beni'?'assets/beni.jpg':null;
      return `<div class="msg-row incoming"><div class="contact-card"><div class="contact-top" data-contact="${esc(m.name)}" data-via="${esc(m.via||'Treehouze')}"><div class="contact-avatar">${img?`<img src="${img}" alt="">`:esc(m.name[0])}</div><div class="contact-name">${esc(m.name)}</div><div class="contact-chevron">›</div></div><div class="card-time">${now()}</div><div class="card-divider"></div><button class="card-action" data-contact="${esc(m.name)}" data-via="${esc(m.via||'Treehouze')}">Message</button></div></div>`;
    }
    if (m.type==='location') return `<div class="msg-row incoming"><button class="location-card" type="button" data-location="${esc(m.name)}" data-address="${esc(m.address)}"><div class="map"><span class="park a"></span><span class="park b"></span><span class="road-v"></span><span class="map-label a">PAPPELALLEE</span><span class="map-label b">SCHÖNHAUSER ALLEE</span><span class="pin"></span></div><div class="location-info"><span class="location-time">${now()}</span><div class="location-title">${esc(m.name)}</div><div class="location-address">${esc(m.address)}</div></div></button></div>`;
    if (m.type==='calendar') return `<div class="msg-row incoming"><div class="calendar-card"><div class="calendar-title">${esc(m.title)}</div><div class="calendar-sub">${esc(m.subtitle)}</div><a class="calendar-btn" download="${esc(m.filename)}" href="${calendarDataUrl(m)}">Add to calendar</a></div></div>`;
    return '';
  }

  function calendarDataUrl(m){
    const start = new Date(); start.setHours(m.hour||18,0,0,0); start.setDate(start.getDate()+(m.dayOffset||0));
    const end = new Date(start.getTime()+(m.duration||90)*60000);
    const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${m.summary}\nLOCATION:${m.location||'Berlin'}\nEND:VEVENT\nEND:VCALENDAR`;
    return 'data:text/calendar;charset=utf-8,'+encodeURIComponent(ics);
  }

  function renderModal(){
    if(state.modal.type==='contact') return `<div class="modal-backdrop"><div class="sheet"><div class="grabber"></div><h3>${esc(state.modal.name)}</h3><p>Introduced via ${esc(state.modal.via)}</p><p>Demo contact · no real messaging is sent.</p><button id="modal-close" class="sheet-close">Close</button></div></div>`;
    return `<div class="modal-backdrop"><div class="sheet"><div class="grabber"></div><h3>${esc(state.modal.name)}</h3><p>${esc(state.modal.address)}</p><p>Directions preview for the deterministic demo.</p><button id="modal-close" class="sheet-close">Close</button></div></div>`;
  }

  function addText(from,text,quote=null){ state.messages.push({type:'text',from,text,quote,time:now()}); renderChat(); }
  function addTyping(){ state.messages.push({type:'typing'}); renderChat(); }
  function removeTyping(){ const i=state.messages.map(m=>m.type).lastIndexOf('typing'); if(i>=0) state.messages.splice(i,1); }
  function addInteractive(prompt, options){ state.activePrompt=prompt; state.messages.push({type:'interactive',prompt,options,time:now()}); renderChat(); }
  function addContact(name,via){ state.messages.push({type:'contact',name,via}); renderChat(); }
  function addLocation(name,address){ state.messages.push({type:'location',name,address}); renderChat(); }
  function addCalendar(data){ state.messages.push({type:'calendar',...data}); renderChat(); }
  function addSeparator(text){ state.messages.push({type:'separator',text}); renderChat(); }
  function finishJourney(){ state.scenario=null; state.journeyStarted=false; state.awaiting=null; state.activePrompt=null; renderChat(); setTimeout(focusComposer,100); }

  function sendTyped(){
    const input=$('#composer-input'); if(!input) return; const text=input.value.trim(); if(!text) return; input.value='';
    addText('user',text);
    if(state.awaiting){ handleAwaiting(state.awaiting,text); return; }
    if(state.journeyStarted) return;
    const scenario=detectScenario(text);
    if(!scenario){ sleepCall(220,()=>{addText('bot','Whatever you want to do, where, when and with whom. I can help you organize it and find your people. What are you craving?');focusComposer();}); return; }
    state.scenario=scenario; state.journeyStarted=true;
    ({tennis:startTennis,newCity:startNewCity,night:startNight,talent:startTalent,specific:startSpecific,sponsor:startSponsor})[scenario]();
  }

  function detectScenario(message){
    const t=message.toLowerCase();
    if(t.includes('tennis')) return 'tennis';
    if(t.includes('sponsor')||t.includes('sponsorship')) return 'sponsor';
    const specific=t.includes('intro to')||t.includes('introduction to')||t.includes('introduce me to')||t.includes('want to meet')||t.includes("i'd like to meet")||(t.includes('linkedin')&&t.includes('nora'));
    if(specific&&!t.includes('someone with')) return 'specific';
    const talent=t.includes('talent')||t.includes('looking for someone with')||t.includes('find a person with')||t.includes('find someone with')||t.includes('looking for a person')||t.includes('looking for someone who')||t.includes('hire someone')||t.includes('growth marketing')||t.includes('marketer')||t.includes('someone for a project');
    if(talent) return 'talent';
    const berlin=t.includes('berlin'); const move=t.includes('moved')||t.includes('move to')||t.includes('new to')||t.includes('just got to'); const network=t.includes('know anyone')||t.includes('know someone')||t.includes('people here');
    if(berlin&&(move||network)) return 'newCity';
    const night=t.includes('nightlife')||t.includes('night out')||t.includes('going out')||t.includes('show them berlin')||t.includes('friends are visiting')||t.includes('friends visiting')||t.includes('visiting me');
    if(night) return 'night';
    return null;
  }

  function chooseReply(id){
    const q=state.activePrompt;
    if(!q) return;
    for(let i=state.messages.length-1;i>=0;i--){
      if(state.messages[i].type==='interactive'){ state.messages[i].selected=id; break; }
    }
    state.activePrompt=null;
    const map={
      marieYes:['Yes, please make the intro',makeMarieIntro],marieNo:['Not now',()=>{sleepCall(220,()=>{addText('bot',"No problem. I'll keep looking whenever you're ready.");finishJourney();});}],
      marieSetup:['Yes, set it up',marieAreas],marieDecline:['Not tonight',()=>{sleepCall(220,()=>{addText('bot',"No problem. I'll leave it there. Message me whenever you want to play.");finishJourney();});}],
      dCharl:['Charlottenburg',()=>chooseDistrict('Charlottenburg')],dMitte:['Mitte',()=>chooseDistrict('Mitte')],dPrenz:['Prenzlauer Berg',()=>chooseDistrict('Prenzlauer Berg')],
      bookCourt:['Finalize booking',bookMarieCourt],skipCourt:['Not now',()=>{sleepCall(220,()=>{addText('bot',"No problem. I won't book the court. You already have Marie's contact if you want to coordinate another time.");finishJourney();});}],
      marieGreat:["Great. I'd definitely do it again.",()=>askAddMarie('Add Marie to your network?')],marieOkay:['It was okay.',()=>askAddMarie('Want to keep Marie in your network anyway?')],marieBad:['Not really a fit.',()=>{sleepCall(220,()=>{addText('bot',"Got it. I won't add Marie, and I'll use that feedback for the next match.");finishJourney();});}],
      addMarie:['👍 Add Marie',()=>{addText('bot','✅ Marie is now part of your network. What else do you need?');finishJourney();}],skipMarie:['No thanks',()=>{sleepCall(220,()=>{addText('bot',"No problem. I won't add Marie. What else can I help with?");finishJourney();});}],
      beniYes:['Yes, please make the intro',introduceBeni],beniNo:['Not now',()=>{sleepCall(220,()=>{addText('bot','No problem. Just tell me whenever you want to meet someone in Berlin.');finishJourney();});}],
      beniJoin:['Yes, join',confirmBeni],beniSkip:['Not this time',()=>{sleepCall(220,()=>{addText('bot',"No problem. You already have Beni's contact above, so you can reach out and find another time.");finishJourney();});}],
      beniGreat:["Great. I'd definitely do it again.",()=>askAddBeni('Add Beni to your network?')],beniOkay:['It was okay.',()=>askAddBeni('Want to add Beni to your network anyway?')],beniBad:['Not really a fit.',()=>{sleepCall(220,()=>{addText('bot',"Got it. I won't add Beni, and I'll use that feedback for future introductions.");finishJourney();});}],
      addBeni:['👍 Add Beni',()=>{addText('bot','✅ Beni is now part of your network. What else do you need?');finishJourney();}],skipBeni:['No thanks',()=>{sleepCall(220,()=>{addText('bot',"No problem. I won't add Beni. What else can I help with?");finishJourney();});}],
      nightBook:['Book the night',bookNight], nightChanges:['Make changes',()=>{}],
      nightGreat:["Great. We'd definitely do it again.",nightHighlight],nightOkay:['It was okay.',nightImprove],nightBad:['Not really for us.',nightImprove],
      hiDinner:['Dinner',()=>saveNight('Dinner at Mido')],hiVern:['Vernissage',()=>saveNight('Vernissage')],hiSisy:['Sisyphos',()=>saveNight('Sisyphos')],
      impTravel:['Less travel',()=>saveImprove('Less travel')],impRelax:['More relaxed',()=>saveImprove('More relaxed')],impEarly:['Earlier finish',()=>saveImprove('Earlier finish')],
      talentYes:['Yes, please',makeTalentIntro],talentNo:['Not now',()=>{sleepCall(220,()=>{addText('bot','No problem. I can keep searching whenever you want.');finishJourney();});}],
      specificYes:['Yes, please with this info',makeSpecificIntro],specificNo:['Not now',()=>{sleepCall(220,()=>{addText('bot',"No problem. I can make the intro whenever you're ready.");finishJourney();});}],
      sponsorYes:['Yes, please',makeSponsorIntro],sponsorNo:['Not now',()=>{sleepCall(220,()=>{addText('bot',"No problem. I can make the sponsor intro whenever you're ready.");finishJourney();});}]
    };
    const entry=map[id]; if(!entry)return; addText('user',entry[0],q); entry[1]();
  }

  // Flow 1: Tennis
  function startTennis(){
    sleepCall(280,()=>{addText('bot',"Okay, I'll look for someone. I'll get back to you as soon as I find someone.");addTyping();});
    sleepCall(2450,()=>{removeTyping();addInteractive('Yeah, I found someone. Want me to make the intro?',[{id:'marieYes',label:'Yes, please'},{id:'marieNo',label:'Not now'}]);});
  }
  function makeMarieIntro(){ sleepCall(280,()=>{addText('bot',"Okay, I'll try to make the intro.");addTyping();}); sleepCall(1850,()=>{removeTyping();addText('bot','Yes, the intro was successful. Tom thinks you should meet Marie.');addContact('Marie','Tom');addText('bot','🎾 Marie plays tennis regularly and also loves art, cafés and weekend runs.\n\n💼 LinkedIn · marie-keller\n📸 Instagram · @marieplays');addInteractive("Marie is also looking for someone to play tonight. She's free at 6. Want me to set it up?",[{id:'marieSetup',label:'Yes, set it up'},{id:'marieDecline',label:'Not tonight'}]);}); }
  function marieAreas(){ sleepCall(260,()=>addInteractive('Marie suggests these areas — which one works best for you?',[{id:'dCharl',label:'Charlottenburg'},{id:'dMitte',label:'Mitte'},{id:'dPrenz',label:'Prenzlauer Berg'}])); }
  function chooseDistrict(d){ state.selectedDistrict=d; sleepCall(280,()=>{addText('bot',"Okay, I'll look for an open court.");addTyping();}); sleepCall(2050,()=>{removeTyping();const venue=d==='Mitte'?'Tennis Club Mitte':d==='Prenzlauer Berg'?'Tennis Club Prenzlauer Berg':'Tennis Club Charlottenburg'; addInteractive(`I found an open court at ${venue} at 6pm for €32 total. Marie agreed to this court. Should I finalize the booking?`,[{id:'bookCourt',label:'Finalize booking'},{id:'skipCourt',label:'Not now'}]);}); }
  function bookMarieCourt(){ const d=state.selectedDistrict; const venue=d==='Mitte'?'Tennis Club Mitte':d==='Prenzlauer Berg'?'Tennis Club Prenzlauer Berg':'Tennis Club Charlottenburg'; sleepCall(180,()=>{addText('bot','All set. Marie will meet you there.');addLocation(venue,`Berlin-${d} · Court 6`);}); sleepCall(1550,()=>{addSeparator('Later');addInteractive('How was tennis with Marie?',[{id:'marieGreat',label:'Great'},{id:'marieOkay',label:'It was okay'},{id:'marieBad',label:'Not a fit'}]);}); }
  function askAddMarie(prompt){sleepCall(220,()=>addInteractive(prompt,[{id:'addMarie',label:'👍 Add Marie'},{id:'skipMarie',label:'No thanks'}]));}

  // Flow 2: New city
  function startNewCity(){ sleepCall(280,()=>{addText('bot',"Okay, I'll look through your network. I'll get back to you as soon as I find someone.");addTyping();}); sleepCall(2450,()=>{removeTyping();addInteractive('Yeah, I found someone. Want me to make the intro?',[{id:'beniYes',label:'Yes, please'},{id:'beniNo',label:'Not now'}]);}); }
  function introduceBeni(){sleepCall(280,()=>{addText('bot',"Okay, I'll make the intro.");addTyping();});sleepCall(1850,()=>{removeTyping();addText('bot','The intro was successful. Monique lived here last year and thinks you should meet Beni.');addContact('Beni','Monique');addText('bot','🏀 Beni is into basketball, running and early-stage startups — and is always up for meeting new people in Berlin.\n\n💼 LinkedIn · beni-wagner\n📸 Instagram · @beniontherun');addInteractive('Beni is up for basketball Sunday at 4 at Pappelallee 22 in Prenzlauer Berg. Want to join?',[{id:'beniJoin',label:'Yes, join'},{id:'beniSkip',label:'Not this time'}]);});}
  function confirmBeni(){sleepCall(180,()=>{addText('bot','✅ Perfect. Beni will meet you there Sunday at 16:00 at the basketball court at Pappelallee 22 in Prenzlauer Berg. Meet by the main court entrance.');addCalendar({title:'Basketball with Beni',subtitle:'Add the time and location to your calendar.',filename:'Treehouze-Basketball-with-Beni.ics',summary:'Basketball with Beni',location:'Pappelallee 22, Berlin-Prenzlauer Berg',dayOffset:3,hour:16,duration:90});addLocation('Basketball Court','Pappelallee 22 · Berlin-Prenzlauer Berg');});sleepCall(1550,()=>{addSeparator('Sunday evening');addInteractive('How was basketball with Beni?',[{id:'beniGreat',label:'Great'},{id:'beniOkay',label:'It was okay'},{id:'beniBad',label:'Not a fit'}]);});}
  function askAddBeni(prompt){sleepCall(220,()=>addInteractive(prompt,[{id:'addBeni',label:'👍 Add Beni'},{id:'skipBeni',label:'No thanks'}]));}

  // Flow 3: Night out
  function startNight(){sleepCall(240,()=>{addText('bot','What do you want to do tonight? Tell me what sounds good — dinner, drinks, bars, a party, or something completely different.');state.awaiting='nightActivities';renderChat();focusComposer();});}
  function handleAwaiting(kind,text){
    state.awaiting=null;
    if(kind==='nightActivities'){state.night.activities=text;sleepCall(220,()=>askOpen('How many of you are there?','nightSize'));}
    else if(kind==='nightSize'){const n=parseSize(text);if(!n||n<1||n>20){sleepCall(220,()=>askOpen('Just send me the number of people — for example, 4.','nightSize'));}else{state.night.size=n;sleepCall(220,()=>askOpen('Any dietary restrictions?','nightDietary'));}}
    else if(kind==='nightDietary'){state.night.dietary=text;sleepCall(200,()=>askOpen('What kind of food are you craving?','nightFood'));}
    else if(kind==='nightFood'){state.night.food=text;sleepCall(200,()=>askOpen('What vibe do you want for the night?','nightVibe'));}
    else if(kind==='nightVibe'){state.night.vibe=text;showNightPlan();}
    else if(kind==='talentBrief'){state.talentBrief=text;talentSearch();}
    else if(kind==='sponsorEvent'){state.sponsor.event=text;sleepCall(220,()=>askOpen('How many people are you expecting?','sponsorAudience'));}
    else if(kind==='sponsorAudience'){state.sponsor.audience=text;sleepCall(220,()=>askOpen('What kind of sponsorship would help most?','sponsorSupport'));}
    else if(kind==='sponsorSupport'){state.sponsor.support=text;sponsorSearch();}
  }
  function askOpen(prompt,kind){addText('bot',prompt);state.awaiting=kind;renderChat();focusComposer();}
  function parseSize(t){const m=t.match(/\d+/);if(m)return +m[0];const w={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};const k=Object.keys(w).find(k=>t.toLowerCase().includes(k));return k?w[k]:null;}
  function showNightPlan(){sleepCall(220,()=>addInteractive(`Got it. I put together a night based on what you told me, what you've liked and what's happening tonight.\n\n**Your night in Berlin**\n**18:00** Dinner at Mido · Prenzlauer Berg\n**20:00** Walk + Späti stop\n**20:30** Drinks + Vernissage · Alexanderplatz\n**23:00** S-Bahn to Sisyphos\n**23:30** Sisyphos · open end\n\n👥 ${state.night.size} people\n💶 Approx. €75–95 per person`,[{id:'nightChanges',label:'Make changes'},{id:'nightBook',label:'Book the night'}]));}
  function bookNight(){sleepCall(180,()=>{addText('bot',"Got it. I'm arranging everything now…");addTyping();});sleepCall(820,()=>{removeTyping();addText('bot',`✅ All set. ${state.night.size} guests are confirmed. Dinner is arranged, event access and the club guest list are confirmed, and your route is saved. Enjoy Berlin.`);addCalendar({title:'Invite your friends',subtitle:'Share the night so everyone can add it to their calendar.',filename:'Treehouze-Berlin-Night.ics',summary:'Treehouze · Your night in Berlin',location:'Berlin',hour:18,duration:480});addLocation('Mido','Prenzlauer Berg');addLocation('Sisyphos','Berlin');});sleepCall(1650,()=>{addSeparator('Next day');addInteractive('How was your night?',[{id:'nightGreat',label:'Great'},{id:'nightOkay',label:'It was okay'},{id:'nightBad',label:'Not for us'}]);});}
  function nightHighlight(){sleepCall(220,()=>addInteractive('What did you like most?',[{id:'hiDinner',label:'Dinner'},{id:'hiVern',label:'Vernissage'},{id:'hiSisy',label:'Sisyphos'}]));}
  function nightImprove(){sleepCall(220,()=>addInteractive('Got it. What should I change next time?',[{id:'impTravel',label:'Less travel'},{id:'impRelax',label:'More relaxed'},{id:'impEarly',label:'Earlier finish'}]));}
  function saveNight(x){sleepCall(220,()=>{addText('bot',`✅ Preference saved: ${x}. I'll keep that in mind for your next night out. What else do you need?`);finishJourney();});}
  function saveImprove(x){const extra=x==='Less travel'?"Next time I'll keep the route tighter and reduce travel between stops.":x==='More relaxed'?"Next time I'll build a more relaxed night with fewer stops.":"Next time I'll plan an earlier finish.";sleepCall(220,()=>{addText('bot',`✅ Preference saved: ${x}. ${extra} What else do you need?`);finishJourney();});}

  // Flow 4: Talent
  function startTalent(){sleepCall(240,()=>askOpen('Absolutely. Send me the brief first — who are you looking for, what should they be good at, and any must-haves?','talentBrief'));}
  function talentSearch(){sleepCall(240,()=>{addText('bot',"Got it. I'll search your network and friends-of-friends for someone who matches that brief.");addTyping();});sleepCall(2350,()=>{removeTyping();addInteractive('I found someone who looks like a strong fit. Want me to make the intro?',[{id:'talentYes',label:'Yes, please'},{id:'talentNo',label:'Not now'}]);});}
  function makeTalentIntro(){sleepCall(260,()=>{addText('bot',"Okay, I'll make the intro.");addTyping();});sleepCall(1550,()=>{removeTyping();addText('bot','The intro worked. David thinks you should meet Lena.');addContact('Lena','David');addText('bot','💼 Lena is a freelance growth marketer focused on consumer apps, early-stage startups and community-led growth.\n\n🔗 LinkedIn: linkedin.com/in/lena-growth-demo');addText('bot','✅ I shared your brief with her. She’s open to learning more — just reach out.');finishJourney();});}

  // Flow 5: Specific intro
  function startSpecific(){sleepCall(260,()=>{addText('bot',"Got it. I'll check whether someone in your network can help with an intro to Nora Klein.");addTyping();});sleepCall(2200,()=>{removeTyping();addInteractive('I know someone who could help with an intro to Nora. Want me to connect you and share the LinkedIn profile and context you sent?',[{id:'specificYes',label:'Yes, please with this info'},{id:'specificNo',label:'Not now'}]);});}
  function makeSpecificIntro(){sleepCall(260,()=>{addText('bot',"Absolutely. I'll connect you to the person who can help and pass along the context you sent.");addTyping();});sleepCall(1550,()=>{removeTyping();addText('bot',"Done. Felix knows Nora and is happy to help with the intro. I shared Nora's LinkedIn profile and your reason for wanting to meet her, so you can work out the details directly with him.");addContact('Felix','Treehouze');addText('bot','Just reach out to Felix and take it from here. ✅');finishJourney();});}

  // Flow 6: Sponsors
  function startSponsor(){sleepCall(240,()=>askOpen('Absolutely. First, give me a few event details. What are you hosting?','sponsorEvent'));}
  function sponsorSearch(){sleepCall(240,()=>{addText('bot',"Got it. I'll search your network for potential sponsors and people who can introduce you.");addTyping();});sleepCall(2250,()=>{removeTyping();addInteractive('I found a potential sponsor through your network. Want me to make the intro?',[{id:'sponsorYes',label:'Yes, please'},{id:'sponsorNo',label:'Not now'}]);});}
  function makeSponsorIntro(){sleepCall(260,()=>{addText('bot',"I'll make the intro.");addTyping();});sleepCall(1550,()=>{removeTyping();addText('bot','The intro worked. Lara introduced you to Maya at Northstar Drinks.');addContact('Maya','Lara');addText('bot',`I shared the basics: ${state.sponsor.event}, ${state.sponsor.audience}, looking for ${state.sponsor.support.toLowerCase()}. Maya is open to hearing more. ✅`);finishJourney();});}

  render();
})();
