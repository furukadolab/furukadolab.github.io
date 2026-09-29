
function esc(v){return (v??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function loc(v){
  if(v==null) return '';
  if(typeof v==='string'||typeof v==='number') return String(v);
  if(Array.isArray(v)) return v.map(loc).filter(Boolean).join(', ');
  if(typeof v==='object') return loc(v.ja||v.en||v.name||Object.values(v)[0]);
  return String(v);
}
async function loadPublications(){
  const selected = document.getElementById('selected-pubs');
  try{
    const r=await fetch('data/selected-publications.json');
    const rows=await r.json();
    selected.innerHTML=rows.map(x=>`
      <div class="pub-item">
        <div class="pub-year">${esc(x.year)}</div>
        <div class="pub-title">${esc(x.title)}</div>
        <div class="pub-venue">${esc(x.venue)}</div>
        <div class="pub-note">${esc(x.note)}</div>
      </div>`).join('');
  }catch(e){}

  const auto=document.getElementById('researchmap-pubs');
  const status=document.getElementById('researchmap-status');
  try{
    const r=await fetch('data/researchmap.json',{cache:'no-store'});
    const d=await r.json();
    const items=d.published_papers||[];
    if(d.generated_at){
      status.textContent=`researchmap 最終同期：${d.generated_at}`;
    }else{
      status.textContent='researchmap 自動同期はまだ実行されていません。';
    }
    if(!items.length){
      auto.innerHTML='<div class="empty">初回のGitHub Actions実行後に、researchmapの論文一覧がここへ表示されます。</div>';
      return;
    }
    auto.innerHTML=items.map(x=>`
      <div class="pub-item">
        <div class="pub-year">${esc(x.date||'')}</div>
        <div class="pub-title">${esc(x.title||'')}</div>
        <div class="pub-venue">${esc(x.venue||'')}</div>
        ${x.url?`<div class="pub-note"><a href="${esc(x.url)}" target="_blank" rel="noopener">関連リンク</a></div>`:''}
      </div>`).join('');
  }catch(e){
    auto.innerHTML='<div class="empty">researchmapデータを読み込めませんでした。</div>';
  }
}
document.addEventListener('DOMContentLoaded',loadPublications);
