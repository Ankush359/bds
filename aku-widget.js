/* Aku – शाळेच्या संकेतस्थळावरील AI मित्र (सर्वांसाठी). फक्त /.netlify/functions/aku शी बोलतो; कोणताही खाजगी डेटा नाही. */
(function () {
  if (window.__akuLoaded) return; window.__akuLoaded = true;
  var M = '#6A1327', G = '#FFD23F', hist = [], busy = false, speak = false;
  function el(t, css, txt) { var e = document.createElement(t); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; }
  var btn = el('button', 'position:fixed;left:14px;bottom:14px;z-index:99998;border:0;border-radius:99px;padding:12px 16px;font:700 15px/1 system-ui,"Noto Sans Devanagari",sans-serif;background:' + M + ';color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer', '🤖 अकु');
  btn.setAttribute('aria-label', 'अकु AI मित्र उघडा');
  var box = el('div', 'position:fixed;left:10px;bottom:70px;z-index:99999;width:min(380px,calc(100vw - 20px));height:min(560px,calc(100vh - 90px));background:#fffdf8;color:#222;border:2px solid ' + M + ';border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.4);display:none;flex-direction:column;overflow:hidden;font:15px/1.5 system-ui,"Noto Sans Devanagari",sans-serif');
  var head = el('div', 'background:' + M + ';color:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px');
  head.append(el('b', 'flex:1;font-size:16px', '🤖 अकु – शाळेचा AI मित्र'));
  var spk = el('button', 'border:0;background:transparent;color:#fff;font-size:18px;cursor:pointer', '🔇'); spk.title = 'उत्तर वाचून ऐकवा';
  var clr = el('button', 'border:0;background:transparent;color:#fff;font-size:18px;cursor:pointer', '🧹'); clr.title = 'नवी चर्चा';
  var x = el('button', 'border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer', '✕'); x.setAttribute('aria-label', 'बंद करा');
  head.append(spk, clr, x);
  var log = el('div', 'flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px');
  var chips = el('div', 'display:flex;flex-wrap:wrap;gap:6px;padding:0 10px 6px');
  var row = el('div', 'display:flex;gap:6px;padding:8px;border-top:1px solid #e6dccb;background:#fff');
  var inp = el('input', 'flex:1;min-width:0;font:inherit;padding:10px;border:1.5px solid #cfc6b8;border-radius:10px'); inp.placeholder = 'काहीही विचारा…'; inp.maxLength = 300; inp.setAttribute('aria-label', 'तुमचा प्रश्न');
  var send = el('button', 'border:0;border-radius:10px;padding:0 14px;font:700 15px system-ui;background:' + M + ';color:#fff;cursor:pointer', '➤'); send.setAttribute('aria-label', 'पाठवा');
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = null;
  if (SR) { mic = el('button', 'border:1.5px solid ' + M + ';border-radius:10px;padding:0 10px;background:#fff;font-size:18px;cursor:pointer', '🎤'); mic.title = 'बोलून विचारा'; }
  row.append(inp); if (mic) row.append(mic); row.append(send);
  var note = el('div', 'font-size:11.5px;color:#666;padding:4px 10px 8px;background:#fff', 'AI चुकू शकतो; महत्त्वाच्या माहितीसाठी शाळेच्या कार्यालयात विचारा. नाव, फोन, PIN अशी वैयक्तिक माहिती टाकू नका.');
  box.append(head, log, chips, row, note);
  document.body.append(btn, box);

  function bubble(who, text) {
    var u = who === 'u', b = el('div', 'max-width:88%;padding:8px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere;' + (u ? 'align-self:flex-end;background:' + M + ';color:#fff;border-bottom-right-radius:4px' : 'align-self:flex-start;background:#fff;border:1px solid #e6dccb;border-bottom-left-radius:4px' + (who === 'e' ? ';color:#c62828' : '')), text);
    log.append(b); log.scrollTop = log.scrollHeight; return b;
  }
  function hello() {
    log.textContent = ''; chips.textContent = ''; hist = [];
    bubble('a', 'नमस्कार! मी अकु 👋 शाळेबद्दल माहिती हवी, अभ्यासात मदत हवी, की क्विझ खेळायची? मराठी, हिंदी किंवा English मध्ये विचारा.');
    ['शाळेशी संपर्क कसा करायचा?', 'शाळेचा इतिहास सांगा', 'प्रकाशाचे परावर्तन सोप्या शब्दांत समजावा', 'मला १० प्रश्नांची क्विझ द्या', 'माझा गृहपाठ कुठे पाहू?'].forEach(function (q) {
      var c = el('button', 'border:1.5px solid ' + M + ';background:#fff;color:' + M + ';border-radius:99px;padding:5px 10px;font:600 13px system-ui,"Noto Sans Devanagari";cursor:pointer', q);
      c.onclick = function () { ask(q); }; chips.append(c);
    });
  }
  async function ask(q) {
    q = (q || '').trim(); if (!q || busy) return; busy = true; send.disabled = true; inp.value = ''; chips.textContent = '';
    bubble('u', q); hist.push({ role: 'user', text: q }); var wait = bubble('a', '…');
    try {
      var r = await fetch('/.netlify/functions/aku', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist.slice(-8) }) });
      var j = {}; try { j = await r.json(); } catch (e) { }
      if (!r.ok || !j.text) { wait.remove(); bubble('e', j.error || (r.status === 404 ? 'अकु फक्त शाळेच्या मूळ संकेतस्थळावर चालतो.' : 'आत्ता उत्तर मिळाले नाही. पुन्हा प्रयत्न करा.')); hist.pop(); }
      else { wait.textContent = j.text; hist.push({ role: 'model', text: j.text }); log.scrollTop = log.scrollHeight; if (speak && window.speechSynthesis) { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(j.text.slice(0, 700)); u.lang = 'mr-IN'; speechSynthesis.speak(u); } }
    } catch (e) { wait.remove(); bubble('e', 'इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.'); hist.pop(); }
    busy = false; send.disabled = false; inp.focus();
  }
  btn.onclick = function () { var open = box.style.display === 'flex'; box.style.display = open ? 'none' : 'flex'; if (!open) { if (!log.childNodes.length) hello(); inp.focus(); } };
  x.onclick = function () { box.style.display = 'none'; if (window.speechSynthesis) speechSynthesis.cancel(); };
  clr.onclick = hello;
  spk.onclick = function () { speak = !speak; spk.textContent = speak ? '🔊' : '🔇'; if (!speak && window.speechSynthesis) speechSynthesis.cancel(); };
  send.onclick = function () { ask(inp.value); };
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ask(inp.value); });
  if (mic) mic.onclick = function () { try { var r = new SR(); r.lang = 'mr-IN'; r.interimResults = false; r.onresult = function (e) { ask(e.results[0][0].transcript); }; r.onerror = function () { bubble('e', 'आवाज ओळखता आला नाही.'); }; r.start(); } catch (e) { } };
})();
