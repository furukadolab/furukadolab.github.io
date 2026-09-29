function esc(v){
  return (v ?? '').toString().replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

async function loadPublications(){
  const auto = document.getElementById('researchmap-pubs');
  const status = document.getElementById('researchmap-status');

  try{
    const r = await fetch('data/researchmap.json', {cache:'no-store'});
    const d = await r.json();
    const items = d.published_papers || [];

    if(d.generated_at){
      status.textContent = `researchmap 最終同期：${d.generated_at}`;
    }else{
      status.textContent = 'researchmap 最終同期：未取得';
    }

    if(!items.length){
      auto.innerHTML = '<div class="empty">現在表示できる研究成果はありません。</div>';
      return;
    }

    auto.innerHTML = items.map(x => `
      <div class="pub-item">
        <div class="pub-year">${esc(x.date || '')}</div>
        <div class="pub-title">${esc(x.title || '')}</div>
        <div class="pub-venue">${esc(x.venue || '')}</div>
        <div class="pub-note">${esc(x.authors || '')}</div>
        ${x.url ? `<div class="pub-note"><a href="${esc(x.url)}" target="_blank" rel="noopener">関連リンク</a></div>` : ''}
      </div>
    `).join('');
  }catch(e){
    auto.innerHTML = '<div class="empty">researchmapデータを読み込めませんでした。</div>';
  }
}

document.addEventListener('DOMContentLoaded', loadPublications);
