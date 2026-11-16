(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={
  get:function(k,d){try{var v=localStorage.getItem('bpl:'+k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem('bpl:'+k,JSON.stringify(v))}catch(e){}}
};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l')}
function el(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='class')e.className=attrs[k];else e.setAttribute(k,attrs[k])}if(html!=null)e.innerHTML=html;return e}

/* ---------- data ---------- */
var DATA=JSON.parse($('#qdata').textContent);
var OWN=DATA.own.map(function(x,i){x.s='own';x.id='K'+(i+1);return x});
DATA.bank.forEach(function(q){q.s='ulc'});
var ALLQ=OWN.concat(DATA.bank);
var QBYID={};ALLQ.forEach(function(q){QBYID[q.id]=q});
var CONTACT='korona.mateusz@gmail.com';
function reportHref(q){var sub='[Kompendium BPL] Pytanie '+q.id;var body='Pytanie '+q.id+': '+q.q+'\n\nCo jest nie tak:\n\n\nŹródło poprawnej informacji (przepis, instrukcja, strona):\n';return 'mailto:'+CONTACT+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body)}
var QBYID={};ALLQ.forEach(function(q){QBYID[q.id]=q});
var blocks=$$('.block');var BLOCK={};blocks.forEach(function(b){BLOCK[b.id]=b});
var ORDER=blocks.map(function(b){return b.id});
var SUBJECTS=['prawo','czlowiek','meteo','lacznosc','zasady','procedury','planowanie','wiedza','nawigacja'];
var EXAMS={
  prawo:{n:20,t:40,parts:{prawo:20}}, czlowiek:{n:10,t:20,parts:{czlowiek:10}}, meteo:{n:20,t:40,parts:{meteo:20}},
  lacznosc:{n:10,t:20,parts:{lacznosc:10}}, nawigacja:{n:20,t:75,parts:{nawigacja:20}}, zasady:{n:10,t:20,parts:{zasady:10}},
  procedury:{n:10,t:20,parts:{procedury:10}}, planowanie:{n:10,t:20,parts:{planowanie:10}}, wiedza:{n:10,t:20,parts:{wiedza:10}},
  balonowe:{n:40,t:80,parts:{zasady:10,procedury:10,planowanie:10,wiedza:10},label:'Przedmioty balonowe łącznie'},
  wszystko:{n:120,t:275,parts:{prawo:20,czlowiek:10,meteo:20,lacznosc:10,nawigacja:20,zasady:10,procedury:10,planowanie:10,wiedza:10},label:'Pełny egzamin – wszystkie przedmioty'}
};
function titleOf(id){return BLOCK[id]?BLOCK[id].getAttribute('data-short'):(EXAMS[id]&&EXAMS[id].label)||id}
function countQ(b,src){return ALLQ.filter(function(q){return q.b===b&&(src==='all'||q.s===src)}).length}

/* ---------- nav ---------- */
var nav=$('#nav');
var GROUPS=[['Start','Start'],['Przedmioty','Przedmioty egzaminacyjne'],['Praktyka','Praktyka i powtórka'],['Sprawdź się','Sprawdź się'],['Informacje','Informacje']];
var MARK={start:'0','sp-bfn':'P',liczby:'Σ',quiz:'?',kontakt:'@'};
function buildNav(){
  var html='';
  GROUPS.forEach(function(g){
    var items=blocks.filter(function(b){return b.getAttribute('data-group')===g[0]});
    if(!items.length)return;
    html+='<p class="nav-g">'+g[1]+'</p>';
    items.forEach(function(b){
      var num=b.getAttribute('data-num')||MARK[b.id]||'•';
      var sub=b.getAttribute('data-exam')||'';
      html+='<a href="#'+b.id+'" data-id="'+b.id+'"><span class="n-num">'+esc(num)+'</span><span><span class="n-t">'+esc(b.getAttribute('data-short'))+'</span>'+(sub?'<span class="n-s">egzamin: '+esc(sub)+'</span>':'')+'</span><span class="n-badge" data-badge="'+b.id+'"></span></a>';
    });
  });
  html+='<div class="nav-prog" id="navProg"></div>';
  nav.innerHTML=html;
  refreshNav();
}
function bestFor(id){
  var r=store.get('res',{});var e=r['exam:'+id],l=r['learn:'+id];
  return e?{v:e.best,k:'egzamin'}:(l?{v:l.best,k:'nauka'}:null);
}
function refreshNav(){
  var done=store.get('done',[]);
  $$('a[data-id]',nav).forEach(function(a){
    var id=a.getAttribute('data-id');
    a.classList.toggle('done',done.indexOf(id)>=0);
    var bd=$('[data-badge="'+id+'"]',nav);var b=bestFor(id);
    if(b&&SUBJECTS.concat(['start']).indexOf(id)>=0){bd.textContent=b.v+'%';bd.className='n-badge '+(b.v>=75?'ok':'bad');bd.title='Najlepszy wynik ('+b.k+')'}else{bd.textContent='';bd.className='n-badge'}
  });
  var total=ORDER.filter(function(id){return id!=='quiz'&&id!=='kontakt'}).length;
  var n=done.filter(function(id){return ORDER.indexOf(id)>=0&&id!=='quiz'&&id!=='kontakt'}).length;
  var p=$('#navProg');
  if(p)p.innerHTML='Powtórzone bloki: <b>'+n+' / '+total+'</b><div class="bar"><i style="width:'+Math.round(100*n/total)+'%"></i></div>';
}

/* ---------- mobile drawer ---------- */
var menuBtn=$('#menuBtn'),backdrop=$('#backdrop');
function setDrawer(open){nav.classList.toggle('open',open);backdrop.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',open?'true':'false')}
menuBtn.addEventListener('click',function(){setDrawer(!nav.classList.contains('open'))});
backdrop.addEventListener('click',function(){setDrawer(false)});
nav.addEventListener('click',function(e){if(e.target.closest('a'))setDrawer(false)});

/* ---------- per-block TOC and footer ---------- */
blocks.forEach(function(b){
  if(b.id==='quiz'||b.id==='kontakt')return;
  var hs=$$('h3[id]',b);
  if(hs.length>2){
    var t=el('nav',{'class':'toc','aria-label':'W tym bloku'});
    t.innerHTML=hs.map(function(h){return '<a href="#'+h.id+'">'+esc(h.textContent)+'</a>'}).join('');
    var head=$('.block-head',b);head.parentNode.insertBefore(t,head.nextSibling);
  }
  var f=el('footer',{'class':'block-foot'});
  var html='';
  var nOwn=countQ(b.id,'own'),nUlc=countQ(b.id,'ulc');
  if(nOwn||nUlc){
    html+='<div class="practice"><p>Sprawdź się z tego bloku</p>';
    if(nOwn)html+='<button class="btn primary" type="button" data-go="learn" data-src="own" data-b="'+b.id+'">Pytania kontrolne ('+nOwn+')</button>';
    if(nUlc)html+='<button class="btn" type="button" data-go="learn" data-src="ulc" data-b="'+b.id+'">Baza ULC – 20 losowych</button>';
    if(EXAMS[b.id])html+='<button class="btn" type="button" data-go="exam" data-b="'+b.id+'">Egzamin próbny ('+EXAMS[b.id].n+' pyt. · '+EXAMS[b.id].t+' min)</button>';
    html+='</div>';
  }
  html+='<div><button class="btn ghost" type="button" data-done="'+b.id+'" aria-pressed="false">Oznacz blok jako powtórzony</button></div>';
  var i=ORDER.indexOf(b.id),prev=ORDER[i-1],next=ORDER[i+1];
  html+='<div class="pager">'+(prev?'<a href="#'+prev+'"><small>Poprzedni</small><span>'+esc(titleOf(prev))+'</span></a>':'<span></span>')+(next?'<a class="next" href="#'+next+'"><small>Następny</small><span>'+esc(titleOf(next))+'</span></a>':'')+'</div>';
  f.innerHTML=html;b.appendChild(f);
});
function syncDoneButtons(){var done=store.get('done',[]);$$('[data-done]').forEach(function(btn){var on=done.indexOf(btn.getAttribute('data-done'))>=0;btn.setAttribute('aria-pressed',on?'true':'false');btn.textContent=on?'Powtórzony ✓':'Oznacz blok jako powtórzony'})}
document.addEventListener('click',function(e){
  var d=e.target.closest('[data-done]');
  if(d){var id=d.getAttribute('data-done');var done=store.get('done',[]);var i=done.indexOf(id);if(i>=0)done.splice(i,1);else done.push(id);store.set('done',done);syncDoneButtons();refreshNav();return}
  var g=e.target.closest('[data-go]');
  if(g){var b=g.getAttribute('data-b');
    if(g.getAttribute('data-go')==='exam')startExam(b);
    else{var src=g.getAttribute('data-src');startLearn({b:b,src:src,count:src==='own'?'all':'20',onlyWrong:false})}
    go('quiz',true);
  }
});

/* ---------- routing ---------- */
var pendingEl=null,current=null;
function flash(t){t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash')}
function show(id){
  if(current!==id){blocks.forEach(function(b){b.classList.toggle('on',b.id===id)});current=id}
  $$('a[data-id]',nav).forEach(function(a){if(a.getAttribute('data-id')===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
}
function route(){
  var h=location.hash.slice(1);try{h=decodeURIComponent(h)}catch(e){}
  var id=h||'start',target=null;
  if(!BLOCK[id]){var t=h&&document.getElementById(h);if(t&&t.closest('.block')){target=t;id=t.closest('.block').id}else id='start'}
  var changed=current!==id;
  show(id);
  if(pendingEl){target=pendingEl;pendingEl=null}
  if(target){requestAnimationFrame(function(){target.scrollIntoView({block:'start'});flash(target)})}
  else if(changed)window.scrollTo(0,0);
}
function go(id,keepState){if(location.hash==='#'+id){route()}else location.hash=id}
window.addEventListener('hashchange',route);

/* ---------- search ---------- */
var qInput=$('#q'),results=$('#results');
var INDEX=[];
blocks.forEach(function(b){
  if(b.id==='quiz')return;
  $$('h3,h4,p,li,td,summary,figcaption',b).forEach(function(n){
    if(n.closest('.block-foot,.toc,.src'))return;
    var t=n.textContent.replace(/\s+/g,' ').trim();if(t.length<3)return;
    INDEX.push({b:b.id,n:n,t:t,k:norm(t),h:/^H[34]$/.test(n.tagName)});
  });
});
var sTimer=null;
qInput.addEventListener('input',function(){clearTimeout(sTimer);sTimer=setTimeout(runSearch,120)});
qInput.addEventListener('focus',function(){if(qInput.value.trim().length>=2)runSearch()});
qInput.addEventListener('keydown',function(e){if(e.key==='Escape'){results.hidden=true;qInput.blur()}if(e.key==='ArrowDown'){var f=$('button',results);if(f){e.preventDefault();f.focus()}}});
results.addEventListener('keydown',function(e){
  var bs=$$('button',results),i=bs.indexOf(document.activeElement);
  if(e.key==='ArrowDown'&&i<bs.length-1){e.preventDefault();bs[i+1].focus()}
  if(e.key==='ArrowUp'){e.preventDefault();if(i>0)bs[i-1].focus();else qInput.focus()}
  if(e.key==='Escape'){results.hidden=true;qInput.focus()}
});
document.addEventListener('click',function(e){if(!e.target.closest('.search'))results.hidden=true});
var HITS=[];
function runSearch(){
  var raw=qInput.value.trim();if(raw.length<2){results.hidden=true;return}
  var terms=norm(raw).split(/\s+/).filter(Boolean);
  var hits=INDEX.filter(function(x){return terms.every(function(t){return x.k.indexOf(t)>=0})});
  hits.sort(function(a,b){return (b.h-a.h)});
  HITS=hits.slice(0,40);
  if(!HITS.length){results.innerHTML='<p class="r-empty">Brak wyników dla „'+esc(raw)+'”. Spróbuj krótszego słowa lub skrótu (np. „TMA”, „rezerwa”).</p>';results.hidden=false;return}
  results.innerHTML=HITS.map(function(x,i){
    var p=x.k.indexOf(terms[0]);var s=Math.max(0,p-60),e=Math.min(x.t.length,p+terms[0].length+80);
    var snip=(s>0?'… ':'')+esc(x.t.slice(s,p))+'<mark>'+esc(x.t.slice(p,p+terms[0].length))+'</mark>'+esc(x.t.slice(p+terms[0].length,e))+(e<x.t.length?' …':'');
    return '<button type="button" data-hit="'+i+'"><span class="r-b">'+esc(titleOf(x.b))+'</span>'+snip+'</button>';
  }).join('')+(hits.length>40?'<p class="r-empty">Pokazano 40 z '+hits.length+' wyników – doprecyzuj zapytanie.</p>':'');
  results.hidden=false;
}
results.addEventListener('click',function(e){
  var b=e.target.closest('[data-hit]');if(!b)return;
  var x=HITS[+b.getAttribute('data-hit')];results.hidden=true;
  var det=x.n.closest('details');if(det)det.open=true;
  if(current===x.b){x.n.scrollIntoView({block:'center'});flash(x.n)}
  else{pendingEl=x.n;location.hash=x.b}
});

/* ---------- checklists ---------- */
$$('ul.check[data-list]').forEach(function(ul){
  var key='chk:'+ul.getAttribute('data-list');var saved=store.get(key,[]);
  var boxes=$$('input[type=checkbox]',ul);
  boxes.forEach(function(cb,i){cb.id='chk-'+ul.getAttribute('data-list')+'-'+i;cb.checked=saved.indexOf(i)>=0;cb.addEventListener('change',function(){store.set(key,boxes.map(function(c,j){return c.checked?j:-1}).filter(function(j){return j>=0}))})});
  var r=el('button',{'class':'check-reset',type:'button'},'Wyczyść tę listę');
  r.addEventListener('click',function(){boxes.forEach(function(c){c.checked=false});store.set(key,[])});
  ul.parentNode.insertBefore(r,ul.nextSibling);
});

/* ---------- calculators ---------- */
function fmt(v,d){return isFinite(v)?v.toLocaleString('pl-PL',{minimumFractionDigits:d,maximumFractionDigits:d}):'–'}
var liftIds=['cl-v','cl-ta','cl-ti','cl-p','cl-m'];
function calcLift(){
  var o=$('#cl-out');if(!o)return;
  var V=+$('#cl-v').value,ta=+$('#cl-ta').value,ti=+$('#cl-ti').value,p=+$('#cl-p').value,m=+$('#cl-m').value;
  if(!(V>0&&p>0&&ti>ta)){o.innerHTML='<div class="bad"><b>sprawdź dane</b><span>pojemność i ciśnienie &gt; 0, temperatura w powłoce wyższa niż otoczenia</span></div>';return}
  var R=287,P=p*100,Ta=ta+273.15,Ti=ti+273.15,ra=P/(R*Ta),ri=P/(R*Ti),a=ra-ri,L=a*V,mg=L-m,areq=m/V,rreq=ra-areq,Treq=P/(R*rreq)-273.15;
  var tcls=Treq<=100?'ok':(Treq<=120?'warn':'bad');
  o.innerHTML='<div><b>'+fmt(ra,3)+'</b><span>gęstość otoczenia [kg/m³]</span></div>'+
    '<div><b>'+fmt(ri,3)+'</b><span>gęstość w powłoce [kg/m³]</span></div>'+
    '<div><b>'+fmt(a,3)+'</b><span>jednostkowa siła nośna [kg/m³]</span></div>'+
    '<div><b>'+fmt(L,0)+' kg</b><span>udźwig całkowity</span></div>'+
    '<div class="'+(mg>=0?'ok':'bad')+'"><b>'+(mg>=0?'+':'')+fmt(mg,0)+' kg</b><span>zapas względem masy do uniesienia</span></div>'+
    '<div class="'+tcls+'"><b>'+(rreq>0?fmt(Treq,0)+' °C':'nieosiągalne')+'</b><span>temperatura w powłoce potrzebna do równowagi</span></div>';
}
liftIds.forEach(function(id){var i=$('#'+id);if(i)i.addEventListener('input',calcLift)});calcLift();

var SPEED={'cv-ms':1,'cv-kmh':3.6,'cv-kt':1.943844,'cv-fpm':196.8504};
var PAIRS=[{'cv-m':1,'cv-ft':3.280840},{'cv-km':1,'cv-nm':0.5399568}];
function linkGroup(g,dec){Object.keys(g).forEach(function(id){var inp=$('#'+id);if(!inp)return;inp.addEventListener('input',function(){var v=parseFloat(inp.value);if(!isFinite(v))return;var base=v/g[id];Object.keys(g).forEach(function(o){if(o!==id){var x=base*g[o];$('#'+o).value=(o==='cv-fpm'||o==='cv-ft')?Math.round(x):Math.round(x*100)/100}})})})}
linkGroup(SPEED);PAIRS.forEach(function(g){linkGroup(g)});
['cv-ms','cv-m','cv-km'].forEach(function(id){var i=$('#'+id);if(i)i.dispatchEvent(new Event('input'))});

/* ---------- quiz ---------- */
var app=$('#quizApp');
var Q=null; /* session */
var setup=store.get('setup',{mode:'learn',b:'all',src:'all',count:'20',onlyWrong:false,exam:'prawo'});
if(setup.mode!=='learn'&&setup.mode!=='exam')setup.mode='learn';
function pool(opt){
  var wrong=store.get('wrong',[]);
  return ALLQ.filter(function(q){
    if(opt.b!=='all'&&q.b!==opt.b)return false;
    if(opt.src!=='all'&&q.s!==opt.src)return false;
    if(opt.onlyWrong&&wrong.indexOf(q.id)<0)return false;
    return true;
  });
}
function mkItem(q){var order=shuffle(q.a.map(function(_,i){return i}));return {q:q,order:order,pick:null}}
function startLearn(opt){
  setup.mode='learn';['b','src','count','onlyWrong'].forEach(function(k){if(opt[k]!==undefined)setup[k]=opt[k]});store.set('setup',setup);
  var p=shuffle(pool(setup));var n=setup.count==='all'?p.length:Math.min(p.length,+setup.count);
  if(!n){renderSetup('Brak pytań dla wybranych ustawień.');return}
  Q={mode:'learn',key:setup.b,items:p.slice(0,n).map(mkItem),i:0,answered:false};
  renderQ();
}
function startExam(key){
  setup.mode='exam';setup.exam=key;store.set('setup',setup);
  var cfg=EXAMS[key];var items=[];
  Object.keys(cfg.parts).forEach(function(b){var p=shuffle(ALLQ.filter(function(q){return q.b===b}));items=items.concat(p.slice(0,cfg.parts[b]).map(mkItem))});
  Q={mode:'exam',key:key,items:items,i:0,end:Date.now()+cfg.t*60000};
  renderQ();tick();
}
var timerId=null;
function tickOnce(){
  if(!Q||Q.mode!=='exam'||Q.done){clearInterval(timerId);return}
  var left=Math.max(0,Q.end-Date.now());var t=$('#qzTimer');
  if(t){var m=Math.floor(left/60000),s=Math.floor(left%60000/1000);t.textContent=m+':'+(s<10?'0':'')+s;t.classList.toggle('low',left<120000)}
  if(left<=0){clearInterval(timerId);finish()}
}
function tick(){clearInterval(timerId);tickOnce();timerId=setInterval(tickOnce,500)}
function srcTag(q){return q.s==='own'?'<span class="qz-src">kontrolne</span>':'<span class="qz-src">ULC '+esc(q.id)+'</span>'}
function renderQ(){
  var it=Q.items[Q.i],q=it.q,N=Q.items.length;
  var html='<div class="qz-card"><div class="qz-top"><span>Pytanie <b>'+(Q.i+1)+'</b> / '+N+' · '+esc(titleOf(q.b))+' '+srcTag(q)+'</span>'+(Q.mode==='exam'?'<span>Pozostało <span class="qz-timer" id="qzTimer">–</span></span>':'')+'</div>';
  html+='<div class="qz-prog"><i style="width:'+Math.round(100*(Q.i)/N)+'%"></i></div>';
  html+='<p class="qz-q">'+esc(q.q)+'</p><div class="qz-opts" role="group" aria-label="Odpowiedzi">';
  it.order.forEach(function(oi,k){
    var cls='';
    if(Q.mode==='learn'&&it.pick!==null){if(oi===0)cls='right';else if(oi===it.pick)cls='wrong'}
    else if(Q.mode==='exam'&&it.pick===oi)cls='sel';
    html+='<button type="button" data-opt="'+oi+'" class="'+cls+'"'+(Q.mode==='learn'&&it.pick!==null?' disabled':'')+'><span class="k">'+'ABCD'[k]+'</span><span>'+esc(q.a[oi])+'</span></button>';
  });
  html+='</div>';
  if(Q.mode==='learn'&&it.pick!==null){
    var ok=it.pick===0;
    html+='<div class="qz-fb '+(ok?'ok':'bad')+'" aria-live="polite"><b>'+(ok?'Dobrze.':'Niestety nie.')+'</b>'+(ok?'':'Poprawna odpowiedź: '+esc(q.a[0])+'. ')+(q.e?esc(q.e):'')+'</div>';
    if(q.adn)html+='<div class="qz-old"><b>Adnotacja: </b>'+esc(q.adn)+'</div>';
    if(!ok&&q.r)html+='<div class="qz-ref"><button class="btn" type="button" data-ref="'+esc(q.id)+'">Zobacz wyjaśnienie w kompendium →</button><span class="small">Wrócisz do tego pytania jednym kliknięciem.</span></div>';
    html+='<p class="qz-rep"><a href="'+esc(reportHref(q))+'">Zgłoś problem z tym pytaniem</a></p>';
  }
  html+='<div class="qz-actions"><button class="btn ghost" type="button" data-qa="quit">Przerwij</button><span style="display:flex;gap:8px;flex-wrap:wrap">';
  if(Q.mode==='exam'){
    html+='<button class="btn" type="button" data-qa="prev"'+(Q.i===0?' disabled':'')+'>Wstecz</button>';
    html+=(Q.i<N-1?'<button class="btn primary" type="button" data-qa="next">Dalej</button>':'')+'<button class="btn'+(Q.i===N-1?' primary':'')+'" type="button" data-qa="finish">Zakończ i oceń</button>';
  }else{
    html+='<button class="btn primary" type="button" data-qa="next"'+(it.pick===null?' disabled':'')+'>'+(Q.i<N-1?'Następne':'Zobacz wynik')+'</button>';
  }
  html+='</span></div></div>';
  if(Q.mode==='exam'){var answered=Q.items.filter(function(x){return x.pick!==null}).length;html+='<p class="qz-info" style="margin-top:10px!important">Odpowiedziano: '+answered+' / '+N+'. Wynik zobaczysz po zakończeniu. Próg: 75%.</p>'}
  app.innerHTML=html;
  if(Q.mode==='exam')tick();
}
app.addEventListener('click',function(e){
  var rf=e.target.closest('[data-ref]');if(rf){openRef(rf.getAttribute('data-ref'));return}
  var o=e.target.closest('[data-opt]');
  if(o&&Q&&!Q.done){var it=Q.items[Q.i];var v=+o.getAttribute('data-opt');
    if(Q.mode==='learn'){if(it.pick===null){it.pick=v;renderQ()}}
    else{it.pick=v;renderQ()}
    return}
  var a=e.target.closest('[data-qa]');if(!a)return;var act=a.getAttribute('data-qa');
  if(act==='next'){if(Q.i<Q.items.length-1){Q.i++;renderQ();app.scrollIntoView({block:'start'})}else finish()}
  else if(act==='prev'){if(Q.i>0){Q.i--;renderQ()}}
  else if(act==='finish')finish();
  else if(act==='quit'){Q=null;clearInterval(timerId);renderSetup()}
  else if(act==='retry'){var items=Q.items.filter(function(x){return x.pick!==0});Q={mode:'learn',key:Q.key,items:shuffle(items.map(function(x){return mkItem(x.q)})),i:0};renderQ()}
  else if(act==='new'){Q=null;renderSetup()}
});
document.addEventListener('keydown',function(e){
  if(current!=='quiz'||!Q||Q.done||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;
  var k=e.key.toUpperCase(),idx='1234'.indexOf(k);if(idx<0)idx='ABCD'.indexOf(k);
  var bs=$$('[data-opt]',app);
  if(idx>=0&&bs[idx]&&!bs[idx].disabled){bs[idx].click();e.preventDefault()}
  else if(e.key==='Enter'){var n=$('[data-qa="next"]',app);if(n&&!n.disabled){n.click();e.preventDefault()}}
});
function finish(){
  if(!Q||Q.done)return;Q.done=true;clearInterval(timerId);
  var N=Q.items.length,ok=Q.items.filter(function(x){return x.pick===0}).length,pct=Math.round(100*ok/N);
  var res=store.get('res',{});var key=(Q.mode==='exam'?'exam:':'learn:')+Q.key;
  var prev=res[key];res[key]={last:pct,best:Math.max(pct,prev?prev.best:0),date:new Date().toISOString().slice(0,10)};
  /* per-subject results for multi-subject runs */
  var bySub={};Q.items.forEach(function(x){var b=x.q.b;bySub[b]=bySub[b]||{n:0,ok:0};bySub[b].n++;if(x.pick===0)bySub[b].ok++});
  if(Q.mode==='exam'&&Object.keys(bySub).length>1)Object.keys(bySub).forEach(function(b){var p=Math.round(100*bySub[b].ok/bySub[b].n);var k='exam:'+b;var pr=res[k];res[k]={last:p,best:Math.max(p,pr?pr.best:0),date:res[key].date}});
  store.set('res',res);
  var wrong=store.get('wrong',[]);
  Q.items.forEach(function(x){var i=wrong.indexOf(x.q.id);if(x.pick===0){if(i>=0)wrong.splice(i,1)}else if(i<0)wrong.push(x.q.id)});
  store.set('wrong',wrong);refreshNav();
  var subjPass=Object.keys(bySub).every(function(b){return bySub[b].ok/bySub[b].n>=0.75});
  var pass=pct>=75&&subjPass;
  var html='<div class="qz-card qz-res"><h3>'+(Q.mode==='exam'?'Wynik egzaminu próbnego':'Wynik')+' · '+esc(Q.key==='all'?'Wszystkie bloki':titleOf(Q.key))+'</h3>';
  html+='<div class="qz-score"><b class="'+(pass?'pass':'fail')+'">'+pct+'%</b><span>'+ok+' z '+N+' poprawnie · '+(pass?'zaliczone (próg 75%)':'poniżej progu 75%')+'</span></div>';
  if(Object.keys(bySub).length>1){html+='<div class="qz-subj">'+Object.keys(bySub).map(function(b){var p=Math.round(100*bySub[b].ok/bySub[b].n);return '<div><span>'+esc(titleOf(b))+'</span><b style="color:var(--'+(p>=75?'ok':'bad')+')">'+p+'% ('+bySub[b].ok+'/'+bySub[b].n+')</b></div>'}).join('')+'</div>'}
  var wrongItems=Q.items.filter(function(x){return x.pick!==0});
  html+='<div class="qz-actions" style="justify-content:flex-start">'+(wrongItems.length?'<button class="btn primary" type="button" data-qa="retry">Powtórz błędne ('+wrongItems.length+')</button>':'')+'<button class="btn" type="button" data-qa="new">Nowy zestaw</button>'+(BLOCK[Q.key]?'<a class="btn ghost" href="#'+Q.key+'">Wróć do bloku</a>':'')+'</div>';
  if(wrongItems.length){
    html+='<div class="qz-review"><h4>Do powtórki</h4>'+wrongItems.map(function(x){var q=x.q;return '<div class="item"><p><b>'+esc(q.q)+'</b> '+srcTag(q)+'</p>'+(x.pick!==null?'<p class="yours">Twoja odpowiedź: '+esc(q.a[x.pick])+'</p>':'<p class="yours">Brak odpowiedzi</p>')+'<p class="corr">Poprawna: '+esc(q.a[0])+'</p>'+(q.e?'<p class="small">'+esc(q.e)+'</p>':'')+(q.adn?'<p class="small qz-old"><b>Adnotacja:</b> '+esc(q.adn)+'</p>':'')+'<p class="qz-item-act">'+(q.r?'<button class="btn" type="button" data-ref="'+esc(q.id)+'">Zobacz wyjaśnienie →</button>':'')+'<a class="qz-rep" href="'+esc(reportHref(q))+'">Zgłoś problem z pytaniem</a></p></div>'}).join('')+'</div>';
  }
  html+='</div>';
  app.innerHTML=html;app.scrollIntoView({block:'start'});
}
function opts(list,sel){return list.map(function(o){return '<option value="'+o[0]+'"'+(String(o[0])===String(sel)?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')}
function renderSetup(msg){
  var blockOpts=[['all','Wszystkie bloki']].concat(['start'].concat(SUBJECTS).map(function(b){return [b,titleOf(b)]}));
  var examOpts=SUBJECTS.map(function(b){return [b,titleOf(b)+' – '+EXAMS[b].n+' pyt. / '+EXAMS[b].t+' min']}).concat([['balonowe','Przedmioty balonowe łącznie – 40 pyt. / 80 min'],['wszystko','Pełny egzamin – 120 pyt. / 275 min']]);
  var wrong=store.get('wrong',[]);
  var html='<div class="qz-set">';
  if(msg)html+='<p class="qz-info" style="color:var(--bad)">'+esc(msg)+'</p>';
  html+='<div class="qz-modes"><button type="button" data-mode="learn" aria-pressed="'+(setup.mode==='learn')+'"><b>Nauka</b><span>Od razu widzisz poprawną odpowiedź i wyjaśnienie.</span></button><button type="button" data-mode="exam" aria-pressed="'+(setup.mode==='exam')+'"><b>Egzamin próbny</b><span>Liczba pytań i czas jak w ULC, wynik na końcu.</span></button></div>';
  if(setup.mode==='learn'){
    html+='<div class="qz-row"><label for="qs-b">Blok<select id="qs-b">'+opts(blockOpts,setup.b)+'</select></label>';
    html+='<label for="qs-src">Źródło pytań<select id="qs-src">'+opts([['all','Kontrolne + baza ULC'],['own','Pytania kontrolne (z wyjaśnieniem)'],['ulc','Baza przykładowych pytań ULC (2025)']],setup.src)+'</select></label>';
    html+='<label for="qs-n">Liczba pytań<select id="qs-n">'+opts([['10','10'],['20','20'],['40','40'],['all','Wszystkie']],setup.count)+'</select></label></div>';
    html+='<div class="qz-row">';
    html+='<label style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)" for="qs-w"><input id="qs-w" type="checkbox"'+(setup.onlyWrong?' checked':'')+(wrong.length?'':' disabled')+'> Tylko pytania, w których się pomyliłem ('+wrong.length+')</label></div>';
    html+='<p class="qz-info" id="qs-info"></p><div><button class="btn primary" type="button" id="qs-go">Zacznij</button></div>';
  }else{
    html+='<div class="qz-row"><label for="qs-e">Egzamin<select id="qs-e">'+opts(examOpts,setup.exam)+'</select></label></div>';
    html+='<p class="qz-info">Pytania losowane z obu źródeł; poprawna jest zawsze odpowiedź z klucza ULC. Próg 75% w każdym przedmiocie. Czas biegnie od startu; po upływie egzamin kończy się sam.</p><div><button class="btn primary" type="button" id="qs-go">Rozpocznij egzamin próbny</button></div>';
  }
  html+='</div>';
  var res=store.get('res',{});var rows=SUBJECTS.map(function(b){var e=res['exam:'+b],l=res['learn:'+b];if(!e&&!l)return '';return '<div><span>'+esc(titleOf(b))+'</span><b style="color:var(--'+((e||l).best>=75?'ok':'bad')+')">'+(e?'egz. '+e.best+'%':'nauka '+l.best+'%')+'</b></div>'}).join('');
  if(rows)html+='<h3 style="font-size:20px;margin-top:26px">Twoje najlepsze wyniki</h3><div class="hist">'+rows+'</div><p class="small">Wyniki zapisuje tylko ta przeglądarka.</p>';
  app.innerHTML=html;
  var upd=function(){var i=$('#qs-info');if(!i)return;var o={b:$('#qs-b').value,src:$('#qs-src').value,onlyWrong:$('#qs-w').checked};
    $$('#qs-b option').forEach(function(op){var v=op.value;var n=pool({b:v,src:o.src,onlyWrong:o.onlyWrong}).length;op.textContent=(v==='all'?'Wszystkie bloki':titleOf(v))+' ('+n+')';op.disabled=!n&&v!==o.b});
    i.textContent='Dostępnych pytań: '+pool(o).length+'.'};
  if(setup.mode==='learn'){['qs-b','qs-src','qs-w'].forEach(function(id){$('#'+id).addEventListener('change',upd)});upd()}
}
app.addEventListener('click',function(e){
  var m=e.target.closest('[data-mode]');if(m){setup.mode=m.getAttribute('data-mode');store.set('setup',setup);renderSetup();return}
  if(e.target.id==='qs-go'){
    if(setup.mode==='learn')startLearn({b:$('#qs-b').value,src:$('#qs-src').value,count:$('#qs-n').value,onlyWrong:$('#qs-w').checked});
    else startExam($('#qs-e').value);
  }
});

/* ---------- explanation links ---------- */
function clearRef(){$$('.ref-hl').forEach(function(x){x.classList.remove('ref-hl')})}
function openRef(id){
  var q=QBYID[id];if(!q||!q.r)return;
  var t=document.getElementById(q.r);if(!t)return;
  clearRef();t.classList.add('ref-hl');
  var lbl=Q&&!Q.done?'Pytanie '+(Q.i+1)+' / '+Q.items.length:'Wyniki testu';
  var rb=$('#retBar');if(rb){$('#retLbl').textContent=lbl;rb.hidden=false}
  go(q.r);
}
function backToQuiz(){
  var rb=$('#retBar');if(rb)rb.hidden=true;
  clearRef();go('quiz');
  setTimeout(function(){var c=$('#quizApp .qz-card')||$('#quizApp');if(c)c.scrollIntoView({block:'start'})},80);
}
document.addEventListener('click',function(e){
  if(e.target.closest('#retBtn')){backToQuiz();return}
  if(e.target.closest('#retX')){$('#retBar').hidden=true;clearRef()}
});
window.addEventListener('hashchange',function(){if(location.hash==='#quiz'){var rb=$('#retBar');if(rb&&!rb.hidden){rb.hidden=true;clearRef()}}});

/* ---------- init ---------- */
buildNav();syncDoneButtons();renderSetup();route();
})();
