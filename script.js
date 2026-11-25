// script.js - Script público (portfolio.html e contato.html) - Ana Clara Martins
const SUPABASE_URL = 'https://qjippsnmszhpsnfddwhi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__797yt1Ud0ihbHmuZuaT8w_X2xevNyN';
let supabaseClient;
try { supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch(e){ console.log('Supabase offline, usando localStorage'); }

// === PORTFOLIO.HTML - Carrega projetos sem flicker ===
async function carregarProjetosPublicos(){
  const lista = document.getElementById('lista-projetos');
  const contador = document.getElementById('contador-projetos');
  if(!lista) return;

  let cache = [];
  try { cache = JSON.parse(localStorage.getItem('meus_projetos')||'[]'); } catch(e){}
  if(cache.length>0) renderProjetos(cache);

  try{
    const { data } = await supabaseClient.from('projetos').select('*').order('created_at',{ascending:false});
    if(data && data.length>0){
      localStorage.setItem('meus_projetos', JSON.stringify(data));
      renderProjetos(data);
    }
  }catch(e){ if(cache.length===0) renderProjetos([]); }
}

function renderProjetos(projetos){
  const lista = document.getElementById('lista-projetos');
  const contador = document.getElementById('contador-projetos');
  if(!lista) return;

  if(!projetos || projetos.length===0){
    if(contador) contador.textContent = '';
    lista.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:70px 30px;border:1.5px dashed #e2d0f3;border-radius:24px;background:#fdfaff;color:#9a8fa6"><h3 style="font-weight:800;color:#1a1620">Nenhum projeto ainda</h3><p style="margin-top:6px">Cadastre seu primeiro projeto no painel Login!</p><a href="login.html" style="display:inline-flex;margin-top:18px;padding:10px 22px;border-radius:999px;background:#7540ad;color:#fff;font-weight:700">Cadastrar projeto</a></div>`;
    return;
  }
  if(contador) contador.textContent = `${projetos.length} ${projetos.length===1?'projeto':'projetos'}`;
  lista.innerHTML='';
  projetos.forEach(p=>{
    const temImg = p.imagem && p.imagem.trim().startsWith('http');
    const thumb = temImg ? `<div style="height:200px;background:#f5eeff"><img src="${p.imagem}" alt="Projeto ${p.titulo}" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.style.display='none'"></div>` : `<div style="height:200px;background:linear-gradient(135deg,#f5eeff,#e8d5ff);display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-code" style="font-size:2rem;color:#7540ad"></i></div>`;
    lista.innerHTML+=`<article style="border:1px solid #ece3f6;border-radius:22px;overflow:hidden;background:#fff"><div>${thumb}</div><div style="padding:18px"><span style="display:inline-flex;padding:4px 10px;border-radius:999px;background:#f3e9fb;color:#7540ad;font-size:.65rem;font-weight:800">${p.categoria||'Portfólio'}</span><h3 style="margin-top:10px;font-weight:800">${p.titulo}</h3><p style="color:#7c7586;font-size:.88rem;margin-top:6px">${(p.descricao||'').substring(0,90)}...</p><a href="${p.link||'#'}" target="_blank" style="display:inline-flex;margin-top:12px;color:#7540ad;font-weight:700;font-size:.84rem;gap:5px">Ver projeto <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div></article>`;
  });
}

// === CONTATO.HTML - Envia mensagem ===
function mascaraCPF(i){
  let v=i.value.replace(/\D/g,'').slice(0,11);
  v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2'); i.value=v;
}

async function enviarContato(e){
  e.preventDefault();
  const nome=document.getElementById('c-nome').value.trim();
  const email=document.getElementById('c-email').value.trim();
  const cpf=document.getElementById('c-cpf')?.value.trim()||'';
  const tel=document.getElementById('c-tel')?.value.trim()||'';
  const interesse=document.getElementById('c-interesse').value;
  const problema=document.getElementById('c-problema').value;
  const msg=document.getElementById('c-msg').value.trim();
  if(!nome||!email||!msg){ alert('Preencha nome, e-mail e mensagem!'); return; }

  const mensagem=`CPF: ${cpf||'não informado'} | Tel: ${tel} | Interesse: ${interesse} | Problema: ${problema} | Mensagem: ${msg}`;
  let lista=JSON.parse(localStorage.getItem('meus_leads')||'[]');
  lista.unshift({id:Date.now().toString(),nome,email,mensagem,created_at:new Date().toISOString()});
  localStorage.setItem('meus_leads',JSON.stringify(lista));

  try{ if(supabaseClient) await supabaseClient.from('leads').insert([{nome,email,mensagem}]); }catch(err){ console.log(err); }
  alert('Mensagem enviada com sucesso! ✅ Já apareceu no seu dashboard em login.html');
  e.target.reset();
}

document.addEventListener('DOMContentLoaded', ()=>{
  carregarProjetosPublicos();
});