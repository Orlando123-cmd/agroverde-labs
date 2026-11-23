'use strict';
/* AgroVerde S.A.C. — Trazabilidad de lotes. Persistencia: localStorage. */
const DB_KEY = 'agroverde_db_v1';

const USUARIOS = [
  {usuario:'operario1', pass:'op123', nombre:'Pablo Blas', rol:'Operario de producción', linea:'L1'},
  {usuario:'jefe1', pass:'jefe123', nombre:'David Ruiz', rol:'Jefe de producción', linea:'L1'},
  {usuario:'almacen1', pass:'alm123', nombre:'Dayron Yangali', rol:'Encargado de almacén'},
  {usuario:'rrhh1', pass:'rrhh123', nombre:'Orlando Ravenna', rol:'Especialista de RRHH'},
  {usuario:'gerencia1', pass:'ger123', nombre:'Gerencia AgroVerde', rol:'Gerencia'},
  {usuario:'admin1', pass:'admin123', nombre:'Administrador', rol:'Administrador'}
];

const MODULOS = {
  'Operario de producción': ['inicio','cierre','offline','consulta','consumo'],
  'Jefe de producción': ['inicio','cierre','validar','offline','consulta','consumo','trazabilidad'],
  'Encargado de almacén': ['inicio','consulta','ingreso','conciliacion','offline','trazabilidad'],
  'Especialista de RRHH': ['inicio','personal','consulta','trazabilidad'],
  'Gerencia': ['inicio','consulta','trazabilidad','documentos','auditoria'],
  'Administrador': ['inicio','cierre','validar','offline','consulta','ingreso','conciliacion','personal','documentos','trazabilidad','consumo','auditoria']
};

const MODULOS_INFO = [
  {id:'inicio', label:'Inicio', icono:'🏠'},
  {id:'cierre', label:'Registro de cierre', icono:'📝'},
  {id:'validar', label:'Validar lotes', icono:'✅'},
  {id:'offline', label:'Modo offline', icono:'📴'},
  {id:'consulta', label:'Consulta y búsqueda', icono:'🔎'},
  {id:'ingreso', label:'Ingreso y stock', icono:'📦'},
  {id:'conciliacion', label:'Conciliación', icono:'⚖️'},
  {id:'personal', label:'Datos y consentimiento', icono:'👥'},
  {id:'documentos', label:'Documentos', icono:'📄'},
  {id:'trazabilidad', label:'Trazabilidad', icono:'🔗'},
  {id:'consumo', label:'Agua y mermas', icono:'💧'},
  {id:'auditoria', label:'Auditoría', icono:'🧾'}
];

let db = null;
let actual = null;
let moduloActual = 'inicio';

/* ---------- Persistencia y semilla ---------- */
function semilla(){
  return {
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
      {dni:'87654321', nombre:'Luis Pérez', cargo:'Operario', vigente:false, fin:'2026-10-01', estado:'BLOQUEADO — sin consentimiento'}
    ],
    auditoria:[{fecha:ahora(), usuario:'Sistema', accion:'Inicialización', detalle:'Datos semilla de AgroVerde S.A.C.'}],
    cache:{}, session:null, modoOffline:false
  };
}
function cargarDB(){ try { const raw = localStorage.getItem(DB_KEY); return raw ? JSON.parse(raw) : semilla(); } catch(e){ return semilla(); } }
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

/* ---------- Sesión ---------- */
function iniciarSesion(e){
  e.preventDefault();
  const u=val('usr'), p=val('pass');
  let user=null;
  if(db.modoOffline){
    if(db.cache[u]===p) user=USUARIOS.find(x=>x.usuario===u);
    else return toast('RN06: sin red solo se aceptan credenciales ya usadas en este dispositivo.');
  } else {
    user=USUARIOS.find(x=>x.usuario===u && x.pass===p);
    if(user) db.cache[u]=p;
  }
  if(!user) return toast('Usuario o contraseña incorrectos.');
  actual={usuario:user.usuario,nombre:user.nombre,rol:user.rol,linea:user.linea||'—'};
  db.session=actual; aud('Inicio de sesión', actual.rol+(db.modoOffline?' (offline RN06)':'')); guardarDB(); renderApp();
}
function cerrarSesion(){ aud('Cierre de sesión',''); db.session=null; guardarDB(); actual=null; document.getElementById('app').classList.add('hidden'); document.getElementById('login').classList.remove('hidden'); document.getElementById('asistente').classList.add('hidden'); }
function cambiarModo(){ db.modoOffline=!db.modoOffline; aud('Cambio de conectividad', db.modoOffline?'Modo offline activo':'Modo en línea activo'); guardarDB(); actualizarCabecera(); ir(moduloActual); toast(db.modoOffline?'Modo offline: los registros quedarán pendientes.':'Modo en línea restablecido.'); }
function actualizarCabecera(){
  document.getElementById('btnModo').textContent=db.modoOffline?'📴 Sin conexión':'🌐 En línea';
  document.getElementById('badgeUsuario').textContent=actual?actual.nombre+' · '+actual.rol:'';
  document.getElementById('bannerOffline').classList.toggle('hidden',!db.modoOffline);
}
function renderApp(){
  document.getElementById('login').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('asistente').classList.remove('hidden');
  actualizarCabecera();
  document.getElementById('menu').innerHTML=MODULOS_INFO.filter(m=>tiene(m.id))
    .map(m=>`<button id="nav-${m.id}" onclick="ir('${m.id}')">${m.icono} ${m.label}</button>`).join('');
  ir('inicio');
}
function ir(mod){
  if(!tiene(mod)) mod='inicio';
  moduloActual=mod;
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('activo', b.id==='nav-'+mod));
  const views={inicio:vInicio,cierre:vCierre,validar:vValidar,offline:vOffline,consulta:vConsulta,ingreso:vIngreso,
    conciliacion:vConciliacion,personal:vPersonal,documentos:vDocumentos,trazabilidad:vTrazabilidad,consumo:vConsumo,auditoria:vAuditoria};
  document.getElementById('contenido').innerHTML=(views[mod]||vInicio)();
}

/* ---------- Vistas ---------- */
function vInicio(){
  const validados=db.lotes.filter(l=>l.estado==='Validado').length;
  const pendientes=db.lotes.filter(l=>l.sync.startsWith('Pendiente')).length;
  const stock=Object.values(db.stock).reduce((a,b)=>a+b,0);
  return `<h2>Panel de control</h2>
  <div class="grid">
    <div class="metric"><b>${db.lotes.length}</b><span>Lotes registrados</span></div>
    <div class="metric"><b>${validados}</b><span>Lotes validados</span></div>
    <div class="metric"><b>${pendientes}</b><span>Pendientes de sincronización</span></div>
    <div class="metric"><b>${stock.toLocaleString('es-PE')}</b><span>Unidades en stock</span></div>
  </div>
  <div class="card"><h3>Actividad reciente</h3><table><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr>
  ${db.auditoria.slice(0,6).map(a=>`<tr><td>${esc(a.fecha)}</td><td>${esc(a.usuario)}</td><td>${esc(a.accion)}</td><td>${esc(a.detalle)}</td></tr>`).join('')}</table></div>
  <div class="card"><h3>Accesos rápidos</h3><p>
  ${tiene('cierre')?'<button class="btn small" onclick="ir(\'cierre\')">Registrar cierre</button> ':''}
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
  </form></div>
  <div class="card"><h3>Lotes registrados</h3><table><tr><th>Código</th><th>Línea</th><th>Fecha</th><th>Cantidad</th><th>Estado</th><th>Sincronización</th></tr>
  ${lotes.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${esc(l.fecha)}</td><td>${l.cantidad}</td><td><span class="estado ${l.estado==='Validado'?'ok':l.estado==='Pendiente'?'pend':'bad'}">${esc(l.estado)}</span></td><td>${esc(l.sync)}</td></tr>`).join('')}</table></div>`;
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
function vValidar(){
  const pend=db.lotes.filter(l=>l.estado!=='Validado');
  return `<h2>Validación de lotes <small>(RN03 — solo Jefe/Administrador)</small></h2>
  <div class="card"><table><tr><th>Código</th><th>Línea</th><th>Cantidad</th><th>Estado actual</th><th>Acción</th></tr>
  ${pend.length?pend.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${l.cantidad}</td><td><span class="estado pend">${esc(l.estado)}</span></td><td><button class="btn small" onclick="validarLote('${esc(l.codigo)}')">Validar</button></td></tr>`).join(''):'<tr><td colspan="5">No hay lotes pendientes de validación.</td></tr>'}</table></div>`;
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
  <div class="card"><h3>Registros pendientes</h3><table><tr><th>Código</th><th>Fecha de captura</th><th>Estado</th></tr>
  ${pend.length?pend.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.sync.replace('Pendiente de sincronización · ',''))}</td><td><span class="estado pend">Pendiente</span></td></tr>`).join(''):'<tr><td colspan="3">Sin registros pendientes.</td></tr>'}</table></div>`;
}
function sincronizar(){
  let n=0; db.lotes.forEach(l=>{ if(l.sync.startsWith('Pendiente')){ l.sync='Sincronizado'; if(l.estado==='Pendiente') l.estado='Registrado'; n++; } });
  aud('Sincronización', n+' registro(s) pendiente(s) cerrados'); guardarDB(); ir('offline'); toast(n+' registro(s) sincronizados.');
}
function vConsulta(){
  return `<h2>Consulta y búsqueda de lotes <small>(RF03 · RF08 · RNF05)</small></h2>
  <div class="card"><form onsubmit="buscar(event)"><div class="grid">
    <label>Código, línea o fecha <input id="busq" placeholder="Ej. LOTE-2026-001 o L1" autocomplete="off"></label>
    <label>Fecha exacta <input id="busqFecha" type="date"></label>
  </div><button class="btn" type="submit">Buscar</button></form>
  <div id="tiempo" class="msg"></div></div>
  <div class="card" id="resultados">${tablaLotes(db.lotes)}</div>`;
}
function tablaLotes(lista){
  return `<table><tr><th>Código</th><th>Línea</th><th>Fecha</th><th>Cantidad</th><th>Estado</th><th>Ubicación</th></tr>
  ${lista.length?lista.map(l=>`<tr><td>${esc(l.codigo)}</td><td>${esc(l.linea)}</td><td>${esc(l.fecha)}</td><td>${l.cantidad}</td><td><span class="estado ${l.estado==='Validado'?'ok':'pend'}">${esc(l.estado)}</span></td><td>${esc(l.ubicacion)}</td></tr>`).join(''):'<tr><td colspan="6">Sin resultados.</td></tr>'}</table>`;
}
function buscar(e){
  e.preventDefault(); const t0=performance.now();
  const q=val('busq').toLowerCase(), f=val('busqFecha');
  const r=db.lotes.filter(l=>(!q||l.codigo.toLowerCase().includes(q)||l.linea.toLowerCase().includes(q)||l.fecha.includes(q))&&(!f||l.fecha===f));
  const ms=performance.now()-t0;
  document.getElementById('resultados').innerHTML=tablaLotes(r);
  document.getElementById('tiempo').className='msg '+(ms<=3000?'ok':'err');
  document.getElementById('tiempo').textContent=`Consulta en ${ms.toFixed(2)} ms · umbral RNF05 ≤ 3000 ms (p95): ${ms<=3000?'CUMPLE':'NO CUMPLE'} · ${r.length} resultado(s)`;
  aud('Consulta de lotes', `filtro="${q}" fecha="${f}" · ${r.length} resultados · ${ms.toFixed(1)} ms`); guardarDB();
}
function vIngreso(){
  return `<h2>Ingreso a almacén y stock <small>(RF04 · CU04)</small></h2>
  <div class="card"><form onsubmit="registrarIngreso(event)"><div class="grid">
    <label>Lote <select id="ingLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Cantidad <input id="ingCant" type="number" min="1" required></label>
    <label>Motivo <select id="ingMotivo"><option>Ingreso de producción</option><option>Devolución</option><option>Ajuste</option></select></label>
  </div><button class="btn" type="submit">Registrar ingreso</button></form></div>
  <div class="card"><h3>Stock actual</h3><table><tr><th>Lote</th><th>Stock</th></tr>${Object.entries(db.stock).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</table>
  <h3>Movimientos</h3><table><tr><th>Fecha</th><th>Lote</th><th>Cantidad</th><th>Motivo</th></tr>
  ${db.movimientos.length?db.movimientos.map(m=>`<tr><td>${esc(m.fecha)}</td><td>${esc(m.lote)}</td><td>${m.cantidad}</td><td>${esc(m.motivo)}</td></tr>`).join(''):'<tr><td colspan="4">Sin movimientos.</td></tr>'}</table></div>`;
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
  <div class="card"><table><tr><th>Lote</th><th>Stock</th><th>Pedidos comprometidos</th><th>Diferencia</th></tr>
  ${filas.map(f=>`<tr><td>${esc(f.lote)}</td><td>${f.stock}</td><td>${f.pedido}</td><td><span class="estado ${f.diferencia<0?'bad':'ok'}">${f.diferencia}</span></td></tr>`).join('')}</table></div>
  <div class="card"><form onsubmit="registrarDiferencia(event)"><div class="grid">
    <label>Lote <select id="difLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Diferencia física <input id="difCant" type="number" required></label>
    <label>Motivo <input id="difMotivo" required placeholder="Ej. merma detectada"></label>
  </div><button class="btn" type="submit">Registrar diferencia (RN08)</button></form></div>
  <div class="card"><h3>Diferencias registradas</h3><table><tr><th>Fecha</th><th>Lote</th><th>Diferencia</th><th>Motivo</th><th>Responsable</th></tr>
  ${db.conciliaciones.length?db.conciliaciones.map(c=>`<tr><td>${esc(c.fecha)}</td><td>${esc(c.lote)}</td><td>${c.cantidad}</td><td>${esc(c.motivo)}</td><td>${esc(c.usuario)}</td></tr>`).join(''):'<tr><td colspan="5">Sin diferencias registradas.</td></tr>'}</table></div>`;
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
  <div class="card"><table><tr><th>DNI</th><th>Nombre</th><th>Cargo</th><th>Vigencia</th><th>Estado del legajo</th></tr>
  ${db.trabajadores.map(t=>`<tr><td>${esc(t.dni)}</td><td>${esc(t.nombre)}</td><td>${esc(t.cargo)}</td><td>${esc(t.fin)}</td><td><span class="estado ${t.estado==='ACTIVO'?'ok':'bad'}">${esc(t.estado)}</span></td></tr>`).join('')}</table></div>`;
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
  <div class="card"><h3>Documentos emitidos</h3><table><tr><th>Fecha</th><th>Tipo</th><th>Lote</th><th>N.°</th></tr>
  ${db.documentos.length?db.documentos.map(d=>`<tr><td>${esc(d.fecha)}</td><td>${esc(d.tipo)}</td><td>${esc(d.lote)}</td><td>${esc(d.numero)}</td></tr>`).join(''):'<tr><td colspan="4">Sin documentos emitidos.</td></tr>'}</table></div>`;
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
  <button class="btn" onclick="imprimir()">Imprimir</button> <button class="btn ghost" onclick="cerrarModal()">Cerrar</button>`);
  ir('documentos');
}
function vTrazabilidad(){
  return `<h2>Reporte de trazabilidad <small>(RF09 · CU08)</small></h2>
  <div class="card"><label>Seleccionar lote <select id="trzLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
  <button class="btn" onclick="verTrazabilidad()">Generar reporte</button></div>
  <div class="card" id="trzSalida">Seleccione un lote y genere el reporte.</div>`;
}
function verTrazabilidad(){
  const lote=val('trzLote'); const eventos=[];
  db.lotes.filter(l=>l.codigo===lote).forEach(l=>eventos.push({f:l.fecha,t:'Cierre de lote',d:'Línea '+l.linea+' · '+l.cantidad+' uds · '+l.estado}));
  db.movimientos.filter(m=>m.lote===lote).forEach(m=>eventos.push({f:m.fecha,t:'Ingreso a almacén',d:'+'+m.cantidad+' · '+m.motivo}));
  db.conciliaciones.filter(c=>c.lote===lote).forEach(c=>eventos.push({f:c.fecha,t:'Conciliación',d:c.cantidad+' · '+c.motivo}));
  db.consumo.filter(c=>c.lote===lote).forEach(c=>eventos.push({f:c.fecha,t:'Agua y mermas',d:c.agua+' L · '+c.mermas+' kg'}));
  db.documentos.filter(d=>d.lote===lote).forEach(d=>eventos.push({f:d.fecha,t:d.tipo,d:'N.° '+d.numero}));
  db.auditoria.filter(a=>a.detalle.includes(lote)).forEach(a=>eventos.push({f:a.fecha,t:a.accion,d:a.detalle}));
  document.getElementById('trzSalida').innerHTML=`<h3>Línea de tiempo: ${esc(lote)}</h3>
  <table><tr><th>Fecha</th><th>Evento</th><th>Detalle</th></tr>
  ${eventos.map(x=>`<tr><td>${esc(x.f)}</td><td>${esc(x.t)}</td><td>${esc(x.d)}</td></tr>`).join('')}</table>
  <p style="margin-top:14px"><button class="btn" onclick="imprimir()">Imprimir reporte</button></p>`;
  aud('Reporte de trazabilidad', lote); guardarDB();
}
function vConsumo(){
  return `<h2>Consumo de agua y mermas <small>(RF10 · CU09)</small></h2>
  <div class="card"><form onsubmit="registrarConsumo(event)"><div class="grid">
    <label>Lote <select id="conLote">${db.lotes.map(l=>`<option value="${esc(l.codigo)}">${esc(l.codigo)}</option>`).join('')}</select></label>
    <label>Agua (litros) <input id="conAgua" type="number" min="0" required></label>
    <label>Mermas (kg) <input id="conMermas" type="number" min="0" required></label>
  </div><button class="btn" type="submit">Registrar consumo</button></form></div>
  <div class="card"><table><tr><th>Fecha</th><th>Lote</th><th>Agua (L)</th><th>Mermas (kg)</th></tr>
  ${db.consumo.length?db.consumo.map(c=>`<tr><td>${esc(c.fecha)}</td><td>${esc(c.lote)}</td><td>${c.agua}</td><td>${c.mermas}</td></tr>`).join(''):'<tr><td colspan="4">Sin registros.</td></tr>'}</table></div>`;
}
function registrarConsumo(e){
  e.preventDefault(); db.consumo.unshift({fecha:ahora(),lote:val('conLote'),agua:Number(val('conAgua')),mermas:Number(val('conMermas'))});
  aud('Registro ambiental', val('conLote')); guardarDB(); ir('consumo'); toast('Consumo y mermas registrados por lote.');
}
function vAuditoria(){
  return `<h2>Auditoría del sistema <small>(CL06 · RN10)</small></h2>
  <div class="card"><table><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr>
  ${db.auditoria.map(a=>`<tr><td>${esc(a.fecha)}</td><td>${esc(a.usuario)}</td><td>${esc(a.accion)}</td><td>${esc(a.detalle)}</td></tr>`).join('')}</table></div>
  <div class="card"><button class="btn warn" onclick="restablecer()">Restablecer datos de prueba</button></div>`;
}
function restablecer(){ if(!confirm('¿Restablecer la base de datos a los datos semilla?')) return; db=semilla(); db.session=actual; guardarDB(); ir('inicio'); toast('Datos restablecidos.'); }

/* ---------- Asistente virtual (reglas locales, sin internet) ---------- */
function toggleAsistente(){
  const panel=document.getElementById('asistentePanel');
  const abrir=panel.classList.contains('hidden');
  panel.classList.toggle('hidden',!abrir);
  if(abrir){
    const chat=document.getElementById('asistenteChat');
    if(!chat.innerHTML){
      mensajeAsistente(`¡Hola${actual?' '+esc(actual.nombre.split(' ')[0]):''}! Soy el <b>asistente AgroVerde</b>. Puedo ayudarte a registrar lotes, trabajar sin señal, validar, consultar stock o explicar un módulo. Escribe tu pregunta o toca una opción rápida.`,'bot');
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
    r='Estoy aquí para guiarte en tu turno. Puedo ayudarte con: <b>registro de lotes</b>, <b>modo offline</b>, <b>validación</b>, <b>stock</b>, <b>conciliación</b>, <b>RRHH</b>, <b>documentos</b> y <b>trazabilidad</b>. '+accion('inicio','Ver panel de inicio');
  } else if(codigo){
    const l=db.lotes.find(function(x){ return x.codigo.toLowerCase()===codigo.toLowerCase(); });
    if(l){
      r='Encontré el lote <b>'+esc(l.codigo)+'</b>: línea '+esc(l.linea)+', fecha '+esc(l.fecha)+', cantidad '+l.cantidad+' und, estado <b>'+esc(l.estado)+'</b>, ubicación: '+esc(l.ubicacion)+'. Sincronización: '+esc(l.sync)+'. '+accion('consulta','Ver en Consulta');
    } else {
      r='No encontré el lote <b>'+esc(codigo)+'</b> en este dispositivo. Revisa el código o busca por línea/fecha. '+accion('consulta','Ir a Consulta');
    }
  } else if(/no hay señal|sin señal|sin cobertura|offline|sin conexion|sin conexión|sincroniz|pendiente/.test(q)){
    r='Si estás en el campo sin señal, activa <b>Sin conexión</b>. El cierre se guarda como <b>Pendiente de sincronización con fecha y hora</b> (RF02). Las credenciales ya usadas quedan en caché (RN06). Al volver a tener señal, toca <b>Sincronizar</b>. '+accion('offline','Ir a Modo offline');
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
    r='En <b>Documentos</b> generas factura y packing list. Recuerda: solo se pueden emitir para lotes <b>Validados</b> (RN04) y se pueden imprimir. '+accion('documentos','Ir a Documentos');
  } else if(/trazab|reporte|historial|rastre/.test(q)){
    r='El reporte de <b>Trazabilidad</b> muestra la línea de tiempo de un lote: cierre, ingreso, conciliación, agua/mermas y documentos (RF09 / CU08). '+accion('trazabilidad','Ir a Trazabilidad');
  } else if(/agua|merma|ambient|consumo/.test(q)){
    r='En <b>Agua y mermas</b> registras litros y kilogramos por lote (RF10 / CU09). Ese dato aparece después en el reporte de trazabilidad. '+accion('consumo','Ir a Agua y mermas');
  } else if(/auditor|quién hizo|quien hizo|cambio|registro de actividad/.test(q)){
    r='La <b>Auditoría</b> guarda cada acción con usuario y fecha (CL06 / RN10). Podrás ver quién registró, validó o cambió algo. '+accion('auditoria','Ir a Auditoría');
  } else if(/contraseña|password|clave|usuario|ingresar|login/.test(q)){
    r='En la pantalla de acceso solo mostramos el <b>usuario por puesto</b>; cada persona conoce su contraseña. Si estás sin señal, usa un usuario ya ingresado en este dispositivo (RN06). El usuario de sistema es <b>admin1</b>.';
  } else if(/resumen|cuantos|cuántos|estado general|cuánto/.test(q)){
    const validados=db.lotes.filter(function(l){return l.estado==='Validado';}).length;
    const pend=db.lotes.filter(function(l){return l.sync.indexOf('Pendiente')===0;}).length;
    r='Resumen de este dispositivo: <b>'+db.lotes.length+'</b> lote(s), <b>'+validados+'</b> validado(s), <b>'+pend+'</b> pendiente(s) de sincronización y <b>'+Object.keys(db.stock).length+'</b> lote(s) con stock. '+accion('inicio','Ver panel');
  } else if(/buscar|consulta|busca|estado|consultar/.test(q)){
    r='Puedes buscar por <b>código, línea o fecha</b> y la consulta muestra si cumple el objetivo de 3 segundos (RNF05). Escribe por ejemplo <b>LOTE-2026-001</b>. '+accion('consulta','Ir a Consulta');
  } else if(/gracias/.test(q)){
    r='¡Con gusto! Si te surge otra duda en el turno, aquí estoy. 🌱';
  } else {
    r='No estoy seguro de entender. Puedo ayudarte con registro de lotes, modo offline, validación, stock, RRHH o trazabilidad. Elige una opción o escribe <b>LOTE-2026-001</b> para consultar un lote. '+accion('cierre','Registrar lote')+' '+accion('offline','Modo offline');
  }
  mensajeAsistente(r,'bot');
}

/* ---------- Arranque ---------- */
db=cargarDB();
if(db.session){
  actual=USUARIOS.find(u=>u.usuario===db.session.usuario)
    ? {usuario:db.session.usuario,nombre:db.session.nombre,rol:db.session.rol,linea:db.session.linea}
    : null;
  if(actual) renderApp();
}
