'use strict';
/* AgroVerde S.A.C. — Trazabilidad de lotes. Persistencia: localStorage. */
const DB_KEY = 'agroverde_db_v1';
// Cierre automático de sesión por inactividad (RNF01 / seguridad de datos de RRHH)
const INACTIVIDAD_MS = 10 * 60 * 1000;   // 10 minutos
const AVISO_MS = 8 * 60 * 1000;          // aviso 2 minutos antes
let ultimaActividad = 0;
let ultimoGuardadoActividad = 0;
let ultimoResetTimer = 0;
let timerAviso = null;
let timerCierre = null;
let avisoMostrado = false;

// Usuarios semilla. La lista editable vive en db.usuarios (gestión desde la app).
const USUARIOS_SEMILLA = [
  {usuario:'operario1', pass:'op123', nombre:'Pablo Blas', rol:'Operario de producción', linea:'L1', activo:true},
  {usuario:'jefe1', pass:'jefe123', nombre:'David Ruiz', rol:'Jefe de producción', linea:'L1', activo:true},
  {usuario:'almacen1', pass:'alm123', nombre:'Dayron Yangali', rol:'Encargado de almacén', linea:'', activo:true},
  {usuario:'rrhh1', pass:'rrhh123', nombre:'Orlando Ravenna', rol:'Especialista de RRHH', linea:'', activo:true},
  {usuario:'gerencia1', pass:'ger123', nombre:'Gerencia AgroVerde', rol:'Gerencia', linea:'', activo:true},
  {usuario:'admin1', pass:'admin123', nombre:'Administrador', rol:'Administrador', linea:'', activo:true}
];

const MODULOS = {
  'Operario de producción': ['inicio','cierre','escanear','offline','consulta','consumo'],
  'Jefe de producción': ['inicio','cierre','escanear','validar','offline','consulta','consumo','trazabilidad'],
  'Encargado de almacén': ['inicio','escanear','consulta','ingreso','conciliacion','offline','trazabilidad'],
  'Especialista de RRHH': ['inicio','personal','consulta','trazabilidad'],
  'Gerencia': ['inicio','consulta','trazabilidad','documentos','auditoria'],
  'Administrador': ['inicio','cierre','escanear','validar','offline','consulta','ingreso','conciliacion','personal','documentos','trazabilidad','consumo','auditoria','usuarios']
};

const MODULOS_INFO = [
  {id:'inicio', label:'Inicio', icono:'🏠'},
  {id:'cierre', label:'Registro de cierre', icono:'📝'},
  {id:'escanear', label:'Escáner de lote', icono:'📷'},
  {id:'validar', label:'Validar lotes', icono:'✅'},
  {id:'offline', label:'Modo offline', icono:'📴'},
  {id:'consulta', label:'Consulta y búsqueda', icono:'🔎'},
  {id:'ingreso', label:'Ingreso y stock', icono:'📦'},
  {id:'conciliacion', label:'Conciliación', icono:'⚖️'},
  {id:'personal', label:'Datos y consentimiento', icono:'👥'},
  {id:'documentos', label:'Documentos', icono:'📄'},
  {id:'trazabilidad', label:'Trazabilidad', icono:'🔗'},
  {id:'consumo', label:'Agua y mermas', icono:'💧'},
  {id:'auditoria', label:'Auditoría y respaldos', icono:'🧾'},
  {id:'usuarios', label:'Gestión de usuarios', icono:'⚙️'}
];

let db = null;
let actual = null;
let moduloActual = 'inicio';
let streamCamara = null;
let detectorCodigos = null;
let escaneoActivo = false;
let ultimoEscaneo = 0;
let canvasEscaneo = null;
let ultimoAnalisisInterno = 0;
let camarasDisponibles = [];
let ultimoReporte = null;
let ultimaConsulta = [];

/* ---------- Persistencia y semilla ---------- */
function semilla(){
  return {
    usuarios: USUARIOS_SEMILLA.map(u=>({...u})),
    lotes:[
      {codigo:'LOTE-2026-001', linea:'L1', fecha:'2026-11-20', cantidad:1200, turno:'Mañana', estado:'Validado', ubicacion:'Almacén A', sync:'Sincronizado'},
      {codigo:'LOTE-2026-002', linea:'L1', fecha:'2026-11-21', cantidad:850, turno:'Tarde', estado:'Pendiente', ubicacion:'Línea L1', sync:'Pendiente de sincronización · 21/11/2026 14:30'},
      {codigo:'LOTE-2026-003', linea:'L2', fecha:'2026-11-21', cantidad:640, turno:'Mañana', estado:'Validado', ubicacion:'Almacén B', sync:'Sincronizado'}
    ],
    stock:{'LOTE-2026-001':1200,'LOTE-2026-003':640},
    pedidos:[{id:'PED-001',lote:'LOTE-2026-001',cantidad:900},{id:'PED-002',lote:'LOTE-2026-003',cantidad:700}],
    movimientos:[], conciliaciones:[], documentos:[], consumo:[],
    trabajadores:[
      {dni:'12345678', nombre:'Ana Quispe', cargo:'Operaria', vigente:true, fin:'2027-12-31', estado:'ACTIVO'},
      {dni:'11223344', nombre:'María Rojas', cargo:'Operaria', vigente:true, fin:'2026-12-15', estado:'ACTIVO'},
      {dni:'87654321', nombre:'Luis Pérez', cargo:'Operario', vigente:false, fin:'2026-10-01', estado:'BLOQUEADO — sin consentimiento'}
    ],
    auditoria:[{fecha:ahora(), usuario:'Sistema', accion:'Inicialización', detalle:'Datos semilla de AgroVerde S.A.C.'}],
    cache:{}, session:null, modoOffline:false
  };
}
function cargarDB(){
  try {
    const raw=localStorage.getItem(DB_KEY);
    if(!raw) return semilla();
    const d=JSON.parse(raw);
    if(!d || typeof d!=='object' || !Array.isArray(d.lotes)) return semilla();
    ['movimientos','conciliaciones','documentos','consumo','pedidos','trabajadores','auditoria'].forEach(function(k){ if(!Array.isArray(d[k])) d[k]=[]; });
    if(!Array.isArray(d.usuarios)||!d.usuarios.length) d.usuarios=USUARIOS_SEMILLA.map(u=>({...u}));
    if(!d.stock||typeof d.stock!=='object') d.stock={};
    if(!d.cache||typeof d.cache!=='object') d.cache={};
    return d;
  } catch(e){ return semilla(); }
}
function guardarDB(){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function ahora(){ const d=new Date(); return d.toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'}); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function val(id){ const e=document.getElementById(id); return e ? e.value.trim() : ''; }
function aud(accion, detalle){ db.auditoria.unshift({fecha:ahora(), usuario:actual?actual.nombre:'Sistema', accion, detalle:detalle||''}); if(db.auditoria.length>300) db.auditoria.pop(); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.add('hidden'),3500); }
function abrirModal(html){ document.getElementById('modalBody').innerHTML=html; document.getElementById('modal').classList.remove('hidden'); }
function cerrarModal(e){ if(e && e.target && e.target.id!=='modal') return; document.getElementById('modal').classList.add('hidden'); }
function imprimir(){ window.print(); }
function tiene(m){ return (MODULOS[actual.rol]||[]).includes(m); }
function listaUsuarios(){ return (db && Array.isArray(db.usuarios) && db.usuarios.length) ? db.usuarios : USUARIOS_SEMILLA; }
function diasParaVencer(fin){
  const f=new Date(String(fin)+'T00:00:00');
  if(isNaN(f.getTime())) return null;
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  return Math.round((f-hoy)/86400000);
}
function descargarBlob(blob,nombre){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); },1500);
}
function csvCell(v){ const s=String(v ?? ''); return /[;"\r\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; }
function guardarCSV(filas,nombre){
  const contenido='\uFEFF'+filas.map(f=>f.map(csvCell).join(';')).join('\r\n');
  descargarBlob(new Blob([contenido],{type:'text/csv;charset=utf-8;'}),nombre);
}

/* ---------- Sesión ---------- */
function iniciarSesion(e){
  e.preventDefault();
  const u=val('usr').toLowerCase(), p=val('pass');
  const usuarios=listaUsuarios();
  let user=null;
  if(db.modoOffline){
    if(db.cache[u]===p) user=usuarios.find(x=>x.usuario===u && x.activo!==false);
    else return toast('RN06: sin red solo se aceptan credenciales ya usadas en este dispositivo.');
  } else {
    user=usuarios.find(x=>x.usuario===u && x.pass===p && x.activo!==false);
    if(user) db.cache[u]=p;
  }
  if(!user) return toast('Usuario o contraseña incorrectos.');
  actual={usuario:user.usuario,nombre:user.nombre,rol:user.rol,linea:user.linea||'—'};
  db.session=actual;
  ultimaActividad=Date.now(); db.session.ultimaActividad=ultimaActividad;
  aud('Inicio de sesión', actual.rol+(db.modoOffline?' (offline RN06)':'')); guardarDB();
  registrarActividad(true); renderApp();
}
function cerrarSesion(){
  limpiarTemporizadores(); detenerEscaneo(true);
  aud('Cierre de sesión',''); db.session=null; guardarDB(); actual=null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
  document.getElementById('asistente').classList.add('hidden');
  renderUsuariosLogin();
}
function cambiarModo(){ db.modoOffline=!db.modoOffline; aud('Cambio de conectividad', db.modoOffline?'Modo offline activo':'Modo en línea activo'); guardarDB(); actualizarCabecera(); ir(moduloActual); toast(db.modoOffline?'Modo offline: los registros quedarán pendientes.':'Modo en línea restablecido.'); }
function actualizarCabecera(){
  document.getElementById('btnModo').textContent=db.modoOffline?'📴 Sin conexión':'🌐 En línea';
  document.getElementById('badgeUsuario').textContent=actual?actual.nombre+' · '+actual.rol:'';
  document.getElementById('bannerOffline').classList.toggle('hidden',!db.modoOffline);
  const av=document.getElementById('avatarUsuario');
  if(av) av.textContent=actual?String(actual.nombre||'?').split(/\s+/).map(function(p){return p[0]||'';}).join('').slice(0,2).toUpperCase():'🌱';
}
const ETIQUETAS_MOVIL={inicio:'Inicio',cierre:'Cierre',escanear:'Escanear',consulta:'Buscar',validar:'Validar',
  trazabilidad:'Trazar',ingreso:'Stock',personal:'RRHH',auditoria:'Auditoría',offline:'Offline',documentos:'Docs',conciliacion:'Conciliar',consumo:'Agua'};
function refrescarMenu(){
  const permitidos=MODULOS_INFO.filter(m=>tiene(m.id));
  document.getElementById('menu').innerHTML=permitidos
    .map(m=>`<button id="nav-${m.id}" onclick="ir('${m.id}')">${m.icono} ${m.label}</button>`).join('');
  const barra=document.getElementById('menuMovil');
  if(barra){
    const orden=['inicio','escanear','cierre','consulta','validar','trazabilidad','ingreso','personal','auditoria'];
    const fijos=orden.filter(function(id){ return permitidos.some(m=>m.id===id); }).slice(0,4)
      .map(function(id){ return permitidos.find(m=>m.id===id); });
    barra.innerHTML=fijos.map(function(m){
      return `<button data-modulo="${m.id}" onclick="ir('${m.id}')"><span class="mi">${m.icono}</span><span class="mt">${esc(ETIQUETAS_MOVIL[m.id]||m.label)}</span></button>`;
    }).join('')+'<button class="mas" onclick="abrirModulos()"><span class="mi">☰</span><span class="mt">Más</span></button>';
  }
}
function abrirModulos(){
  const mods=MODULOS_INFO.filter(m=>tiene(m.id));
  abrirModal('<h2>Todos los módulos</h2><p class="sub">Elija un módulo para continuar</p><div class="modulos-grid">'+
    mods.map(m=>`<button class="modulo-btn" onclick="irModuloMovil('${m.id}')"><span>${m.icono}</span><b>${esc(m.label)}</b></button>`).join('')+'</div>');
}
function irModuloMovil(id){ cerrarModal(); ir(id); }
function mejorarTablasMovil(){
  if(!window.matchMedia || !matchMedia('(max-width:600px)').matches) return;
  document.querySelectorAll('#contenido table').forEach(function(t){
    if(t.classList.contains('tabla-movil')) return;
    let cab=Array.from(t.querySelectorAll('thead th')).map(function(h){ return h.textContent.trim(); });
    let filaCab=t.querySelector('thead tr');
    if(!cab.length){
      filaCab=Array.from(t.querySelectorAll('tr')).find(function(f){ return f.querySelector('th'); });
      if(filaCab) cab=Array.from(filaCab.querySelectorAll('th')).map(function(h){ return h.textContent.trim(); });
    }
    if(!cab.length) return;
    t.classList.add('tabla-movil');
    if(filaCab) filaCab.classList.add('fila-cabecera');
    t.querySelectorAll('tbody tr').forEach(function(tr){
      if(tr.classList.contains('fila-cabecera')) return;
      Array.from(tr.children).forEach(function(td,i){
        if(cab[i]) td.setAttribute('data-label',cab[i]);
        if(td.querySelector('button')) td.classList.add('celda-acciones');
      });
    });
  });
}
function renderUsuariosLogin(){
  const c=document.getElementById('listaUsuariosLogin');
  if(!c) return;
  const us=listaUsuarios().filter(u=>u.activo!==false);
  c.innerHTML=us.length
    ? us.map(u=>`<span class="usuario-chip"><code>${esc(u.usuario)}</code><small>${esc(u.rol==='Administrador'?'sistema':u.rol)}</small></span>`).join('')
    : '<span class="hint">No hay usuarios activos. Pida soporte al administrador.</span>';
}
function renderApp(){
  document.getElementById('login').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('asistente').classList.remove('hidden');
  const guardada = db.session ? db.session.ultimaActividad : 0;
  if (guardada && Date.now() - guardada >= INACTIVIDAD_MS) { cerrarPorInactividad(true); return; }
  ultimaActividad = guardada || Date.now();
  if (db.session) { db.session.ultimaActividad = ultimaActividad; guardarDB(); }
  reiniciarTemporizador();
  actualizarCabecera();
  refrescarMenu();
  ir('inicio');
}
function ir(mod){
  if(!tiene(mod)) mod='inicio';
  if(moduloActual==='escanear' && mod!=='escanear') detenerEscaneo(true);
  moduloActual=mod;
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('activo', b.id==='nav-'+mod || b.dataset.modulo===mod));
  const views={inicio:vInicio,cierre:vCierre,escanear:vEscanear,validar:vValidar,offline:vOffline,consulta:vConsulta,ingreso:vIngreso,
    conciliacion:vConciliacion,personal:vPersonal,documentos:vDocumentos,trazabilidad:vTrazabilidad,consumo:vConsumo,auditoria:vAuditoria,usuarios:vUsuarios};
  document.getElementById('contenido').innerHTML=(views[mod]||vInicio)();
  if(mod==='escanear') listarCamarasSinPermiso();
}

/* ---------- Alertas del inicio ---------- */
function calcularAlertas(){
  const a=[];
  const sinValidar=db.lotes.filter(l=>l.estado!=='Validado').length;
  if(sinValidar) a.push({nivel:'pend',icono:'✅',texto:`<b>${sinValidar}</b> lote(s) sin validar`,
    detalle:'Requieren revisión del Jefe de producción antes de generar documentos.',modulo:'validar',boton:'Validar'});

  const pend=db.lotes.filter(l=>l.sync.startsWith('Pendiente')).length;
  if(pend) a.push({nivel:'pend',icono:'↻',texto:`<b>${pend}</b> registro(s) pendiente(s) de sincronización`,
    detalle:'Capturados sin señal. Sincroniza al volver a tener conexión.',modulo:'offline',boton:'Sincronizar'});

  const bloqueados=db.trabajadores.filter(t=>String(t.estado).indexOf('BLOQUEADO')===0).length;
  if(bloqueados) a.push({nivel:'bad',icono:'⛔',texto:`<b>${bloqueados}</b> legajo(s) bloqueado(s)`,
    detalle:'Sin consentimiento vigente no deben operar (RN09).',modulo:'personal',boton:'Ver legajos'});

  const porVencer=db.trabajadores.filter(function(t){
    if(!t.vigente||!t.fin) return false;
    const d=diasParaVencer(t.fin);
    return d!==null && d>=0 && d<=60;
  });
  if(porVencer.length) a.push({nivel:'pend',icono:'📅',texto:`<b>${porVencer.length}</b> consentimiento(s) por vencer`,
    detalle:porVencer.map(t=>t.nombre+' ('+t.fin+')').join(', '),modulo:'personal',boton:'Revisar'});

  const insuf=db.pedidos.filter(p=>(db.stock[p.lote]||0)<p.cantidad).length;
  if(insuf) a.push({nivel:'bad',icono:'📦',texto:`<b>${insuf}</b> pedido(s) con stock insuficiente`,
    detalle:'Revisa la conciliación antes de programar el despacho.',modulo:'conciliacion',boton:'Conciliar'});

  return a;
}

/* ---------- Vistas ---------- */
function vInicio(){
  const validados=db.lotes.filter(l=>l.estado==='Validado').length;
  const pendientes=db.lotes.filter(l=>l.sync.startsWith('Pendiente')).length;
  const stock=Object.values(db.stock).reduce((a,b)=>a+b,0);
  const alertas=calcularAlertas();
  return `<h2>Panel de control</h2>
  <div class="grid metrics">
    <div class="metric"><b>${db.lotes.length}</b><span>Lotes registrados</span></div>
    <div class="metric"><b>${validados}</b><span>Lotes validados</span></div>
    <div class="metric"><b>${pendientes}</b><span>Pendientes de sincronización</span></div>
    <div class="metric"><b>${stock.toLocaleString('es-PE')}</b><span>Unidades en stock</span></div>
  </div>
  <div class="card alertas-card">
    <div class="section-head"><h3>Alertas del turno</h3><span class="alerta-count">${alertas.length} aviso(s)</span></div>
    ${alertas.length?`<div class="alertas-lista">${alertas.map(x=>`<div class="alerta-item ${x.nivel}">
      <span class="alerta-icono">${x.icono}</span>
      <div class="alerta-texto"><b>${x.texto}</b><small>${esc(x.detalle)}</small></div>
      ${tiene(x.modulo)?`<button class="btn small" onclick="ir('${x.modulo}')">${x.boton}</button>`:''}
    </div>`).join('')}</div>`:'<div class="msg ok">No hay alertas pendientes en este dispositivo.</div>'}
  </div>
  <div class="card"><h3>Actividad reciente</h3><div class="table-scroll"><table><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr>
  ${db.auditoria.slice(0,6).map(a=>`<tr><td>${esc(a.fecha)}</td><td>${esc(a.usuario)}</td><td>${esc(a.accion)}</td><td>${esc(a.detalle)}</td></tr>`).join('')}</table></div></div>
  <div class="card"><h3>Accesos rápidos</h3><p>
  ${tiene('cierre')?'<button class="btn small" onclick="ir(\'cierre\')">Registrar cierre</button> ':''}
  ${tiene('escanear')?'<button class="btn small" onclick="ir(\'escanear\')">📷 Escanear lote</button> ':''}
  ${tiene('validar')?'<button class="btn small" onclick="ir(\'validar\')">Validar lotes</button> ':''}
  <button class="btn small" onclick="ir('consulta')">Buscar lote</button>
  ${tiene('trazabilidad')?'<button class="btn small" onclick="ir(\'trazabilidad\')">Ver trazabilidad</button>':''}
  </p></div>`;
}
function vCierre(){
  const lotes=actual.rol==='Operario de producción'?db.lotes.filter(l=>l.linea===actual.linea):db.lotes;
  return `<h2>Registro de cierre de lote <small>(RF01 · CU01)</small></h2>
  <div class="card"><form onsubmit="registrarCierre(event)">
    <div class="grid">
      <label>Código de lote <input id="cieCod" required value="LOTE-2026-${String(db.lotes.length+1).padStart(3,'0')}"></label>
      <label>Línea <select id="cieLinea"><option>L1</option><option>L2</option><option>L3</option></select></label>
      <label>Fecha <input id="cieFecha" type="date" required value="${new Date().toISOString().slice(0,10)}"></label>
      <label>Turno <select id="cieTurno"><option>Mañana</option><option>Tarde</option><option>Noche</option></select></label>
      <label>Cantidad <input id="cieCant" type="number" min="1" required></label>
    </div>
    <button class="btn primary" type="submit">Guardar cierre</button>
    ${tiene('escanear')?'<button class="btn ghost" type="button" onclick="ir(\'escanear\')">📷 Escanear código</button>':''}
  </form></div>
  <div class="card"><h3>Lotes registrados</h3><div class="table-scroll"><table><tr><th>Código</th><th>Línea</th><th>Fecha</th><th>Cantidad</th><th>Estado</th><th>Sincronización</th></tr>
  ${lotes.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${esc(l.fecha)}</td><td>${l.cantidad}</td><td><span class="estado ${l.estado==='Validado'?'ok':l.estado==='Pendiente'?'pend':'bad'}">${esc(l.estado)}</span></td><td>${esc(l.sync)}</td></tr>`).join('')}</table></div></div>`;
}
function registrarCierre(e){
  e.preventDefault();
  const codigo=val('cieCod'), linea=val('cieLinea');
  if(db.lotes.some(l=>l.codigo===codigo)) return toast('RN02: el código de lote ya existe.');
  if(actual.rol==='Operario de producción' && linea!==actual.linea) return toast('RN07: solo puede cerrar lotes de su línea ('+actual.linea+').');
  const pendiente=db.modoOffline;
  db.lotes.unshift({codigo,linea,fecha:val('cieFecha'),cantidad:Number(val('cieCant')),turno:val('cieTurno'),
    estado:pendiente?'Pendiente':'Registrado',ubicacion:'Línea '+linea,
    sync:pendiente?'Pendiente de sincronización · '+ahora():'Sincronizado'});
  aud('Registro de cierre', codigo+(pendiente?' (offline)':'')); guardarDB(); ir('cierre'); toast('Cierre registrado: '+codigo);
}

/* ---------- Generador de código de barras Code128-B (sin librerías) ---------- */
// Patrones estándar Code128 (JsBarcode, MIT). 103 datos + 3 inicios + 1 parada.
const CODE128_BARS = [
  11011001100,11001101100,11001100110,10010011000,10010001100,10001001100,10011001000,10011000100,10001100100,11001001000,
  11001000100,11000100100,10110011100,10011011100,10011001110,10111001100,10011101100,10011100110,11001110010,11001011100,
  11001001110,11011100100,11001110100,11101101110,11101001100,11100101100,11100100110,11101100100,11100110100,11100110010,
  11011011000,11011000110,11000110110,10100011000,10001011000,10001000110,10110001000,10001101000,10001100010,11010001000,
  11000101000,11000100010,10110111000,10110001110,10001101110,10111011000,10111000110,10001110110,11101110110,11010001110,
  11000101110,11011101000,11011100010,11011101110,11101011000,11101000110,11100010110,11101101000,11101100010,11100011010,
  11101111010,11001000010,11110001010,10100110000,10100001100,10010110000,10010000110,10000101100,10000100110,10110010000,
  10110000100,10011010000,10011000010,10000110100,10000110010,11000010010,11001010000,11110111010,11000010100,10001111010,
  10100111100,10010111100,10010011110,10111100100,10011110100,10011110010,11110100100,11110010100,11110010010,11011011110,
  11011110110,11110110110,10101111000,10100011110,10001011110,10111101000,10111100010,11110101000,11110100010,10111011110,
  10111101110,11101011110,11110101110,11010000100,11010010000,11010011100,1100011101011
];
function bitsCodigo128(texto){
  const s=String(texto||'').slice(0,40);
  if(!s) throw new Error('Escriba un código.');
  let suma=104, pesos='104';
  for(let i=0;i<s.length;i++){
    const v=s.charCodeAt(i)-32;
    if(v<0||v>94) throw new Error('El código solo admite letras, números y guiones.');
    pesos+=' '+v; suma+=v*(i+1);
  }
  pesos+=' '+(suma%103)+' 106';
  return pesos.split(' ').map(Number).map(function(i){ return String(CODE128_BARS[i]); }).join('');
}
function svgCodigoBarras(texto){
  const bits=bitsCodigo128(texto);
  const mod=2, quiet=14, h=84, textH=34;
  let rects='', x=quiet;
  for(let i=0;i<bits.length;i++){
    if(bits[i]==='1') rects+='<rect x="'+x+'" y="8" width="'+mod+'" height="'+h+'" fill="#0b1b14"/>';
    x+=mod;
  }
  const total=x+quiet, alto=h+textH+16;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+total+'" height="'+alto+'" viewBox="0 0 '+total+' '+alto+'">'+
    '<rect width="100%" height="100%" fill="#ffffff"/>'+rects+
    '<text x="'+(total/2)+'" y="'+(h+30)+'" font-family="Consolas,monospace" font-size="18" text-anchor="middle" fill="#14261f">'+esc(texto)+'</text></svg>';
}
function actualizarCodigoPrueba(){
  const c=document.getElementById('codigoPrueba');
  if(c) c.innerHTML=svgCodigoBarras(val('bcLote'));
  const r=document.getElementById('resultadoVerificacion');
  if(r){ r.className='msg'; r.textContent=''; }
}
function descargarCodigoPrueba(){
  const codigo=val('bcLote');
  descargarBlob(new Blob([svgCodigoBarras(codigo)],{type:'image/svg+xml;charset=utf-8'}),'codigo_'+codigo+'.svg');
  aud('Descarga de código de barras', codigo); guardarDB(); toast('Código de barras descargado.');
}
function imprimirCodigoPrueba(){
  const codigo=val('bcLote');
  const w=window.open('','_blank');
  if(!w) return toast('Permite ventanas emergentes para imprimir el código.');
  w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Código '+esc(codigo)+'</title>'+
    '<style>body{font-family:Consolas,monospace;text-align:center;padding:28px}h1{font-size:22px}h2{font-size:26px;margin:18px 0}'+
    'svg{max-width:100%;height:auto}.btn{margin-top:20px;padding:12px 20px;font-size:16px;cursor:pointer}</style></head><body>'+
    '<h1>AgroVerde S.A.C. — Código de prueba</h1><h2>'+esc(codigo)+'</h2>'+svgCodigoBarras(codigo)+
    '<br><button class="btn" onclick="window.print()">Imprimir código</button></body></html>');
  w.document.close();
}
function decodificarBits128(bits,inicioIdx){
  inicioIdx=(inicioIdx===undefined?104:inicioIdx); // 103=A, 104=B, 105=C
  const patrones={};
  for(let i=0;i<CODE128_BARS.length;i++) patrones[String(CODE128_BARS[i])]=i;
  const stop=String(CODE128_BARS[106]);
  const inicioPat=String(CODE128_BARS[inicioIdx]);
  if(bits.slice(0,inicioPat.length)!==inicioPat) throw new Error('Patrón de inicio no encontrado.');
  let p=inicioPat.length, suma=inicioIdx, pos=0, texto='', checksum=null;
  while(p<bits.length){
    if(bits.slice(p,p+stop.length)===stop) break;
    if(p+11>bits.length) throw new Error('Código incompleto.');
    const v=patrones[bits.slice(p,p+11)];
    if(v===undefined) throw new Error('Patrón desconocido en el código.');
    p+=11;
    if(bits.slice(p,p+stop.length)===stop){ checksum=v; break; }
    pos++;
    if(inicioIdx===105) texto+=('0'+v).slice(-2);
    else if(inicioIdx===103) texto+= v<64?String.fromCharCode(v+32):String.fromCharCode(v-64);
    else texto+=String.fromCharCode(v+32);
    suma+=v*pos;
  }
  if(checksum===null) throw new Error('No se encontró el patrón de parada.');
  if(suma%103!==checksum) throw new Error('El checksum no coincide.');
  return texto;
}
async function leerCodigo128DesdeSvg(svg){
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  try{
    const img=new Image();
    await new Promise(function(res,rej){ img.onload=res; img.onerror=function(){rej(new Error('No se pudo dibujar el código.'));}; img.src=url; });
    const canvas=document.createElement('canvas');
    canvas.width=img.naturalWidth||900; canvas.height=img.naturalHeight||180;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0);
    const datos=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const y=Math.floor(canvas.height*0.3);
    const oscuro=function(x){ const i=(y*canvas.width+x)*4; return datos[i]<140 && datos[i+1]<140 && datos[i+2]<140; };
    let inicio=-1;
    for(let x=0;x<canvas.width;x++){ if(oscuro(x)){ inicio=x; break; } }
    if(inicio<0) throw new Error('No se encontraron barras en la imagen.');
    let fin=inicio;
    while(fin<canvas.width && oscuro(fin)) fin++;
    const mod=Math.max(1,Math.round((fin-inicio)/2));
    let bits='';
    for(let x=inicio; x+mod<=canvas.width; x+=mod){
      const centro=Math.floor(x+mod/2);
      bits+=oscuro(centro)?'1':'0';
    }
    return decodificarBits128(bits);
  } finally { URL.revokeObjectURL(url); }
}
/* ---------- Lector interno de Code128 para cuadros de cámara ----------
   Funciona aunque el navegador no tenga BarcodeDetector (caso típico de PC).
   Busca el patrón de inicio en cada fila y valida el checksum antes de devolver. */
const START128=[
  {idx:104,pat:String(CODE128_BARS[104])},
  {idx:103,pat:String(CODE128_BARS[103])},
  {idx:105,pat:String(CODE128_BARS[105])}
];
const STOP128=String(CODE128_BARS[106]);
function bitsMuestreados128(lum,inicioX,modulo,maxModulos,ancho,umbral){
  let bits='';
  for(let b=0;b<maxModulos;b++){
    const px=Math.round(inicioX+(b+0.5)*modulo);
    if(px<0||px>=ancho) break;
    bits+=lum[px]<umbral?'1':'0';
    if(b>10 && bits.slice(-STOP128.length)===STOP128) break;
  }
  return bits;
}
function leerCode128DesdeCanvas(canvas){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const w=canvas.width,h=canvas.height;
  if(!w||!h) return null;
  const img=ctx.getImageData(0,0,w,h).data;
  const paso=Math.max(2,Math.round(h/80));
  const maxModulos=11+95*11+STOP128.length;
  for(let u=0;u<2;u++){
    const umbral=u?160:120;
    for(let y=Math.floor(h*0.04); y<Math.floor(h*0.96); y+=paso){
      const lum=new Float32Array(w);
      const runs=[]; let actual=null;
      for(let px=0;px<w;px++){
        const i=(y*w+px)*4;
        const v=img[i]*0.299+img[i+1]*0.587+img[i+2]*0.114;
        lum[px]=v;
        const dark=v<umbral;
        if(!actual || actual.dark!==dark){ actual={dark:dark,len:1,x:px}; runs.push(actual); }
        else actual.len++;
      }
      for(let r=0;r<runs.length-6;r++){
        if(!runs[r].dark || runs[r].len<2 || runs[r].len>40) continue;
        const bases=[runs[r].len/2,runs[r].len/4,runs[r].len];
        for(let b=0;b<bases.length;b++){
          const base=bases[b];
          if(base<1.2||base>18) continue;
          const desde=Math.max(1.2,base-0.4);
          for(let modulo=desde;modulo<=base+0.4;modulo+=0.02){
            for(let s=0;s<START128.length;s++){
              const st=START128[s];
              for(let dx=-1;dx<=1;dx++){
                const inicioX=runs[r].x+dx;
                const muestra=bitsMuestreados128(lum,inicioX,modulo,11,w,umbral);
                if(muestra.length<11) continue;
                let dif=0;
                for(let k=0;k<11;k++) if(muestra[k]!==st.pat[k]) dif++;
                if(dif>2) continue;
                const bits=bitsMuestreados128(lum,inicioX,modulo,maxModulos,w,umbral);
                try{ return decodificarBits128(bits,st.idx); }catch(e){}
              }
            }
          }
        }
      }
    }
  }
  return null;
}
async function verificarCodigoPrueba(){
  const codigo=val('bcLote');
  const svg=svgCodigoBarras(codigo);
  const salida=document.getElementById('resultadoVerificacion');
  if(!salida) return;
  salida.className='msg'; salida.textContent='Verificando el código...';
  let leido='', metodo='';
  try{
    if('BarcodeDetector' in window){
      const formatos=await BarcodeDetector.getSupportedFormats();
      if(formatos.includes('code_128')){
        const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
        try{
          const img=new Image();
          await new Promise(function(res,rej){ img.onload=res; img.onerror=function(){rej(new Error('No se pudo dibujar.'));}; img.src=url; });
          const canvas=document.createElement('canvas');
          canvas.width=img.naturalWidth||900; canvas.height=img.naturalHeight||180;
          canvas.getContext('2d').drawImage(img,0,0);
          const res=await new BarcodeDetector({formats:['code_128']}).detect(canvas);
          if(res.length) leido=String(res[0].rawValue);
          metodo='BarcodeDetector del navegador';
        } finally { URL.revokeObjectURL(url); }
      }
    }
    if(!leido){ leido=await leerCodigo128DesdeSvg(svg); metodo='lector interno Code128'; }
    if(leido===codigo){
      salida.className='msg ok';
      salida.textContent='✓ Verificación correcta ('+metodo+'): el lector devolvió "'+leido+'". El código es escaneable.';
      aud('Verificación de código de barras', codigo+' → OK ('+metodo+')');
    } else {
      salida.className='msg err';
      salida.textContent='El lector devolvió "'+(leido||'ningún valor')+'" en vez de "'+codigo+'".';
      aud('Verificación de código de barras', codigo+' → falló');
    }
  }catch(err){
    salida.className='msg err';
    salida.textContent='No se pudo verificar: '+err.message+'. Prueba escaneándolo con otro celular.';
  }
  guardarDB();
}

/* ---------- Escáner QR / código de barras ---------- */
function esEquipoEscritorio(){
  if(!window.matchMedia) return innerWidth>=700;
  return innerWidth>=700 && matchMedia('(pointer:fine)').matches;
}
function actualizarSelectorCamaras(textoEstado){
  const sel=document.getElementById('camaraDispositivo');
  if(sel){
    const anterior=sel.value;
    sel.innerHTML='<option value="">Predeterminada</option>'+
      '<option value="environment">Trasera (celular)</option>'+
      '<option value="user">Frontal (celular)</option>'+
      camarasDisponibles.map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.label)+'</option>'; }).join('');
    if(anterior && Array.from(sel.options).some(function(o){ return o.value===anterior; })) sel.value=anterior;
  }
  const estado=document.getElementById('estadoCamaras');
  if(estado && textoEstado) estado.textContent=textoEstado;
}
async function listarCamarasSinPermiso(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
  try{
    const devices=await navigator.mediaDevices.enumerateDevices();
    camarasDisponibles=devices.filter(function(d){ return d.kind==='videoinput'; })
      .map(function(d,i){ return {id:d.deviceId,label:d.label||('Cámara '+(i+1))}; });
    actualizarSelectorCamaras(camarasDisponibles.length
      ? 'Cámaras detectadas: '+camarasDisponibles.length+'. Pulsa «Detectar cámaras» para ver sus nombres.'
      : '');
  }catch(e){}
}
async function detectarCamaras(){
  const estado=document.getElementById('estadoCamaras');
  if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices){
    if(estado) estado.textContent='Este navegador no permite enumerar cámaras. Puedes usar la predeterminada.';
    return;
  }
  if(estado) estado.textContent='Detectando cámaras...';
  let temporal=null;
  try{
    if(!streamCamara) temporal=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    const devices=await navigator.mediaDevices.enumerateDevices();
    camarasDisponibles=devices.filter(function(d){ return d.kind==='videoinput'; })
      .map(function(d,i){ return {id:d.deviceId,label:d.label||('Cámara '+(i+1))}; });
  }catch(err){
    try{
      const devices=await navigator.mediaDevices.enumerateDevices();
      camarasDisponibles=devices.filter(function(d){ return d.kind==='videoinput'; })
        .map(function(d,i){ return {id:d.deviceId,label:d.label||('Cámara '+(i+1))}; });
    }catch(e){ camarasDisponibles=[]; }
  }finally{
    if(temporal) temporal.getTracks().forEach(function(t){ t.stop(); });
  }
  actualizarSelectorCamaras(camarasDisponibles.length
    ? 'Se detectaron '+camarasDisponibles.length+' cámara(s). Elige una y activa el escáner.'
    : 'No se detectaron cámaras. Revisa el permiso del navegador o usa la captura manual.');
}
function vEscanear(){
  const escritorio=esEquipoEscritorio();
  return `<h2>Escáner de lote <small>(apoyo a RF01 · RF03)</small></h2>
  <div class="card">
    <p>Apunta la cámara al <b>QR o código de barras</b> del lote. Al leerlo podrás verlo en Consulta, generar su trazabilidad o usar el código en un nuevo cierre.</p>
    <div class="camara-controles">
      <label>Cámara <select id="camaraDispositivo">
        <option value="">Predeterminada</option>
        <option value="environment">Trasera (celular)</option>
        <option value="user">Frontal (celular)</option>
        ${camarasDisponibles.map(function(c){ return '<option value="'+esc(c.id)+'">'+esc(c.label)+'</option>'; }).join('')}
      </select></label>
      <button class="btn small ghost" type="button" onclick="detectarCamaras()">🔎 Detectar cámaras</button>
    </div>
    <p id="estadoCamaras" class="hint"></p>
    <div class="scanner-box" id="camaraBox">
      <video id="camaraVideo" playsinline muted autoplay></video>
      <div class="scanner-marca"></div>
      <div id="scannerMensaje" class="scanner-overlay">Cámara apagada</div>
      <button class="scanner-salir" onclick="detenerEscaneo()" aria-label="Cerrar cámara">✕ Salir</button>
    </div>
    <p class="acciones-tabla">
      <button class="btn" onclick="iniciarEscaneo()">${escritorio?'📷 Activar cámara de PC':'📷 Activar cámara (pantalla completa)'}</button>
      <button class="btn ghost" onclick="detenerEscaneo()">⏹ Detener cámara</button>
    </p>
    <div id="resultadoEscaneo" class="msg"></div>
    <p class="hint">${escritorio
      ? 'En computadora selecciona tu cámara web y pulsa «Activar cámara de PC». La lectura de <b>códigos de barras Code128</b> funciona aunque el navegador no tenga lector nativo; para QR se necesita un navegador con BarcodeDetector (Chrome/Edge recientes).'
      : 'La cámara necesita el link publicado (HTTPS) y permiso del navegador. Al activarla ocupa toda la pantalla; toca <b>Salir</b> o presiona Esc para volver. Si tu equipo no la soporta, usa la captura manual.'}</p>
  </div>
  <div class="card"><h3>Código de barras de prueba</h3>
    <p>Genera un <b>Code128</b> real para verificar el lector. Muestra este código en otra pantalla o imprímelo y escanealo desde la cámara.</p>
    <label>Lote del código <select id="bcLote" onchange="actualizarCodigoPrueba()">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <div id="codigoPrueba" class="codigo-barras">${svgCodigoBarras(db.lotes[0]?db.lotes[0].codigo:'LOTE-2026-001')}</div>
    <div class="acciones-tabla">
      <button class="btn small" onclick="descargarCodigoPrueba()">⬇ Descargar SVG</button>
      <button class="btn small ghost" onclick="imprimirCodigoPrueba()">🖨 Imprimir código</button>
      <button class="btn small ghost" onclick="verificarCodigoPrueba()">✓ Verificar lectura</button>
    </div>
    <div id="resultadoVerificacion" class="msg"></div>
    <p class="hint">También hay una copia lista para usar en <code>codigo_barras_prueba.svg</code> dentro del ZIP.</p>
  </div>
  <div class="card"><h3>Captura manual del código</h3><form onsubmit="procesarCodigoManual(event)">
    <label>Código del lote <input id="escanManual" placeholder="LOTE-2026-001" required autocomplete="off"></label>
    <button class="btn" type="submit">Buscar código</button>
  </form></div>`;
}
async function iniciarEscaneo(){
  const video=document.getElementById('camaraVideo');
  const msg=document.getElementById('scannerMensaje');
  if(!video||!msg) return;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    msg.textContent='Este navegador no permite usar la cámara. Usa la captura manual.';
    return toast('Cámara no disponible: usa la captura manual.');
  }
  detenerEscaneo(true);
  const escritorio=esEquipoEscritorio();
  // En celular se pide pantalla completa ANTES de cualquier await: el navegador
  // solo la concede mientras el gesto del botón (onclick) sigue activo.
  if(!escritorio) ponerPantallaCompleta(document.getElementById('camaraBox'),video);
  const selector=document.getElementById('camaraDispositivo');
  const elegido=selector?selector.value:'';
  let videoConstraints;
  if(elegido && elegido!=='user' && elegido!=='environment'){
    videoConstraints={deviceId:{exact:elegido},width:{ideal:1280},height:{ideal:720}};
  } else if(elegido==='user'){
    videoConstraints={facingMode:'user',width:{ideal:1280},height:{ideal:720}};
  } else if(elegido==='environment' || !escritorio){
    videoConstraints={facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}};
  } else {
    videoConstraints={width:{ideal:1280},height:{ideal:720}};
  }
  try{
    streamCamara=await navigator.mediaDevices.getUserMedia({video:videoConstraints,audio:false});
    video.srcObject=streamCamara;
    await video.play();
    if(!escritorio && !document.fullscreenElement && video.webkitEnterFullscreen){
      try{ video.webkitEnterFullscreen(); }catch(e){}
    }
    let soportaQR=false;
    detectorCodigos=null;
    if('BarcodeDetector' in window){
      try{
        const formatos=await BarcodeDetector.getSupportedFormats();
        const preferidos=['qr_code','code_128','code_39','ean_13','ean_8','upc_a','upc_e','itf','codabar'];
        const usar=preferidos.filter(f=>formatos.includes(f));
        if(usar.length){
          detectorCodigos=new BarcodeDetector({formats:usar});
          soportaQR=true;
        }
      }catch(e){ detectorCodigos=null; }
    }
    escaneoActivo=true;
    msg.textContent=soportaQR
      ? 'Cámara activa · apunta al QR o código de barras · ✕ Salir o Esc para cerrar'
      : 'Cámara activa · lector interno de código de barras · ✕ Salir para cerrar';
    bucleEscaneo();
    toast(escritorio?'Cámara de PC activada.':'Cámara activada.');
  }catch(err){
    detenerEscaneo(true);
    msg.textContent='No se pudo activar la cámara: '+((err&&err.message)?err.message:'permiso denegado');
    toast('No se pudo activar la cámara. Usa la captura manual.');
  }
}
function ponerPantallaCompleta(box,video){
  try{
    if(box && box.requestFullscreen) box.requestFullscreen().catch(function(){});
    else if(video && video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  }catch(e){}
}
function detenerEscaneo(silencioso){
  escaneoActivo=false;
  ultimoAnalisisInterno=0;
  try{ if(document.fullscreenElement) document.exitFullscreen().catch(function(){}); }catch(e){}
  if(streamCamara){ streamCamara.getTracks().forEach(function(t){ t.stop(); }); streamCamara=null; }
  const video=document.getElementById('camaraVideo');
  if(video){ try{ video.pause(); video.srcObject=null; }catch(e){} }
  const msg=document.getElementById('scannerMensaje');
  if(msg) msg.textContent='Cámara apagada';
  if(!silencioso){ const r=document.getElementById('resultadoEscaneo'); if(r){ r.className='msg'; r.textContent=''; } }
}
document.addEventListener('fullscreenchange',function(){
  if(!document.fullscreenElement && escaneoActivo) detenerEscaneo(true);
});
async function bucleEscaneo(){
  if(!escaneoActivo) return;
  const video=document.getElementById('camaraVideo');
  if(video && video.readyState>=2){
    // 1) Lector nativo del navegador (QR y otros formatos), si existe.
    if(detectorCodigos){
      try{
        const codigos=await detectorCodigos.detect(video);
        if(codigos.length){
          const raw=codigos[0].rawValue;
          const ahoraMs=Date.now();
          if(raw && ahoraMs-ultimoEscaneo>1500){ ultimoEscaneo=ahoraMs; procesarCodigo(raw,true); }
        }
      }catch(e){}
    }
    // 2) Lector interno Code128 sobre el cuadro de video (funciona en PC sin BarcodeDetector).
    const ahora=Date.now();
    if(ahora-ultimoAnalisisInterno>220){
      ultimoAnalisisInterno=ahora;
      try{
        if(!canvasEscaneo) canvasEscaneo=document.createElement('canvas');
        const vw=video.videoWidth||640, vh=video.videoHeight||480;
        const escala=Math.min(1,520/vw);
        canvasEscaneo.width=Math.max(1,Math.round(vw*escala));
        canvasEscaneo.height=Math.max(1,Math.round(vh*escala));
        const ctx=canvasEscaneo.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(video,0,0,canvasEscaneo.width,canvasEscaneo.height);
        const codigo=leerCode128DesdeCanvas(canvasEscaneo);
        if(codigo && Date.now()-ultimoEscaneo>1500){ ultimoEscaneo=Date.now(); procesarCodigo(codigo,true); }
      }catch(e){}
    }
  }
  if(escaneoActivo) requestAnimationFrame(bucleEscaneo);
}
function extraerCodigo(raw){
  let s=String(raw||'').trim();
  try{ const j=JSON.parse(s); if(j && j.codigo) s=String(j.codigo); }catch(e){}
  const m=s.match(/LOTE[-_][A-Za-z0-9-]+/i);
  return (m?m[0]:s).toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,60);
}
function procesarCodigoManual(e){ e.preventDefault(); procesarCodigo(val('escanManual'),false); }
function procesarCodigo(raw,desdeCamara){
  const codigo=extraerCodigo(raw);
  const r=document.getElementById('resultadoEscaneo');
  if(!r) return;
  if(!codigo) return toast('No se pudo leer un código.');
  if(desdeCamara) detenerEscaneo(true);
  const l=db.lotes.find(x=>x.codigo.toUpperCase()===codigo);
  if(l){
    r.className='msg ok';
    r.innerHTML=`<b>Código leído:</b> ${esc(codigo)}<br>Línea ${esc(l.linea)} · ${l.cantidad} und · estado <b>${esc(l.estado)}</b> · ${esc(l.ubicacion)}.
      <div class="acciones-tabla">
        <button class="btn small" onclick="buscarCodigo('${esc(codigo)}')">Ver en Consulta</button>
        ${tiene('trazabilidad')?`<button class="btn small ghost" onclick="verTrazabilidadCodigo('${esc(codigo)}')">Ver trazabilidad</button>`:''}
        ${tiene('cierre')?`<button class="btn small ghost" onclick="usarCodigoEnCierre('${esc(codigo)}')">Registrar cierre</button>`:''}
      </div>`;
    aud('Escaneo de lote', codigo+(desdeCamara?' (cámara)':' (manual)'));
  } else {
    r.className='msg err';
    r.innerHTML=`<b>Código ${esc(codigo)} no encontrado</b> en este dispositivo. Puedes usarlo para un nuevo cierre.
      ${tiene('cierre')?`<div class="acciones-tabla"><button class="btn small" onclick="usarCodigoEnCierre('${esc(codigo)}')">Registrar cierre con este código</button></div>`:''}`;
    aud('Escaneo sin coincidencia', codigo);
  }
  guardarDB();
}
function buscarCodigo(codigo){ detenerEscaneo(true); ir('consulta'); const i=document.getElementById('busq'); if(i) i.value=codigo; buscar({preventDefault:function(){}}); }
function verTrazabilidadCodigo(codigo){ detenerEscaneo(true); ir('trazabilidad'); const s=document.getElementById('trzLote'); if(s) s.value=codigo; verTrazabilidad(); }
function usarCodigoEnCierre(codigo){ detenerEscaneo(true); ir('cierre'); const i=document.getElementById('cieCod'); if(i){ i.value=codigo; i.focus(); } }

function vValidar(){
  const pend=db.lotes.filter(l=>l.estado!=='Validado');
  return `<h2>Validación de lotes <small>(RN03 — solo Jefe/Administrador)</small></h2>
  <div class="card"><div class="table-scroll"><table><tr><th>Código</th><th>Línea</th><th>Cantidad</th><th>Estado actual</th><th>Acción</th></tr>
  ${pend.length?pend.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${l.cantidad}</td><td><span class="estado pend">${esc(l.estado)}</span></td><td><button class="btn small" onclick="validarLote('${esc(l.codigo)}')">Validar</button></td></tr>`).join(''):'<tr><td colspan="5">No hay lotes pendientes de validación.</td></tr>'}</table></div></div>`;
}
function validarLote(codigo){
  const l=db.lotes.find(x=>x.codigo===codigo); if(!l) return;
  l.estado='Validado'; l.sync='Sincronizado'; aud('Validación de lote', codigo+' → Validado'); guardarDB(); ir('validar'); toast(codigo+' validado correctamente (CU01).');
}
function vOffline(){
  const pend=db.lotes.filter(l=>l.sync.startsWith('Pendiente'));
  return `<h2>Modo offline y sincronización <small>(RF02 · CU02 · RN06)</small></h2>
  <div class="card"><p><b>Estado actual:</b> ${db.modoOffline?'📴 Sin conexión — credenciales en caché activas (RN06)':'🌐 En línea'}</p>
  <button class="btn ${db.modoOffline?'warn':''}" onclick="cambiarModo()">${db.modoOffline?'Volver a conectarse':'Probar modo offline'}</button>
  <button class="btn" onclick="sincronizar()" ${pend.length?'':'disabled'}>Sincronizar ${pend.length} pendiente(s)</button></div>
  <div class="card"><h3>Registros pendientes</h3><div class="table-scroll"><table><tr><th>Código</th><th>Fecha de captura</th><th>Estado</th></tr>
  ${pend.length?pend.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.sync.replace('Pendiente de sincronización · ',''))}</td><td><span class="estado pend">Pendiente</span></td></tr>`).join(''):'<tr><td colspan="3">Sin registros pendientes.</td></tr>'}</table></div></div>`;
}
function sincronizar(){
  let n=0; db.lotes.forEach(l=>{ if(l.sync.startsWith('Pendiente')){ l.sync='Sincronizado'; if(l.estado==='Pendiente') l.estado='Registrado'; n++; } });
  aud('Sincronización', n+' registro(s) pendiente(s) cerrados'); guardarDB(); ir('offline'); toast(n+' registro(s) sincronizados.');
}
function vConsulta(){
  ultimaConsulta=db.lotes.slice();
  return `<h2>Consulta y búsqueda de lotes <small>(RF03 · RF08 · RNF05)</small></h2>
  <div class="card"><form onsubmit="buscar(event)"><div class="grid">
    <label>Código, línea o fecha <input id="busq" placeholder="Ej. LOTE-2026-001 o L1" autocomplete="off"></label>
    <label>Fecha exacta <input id="busqFecha" type="date"></label>
  </div><button class="btn" type="submit">Buscar</button>
  ${tiene('escanear')?'<button class="btn ghost" type="button" onclick="ir(\'escanear\')">📷 Escanear código</button>':''}</form>
  <div id="tiempo" class="msg"></div></div>
  <div class="card" id="resultados">${tablaConDescarga(ultimaConsulta)}</div>`;
}
function tablaLotes(lista){
  return `<table><tr><th>Código</th><th>Línea</th><th>Fecha</th><th>Cantidad</th><th>Estado</th><th>Ubicación</th></tr>
  ${lista.length?lista.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${esc(l.fecha)}</td><td>${l.cantidad}</td><td><span class="estado ${l.estado==='Validado'?'ok':'pend'}">${esc(l.estado)}</span></td><td>${esc(l.ubicacion)}</td></tr>`).join(''):'<tr><td colspan="6">Sin resultados.</td></tr>'}</table>`;
}
function tablaConDescarga(lista){
  return tablaLotes(lista)+'<div class="acciones-tabla"><button class="btn small ghost" onclick="descargarConsultaCSV()">⬇ Descargar CSV</button></div>';
}
function buscar(e){
  e.preventDefault(); const t0=performance.now();
  const q=val('busq').toLowerCase(), f=val('busqFecha');
  const r=db.lotes.filter(l=>(!q||l.codigo.toLowerCase().includes(q)||l.linea.toLowerCase().includes(q)||l.fecha.includes(q))&&(!f||l.fecha===f));
  const ms=performance.now()-t0;
  ultimaConsulta=r;
  document.getElementById('resultados').innerHTML=tablaConDescarga(r);
  document.getElementById('tiempo').className='msg '+(ms<=3000?'ok':'err');
  document.getElementById('tiempo').textContent=`Consulta en ${ms.toFixed(2)} ms · umbral RNF05 ≤ 3000 ms (p95): ${ms<=3000?'CUMPLE':'NO CUMPLE'} · ${r.length} resultado(s)`;
  aud('Consulta de lotes', `filtro="${q}" fecha="${f}" · ${r.length} resultados · ${ms.toFixed(1)} ms`); guardarDB();
}
function descargarConsultaCSV(){
  if(!ultimaConsulta.length) return toast('No hay resultados para descargar.');
  const filas=[['AgroVerde S.A.C. — Consulta de lotes'],['Generado',ahora()],[],
    ['Código','Línea','Fecha','Cantidad','Estado','Ubicación']].concat(ultimaConsulta.map(l=>[l.codigo,l.linea,l.fecha,l.cantidad,l.estado,l.ubicacion]));
  guardarCSV(filas,'consulta_lotes_'+new Date().toISOString().slice(0,10)+'.csv');
  aud('Descarga de reporte CSV','Consulta de lotes · '+ultimaConsulta.length+' fila(s)'); guardarDB();
  toast('Consulta descargada en CSV.');
}
function vIngreso(){
  return `<h2>Ingreso a almacén y stock <small>(RF04 · CU04)</small></h2>
  <div class="card"><form onsubmit="registrarIngreso(event)"><div class="grid">
    <label>Lote <select id="ingLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Cantidad <input id="ingCant" type="number" min="1" required></label>
    <label>Motivo <select id="ingMotivo"><option>Ingreso de producción</option><option>Devolución</option><option>Ajuste</option></select></label>
  </div><button class="btn" type="submit">Registrar ingreso</button></form></div>
  <div class="card"><h3>Stock actual</h3><div class="table-scroll"><table><tr><th>Lote</th><th>Stock</th></tr>${Object.entries(db.stock).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</table></div>
  <h3>Movimientos</h3><div class="table-scroll"><table><tr><th>Fecha</th><th>Lote</th><th>Cantidad</th><th>Motivo</th></tr>
  ${db.movimientos.length?db.movimientos.map(m=>`<tr><td>${esc(m.fecha)}</td><td>${esc(m.lote)}</td><td>${m.cantidad}</td><td>${esc(m.motivo)}</td></tr>`).join(''):'<tr><td colspan="4">Sin movimientos.</td></tr>'}</table></div></div>`;
}
function registrarIngreso(e){
  e.preventDefault(); const lote=val('ingLote'), cant=Number(val('ingCant'));
  if(!(cant>0)) return toast('La cantidad debe ser mayor a cero.');
  db.stock[lote]=(db.stock[lote]||0)+cant;
  const l=db.lotes.find(x=>x.codigo===lote); if(l) l.ubicacion='Almacén';
  db.movimientos.unshift({fecha:ahora(),lote,cantidad:cant,motivo:val('ingMotivo')});
  aud('Ingreso a almacén', lote+' +'+cant); guardarDB(); ir('ingreso'); toast('Ingreso registrado y stock actualizado.');
}
function vConciliacion(){
  const filas=db.pedidos.map(p=>{const s=db.stock[p.lote]||0;return {lote:p.lote,stock:s,pedido:p.cantidad,diferencia:s-p.cantidad};});
  return `<h2>Conciliación de stock y pedidos <small>(RF05 · CU05 / CU05a)</small></h2>
  <div class="card"><div class="table-scroll"><table><tr><th>Lote</th><th>Stock</th><th>Pedidos comprometidos</th><th>Diferencia</th></tr>
  ${filas.map(f=>`<tr><td>${esc(f.lote)}</td><td>${f.stock}</td><td>${f.pedido}</td><td><span class="estado ${f.diferencia<0?'bad':'ok'}">${f.diferencia}</span></td></tr>`).join('')}</table></div></div>
  <div class="card"><form onsubmit="registrarDiferencia(event)"><div class="grid">
    <label>Lote <select id="difLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Diferencia física <input id="difCant" type="number" required></label>
    <label>Motivo <input id="difMotivo" required placeholder="Ej. merma detectada"></label>
  </div><button class="btn" type="submit">Registrar diferencia (RN08)</button></form></div>
  <div class="card"><h3>Diferencias registradas</h3><div class="table-scroll"><table><tr><th>Fecha</th><th>Lote</th><th>Diferencia</th><th>Motivo</th><th>Responsable</th></tr>
  ${db.conciliaciones.length?db.conciliaciones.map(c=>`<tr><td>${esc(c.fecha)}</td><td>${esc(c.lote)}</td><td>${c.cantidad}</td><td>${esc(c.motivo)}</td><td>${esc(c.usuario)}</td></tr>`).join(''):'<tr><td colspan="5">Sin diferencias registradas.</td></tr>'}</table></div></div>`;
}
function registrarDiferencia(e){
  e.preventDefault();
  db.conciliaciones.unshift({fecha:ahora(),lote:val('difLote'),cantidad:Number(val('difCant')),motivo:val('difMotivo'),usuario:actual.nombre});
  aud('Diferencia física (CU05a)', val('difLote')+' · '+val('difMotivo')); guardarDB(); ir('conciliacion'); toast('Diferencia registrada con responsable y motivo.');
}
function vPersonal(){
  return `<h2>Datos de trabajadores y consentimiento <small>(RF06 · RF11 · RNF02 · RN09)</small></h2>
  <div class="card"><form onsubmit="registrarTrabajador(event)"><div class="grid">
    <label>DNI <input id="trDni" required maxlength="8"></label>
    <label>Nombre <input id="trNom" required></label>
    <label>Cargo <input id="trCargo" required></label>
    <label>Vigencia del consentimiento <input id="trFin" type="date" required></label>
  </div><label><input id="trVigente" type="checkbox" checked style="width:auto;margin-right:8px"> Consentimiento informado vigente (Ley N.° 29733)</label>
  <button class="btn" type="submit">Guardar trabajador</button></form></div>
  <div class="card"><div class="table-scroll"><table><tr><th>DNI</th><th>Nombre</th><th>Cargo</th><th>Vigencia</th><th>Estado del legajo</th></tr>
  ${db.trabajadores.map(t=>`<tr><td>${esc(t.dni)}</td><td>${esc(t.nombre)}</td><td>${esc(t.cargo)}</td><td>${esc(t.fin)}</td><td><span class="estado ${t.estado==='ACTIVO'?'ok':'bad'}">${esc(t.estado)}</span></td></tr>`).join('')}</table></div></div>`;
}
function registrarTrabajador(e){
  e.preventDefault(); const dni=val('trDni');
  if(db.trabajadores.some(t=>t.dni===dni)) return toast('El DNI ya está registrado.');
  const vigente=document.getElementById('trVigente').checked;
  db.trabajadores.unshift({dni,nombre:val('trNom'),cargo:val('trCargo'),vigente,fin:val('trFin'),
    estado:vigente?'ACTIVO':'BLOQUEADO — sin consentimiento'});
  aud('Alta de trabajador', dni+' · '+(vigente?'consentimiento vigente':'legajo bloqueado RN09'));
  guardarDB(); ir('personal'); toast(vigente?'Trabajador activo (RF11).':'Legajo bloqueado por falta de consentimiento vigente.');
}
function vDocumentos(){
  return `<h2>Documentos de exportación <small>(RF07 · CU07 · RN04)</small></h2>
  <div class="card"><form onsubmit="generarDocumento(event)"><div class="grid">
    <label>Lote validado <select id="docLote">${db.lotes.filter(l=>l.estado==='Validado').map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Tipo <select id="docTipo"><option>Factura</option><option>Packing list</option></select></label>
  </div><button class="btn" type="submit">Generar documento</button></form></div>
  <div class="card"><h3>Documentos emitidos</h3><div class="table-scroll"><table><tr><th>Fecha</th><th>Tipo</th><th>Lote</th><th>N.°</th></tr>
  ${db.documentos.length?db.documentos.map(d=>`<tr><td>${esc(d.fecha)}</td><td>${esc(d.tipo)}</td><td>${esc(d.lote)}</td><td>${esc(d.numero)}</td></tr>`).join(''):'<tr><td colspan="4">Sin documentos emitidos.</td></tr>'}</table></div></div>`;
}
function generarDocumento(e){
  e.preventDefault(); const lote=val('docLote'), tipo=val('docTipo');
  const l=db.lotes.find(x=>x.codigo===lote);
  if(!l||l.estado!=='Validado') return toast('RN04: solo se documentan lotes validados.');
  const numero=(tipo==='Factura'?'F':'PL')+'-'+Date.now().toString().slice(-6);
  db.documentos.unshift({fecha:ahora(),tipo,lote,numero}); aud('Emisión de documento', tipo+' '+numero+' · '+lote); guardarDB();
  abrirModal(`<h2>${tipo} ${numero}</h2><p><b>AgroVerde S.A.C.</b> — Remitente de exportación</p>
  <table><tr><th>Lote</th><th>Línea</th><th>Fecha</th><th>Cantidad</th><th>Destino</th></tr>
  <tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${esc(l.fecha)}</td><td>${l.cantidad}</td><td>Cliente de exportación</td></tr></table>
  <p style="margin-top:18px">Documento generado electrónicamente · ${esc(ahora())}</p>
  <button class="btn" onclick="imprimir()">Imprimir / guardar PDF</button> <button class="btn ghost" onclick="cerrarModal()">Cerrar</button>`);
  ir('documentos');
}
function vTrazabilidad(){
  return `<h2>Reporte de trazabilidad <small>(RF09 · CU08)</small></h2>
  <div class="card"><label>Seleccionar lote <select id="trzLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
  <button class="btn" onclick="verTrazabilidad()">Generar reporte</button>
  ${tiene('escanear')?'<button class="btn ghost" type="button" onclick="ir(\'escanear\')">📷 Escanear lote</button>':''}</div>
  <div class="card" id="trzSalida">Seleccione un lote y genere el reporte.</div>`;
}
function eventosLote(lote){
  const eventos=[];
  db.lotes.filter(l=>l.codigo===lote).forEach(l=>eventos.push({f:l.fecha,t:'Cierre de lote',d:'Línea '+l.linea+' · '+l.cantidad+' uds · '+l.estado}));
  db.movimientos.filter(m=>m.lote===lote).forEach(m=>eventos.push({f:m.fecha,t:'Ingreso a almacén',d:'+'+m.cantidad+' · '+m.motivo}));
  db.conciliaciones.filter(c=>c.lote===lote).forEach(c=>eventos.push({f:c.fecha,t:'Conciliación',d:c.cantidad+' · '+c.motivo}));
  db.consumo.filter(c=>c.lote===lote).forEach(c=>eventos.push({f:c.fecha,t:'Agua y mermas',d:c.agua+' L · '+c.mermas+' kg'}));
  db.documentos.filter(d=>d.lote===lote).forEach(d=>eventos.push({f:d.fecha,t:d.tipo,d:'N.° '+d.numero}));
  db.auditoria.filter(a=>a.detalle.includes(lote)).forEach(a=>eventos.push({f:a.fecha,t:a.accion,d:a.detalle}));
  return eventos;
}
function verTrazabilidad(){
  const lote=val('trzLote'); const eventos=eventosLote(lote);
  ultimoReporte={lote:lote,eventos:eventos};
  document.getElementById('trzSalida').innerHTML=`<h3>Línea de tiempo: ${esc(lote)}</h3>
  <div class="table-scroll"><table><tr><th>Fecha</th><th>Evento</th><th>Detalle</th></tr>
  ${eventos.map(x=>`<tr><td>${esc(x.f)}</td><td>${esc(x.t)}</td><td>${esc(x.d)}</td></tr>`).join('')}</table></div>
  <p class="acciones-tabla" style="margin-top:14px">
    <button class="btn" onclick="descargarCSV()">⬇ Descargar CSV</button>
    <button class="btn ghost" onclick="imprimir()">🖨 Guardar PDF (imprimir)</button>
  </p>`;
  aud('Reporte de trazabilidad', lote); guardarDB();
}
function descargarCSV(){
  if(!ultimoReporte) return toast('Primero genera un reporte de trazabilidad.');
  const filas=[['AgroVerde S.A.C. — Reporte de trazabilidad'],['Lote',ultimoReporte.lote],['Generado',ahora()],[],
    ['Fecha','Evento','Detalle']].concat(ultimoReporte.eventos.map(e=>[e.f,e.t,e.d]));
  guardarCSV(filas,'trazabilidad_'+ultimoReporte.lote+'_'+new Date().toISOString().slice(0,10)+'.csv');
  aud('Descarga de reporte CSV', 'Trazabilidad · '+ultimoReporte.lote); guardarDB();
  toast('Reporte descargado en CSV.');
}
function vConsumo(){
  return `<h2>Consumo de agua y mermas <small>(RF10 · CU09)</small></h2>
  <div class="card"><form onsubmit="registrarConsumo(event)"><div class="grid">
    <label>Lote <select id="conLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Agua (litros) <input id="conAgua" type="number" min="0" required></label>
    <label>Mermas (kg) <input id="conMermas" type="number" min="0" required></label>
  </div><button class="btn" type="submit">Registrar consumo</button></form></div>
  <div class="card"><div class="table-scroll"><table><tr><th>Fecha</th><th>Lote</th><th>Agua (L)</th><th>Mermas (kg)</th></tr>
  ${db.consumo.length?db.consumo.map(c=>`<tr><td>${esc(c.fecha)}</td><td>${esc(c.lote)}</td><td>${c.agua}</td><td>${c.mermas}</td></tr>`).join(''):'<tr><td colspan="4">Sin registros.</td></tr>'}</table></div></div>`;
}
function registrarConsumo(e){
  e.preventDefault(); db.consumo.unshift({fecha:ahora(),lote:val('conLote'),agua:Number(val('conAgua')),mermas:Number(val('conMermas'))});
  aud('Registro ambiental', val('conLote')); guardarDB(); ir('consumo'); toast('Consumo y mermas registrados por lote.');
}

/* ---------- Auditoría, respaldos y reportes ---------- */
function vAuditoria(){
  return `<h2>Auditoría del sistema <small>(CL06 · RN10)</small></h2>
  <div class="card">
    <div class="acciones-tabla">
      <button class="btn small" onclick="exportarDatos()">⬆ Exportar JSON</button>
      <button class="btn small ghost" onclick="document.getElementById('archivoImportar').click()">⬇ Importar JSON</button>
      <input id="archivoImportar" type="file" accept="application/json,.json" class="hidden" onchange="importarDatos(event)">
      <button class="btn small ghost" onclick="descargarAuditoriaCSV()">⬇ Descargar auditoría CSV</button>
    </div>
    <p class="hint">El respaldo JSON conserva usuarios, lotes, stock, trabajadores y bitácora. Permite pasar datos entre dispositivos sin backend; la sincronización sigue siendo simulada.</p>
  </div>
  <div class="card"><h3>Bitácora</h3><div class="table-scroll"><table><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr>
  ${db.auditoria.map(a=>`<tr><td>${esc(a.fecha)}</td><td>${esc(a.usuario)}</td><td>${esc(a.accion)}</td><td>${esc(a.detalle)}</td></tr>`).join('')}</table></div></div>
  <div class="card"><button class="btn warn" onclick="restablecer()">Restablecer datos de prueba</button></div>`;
}
function descargarAuditoriaCSV(){
  const filas=[['AgroVerde S.A.C. — Auditoría'],['Generado',ahora()],[],['Fecha','Usuario','Acción','Detalle']]
    .concat(db.auditoria.map(a=>[a.fecha,a.usuario,a.accion,a.detalle]));
  guardarCSV(filas,'auditoria_'+new Date().toISOString().slice(0,10)+'.csv');
  aud('Descarga de auditoría CSV', db.auditoria.length+' registro(s)'); guardarDB();
  toast('Auditoría descargada en CSV.');
}
function exportarDatos(){
  const nombre='agroverde_respaldo_'+new Date().toISOString().slice(0,10)+'.json';
  const payload=Object.assign({},db,{_export:{app:'AgroVerde S.A.C.',version:1,fecha:ahora(),usuario:actual?actual.usuario:''}});
  descargarBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),nombre);
  aud('Exportación de datos', nombre); guardarDB(); toast('Respaldo JSON descargado.');
}
function importarDatos(e){
  const file=e.target.files && e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(){
    try{
      const datos=JSON.parse(reader.result);
      if(!datos || typeof datos!=='object' || !Array.isArray(datos.lotes) || !datos.stock || typeof datos.stock!=='object'){
        throw new Error('El archivo no tiene el formato AgroVerde.');
      }
      if(!confirm('Se reemplazarán los datos de este dispositivo con "'+file.name+'". ¿Continuar?')){ e.target.value=''; return; }
      const sesion=db.session, modo=db.modoOffline, cache=Object.assign({},db.cache||{});
      const base=semilla();
      const normal=Object.assign(base,datos);
      ['lotes','movimientos','conciliaciones','documentos','consumo','pedidos','trabajadores','auditoria','usuarios'].forEach(function(k){
        if(!Array.isArray(normal[k])) normal[k]=base[k];
      });
      if(!normal.stock || typeof normal.stock!=='object') normal.stock=base.stock;
      if(!normal.cache || typeof normal.cache!=='object') normal.cache={};
      normal.cache=Object.assign({},cache,normal.cache,datos.cache||{});
      if(!normal.usuarios.length) normal.usuarios=USUARIOS_SEMILLA.map(u=>({...u}));
      const actualPrevio=listaUsuarios().find(u=>actual && u.usuario===actual.usuario);
      if(actualPrevio && !normal.usuarios.some(u=>u.usuario===actualPrevio.usuario)) normal.usuarios.unshift(actualPrevio);
      normal.session=sesion;
      normal.modoOffline=modo;
      delete normal._export;
      normal.auditoria.unshift({fecha:ahora(),usuario:actual?actual.nombre:'Sistema',accion:'Importación de datos',detalle:file.name});
      db=normal; guardarDB(); renderUsuariosLogin(); ir('auditoria'); toast('Datos importados correctamente.');
    }catch(err){ toast('No se pudo importar: '+(err.message||'formato inválido')); }
    e.target.value='';
  };
  reader.onerror=function(){ toast('No se pudo leer el archivo.'); e.target.value=''; };
  reader.readAsText(file);
}
function restablecer(){
  if(!confirm('¿Restablecer la base de datos a los datos semilla?')) return;
  db=semilla();
  db.session=actual?Object.assign({},actual,{ultimaActividad:ultimaActividad}):null;
  guardarDB(); renderUsuariosLogin(); ir('inicio'); toast('Datos restablecidos.');
}

/* ---------- Gestión de usuarios (solo Administrador) ---------- */
function vUsuarios(){
  const usuarios=listaUsuarios();
  return `<h2>Gestión de usuarios <small>(módulo de Administrador)</small></h2>
  <div class="card"><h3>Nuevo usuario</h3><form onsubmit="crearUsuario(event)"><div class="grid">
    <label>Usuario <input id="usuNuevo" required placeholder="Ej. operario2" autocomplete="off"></label>
    <label>Nombre completo <input id="usuNom" required placeholder="Ej. Rosa Mendoza"></label>
    <label>Rol / puesto <select id="usuRol">${Object.keys(MODULOS).map(r=>`<option>${esc(r)}</option>`).join('')}</select></label>
    <label>Línea asignada <input id="usuLinea" placeholder="L1, L2 o L3 (opcional)"></label>
    <label>Contraseña <input id="usuPass" type="password" required minlength="4" autocomplete="new-password"></label>
  </div><button class="btn" type="submit">Crear usuario</button></form>
  <p class="hint">Las contraseñas nunca se muestran en la lista. El administrador puede cambiarlas cuando sea necesario.</p></div>
  <div class="card"><h3>Usuarios registrados <span class="alerta-count">${usuarios.length}</span></h3>
  <div class="table-scroll"><table><tr><th>Usuario</th><th>Nombre</th><th>Puesto</th><th>Línea</th><th>Estado</th><th>Acciones</th></tr>
  ${usuarios.map(u=>`<tr>
    <td>${esc(u.usuario)}</td><td>${esc(u.nombre)}</td><td>${esc(u.rol)}</td><td>${esc(u.linea||'—')}</td>
    <td><span class="estado ${u.activo!==false?'ok':'bad'}">${u.activo!==false?'Activo':'Baja'}</span></td>
    <td><div class="acciones-tabla">
      <button class="btn small ghost" onclick="toggleUsuario('${esc(u.usuario)}')">${u.activo!==false?'Dar de baja':'Activar'}</button>
      <button class="btn small ghost" onclick="cambiarClaveUsuario('${esc(u.usuario)}')">Cambiar clave</button>
      <button class="btn small ghost" onclick="editarUsuario('${esc(u.usuario)}')">Editar puesto</button>
      <button class="btn small warn" onclick="eliminarUsuario('${esc(u.usuario)}')">Eliminar</button>
    </div></td>
  </tr>`).join('')}</table></div></div>`;
}
function crearUsuario(e){
  e.preventDefault();
  const usuario=val('usuNuevo').toLowerCase().replace(/\s+/g,'');
  const pass=val('usuPass');
  if(!usuario) return toast('Ingrese un usuario.');
  if(listaUsuarios().some(u=>u.usuario===usuario)) return toast('Ese usuario ya existe.');
  if(pass.length<4) return toast('La contraseña debe tener al menos 4 caracteres.');
  db.usuarios.push({usuario,pass,nombre:val('usuNom'),rol:val('usuRol'),linea:val('usuLinea'),activo:true});
  aud('Alta de usuario', usuario+' · '+val('usuRol')); guardarDB(); renderUsuariosLogin(); ir('usuarios'); toast('Usuario creado correctamente.');
}
function toggleUsuario(usuario){
  const u=listaUsuarios().find(x=>x.usuario===usuario); if(!u) return;
  if(usuario===actual.usuario) return toast('No puedes dar de baja tu propio usuario.');
  u.activo=(u.activo===false);
  aud(u.activo?'Activación de usuario':'Baja de usuario', usuario);
  guardarDB(); renderUsuariosLogin(); ir('usuarios'); toast(u.activo?'Usuario activado.':'Usuario dado de baja.');
}
function cambiarClaveUsuario(usuario){
  const u=listaUsuarios().find(x=>x.usuario===usuario); if(!u) return;
  const nueva=prompt('Nueva contraseña para '+usuario+' (no se mostrará en pantalla):');
  if(nueva===null) return;
  if(nueva.trim().length<4) return toast('La contraseña debe tener al menos 4 caracteres.');
  u.pass=nueva.trim();
  db.cache[usuario]=u.pass;
  aud('Cambio de contraseña', usuario); guardarDB(); toast('Contraseña actualizada.');
}
function editarUsuario(usuario){
  const u=listaUsuarios().find(x=>x.usuario===usuario); if(!u) return;
  const rol=prompt('Puesto del usuario. Opciones: '+Object.keys(MODULOS).join(', '),u.rol);
  if(rol===null) return;
  if(!MODULOS[rol]) return toast('Puesto no válido. Revise las opciones.');
  const linea=prompt('Línea asignada (L1, L2, L3 o dejar vacío):',u.linea||'');
  if(linea===null) return;
  u.rol=rol; u.linea=linea.trim();
  if(actual && actual.usuario===usuario){
    actual.rol=rol; actual.linea=u.linea||'—'; db.session=actual;
  }
  aud('Cambio de puesto', usuario+' → '+rol+(u.linea?' / '+u.linea:'')); guardarDB();
  refrescarMenu(); actualizarCabecera(); renderUsuariosLogin(); ir('usuarios');
}
function eliminarUsuario(usuario){
  if(usuario===actual.usuario) return toast('No puedes eliminar tu propio usuario.');
  if(!confirm('¿Eliminar definitivamente al usuario '+usuario+'?')) return;
  db.usuarios=db.usuarios.filter(x=>x.usuario!==usuario);
  delete db.cache[usuario];
  aud('Eliminación de usuario', usuario); guardarDB(); renderUsuariosLogin(); ir('usuarios'); toast('Usuario eliminado.');
}

/* ---------- Asistente virtual (reglas locales, sin internet) ---------- */
function toggleAsistente(){
  const panel=document.getElementById('asistentePanel');
  const abrir=panel.classList.contains('hidden');
  panel.classList.toggle('hidden',!abrir);
  if(abrir){
    const chat=document.getElementById('asistenteChat');
    if(!chat.innerHTML){
      mensajeAsistente(`¡Hola${actual?' '+esc(actual.nombre.split(' ')[0]):''}! Soy el <b>asistente AgroVerde</b>. Puedo ayudarte a registrar lotes, escanear códigos, trabajar sin señal, validar, consultar stock o explicar un módulo. Escribe tu pregunta o toca una opción rápida.`,'bot');
    }
    setTimeout(function(){ document.getElementById('asistenteInput').focus(); },120);
  }
}
function mensajeAsistente(texto,quien){
  const b=document.createElement('div');
  b.className='chat-bubble '+(quien==='user'?'user':'bot');
  b.innerHTML=quien==='user'?esc(texto):texto;
  const chat=document.getElementById('asistenteChat');
  chat.appendChild(b);
  chat.scrollTop=chat.scrollHeight;
}
function enviarAsistente(e){
  e.preventDefault();
  const t=val('asistenteInput');
  if(!t) return;
  document.getElementById('asistenteInput').value='';
  mensajeAsistente(t,'user');
  setTimeout(function(){ responderAsistente(t); },220);
}
function preguntaRapida(t){
  if(document.getElementById('asistentePanel').classList.contains('hidden')) toggleAsistente();
  mensajeAsistente(t,'user');
  responderAsistente(t);
}
function responderAsistente(t){
  const q=t.toLowerCase();
  const accion=function(id,label){ return '<button class="chat-action" onclick="ir(\''+id+'\');toggleAsistente()">'+label+' →</button>'; };
  const codigo=(t.match(/LOTE-[\w-]+/i)||[])[0];
  let r='';

  if(/hola|buenas|buen dia|buen día|ayuda|quién eres|quien eres|qué puedes hacer|que puedes hacer/.test(q)){
    r='Estoy aquí para guiarte en tu turno. Puedo ayudarte con: <b>registro de lotes</b>, <b>escáner</b>, <b>modo offline</b>, <b>validación</b>, <b>stock</b>, <b>RRHH</b>, <b>documentos</b> y <b>trazabilidad</b>. '+accion('inicio','Ver panel de inicio');
  } else if(codigo){
    const l=db.lotes.find(function(x){ return x.codigo.toLowerCase()===codigo.toLowerCase(); });
    if(l){
      r='Encontré el lote <b>'+esc(l.codigo)+'</b>: línea '+esc(l.linea)+', fecha '+esc(l.fecha)+', cantidad '+l.cantidad+' und, estado <b>'+esc(l.estado)+'</b>, ubicación: '+esc(l.ubicacion)+'. Sincronización: '+esc(l.sync)+'. '+accion('consulta','Ver en Consulta');
    } else {
      r='No encontré el lote <b>'+esc(codigo)+'</b> en este dispositivo. Revisa el código o busca por línea/fecha. '+accion('consulta','Ir a Consulta');
    }
  } else if(/no hay señal|sin señal|sin cobertura|offline|sin conexion|sin conexión|sincroniz|pendiente/.test(q)){
    r='Si estás en el campo sin señal, activa <b>Sin conexión</b>. El cierre se guarda como <b>Pendiente de sincronización con fecha y hora</b> (RF02). Las credenciales ya usadas quedan en caché (RN06). Al volver a tener señal, toca <b>Sincronizar</b>. '+accion('offline','Ir a Modo offline');
  } else if(/escan|qr|barra|cámara|camera|leer código/.test(q)){
    r=tiene('escanear')
      ? 'Abre el <b>Escáner de lote</b> y apunta la cámara al QR o código de barras. Si tu equipo no lo soporta, usa la captura manual. '+accion('escanear','Abrir escáner')
      : 'El escáner está disponible para Producción y Almacén. Puedes buscar el lote escribiendo su código. '+accion('consulta','Ir a Consulta');
  } else if(/registrar|cerrar|registro de cierre|captura|nuevo lote/.test(q)){
    r=actual&&actual.rol==='Operario de producción'
      ? 'Para registrar, llena <b>línea, fecha, cantidad y turno</b> en Registro de cierre. Como operario solo puedes cerrar lotes de tu línea <b>'+esc(actual.linea)+'</b> (RN07). '+accion('cierre','Registrar cierre')
      : 'En <b>Registro de cierre</b> capturas línea, fecha, cantidad y turno. El código se genera solo y el estado queda <b>Registrado</b> hasta que el Jefe valide (CU01). '+accion('cierre','Registrar cierre');
  } else if(/valid|jefe|aprob|autoriz/.test(q)){
    r=tiene('validar')
      ? 'Como <b>'+esc(actual.rol)+'</b> puedes validar lotes: eso cambia el estado a <b>Validado</b> (RN03). Solo los lotes validados generan documentos (RN04). '+accion('validar','Ir a Validación')
      : 'La validación la hace el <b>Jefe de producción</b> o el administrador (RN03). Tu rol registra o consulta, pero no aprueba lotes. '+accion('consulta','Consultar lotes');
  } else if(/stock|almacen|almacén|ingreso|movimiento/.test(q)){
    const total=Object.values(db.stock).reduce(function(a,b){return a+b;},0);
    r='Hay <b>'+total.toLocaleString('es-PE')+'</b> unidades en stock. En <b>Ingreso y stock</b> registras el movimiento y se actualiza automáticamente (RF04). '+accion('ingreso','Ir a Ingreso y stock');
  } else if(/concili|diferencia|pedido|comprometid/.test(q)){
    r='La <b>Conciliación</b> compara el stock contra los pedidos comprometidos. Si hay diferencia física, regístrala con <b>motivo y responsable</b> (RN08 / CU05a). '+accion('conciliacion','Ir a Conciliación');
  } else if(/trabajador|consentimiento|rrhh|legajo|bloquead|datos personal|datos del personal/.test(q)){
    const bloqueados=db.trabajadores.filter(function(x){return x.estado.indexOf('BLOQUEADO')===0;}).length;
    r='En <b>Datos y consentimiento</b> se registran los trabajadores. Sin consentimiento vigente el legajo queda <b>BLOQUEADO</b> (RF11 / RN09). Actualmente hay <b>'+bloqueados+'</b> legajo(s) bloqueado(s). '+accion('personal','Ir a Datos y consentimiento');
  } else if(/documento|factura|packing|exporta/.test(q)){
    r='En <b>Documentos</b> generas factura y packing list. Recuerda: solo se pueden emitir para lotes <b>Validados</b> (RN04) y se pueden guardar como PDF al imprimir. '+accion('documentos','Ir a Documentos');
  } else if(/trazab|reporte|historial|rastre/.test(q)){
    r='El reporte de <b>Trazabilidad</b> muestra la línea de tiempo de un lote y se puede <b>descargar en CSV o guardar como PDF</b> (RF09 / CU08). '+accion('trazabilidad','Ir a Trazabilidad');
  } else if(/agua|merma|ambient|consumo/.test(q)){
    r='En <b>Agua y mermas</b> registras litros y kilogramos por lote (RF10 / CU09). Ese dato aparece después en el reporte de trazabilidad. '+accion('consumo','Ir a Agua y mermas');
  } else if(/exportar|importar|respaldo|backup|json|copia de datos/.test(q)){
    r=tiene('auditoria')
      ? 'En <b>Auditoría y respaldos</b> puedes exportar/importar un <b>JSON</b> con todos los datos y descargar la bitácora en CSV. Útil para llevar información entre dispositivos. '+accion('auditoria','Ir a Respaldos')
      : 'Los respaldos JSON se gestionan desde <b>Auditoría</b>, disponible para Gerencia y Administrador.';
  } else if(/crear usuario|nuevo usuario|dar de baja|gestión de usuarios|gestion de usuarios/.test(q)){
    r=tiene('usuarios')
      ? 'Como Administrador puedes crear usuarios, darlos de baja, cambiar claves y editar puestos en <b>Gestión de usuarios</b>. Las contraseñas nunca se muestran en la lista. '+accion('usuarios','Ir a Gestión de usuarios')
      : 'La gestión de usuarios la hace el <b>Administrador</b>. Tu usuario y puesto están asignados desde el acceso.';
  } else if(/auditor|quién hizo|quien hizo|cambio|registro de actividad/.test(q)){
    r='La <b>Auditoría</b> guarda cada acción con usuario y fecha (CL06 / RN10). Podrás ver quién registró, validó o cambió algo y descargarlo en CSV. '+accion('auditoria','Ir a Auditoría');
  } else if(/contraseña|password|clave|usuario|ingresar|login/.test(q)){
    r='En la pantalla de acceso solo mostramos el <b>usuario por puesto</b>; cada persona conoce su contraseña. Si estás sin señal, usa un usuario ya ingresado en este dispositivo (RN06). El usuario de sistema es <b>admin1</b>.';
  } else if(/resumen|cuantos|cuántos|estado general|cuánto/.test(q)){
    const validados=db.lotes.filter(function(l){return l.estado==='Validado';}).length;
    const pend=db.lotes.filter(function(l){return l.sync.indexOf('Pendiente')===0;}).length;
    r='Resumen de este dispositivo: <b>'+db.lotes.length+'</b> lote(s), <b>'+validados+'</b> validado(s), <b>'+pend+'</b> pendiente(s) de sincronización y <b>'+Object.keys(db.stock).length+'</b> lote(s) con stock. '+accion('inicio','Ver panel');
  } else if(/buscar|consulta|busca|estado|consultar/.test(q)){
    r='Puedes buscar por <b>código, línea o fecha</b> y la consulta muestra si cumple el objetivo de 3 segundos (RNF05). Escribe por ejemplo <b>LOTE-2026-001</b> o usa el escáner. '+accion('consulta','Ir a Consulta');
  } else if(/gracias/.test(q)){
    r='¡Con gusto! Si te surge otra duda en el turno, aquí estoy. 🌱';
  } else {
    r='No estoy seguro de entender. Puedo ayudarte con registro de lotes, escáner, modo offline, validación, stock, RRHH o trazabilidad. Elige una opción o escribe <b>LOTE-2026-001</b> para consultar un lote. '+accion('cierre','Registrar lote')+' '+accion('offline','Modo offline');
  }
  mensajeAsistente(r,'bot');
}

/* ---------- Cierre automático por inactividad ---------- */
function limpiarTemporizadores(){
  clearTimeout(timerAviso); clearTimeout(timerCierre);
  timerAviso=null; timerCierre=null; avisoMostrado=false;
}
function reiniciarTemporizador(){
  if(!actual) return;
  limpiarTemporizadores();
  timerAviso=setTimeout(mostrarAvisoInactividad, AVISO_MS);
  timerCierre=setTimeout(function(){ cerrarPorInactividad(false); }, INACTIVIDAD_MS);
}
function registrarActividad(forzar){
  if(!actual) return;
  const ahora=Date.now();
  ultimaActividad=ahora;
  if(db.session) db.session.ultimaActividad=ahora;
  if(forzar || ahora-ultimoGuardadoActividad>15000){ ultimoGuardadoActividad=ahora; guardarDB(); }
  if(!avisoMostrado && (forzar || ahora-ultimoResetTimer>1000)){
    ultimoResetTimer=ahora; reiniciarTemporizador();
  }
}
function mostrarAvisoInactividad(){
  if(!actual || avisoMostrado) return;
  avisoMostrado=true;
  abrirModal('<h2>Sesión por cerrar</h2>'+
    '<p>Por seguridad, tu sesión se cerrará en <b>2 minutos</b> si no registras actividad.</p>'+
    '<p style="font-size:12px;color:#667">Cierre automático: 10 minutos de inactividad.</p>'+
    '<button class="btn" onclick="continuarSesion()">Seguir trabajando</button> '+
    '<button class="btn ghost" onclick="cerrarSesion()">Cerrar ahora</button>');
}
function continuarSesion(){ cerrarModal(); registrarActividad(true); toast('Sesión extendida por 10 minutos más.'); }
function cerrarPorInactividad(silencioso){
  limpiarTemporizadores(); detenerEscaneo(true);
  if(actual) aud('Cierre por inactividad', 'Sesión finalizada automáticamente tras 10 min sin actividad');
  db.session=null; guardarDB(); actual=null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('asistente').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
  document.getElementById('modal').classList.add('hidden');
  renderUsuariosLogin();
  if(!silencioso) toast('Sesión cerrada por inactividad. Vuelve a ingresar.');
}
['click','keydown','touchstart','scroll','mousemove'].forEach(function(ev){
  window.addEventListener(ev, function(){ registrarActividad(false); }, {passive:true});
});

/* ---------- Arranque ---------- */
db=cargarDB();
renderUsuariosLogin();
if(db.session){
  actual=listaUsuarios().find(u=>u.usuario===db.session.usuario && u.activo!==false)
    ? {usuario:db.session.usuario,nombre:db.session.nombre,rol:db.session.rol,linea:db.session.linea}
    : null;
  if(actual) renderApp();
  else { db.session=null; guardarDB(); }
}
/* Las tablas se convierten en tarjetas en celular. Se vuelve a aplicar cuando
   una vista cambia su contenido (búsquedas, reportes, etc.). */
if(window.MutationObserver){
  const observadorTablas=new MutationObserver(function(){ requestAnimationFrame(mejorarTablasMovil); });
  observadorTablas.observe(document.getElementById('contenido'),{childList:true,subtree:true});
}
mejorarTablasMovil();
