
function escG(v){return (v??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
async function loadGrants(){
  const holder=document.getElementById('grant-table-body');
  const status=document.getElementById('grant-status');
  let manual=[], auto=[];
  try{manual=await (await fetch('data/manual-grants.json')).json();}catch(e){}
  try{
    const d=await (await fetch('data/researchmap.json',{cache:'no-store'})).json();
    auto=d.research_projects||[];
    status.textContent=d.generated_at?`researchmap 最終同期：${d.generated_at}`:'researchmap 自動同期はまだ実行されていません。';
  }catch(e){}
  const rows=[...manual, ...auto.filter(a=>!manual.some(m=>m.grant_number && m.grant_number===a.grant_number))];
  holder.innerHTML=rows.map(x=>`
    <tr>
      <td>${escG(x.year||x.period||'')}</td>
      <td><strong>${escG(x.title||'')}</strong></td>
      <td>${escG(x.funder||'')}</td>
      <td>${escG(x.program||'')}</td>
      <td>${escG(x.grant_number||'')}</td>
      <td>${escG(x.role||'')}</td>
      <td>${x.amount?escG(x.amount):'—'}</td>
    </tr>`).join('') || '<tr><td colspan="7">データがありません。</td></tr>';
}
document.addEventListener('DOMContentLoaded',loadGrants);
