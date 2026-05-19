import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HeartPulse, LogOut, UsersRound, ClipboardList, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import './styles.css';

const STORAGE_KEY = 'seguimiento-pacientes-v1';
const initialData = {
  patients: [
    { id: 'p1', name: 'Paciente Demo 1', code: 'ANA123' },
    { id: 'p2', name: 'Paciente Demo 2', code: 'LUIS123' },
  ],
  records: [{ id:'r1', patientId:'p1', date:new Date().toISOString().slice(0,10), didExercise:true, completedProgram:true, percentage:100, pain:2, fatigue:3, comments:'Me he sentido bien durante los ejercicios.' }]
};
const today = () => new Date().toISOString().slice(0,10);
const loadData = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData; } catch { return initialData; }};
const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

function Button({children, onClick, type='button', secondary=false, danger=false}) { return <button type={type} onClick={onClick} className={`btn ${secondary?'secondary':''} ${danger?'danger':''}`}>{children}</button>; }
function Card({children}) { return <div className="card">{children}</div>; }
function Field({label, children, help}) { return <label className="field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>; }
function SelectBool({value,onChange}) { return <select value={String(value)} onChange={e=>onChange(e.target.value==='true')}><option value="true">Sí</option><option value="false">No</option></select>; }
function Stat({icon, title, value}) { return <Card><div className="stat"><div className="statIcon">{icon}</div><div><small>{title}</small><strong>{value}</strong></div></div></Card>; }

function Login({data,onLogin}){
  const [role,setRole]=useState('patient'); const [code,setCode]=useState('ANA123'); const [error,setError]=useState('');
  function submit(e){ e.preventDefault(); setError(''); if(role==='professional'){ if(code.trim().toLowerCase()==='profesional') return onLogin({role:'professional'}); setError('Código profesional incorrecto. Usa: profesional'); return; } const p=data.patients.find(x=>x.code.toLowerCase()===code.trim().toLowerCase()); if(!p) return setError('Código no encontrado. Prueba: ANA123 o LUIS123'); onLogin({role:'patient', patientId:p.id}); }
  return <main className="center"><Card><div className="brand"><div className="logo"><HeartPulse/></div><div><h1>Seguimiento de ejercicio</h1><p>Registro diario para pacientes</p></div></div><div className="tabs"><button onClick={()=>{setRole('patient');setCode('ANA123')}} className={role==='patient'?'active':''}>Paciente</button><button onClick={()=>{setRole('professional');setCode('profesional')}} className={role==='professional'?'active':''}>Profesional</button></div><form onSubmit={submit}><Field label={role==='patient'?'Código de paciente':'Código profesional'}><input value={code} onChange={e=>setCode(e.target.value)} /></Field>{error&&<p className="error">{error}</p>}<Button type="submit">Entrar</Button></form><div className="note"><b>Para probar:</b><br/>Paciente: ANA123 o LUIS123<br/>Profesional: profesional</div></Card></main>;
}

function Patient({data,setData,session,onLogout}){
  const patient=data.patients.find(p=>p.id===session.patientId); const existing=data.records.find(r=>r.patientId===patient.id && r.date===today());
  const [form,setForm]=useState(existing || {date:today(),didExercise:true,completedProgram:false,percentage:50,pain:0,fatigue:0,comments:''}); const [saved,setSaved]=useState(false);
  const records=useMemo(()=>data.records.filter(r=>r.patientId===patient.id).sort((a,b)=>b.date.localeCompare(a.date)),[data,patient.id]);
  const upd=(k,v)=>{setSaved(false);setForm({...form,[k]:v})};
  function submit(e){ e.preventDefault(); const rec={...form,id:crypto.randomUUID(),patientId:patient.id,percentage:+form.percentage,pain:+form.pain,fatigue:+form.fatigue}; const next={...data,records:[...data.records.filter(r=>!(r.patientId===patient.id && r.date===form.date)),rec]}; setData(next); setSaved(true); }
  return <main className="page"><header><div><h1>Hola, {patient.name}</h1><p>Registra cómo ha ido tu programa hoy.</p></div><Button secondary onClick={onLogout}><LogOut size={16}/> Salir</Button></header><Card><h2>Registro diario</h2><form onSubmit={submit} className="gridform"><Field label="Fecha"><input type="date" value={form.date} onChange={e=>upd('date',e.target.value)} /></Field><Field label={`Porcentaje realizado: ${form.percentage}%`}><input type="range" min="0" max="100" value={form.percentage} onChange={e=>upd('percentage',e.target.value)} /></Field><Field label="¿Has hecho ejercicio hoy?"><SelectBool value={form.didExercise} onChange={v=>upd('didExercise',v)} /></Field><Field label="¿Terminaste el programa completo?"><SelectBool value={form.completedProgram} onChange={v=>upd('completedProgram',v)} /></Field><Field label={`Dolor: ${form.pain}/10`} help="0 = sin dolor, 10 = dolor máximo"><input type="range" min="0" max="10" value={form.pain} onChange={e=>upd('pain',e.target.value)} /></Field><Field label={`Cansancio: ${form.fatigue}/10`} help="0 = nada, 10 = muchísimo"><input type="range" min="0" max="10" value={form.fatigue} onChange={e=>upd('fatigue',e.target.value)} /></Field><Field label="Comentarios"><textarea value={form.comments} onChange={e=>upd('comments',e.target.value)} placeholder="Ejemplo: el ejercicio 3 me costó..." /></Field><Button type="submit">Guardar registro</Button>{saved&&<p className="ok">Registro guardado correctamente.</p>}</form></Card><Card><h2>Mis últimos registros</h2>{records.slice(0,7).map(r=><div className="record" key={r.id}><b>{r.date}</b><span>{r.percentage}% realizado</span><p>Dolor: {r.pain}/10 · Cansancio: {r.fatigue}/10 · Completo: {r.completedProgram?'Sí':'No'}</p>{r.comments&&<em>“{r.comments}”</em>}</div>)}</Card></main>;
}

function Professional({data,setData,onLogout}){
  const [pid,setPid]=useState(data.patients[0]?.id||''); const [name,setName]=useState(''); const [code,setCode]=useState(''); const p=data.patients.find(x=>x.id===pid);
  const records=useMemo(()=>data.records.filter(r=>r.patientId===pid).sort((a,b)=>a.date.localeCompare(b.date)),[data,pid]); const avgPain=data.records.length?(data.records.reduce((s,r)=>s+r.pain,0)/data.records.length).toFixed(1):0;
  function add(e){e.preventDefault(); if(!name||!code)return; const np={id:crypto.randomUUID(),name,code}; setData({...data,patients:[...data.patients,np]}); setPid(np.id); setName(''); setCode('');}
  return <main className="page wide"><header><div><h1>Panel profesional</h1><p>Revisa cumplimiento, dolor y comentarios.</p></div><Button secondary onClick={onLogout}><LogOut size={16}/> Salir</Button></header><div className="stats"><Stat icon={<UsersRound/>} title="Pacientes" value={data.patients.length}/><Stat icon={<ClipboardList/>} title="Registros" value={data.records.length}/><Stat icon={<HeartPulse/>} title="Dolor medio" value={`${avgPain}/10`}/></div><div className="columns"><Card><h2>Pacientes</h2><select value={pid} onChange={e=>setPid(e.target.value)}>{data.patients.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>{p&&<p className="note">Código de acceso: <b>{p.code}</b></p>}<form onSubmit={add} className="add"><h3><Plus size={16}/> Añadir paciente</h3><input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Código, ej. MARTA001" value={code} onChange={e=>setCode(e.target.value)}/><Button type="submit">Añadir</Button></form></Card><Card><h2>Evolución de {p?.name}</h2>{records.length===0?<p>No hay registros.</p>:<><div className="chart"><ResponsiveContainer><LineChart data={records}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis domain={[0,10]}/><Tooltip/><Line dataKey="pain" name="Dolor" strokeWidth={3}/><Line dataKey="fatigue" name="Cansancio" strokeWidth={3}/></LineChart></ResponsiveContainer></div><div className="chart"><ResponsiveContainer><BarChart data={records}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis domain={[0,100]}/><Tooltip/><Bar dataKey="percentage" name="% realizado"/></BarChart></ResponsiveContainer></div></>}</Card></div><Card><h2>Registros</h2><div className="table"><table><thead><tr><th>Fecha</th><th>Ejercicio</th><th>Completo</th><th>%</th><th>Dolor</th><th>Cansancio</th><th>Comentarios</th></tr></thead><tbody>{[...records].reverse().map(r=><tr key={r.id}><td>{r.date}</td><td>{r.didExercise?'Sí':'No'}</td><td>{r.completedProgram?'Sí':'No'}</td><td>{r.percentage}%</td><td>{r.pain}/10</td><td>{r.fatigue}/10</td><td>{r.comments||'—'}</td></tr>)}</tbody></table></div></Card></main>;
}
function App(){ const [data,setDataState]=useState(initialData); const [session,setSession]=useState(null); useEffect(()=>setDataState(loadData()),[]); function setData(d){setDataState(d); saveData(d)} if(!session)return <Login data={data} onLogin={setSession}/>; if(session.role==='patient')return <Patient data={data} setData={setData} session={session} onLogout={()=>setSession(null)}/>; return <Professional data={data} setData={setData} onLogout={()=>setSession(null)}/>; }
createRoot(document.getElementById('root')).render(<App/>);
