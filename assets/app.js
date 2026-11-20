'use strict';
(() => {
  const kind = document.body.dataset.experiment;
  const paired = kind === 'prosody';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names = {'live-audio':'GPT-Live · audio input','realtime-audio':'GPT-Realtime · audio input','gemini-audio':'Gemini · audio input','grok-audio':'Grok · audio input','realtime-text':'GPT-Realtime · text input','gemini-text':'Gemini · text input'};
  const cases = [
    {id:'debate_seg_016_017_s0',title:'Chicken and duck',subtitle:'Grok · all three runs',note:'Grok retains the chicken/duck distinction across all ten hops in each of the three runs.',arm:'grok-audio',hop:10,run:0,stops:[1,5,10]},
    {id:'iud_006_pid_f05',title:'Moving the lamp',subtitle:'Realtime · runs 2 and 3',note:'In Realtime run 2, H1 distinguishes the readings; H2 becomes ambiguous; by H3, both sides mean taking the lamp upstairs. Run 3 follows a different trajectory and preserves the contrast.',arm:'realtime-audio',hop:3,run:2,stops:[1,2,3,10]},
    {id:'contra_50002',title:'Receipt, receiver, recipient',subtitle:'Realtime · run 2',note:'Realtime run 2 preserves the statement/question contrast through H5. At H6, “receipt” becomes “receiver” and later “recipient”, while the question form remains.',arm:'realtime-audio',hop:6,run:2,stops:[1,5,6,10]},
    {id:'debate_seg_057_058_s4',title:'Concert and refunds',subtitle:'All four models · all three runs',note:'The source labels contrast cancelling a refund policy with cancelling a concert. At H10, all 12 A-side chains describe a refund outcome.',arm:'live-audio',hop:10,run:0,stops:[1,5,10]},
    {id:'debate_seg_043_044_s1',title:'Two leaders or two plans',subtitle:'Gemini · run 3',note:'In Gemini run 3, side A shifts to two plans during the chain, then returns to one plan for two leaders at H10, separating from B again.',arm:'gemini-audio',hop:10,run:3,stops:[1,5,6,10]},
    {id:'contra_50002',title:'Same transcript, different intonation',subtitle:'Grok · run 1',note:'At H1, Grok run 1 has identical ASR text for A and B. The experiment’s pitch analysis describes a falling ending for A and a rising ending for B at H1 and H10. At H10, the transcripts also differ: A explicitly states the requirement, while B remains a question.',arm:'grok-audio',hop:1,run:1,stops:[1,10]}
  ];
  let data, items, selected, currentRows = [], renderTicket = 0, feature = null;
  const cache = new Map();
  async function getJSON(path) { const r = await fetch(path); if (!r.ok) throw new Error(`Could not load ${path} (${r.status}).`); return r.json(); }
  function player(path,label) { return path ? `<audio controls preload="none" aria-label="${esc(label)}" src="${esc(path)}">Your browser does not support this audio format. <a href="${esc(path)}">Download audio</a></audio>` : ''; }
  function modelLabel(id) { return paired ? names[id].split(' · ')[0] : names[id]; }
  function caption(r,label) {
    if (!r?.audio) return '<p class="missing">No output recorded at this hop.</p>';
    return `${player(r.audio,label)}<div class="audio-label">Independent ASR transcript <span class="tag">· ${Number(r.seconds || 0).toFixed(1)} s</span></div><p class="text" lang="${selected.language || 'en'}">${esc(r.asr || 'ASR transcript unavailable.')}</p>${r.native ? `<details class="native"><summary>Model-native caption</summary><p class="text" lang="${selected.language || 'en'}">${esc(r.native)}</p></details>` : ''}`;
  }
  function sourceMarkup() {
    if (!paired) return `<div class="source-head"><h2>${esc(selected.sample_id)} <span class="pill">H0 · source</span></h2><span class="tag"><a href="${esc(selected.source_url)}">${esc(selected.dataset)}</a> · ${Number(selected.seconds).toFixed(1)} s</span></div>${player(selected.audio,`${selected.sample_id} source audio`)}<div class="audio-label">Frozen source ASR · actual H0 input for text conditions</div><p class="text" lang="en">${esc(selected.text)}</p><details class="publisher"><summary>Publisher transcript &amp; source ID</summary><p class="text" lang="en">${esc(selected.publisher_text)}</p><p>Source ID: ${esc(selected.source_id)} · ${esc(selected.license)}</p></details>`;
    return `<div class="source-head"><h2>${esc(selected.title)} <span class="pill">H0 · source pair</span></h2><span class="tag"><a href="${esc(selected.source_url)}">${esc(selected.dataset)}</a> · ${selected.language === 'zh' ? 'Mandarin Chinese' : 'English'}</span></div><p class="tag">${esc(selected.pair_id)}</p><div class="source-pair">${selected.sources.map(s => `<section><h3><span class="side-label ${s.side==='b'?'side-b':''}">${s.side.toUpperCase()}</span> Source reading</h3><p class="meaning">${esc(s.meaning)}</p>${player(s.audio,`Source ${s.side.toUpperCase()} — ${selected.title}`)}<div class="audio-label">Independent source ASR</div><p class="text" lang="${selected.language}">${esc(s.text)}</p><details class="publisher"><summary>Publisher script${selected.language==='zh'?' · / marks a prosodic boundary':''}</summary><p class="text" lang="${selected.language}">${esc(s.publisher_text)}</p></details></section>`).join('')}</div>`;
  }
  function settings() {
    $('settings-content').innerHTML = `<table class="model-table"><thead><tr><th>Condition</th><th>Model ID</th><th>Voice</th></tr></thead><tbody>${Object.entries(data.arms).map(([id,a])=>`<tr><td>${esc(modelLabel(id))}</td><td>${esc(a.model)}</td><td>${esc(a.voice)}</td></tr>`).join('')}</tbody></table><p><strong>Shared audio prompt</strong></p><blockquote class="prompt">${esc(data.audio_prompt)}</blockquote>${data.text_prompt ? `<p><strong>Text-input prompt</strong></p><blockquote class="prompt">${esc(data.text_prompt)}</blockquote>` : ''}<p>Three independent runs × ten hops. Technical failures may be retried up to six attempts; completed outputs are retained without semantic reruns. Independent transcripts use gpt-transcribe${paired?', with the original source language set for each chain':', in English'}. ${paired?'A/B meanings and source labels are not sent to the relay model.':'Text conditions begin with the frozen source ASR and use the previous output’s ASR thereafter.'}</p><p>Provider settings follow the saved experiment configuration: Realtime uses low reasoning with a 4,096-token output limit; Grok uses reasoning “none”. Model IDs and voices are listed above. No shared temperature or seed was imposed. GPT-Live uses native PCM capture with an 8-second quiet interval, a minimum 15-second tail, and a 90-second maximum tail.</p>`;
  }
  function updateURL() {
    const p = new URLSearchParams(); p.set(paired?'pair':'sample',$('sample').value); p.set('arm',$('arm').value); p.set('hop',$('hop').value);
    if (feature) p.set('example',String(cases.indexOf(feature)+1));
    history.replaceState(null,'',`${location.pathname}?${p}`);
  }
  function renderObservation() {
    if (!paired) return;
    if (!feature || feature.id !== selected.pair_id) feature = cases.find(c=>c.id===selected.pair_id);
    $('observation').innerHTML = `<p><strong>${esc(feature.title)}.</strong> ${esc(feature.note)}</p><div class="evidence-links"><span class="tag">Jump to ${esc(modelLabel(feature.arm))}${feature.run?' · highlighted run '+feature.run:''}:</span>${feature.stops.map(h=>`<button data-evidence="${h}">H${h}</button>`).join('')}${selected.pair_id==='contra_50002'?`<button data-example="${feature===cases[5]?2:5}">${feature===cases[5]?'See Realtime wording drift':'Compare Grok intonation'}</button>`:''}</div>`;
  }
  function renderRuns() {
    const arm=$('arm').value,hop=Number($('hop').value);
    $('result-title').textContent=hop===0?'Source replay across runs':`H${hop} · Compare three runs`;
    $('result-meta').textContent=`${modelLabel(arm)} · ${data.arms[arm].model} · voice ${data.arms[arm].voice}${hop===0?' · Each run starts from the same H0.':''}`;
    $('grid').innerHTML=[1,2,3].map(run=>{
      let body;
      if (paired) body=['a','b'].map(side=>{
        const r=hop===0?{...selected.sources.find(s=>s.side===side),asr:selected.sources.find(s=>s.side===side).text}:currentRows.find(r=>r.arm===arm&&r.run===run&&r.hop===hop&&r.side===side);
        return `<section class="run-side"><div class="audio-label"><span class="side-label ${side==='b'?'side-b':''}">${side.toUpperCase()}</span> H${hop}</div>${caption(r,`Run ${run}, side ${side.toUpperCase()}, hop ${hop}`)}</section>`;
      }).join('');
      else {const r=hop===0?{...selected,asr:selected.text}:currentRows.find(r=>r.arm===arm&&r.run===run&&r.hop===hop); body=caption(r,`Run ${run}, hop ${hop}`);}
      return `<article class="card ${feature?.run===run&&feature.arm===arm?'highlight':''}" aria-label="Run ${run}"><div class="run-label"><h2>Run ${run}</h2><span>${hop===0?'Same source':'Independent chain'}</span></div>${body}</article>`;
    }).join('');
    $('hops').innerHTML=Array.from({length:11},(_,h)=>`<button data-hop="${h}" class="${h===hop?'active':''}" aria-pressed="${h===hop}">H${h}</button>`).join('');
    updateURL();
  }
  async function renderSample() {
    const ticket=++renderTicket; selected=items.find(s=>(paired?s.pair_id:s.sample_id)===$('sample').value);
    $('source').innerHTML=sourceMarkup();renderObservation();
    const idx=items.indexOf(selected);$('prev').disabled=idx===0;$('next').disabled=idx===items.length-1;
    $('grid').innerHTML='<p class="loading" role="status">Loading this input’s results…</p>';
    const id=$('sample').value;
    try { if (!cache.has(id)) cache.set(id,await getJSON(`assets/data/${kind}/${id}.json`)); if(ticket!==renderTicket)return;currentRows=cache.get(id);renderRuns(); }
    catch(e){if(ticket===renderTicket)$('grid').innerHTML=`<p class="error" role="alert">${esc(e.message)} Please reload to try again.</p>`;}
  }
  async function openExample(index) { feature=cases[index];$('sample').value=feature.id;$('arm').value=feature.arm;$('hop').value=feature.hop;await renderSample(); }
  async function init() {
    data=await getJSON(`assets/data/${kind}.json`);items=paired?data.pairs:data.sources;
    $('sample').innerHTML=items.map(s=>`<option value="${esc(paired?s.pair_id:s.sample_id)}">${esc(paired?s.title:s.sample_id+' · '+s.dataset)}</option>`).join('');
    $('arm').innerHTML=Object.keys(data.arms).map(id=>`<option value="${id}">${esc(modelLabel(id))}</option>`).join('');
    $('hop').innerHTML=Array.from({length:11},(_,h)=>`<option value="${h}">H${h}${h===0?' · source':''}</option>`).join('');
    const p=new URLSearchParams(location.search),id=p.get(paired?'pair':'sample'),arm=p.get('arm'),hop=p.get('hop');
    if(items.some(s=>(paired?s.pair_id:s.sample_id)===id))$('sample').value=id;
    if(paired){const ex=Number(p.get('example'));feature=ex>=1&&ex<=cases.length&&cases[ex-1].id===$('sample').value?cases[ex-1]:cases.find(c=>c.id===$('sample').value);$('arm').value=feature.arm;}
    if(Object.hasOwn(data.arms,arm))$('arm').value=arm;
    $('hop').value=hop!==null&&/^\d+$/.test(hop)&&Number(hop)<=10?Number(hop):10;
    settings();
    if(paired){$('case-list').innerHTML=cases.map((c,i)=>`<a class="case-link" href="emotion.html?pair=${c.id}&amp;arm=${c.arm}&amp;hop=${c.hop}&amp;example=${i+1}" data-example="${i}"><strong>${esc(c.title)}</strong><span>${esc(c.subtitle)}</span></a>`).join('');}
    $('sample').addEventListener('change',()=>{if(paired){feature=cases.find(c=>c.id===$('sample').value);$('arm').value=feature.arm;}renderSample();});
    $('arm').addEventListener('change',()=>renderSample());$('hop').addEventListener('change',()=>renderSample());
    $('prev').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));
    document.addEventListener('click',e=>{const ex=e.target.closest('[data-example]'),hb=e.target.closest('[data-hop]'),ev=e.target.closest('[data-evidence]');if(ex){e.preventDefault();openExample(Number(ex.dataset.example));}else if(hb){$('hop').value=hb.dataset.hop;renderSample();}else if(ev){$('arm').value=feature.arm;$('hop').value=ev.dataset.evidence;renderSample();}});
    document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause();});},true);
    await renderSample();
  }
  function move(delta){const i=items.findIndex(s=>(paired?s.pair_id:s.sample_id)===$('sample').value);if(i+delta<0||i+delta>=items.length)return;$('sample').selectedIndex=i+delta;$('sample').dispatchEvent(new Event('change'));}
  init().catch(e=>{$('source').innerHTML=`<p class="error" role="alert">${esc(e.message)} Please serve this folder over HTTP or open the GitHub Pages site.</p>`;});
})();
