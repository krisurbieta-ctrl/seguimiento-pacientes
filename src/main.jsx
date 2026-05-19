import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Download, ClipboardList, HeartPulse, RefreshCw } from 'lucide-react';
import './styles.css';

const SUPABASE_URL = 'https://bhugwtecubonlljmxldv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ssyspjYfX8uY6b8EtGagPw_QNp8cpgV';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const today = () => new Date().toISOString().slice(0,10);

function Button({children, onClick, type='button', secondary=false}) {
  return <button type={type} onClick={onClick} className={`btn ${secondary?'secondary':''}`}>{children}</button>;
}
function Card({children}) { return <div className="card">{children}</div>; }
function Field({label, children, help}) { return <label className="field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>; }

function PatientForm(){
  const [form,setForm]=useState({
    patient_code:'', date:today(), exercise_done:true, program_completed:true,
    completion_percentage:100, pain:0, fatigue:0, olive_ml:0, comments:''
  });
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const upd=(k,v)=>{setMessage(''); setForm(prev=>({...prev,[k]:v}));};

  async function submit(e){
    e.preventDefault();
    setMessage('');
    if(!form.patient_code.trim()) { setMessage('Por favor, escribe tu código de paciente.'); return; }
    setSaving(true);
    const payload={
      patient_code: form.patient_code.trim().toUpperCase(),
      exercise_done: Boolean(form.exercise_done),
      completion_percentage: Number(form.completion_percentage),
      pain: Number(form.pain),
      fatigue: Number(form.fatigue),
      olive_ml: Number(form.olive_ml),
      comments: form.comments || ''
    };
    const { error } = await supabase.from('records').insert([payload]);
    setSaving(false);
    if(error){
      setMessage('No se ha podido guardar. Revisa la conexión o la tabla de Supabase.');
      console.error(error);
      return;
    }
    setMessage('Registro guardado correctamente. Muchas gracias.');
    setForm(prev=>({...prev, exercise_done:true, program_completed:true, completion_percentage:100, pain:0, fatigue:0, olive_ml:0, comments:''}));
  }

  return <Card>
    <h2>Registro diario</h2>
    <form onSubmit={submit} className="gridform">
      <Field label="Código de paciente" help="Ejemplo: ANA001, PAMPLONA03, etc.">
        <input value={form.patient_code} onChange={e=>upd('patient_code',e.target.value)} placeholder="Escribe tu código" />
      </Field>
      <Field label="Fecha">
        <input type="date" value={form.date} onChange={e=>upd('date',e.target.value)} />
      </Field>

      <div className="choiceBox">
        <span>¿Has realizado ejercicio hoy?</span>
        <div className="twoButtons">
          <button type="button" className={form.exercise_done ? 'selected' : ''} onClick={()=>upd('exercise_done',true)}>✅ Sí</button>
          <button type="button" className={!form.exercise_done ? 'selected' : ''} onClick={()=>upd('exercise_done',false)}>❌ No</button>
        </div>
      </div>

      <div className="choiceBox">
        <span>¿Has completado el programa?</span>
        <div className="twoButtons">
          <button type="button" className={form.completion_percentage >= 100 ? 'selected' : ''} onClick={()=>upd('completion_percentage',100)}>✅ Completo</button>
          <button type="button" className={form.completion_percentage < 100 ? 'selected' : ''} onClick={()=>upd('completion_percentage',50)}>🟡 Parcial</button>
        </div>
      </div>

      <Field label={`Porcentaje realizado: ${form.completion_percentage}%`}>
        <input type="range" min="0" max="100" value={form.completion_percentage} onChange={e=>upd('completion_percentage',e.target.value)} />
      </Field>

      <div className="oilBox">
        <h3>🫒 Aceite de oliva virgen extra</h3>
        <p>Objetivo diario: <b>4 cucharadas = 60 ml</b></p>
        <div className="spoonGrid">
          {[0,1,2,3,4].map(n=><button key={n} type="button" className={Number(form.olive_ml)===n*15?'selectedSpoon':''} onClick={()=>upd('olive_ml',n*15)}><span>🫒</span><b>{n}</b><small>{n*15} ml</small></button>)}
        </div>
        <p className="oilStatus">{Number(form.olive_ml)>=60 ? '¡Objetivo de AOVE conseguido hoy! 🌟' : `Te faltan ${60-Number(form.olive_ml)} ml para el objetivo.`}</p>
      </div>

      <Field label={`Dolor hoy: ${form.pain}/10`} help="0 = sin dolor, 10 = dolor máximo">
        <input type="range" min="0" max="10" value={form.pain} onChange={e=>upd('pain',e.target.value)} />
      </Field>
      <Field label={`Cansancio hoy: ${form.fatigue}/10`} help="0 = nada, 10 = muchísimo">
        <input type="range" min="0" max="10" value={form.fatigue} onChange={e=>upd('fatigue',e.target.value)} />
      </Field>
      <Field label="Comentarios">
        <textarea value={form.comments} onChange={e=>upd('comments',e.target.value)} placeholder="Ejemplo: hoy me ha dolido la rodilla, no he podido terminar..." />
      </Field>
      <Button type="submit">{saving ? 'Guardando...' : 'Guardar registro'}</Button>
      {message && <p className={message.includes('correctamente') ? 'ok' : 'error'}>{message}</p>}
    </form>
  </Card>;
}

function InvestigatorPanel(){
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(false);
  const [code,setCode]=useState('');

  async function load(){
    setLoading(true);
    const { data, error } = await supabase.from('records').select('*').order('created_at', { ascending:false });
    setLoading(false);
    if(error){ alert('No se han podido cargar los datos.'); console.error(error); return; }
    setRecords(data || []);
  }
  useEffect(()=>{load();},[]);

  const filtered=useMemo(()=>{
    if(!code.trim()) return records;
    return records.filter(r=>(r.patient_code||'').toLowerCase().includes(code.trim().toLowerCase()));
  },[records,code]);

  function exportCSV(){
    const headers=['id','created_at','patient_code','exercise_done','completion_percentage','pain','fatigue','olive_ml','comments'];
    const rows=filtered.map(r=>headers.map(h=>`"${String(r[h] ?? '').replaceAll('"','""')}"`).join(','));
    const csv=[headers.join(','),...rows].join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='vivi-olive-registros.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return <Card>
    <h2><ClipboardList size={22}/> Panel investigadora</h2>
    <div className="toolbar">
      <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Filtrar por código de paciente" />
      <Button secondary onClick={load}><RefreshCw size={16}/> Actualizar</Button>
      <Button secondary onClick={exportCSV}><Download size={16}/> Exportar CSV</Button>
    </div>
    <p className="note">Registros encontrados: <b>{filtered.length}</b></p>
    <div className="table"><table><thead><tr><th>Fecha/hora</th><th>Paciente</th><th>Ejercicio</th><th>%</th><th>Dolor</th><th>Cansancio</th><th>AOVE</th><th>Comentarios</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.patient_code}</td><td>{r.exercise_done?'Sí':'No'}</td><td>{r.completion_percentage}%</td><td>{r.pain}/10</td><td>{r.fatigue}/10</td><td>{r.olive_ml} ml</td><td>{r.comments || '—'}</td></tr>)}</tbody></table></div>
    {loading && <p>Cargando...</p>}
  </Card>;
}

function App(){
  const [view,setView]=useState('patient');
  return <main className="page wide">
    <div className="topBrand"><div className="logo"><HeartPulse/></div><div><h1>VIVI-OLIVE</h1><p>Registro diario de ejercicio y aceite de oliva</p></div></div>
    <div className="tabs"><button onClick={()=>setView('patient')} className={view==='patient'?'active':''}>Paciente</button><button onClick={()=>setView('investigator')} className={view==='investigator'?'active':''}>Investigadora</button></div>
    {view==='patient' ? <PatientForm/> : <InvestigatorPanel/>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
