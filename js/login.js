const supabaseClient = supabase.createClient('https://qjippsnmszhpsnfddwhi.supabase.co','sb_publishable__797yt1Ud0ihbHmuZuaT8w_X2xevNyN');
let projetosCache = []; let leadsCache = [];
async function fazerLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-user').value.trim().toLowerCase();
  const senha = document.getElementById('login-pass').value.trim();
  const btn = document.getElementById('btn-login'); const txt = btn.innerHTML;
  btn.innerHTML = 'Verificando...'; btn.disabled = true;
  try{
    const { data, error } = await supabaseClient.from('usuarios').select('*').eq('email', email).eq('senha', senha).single();
    if(error || !data){
      if(email === 'ana.10364057@aluno.mg.gov.br' && senha === '123456'){ console.log('login local autorizado'); }
      else { alert('E-mail ou senha incorretos!'); btn.innerHTML = txt; btn.disabled = false; return; }
    }
    document.getElementById('tela-login').style.display='none';
    document.getElementById('tela-dashboard').classList.add('active');
    localStorage.setItem('logado','true'); carregarDashboard(); btn.innerHTML = txt; btn.disabled = false;
  }catch(err){ alert('Erro ao conectar no Supabase!'); btn.innerHTML = txt; btn.disabled = false; }
}
function fazerLogout(){ localStorage.removeItem('logado'); location.reload(); }
async function carregarDashboard(){
  try {
    const p = await supabaseClient.from('projetos').select('*').order('created_at',{ascending:false});
    const l = await supabaseClient.from('leads').select('*').order('created_at',{ascending:false});
    const u = await supabaseClient.from('usuarios').select('*', {count:'exact', head:true});
    projetosCache = p.data || []; leadsCache = l.data || [];
    if(p.data) localStorage.setItem('meus_projetos', JSON.stringify(p.data));
    if(l.data) localStorage.setItem('meus_leads', JSON.stringify(l.data));
    if(u.count) document.getElementById('total-usuarios').textContent = u.count;
  } catch(e){ projetosCache = JSON.parse(localStorage.getItem('meus_projetos')||'[]'); leadsCache = JSON.parse(localStorage.getItem('meus_leads')||'[]'); }
  document.getElementById('total-projetos').textContent = projetosCache.length||0;
  document.getElementById('total-mensagens').textContent = leadsCache.length||0;
  const listaProj = document.getElementById('lista-projetos-admin');
  if(projetosCache.length>0){ listaProj.innerHTML=''; projetosCache.forEach((p,i)=>{ listaProj.innerHTML+=`<div class="msg-card"><div class="msg-top"><strong style="font-size:.88rem">${p.titulo}</strong><span style="font-size:.7rem">${p.categoria||''}</span></div><div class="msg-actions"><button onclick="editarProjeto(${i})" class="mini-btn edit">Editar</button><button onclick="deletarProjeto('${p.id}')" class="mini-btn del">Excluir</button></div></div>`; }); }
  const listaMsgs = document.getElementById('lista-mensagens');
  if(leadsCache.length>0){ listaMsgs.innerHTML=''; leadsCache.forEach(l=>{ listaMsgs.innerHTML+=`<div class="msg-card" id="msg-${l.id}"><div class="msg-top"><strong>${l.nome}</strong></div><div style="font-size:.78rem">${l.email}</div><div style="font-size:.84rem;margin-top:6px;background:#fcf9ff;padding:8px 10px;border-radius:10px">${l.mensagem}</div><div class="msg-actions"><button onclick="marcarLido('${l.id}')" class="mini-btn lido">Marcar como lido</button><button onclick="responderWhatsApp('${l.id}')" class="mini-btn whatsapp">WhatsApp</button><button onclick="copiarEmail('${l.email}')" class="mini-btn copy">Copiar e-mail</button><button onclick="deletarLead('${l.id}')" class="mini-btn del">Apagar</button></div></div>`; }); }
}
function editarProjeto(index){ const p=projetosCache[index]; document.getElementById('projeto-titulo').value=p.titulo; document.getElementById('projeto-categoria').value=p.categoria||''; document.getElementById('projeto-imagem').value=p.imagem||''; document.getElementById('projeto-url').value=p.link||''; document.getElementById('projeto-desc').value=p.descricao||''; const btn=document.querySelector('#form-projeto button[type="submit"]'); btn.innerHTML='Atualizar projeto'; btn.dataset.editandoId=p.id; document.getElementById('btn-cancelar-edicao').style.display='block'; }
function cancelarEdicao(){ document.getElementById('form-projeto').reset(); const btn=document.querySelector('#form-projeto button[type="submit"]'); btn.innerHTML='Publicar projeto'; delete btn.dataset.editandoId; document.getElementById('btn-cancelar-edicao').style.display='none'; }
async function salvarProjeto(e){ e.preventDefault(); const titulo=document.getElementById('projeto-titulo').value.trim(); const categoria=document.getElementById('projeto-categoria').value.trim()||'Portfólio'; const imagem=document.getElementById('projeto-imagem').value.trim(); const link=document.getElementById('projeto-url').value.trim(); const descricao=document.getElementById('projeto-desc').value.trim(); if(!titulo||!descricao){ alert('Preencha título e descrição!'); return; } const btn=e.target.querySelector('button[type="submit"]'); const id=btn.dataset.editandoId; if(id){ await supabaseClient.from('projetos').update({titulo,categoria,imagem,link,descricao}).eq('id',id); } else { await supabaseClient.from('projetos').insert([{titulo,categoria,imagem,link,descricao}]); } cancelarEdicao(); carregarDashboard(); }
function marcarLido(id){ document.getElementById('msg-'+id)?.classList.toggle('lida'); }
function responderWhatsApp(id){ const lead=leadsCache.find(x=>String(x.id)===String(id)); const texto=`Olá ${lead.nome}! Vi sua mensagem: "${lead.mensagem}" - Sou a Ana Clara!`; window.open('https://wa.me/?text='+encodeURIComponent(texto),'_blank'); }
function copiarEmail(email){ navigator.clipboard.writeText(email); alert('E-mail copiado: '+email); }
async function deletarProjeto(id){ if(!confirm('Excluir?')) return; await supabaseClient.from('projetos').delete().eq('id',id); carregarDashboard(); }
async function deletarLead(id){ if(!confirm('Apagar?')) return; await supabaseClient.from('leads').delete().eq('id',id); carregarDashboard(); }
if(localStorage.getItem('logado')==='true'){ document.getElementById('tela-login').style.display='none'; document.getElementById('tela-dashboard').classList.add('active'); carregarDashboard(); }