
async function loadStudentResearch(){
  const holder = document.getElementById('research-list');
  const filterbar = document.getElementById('year-filters');
  const topicSelect = document.getElementById('topic-filter');
  const countEl = document.getElementById('research-count');
  if(!holder) return;

  let data = [];
  try{
    const res = await fetch('data/student-research.json');
    data = await res.json();
  }catch(e){
    holder.innerHTML = '<div class="empty">データを読み込めませんでした。GitHub Pages上、またはローカルHTTPサーバーで確認してください。</div>';
    return;
  }

  const years = ['ALL','R7','R6','R5','R4','R3','R2'];
  const topics = [...new Set(data.flatMap(x=>x.topics||[]))].sort((a,b)=>a.localeCompare(b,'ja'));
  topicSelect.innerHTML = '<option value="ALL">研究テーマ：すべて</option>' + topics.map(t=>`<option value="${t}">${t}</option>`).join('');

  let currentYear='ALL';

  function render(){
    const topic = topicSelect.value;
    const rows = data.filter(x => (currentYear==='ALL'||x.year===currentYear) && (topic==='ALL'||(x.topics||[]).includes(topic)));
    countEl.textContent = `${rows.length}件`;
    holder.innerHTML = rows.map(x=>`
      <article class="research-entry">
        <div class="entry-top">
          <div>
            <div class="pub-year">${x.year}</div>
            <h3>${x.title}</h3>
          </div>
          <span class="badge">${x.type}</span>
        </div>
        <p>${x.summary}</p>
        <div class="tags">${(x.topics||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </article>`).join('') || '<div class="empty">該当する研究はありません。</div>';
  }

  filterbar.innerHTML = years.map((y,i)=>`<button class="filter-btn ${i===0?'active':''}" data-year="${y}">${y==='ALL'?'すべて':y}</button>`).join('');
  filterbar.addEventListener('click',e=>{
    if(!e.target.matches('.filter-btn')) return;
    currentYear=e.target.dataset.year;
    filterbar.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b===e.target));
    render();
  });
  topicSelect.addEventListener('change',render);
  render();
}
document.addEventListener('DOMContentLoaded',loadStudentResearch);
