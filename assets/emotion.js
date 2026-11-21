'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names = {'live-audio':'GPT-Live','realtime-audio':'GPT-Realtime','gemini-audio':'Gemini','grok-audio':'Grok'};
  const observations = {
    debate_seg_055_056_s8: 'The source recordings are quiet. In Realtime run 2, H1 distinguishes who loses whom; by H4, side A changes from Xiaoming dying to Xiaohong lacking his support. Realtime run 1 and all three Grok runs retain the role contrast.',
    debate_seg_016_017_s0: 'Grok retains the chicken/duck distinction across all ten hops in each of the three runs.',
    iud_006_pid_f05: 'In Realtime run 2, H1 distinguishes the readings; H2 becomes ambiguous; by H3, both sides mean taking the lamp upstairs. Run 3 preserves the contrast.',
    contra_50002: 'Realtime run 2 preserves the statement/question contrast through H5. At H6, “receipt” becomes “receiver” and later “recipient”, while the question form remains. In Grok run 1, the H1 ASR text is identical for A and B; the experiment’s pitch analysis describes a falling ending for A and a rising ending for B at H1 and H10.',
    debate_seg_057_058_s4: 'The source labels contrast cancelling a refund policy with cancelling a concert. At H10, all 12 A-side chains describe a refund outcome.',
    debate_seg_043_044_s1: 'In Gemini run 3, side A shifts to two plans during the chain, then returns to one plan for two leaders at H10, separating from B again.'
  };
  const examples = [
    ['debate_seg_016_017_s0','grok-audio',1,10],
    ['iud_006_pid_f05','realtime-audio',2,3],
    ['contra_50002','realtime-audio',2,6],
    ['debate_seg_057_058_s4','live-audio',1,10],
    ['debate_seg_043_044_s1','gemini-audio',3,10],
    ['contra_50002','grok-audio',1,1]
  ];
  let data;
  const rowsByPair = new Map();
  const chainId = (pair,arm,run) => `${pair}-${arm}-r${run}`;
  async function getJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path} (${response.status}).`);
    return response.json();
  }
  function renderSettings() {
    $('settings-content').innerHTML = `<table class="model-table"><thead><tr><th>Model</th><th>Model ID</th><th>Voice</th></tr></thead><tbody>${Object.entries(data.arms).map(([id,a])=>`<tr><td>${names[id]}</td><td>${esc(a.model)}</td><td>${esc(a.voice)}</td></tr>`).join('')}</tbody></table><p><strong>Shared audio prompt</strong></p><blockquote class="prompt">${esc(data.audio_prompt)}</blockquote><p>Three independent runs × ten hops. Each side begins at its own fixed H0. Source meanings and A/B labels are not sent to the model. Independent ASR uses gpt-transcribe with the original source language.</p><p>Technical failures may be retried up to six attempts; completed outputs are retained without semantic reruns. Realtime uses low reasoning with a 4,096-token output limit; Grok uses reasoning “none”. No shared temperature or seed was imposed. GPT-Live uses native PCM capture with an 8-second quiet interval, a minimum 15-second tail, and a 90-second maximum tail.</p>`;
  }
  function renderPair(pair,index) {
    const rows = rowsByPair.get(pair.pair_id);
    return `<section class="pair-section" id="${pair.pair_id}" aria-labelledby="${pair.pair_id}-title"><div class="pair-title"><div><p class="section-label">Input ${index+1} of ${data.pairs.length}</p><h2 id="${pair.pair_id}-title">${esc(pair.title)}</h2></div><a href="${esc(pair.source_url)}">${esc(pair.dataset)}</a></div><p class="tag">${esc(pair.pair_id)} · ${pair.language==='zh'?'Mandarin Chinese':'English'}</p><p class="pair-script"><strong>Source script:</strong> <span lang="${pair.language}">${esc(pair.shared_transcript)}</span></p><div class="pair-meanings"><p><span class="side-label">A</span> ${esc(pair.meaning_a)}</p><p><span class="side-label side-b">B</span> ${esc(pair.meaning_b)}</p></div><p class="pair-observation"><strong>Observation:</strong> ${esc(observations[pair.pair_id])}</p><div class="pair-actions"><span>Expand a run to follow every hop. Multiple runs can stay open.</span><div><button data-expand-pair="${pair.pair_id}">Expand all runs</button><button data-collapse-pair="${pair.pair_id}">Collapse all</button></div></div><div class="chain-list">${Object.entries(data.arms).map(([arm,config])=>[1,2,3].map(run=>{
      const count = rows.filter(r=>r.arm===arm&&r.run===run&&r.audio).length;
      const id=chainId(pair.pair_id,arm,run);
      return `<details class="chain" id="${id}" data-pair="${pair.pair_id}" data-arm="${arm}" data-run="${run}"><summary><span class="chain-name">${names[arm]} <span>Run ${run}</span></span> <span class="chain-meta">${esc(config.model)} · ${esc(config.voice)}</span> <span class="chain-count">${count}/20 outputs · H0–H10</span></summary><div class="chain-body"></div></details>`;
    }).join('')).join('')}</div></section>`;
  }
  function renderCell(pair,row,side,hop,label) {
    const sideLabel=side.toUpperCase();
    if (!row?.audio) return `<div class="timeline-cell"><span class="mobile-side side-label ${side==='b'?'side-b':''}">${sideLabel}</span><p class="missing">No output recorded at this hop.</p></div>`;
    return `<div class="timeline-cell"><span class="mobile-side side-label ${side==='b'?'side-b':''}">${sideLabel}</span><p class="text" lang="${pair.language}">${esc(row.asr || 'ASR transcript unavailable.')}</p><div class="audio-label">${hop===0?'Source ASR':'Independent ASR'} · ${Number(row.seconds || 0).toFixed(1)} s</div><audio controls preload="none" aria-label="${esc(label)}, side ${sideLabel}, H${hop}" src="${esc(row.audio)}">Your browser does not support this audio format. <a href="${esc(row.audio)}">Download audio</a></audio>${hop===0?`<details class="publisher"><summary>Publisher script${pair.language==='zh'?' · / marks a prosodic boundary':''}</summary><p class="text" lang="${pair.language}">${esc(row.publisher_text)}</p></details>`:row.native?`<details class="native"><summary>Model-native caption</summary><p class="text" lang="${pair.language}">${esc(row.native)}</p></details>`:''}</div>`;
  }
  function populateChain(details) {
    if(details.dataset.loaded)return;
    const pair=data.pairs.find(p=>p.pair_id===details.dataset.pair),arm=details.dataset.arm,run=Number(details.dataset.run);
    const rows=rowsByPair.get(pair.pair_id).filter(r=>r.arm===arm&&r.run===run);
    const label=`${pair.title}, ${names[arm]}, run ${run}`;
    details.querySelector('.chain-body').innerHTML=`<nav class="timeline-hop-links" aria-label="${esc(label)} hop shortcuts">${Array.from({length:11},(_,h)=>`<a href="#${details.id}-h${h}">H${h}</a>`).join('')}</nav><div class="timeline-head"><span>Hop</span><span><span class="side-label">A</span> ${esc(pair.meaning_a)}</span><span><span class="side-label side-b">B</span> ${esc(pair.meaning_b)}</span></div>${Array.from({length:11},(_,hop)=>`<section class="timeline-row ${hop===0?'source-row':''}" id="${details.id}-h${hop}" aria-label="${esc(label)}, hop ${hop}"><h3>H${hop}${hop===0?'<small>Source</small>':''}</h3>${['a','b'].map(side=>{
      const source=pair.sources.find(s=>s.side===side);
      const row=hop===0?{...source,asr:source.text}:rows.find(r=>r.hop===hop&&r.side===side);
      return renderCell(pair,row,side,hop,label);
    }).join('')}</section>`).join('')}`;
    details.dataset.loaded='true';
  }
  function pauseWithin(element) { element.querySelectorAll('audio').forEach(audio=>audio.pause()); }
  function openChain(details) { populateChain(details);details.open=true; }
  function followExistingLink() {
    const params=new URLSearchParams(location.search),pair=params.get('pair');
    if(!data.pairs.some(p=>p.pair_id===pair))return;
    const example=examples[Number(params.get('example'))-1];
    const arm=Object.hasOwn(data.arms,params.get('arm'))?params.get('arm'):example?.[0]===pair?example[1]:Object.keys(data.arms)[0];
    const run=[1,2,3].includes(Number(params.get('run')))?Number(params.get('run')):example?.[0]===pair?example[2]:1;
    const hop=params.has('hop')&&/^\d+$/.test(params.get('hop'))&&Number(params.get('hop'))<=10?Number(params.get('hop')):0;
    const details=$(chainId(pair,arm,run));openChain(details);
    $(details.id+'-h'+hop).scrollIntoView({behavior:'instant',block:'start'});
  }
  function restoreAnchor() {
    const id=location.hash.slice(1);
    if(!id)return;
    const chain=[...document.querySelectorAll('details.chain')].find(details=>id===details.id||id.startsWith(details.id+'-h'));
    if(chain)openChain(chain);
    const target=$(id);
    if(target)target.scrollIntoView({behavior:'instant',block:'start'});
  }
  async function init() {
    data=await getJSON('assets/data/prosody.json?v=3');
    const allRows=await Promise.all(data.pairs.map(pair=>getJSON(`assets/data/prosody/${pair.pair_id}.json`)));
    data.pairs.forEach((pair,i)=>rowsByPair.set(pair.pair_id,allRows[i]));
    renderSettings();
    $('pair-links').innerHTML=data.pairs.map((pair,i)=>`<a href="#${pair.pair_id}">${i+1}. ${esc(pair.title)}</a>`).join('');
    $('pair-sections').innerHTML=data.pairs.map(renderPair).join('');
    document.querySelectorAll('details.chain').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)populateChain(details);else pauseWithin(details);}));
    document.addEventListener('click',event=>{
      const expand=event.target.closest('[data-expand-pair]'),collapse=event.target.closest('[data-collapse-pair]');
      if(expand)$(expand.dataset.expandPair).querySelectorAll('details.chain').forEach(openChain);
      if(collapse)$(collapse.dataset.collapsePair).querySelectorAll('details.chain').forEach(details=>{details.open=false;pauseWithin(details);});
    });
    document.addEventListener('play',event=>{if(event.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(audio=>{if(audio!==event.target)audio.pause();});},true);
    followExistingLink();
    // Restore bookmarked input or hop anchors after the dynamic sections exist.
    restoreAnchor();
    window.addEventListener('hashchange',restoreAnchor);
  }
  init().catch(error=>{$('pair-sections').innerHTML=`<p class="error" role="alert">${esc(error.message)} Please reload to try again.</p>`;});
})();
