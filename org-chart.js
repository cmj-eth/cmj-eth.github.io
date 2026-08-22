function orgEsc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

async function initPublicOrgChart(){
 const root=document.querySelector('#org-chart');
 if(!root)return;
 const {data,error}=await cmjDb.from('org_chart_members').select('*').eq('is_visible',true).order('level').order('sort_order').order('name');
 if(error){root.innerHTML='<div class="notice">Impossible de charger l’organigramme.</div>';return;}
 if(!data?.length){root.innerHTML='<div class="notice">L’organigramme sera bientôt disponible.</div>';return;}
 const levels=[...new Set(data.map(x=>x.level))];
 root.innerHTML=levels.map(level=>{
  const members=data.filter(x=>x.level===level);
  return `<section class="org-level"><div class="org-line"></div><div class="org-level-members">${members.map(m=>`<article class="org-person">${m.photo_url?`<img src="${orgEsc(m.photo_url)}" alt="Photo de ${orgEsc(m.name)}">`:`<div class="org-avatar">${orgEsc(m.name).charAt(0).toUpperCase()}</div>`}<h3>${orgEsc(m.name)}</h3><strong>${orgEsc(m.role)}</strong>${m.note?`<p>${orgEsc(m.note)}</p>`:''}</article>`).join('')}</div></section>`;
 }).join('');
}

async function initAdminOrgChart(){
 const section=document.querySelector('[data-super-only]');
 if(!section)return;
 const {data:perms}=await cmjDb.rpc('get_my_admin_permissions');
 const p=perms?.[0];
 section.hidden=!p?.is_super_admin;
 if(!p?.is_super_admin)return;
 const form=document.querySelector('#org-create-form');
 const msg=document.querySelector('#org-create-message');
 if(form&&!form.dataset.bound){
  form.dataset.bound='1';
  form.addEventListener('submit',async e=>{
   e.preventDefault();const fd=new FormData(form);
   try{
    const photo=fd.get('photo')?.size?await uploadMedia(fd.get('photo'),'organigramme'):null;
    const {error}=await cmjDb.from('org_chart_members').insert({name:fd.get('name'),role:fd.get('role'),level:Number(fd.get('level')),sort_order:Number(fd.get('sort_order')),photo_url:photo,note:fd.get('note')||null,is_visible:fd.get('visible')==='on'});
    if(error)throw error;
    form.reset();form.querySelector('[name="level"]').value='1';form.querySelector('[name="sort_order"]').value='0';form.querySelector('[name="visible"]').checked=true;
    setMsg(msg,'Personne ajoutée à l’organigramme.');await loadAdminOrgChart();
   }catch(err){setMsg(msg,err.message||'Erreur lors de l’ajout.','error');}
  });
 }
 await loadAdminOrgChart();
}

async function loadAdminOrgChart(){
 const box=document.querySelector('#admin-org-chart');if(!box)return;
 const {data,error}=await cmjDb.from('org_chart_members').select('*').order('level').order('sort_order').order('name');
 if(error){box.innerHTML='<p>Impossible de charger l’organigramme.</p>';return;}
 box.innerHTML=(data||[]).map(m=>`<div class="admin-row"><div>${m.photo_url?`<img class="admin-thumb" src="${orgEsc(m.photo_url)}" alt="">`:''}<strong>${orgEsc(m.name)}</strong><small>${orgEsc(m.role)} • niveau ${m.level} • ordre ${m.sort_order}${m.is_visible?' • visible':' • masqué'}</small>${m.note?`<p>${orgEsc(m.note)}</p>`:''}</div><div><button class="small-btn" data-org-edit="${m.id}">Modifier</button> <button class="small-btn danger" data-org-delete="${m.id}">Supprimer</button></div></div>`).join('')||'<p>Aucune personne dans l’organigramme.</p>';
 box.querySelectorAll('[data-org-delete]').forEach(b=>b.addEventListener('click',async()=>{if(!confirm('Supprimer cette personne de l’organigramme ?'))return;await cmjDb.from('org_chart_members').delete().eq('id',b.dataset.orgDelete);await loadAdminOrgChart();}));
 box.querySelectorAll('[data-org-edit]').forEach(b=>b.addEventListener('click',async()=>{
  const m=data.find(x=>x.id===b.dataset.orgEdit);if(!m)return;
  const name=prompt('Nom',m.name);if(name===null)return;
  const role=prompt('Fonction',m.role);if(role===null)return;
  const level=prompt('Niveau hiérarchique (1 à 10)',String(m.level));if(level===null)return;
  const order=prompt('Ordre dans le niveau',String(m.sort_order));if(order===null)return;
  const note=prompt('Note facultative',m.note||'');if(note===null)return;
  const visible=confirm('OK = visible sur le site public\nAnnuler = masqué');
  await cmjDb.from('org_chart_members').update({name,role,level:Math.max(1,Math.min(10,Number(level)||1)),sort_order:Math.max(0,Number(order)||0),note:note||null,is_visible:visible}).eq('id',m.id);
  await loadAdminOrgChart();
 }));
}

document.addEventListener('DOMContentLoaded',()=>{initPublicOrgChart();initAdminOrgChart();});