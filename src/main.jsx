import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Download, Lock, Save, UserRound, Droplets, Activity, HeartPulse, ClipboardList } from 'lucide-react';
import './styles.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('TU-PROYECTO'));
const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

function downloadCSV(rows) {
  const headers = [
    'id', 'created_at', 'record_date', 'patient_code', 'exercise_done', 'completed_program',
    'completion_percentage', 'pain', 'fatigue', 'olive_tablespoons', 'olive_ml', 'comments'
  ];
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => csvEscape(row[h])).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vivi-olive-registros-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SetupWarning() {
  if (isConfigured) return null;
  return (
    <div className="setup-warning">
      <strong>Falta conectar Supabase.</strong><br />
      En Vercel debes añadir las variables <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.
    </div>
  );
}

function PatientForm() {
  const [patientCode, setPatientCode] = useState('');
  const [exerciseDone, setExerciseDone] = useState(true);
  const [completedProgram, setCompletedProgram] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const [pain, setPain] = useState(0);
  const [fatigue, setFatigue] = useState(0);
  const [oliveTablespoons, setOliveTablespoons] = useState(0);
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const oliveMl = oliveTablespoons * 15;

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!patientCode.trim()) {
      setMessage({ type: 'error', text: 'Introduce tu código de paciente.' });
      return;
    }
    if (!supabase) {
      setMessage({ type: 'error', text: 'La app aún no está conectada a Supabase.' });
      return;
    }

    setSaving(true);
    const payload = {
      record_date: today(),
      patient_code: patientCode.trim().toUpperCase(),
      exercise_done: exerciseDone,
      completed_program: completedProgram,
      completion_percentage: Number(completionPercentage),
      pain: Number(pain),
      fatigue: Number(fatigue),
      olive_tablespoons: Number(oliveTablespoons),
      olive_ml: Number(oliveMl),
      comments: comments.trim() || null,
    };

    const { error } = await supabase.from('records').insert(payload);
    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: `No se ha podido guardar: ${error.message}` });
      return;
    }

    setMessage({ type: 'success', text: 'Registro guardado correctamente. Gracias.' });
    setComments('');
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <section className="section patient-code-section">
        <label className="label">Código de paciente</label>
        <input
          className="text-input big-input"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value)}
          placeholder="Ejemplo: P001"
        />
        <p className="hint">Usa siempre el mismo código asignado por el equipo investigador.</p>
      </section>

      <section className="section">
        <h2><Activity size={24} /> Ejercicio físico</h2>
        <p className="question">¿Has realizado ejercicio hoy?</p>
        <div className="button-row">
          <button type="button" className={exerciseDone ? 'choice active' : 'choice'} onClick={() => setExerciseDone(true)}>✅ Sí</button>
          <button type="button" className={!exerciseDone ? 'choice active' : 'choice'} onClick={() => setExerciseDone(false)}>❌ No</button>
        </div>

        <p className="question">¿Has completado el programa?</p>
        <div className="button-row">
          <button type="button" className={completedProgram ? 'choice active' : 'choice'} onClick={() => { setCompletedProgram(true); setCompletionPercentage(100); }}>✅ Completo</button>
          <button type="button" className={!completedProgram ? 'choice active' : 'choice'} onClick={() => setCompletedProgram(false)}>🟡 Parcial</button>
        </div>

        <label className="label">Porcentaje realizado: {completionPercentage}%</label>
        <input type="range" min="0" max="100" step="5" value={completionPercentage} onChange={(e) => setCompletionPercentage(e.target.value)} />
      </section>

      <section className="section olive-section">
        <h2><Droplets size={24} /> Aceite de oliva virgen extra</h2>
        <p className="target">Objetivo diario: <strong>4 cucharadas = 60 ml</strong></p>
        <div className="olive-grid">
          {[0, 1, 2, 3, 4].map((spoons) => (
            <button
              key={spoons}
              type="button"
              className={Number(oliveTablespoons) === spoons ? 'olive-button selected' : 'olive-button'}
              onClick={() => setOliveTablespoons(spoons)}
            >
              <span className="olive-icon">🫒</span>
              <strong>{spoons}</strong>
              <small>{spoons * 15} ml</small>
            </button>
          ))}
        </div>
        <p className={oliveMl >= 60 ? 'goal ok' : 'goal'}>
          {oliveMl >= 60 ? 'Objetivo de AOVE conseguido hoy.' : `Has tomado ${oliveMl} ml. Faltan ${60 - oliveMl} ml.`}
        </p>
      </section>

      <section className="section">
        <h2><HeartPulse size={24} /> Síntomas de hoy</h2>
        <label className="label">Dolor hoy: {pain}/10</label>
        <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(e.target.value)} />
        <p className="hint">0 = sin dolor, 10 = dolor máximo</p>

        <label className="label">Cansancio hoy: {fatigue}/10</label>
        <input type="range" min="0" max="10" value={fatigue} onChange={(e) => setFatigue(e.target.value)} />
        <p className="hint">0 = nada, 10 = muchísimo</p>
      </section>

      <section className="section">
        <label className="label">Comentarios opcionales</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Ejemplo: hoy me ha dolido la rodilla, no he podido terminar, me he sentido bien..."
        />
      </section>

      <button className="save-button" disabled={saving} type="submit"><Save size={20} /> {saving ? 'Guardando...' : 'Guardar registro de hoy'}</button>
      {message && <div className={message.type === 'success' ? 'message success' : 'message error'}>{message.text}</div>}
    </form>
  );
}

function ProfessionalPanel({ onBack }) {
  const [code, setCode] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadRows() {
    if (!supabase) {
      setError('La app aún no está conectada a Supabase.');
      return;
    }
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows(data || []);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (code.trim().toLowerCase() === 'profesional') {
      setAuthorized(true);
      setTimeout(loadRows, 0);
    } else {
      setError('Código profesional incorrecto.');
    }
  }

  const stats = useMemo(() => {
    const total = rows.length;
    const avg = (field) => total ? Math.round(rows.reduce((s, r) => s + Number(r[field] || 0), 0) / total) : 0;
    const uniquePatients = new Set(rows.map(r => r.patient_code)).size;
    return { total, uniquePatients, avgCompletion: avg('completion_percentage'), avgOlive: avg('olive_ml'), avgPain: avg('pain') };
  }, [rows]);

  if (!authorized) {
    return (
      <div className="card professional-login">
        <h2><Lock size={24} /> Acceso profesional</h2>
        <form onSubmit={handleLogin}>
          <input className="text-input big-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código profesional" />
          <button className="save-button" type="submit">Entrar</button>
        </form>
        {error && <div className="message error">{error}</div>}
        <button className="link-button" onClick={onBack}>Volver al cuestionario</button>
      </div>
    );
  }

  return (
    <div className="card professional-panel">
      <div className="panel-header">
        <h2><ClipboardList size={24} /> Panel profesional</h2>
        <div className="panel-actions">
          <button className="small-button" onClick={loadRows}>{loading ? 'Cargando...' : 'Actualizar'}</button>
          <button className="small-button" onClick={() => downloadCSV(rows)} disabled={!rows.length}><Download size={16} /> Exportar CSV</button>
          <button className="small-button secondary" onClick={onBack}>Cuestionario</button>
        </div>
      </div>
      {error && <div className="message error">{error}</div>}

      <div className="stats-grid">
        <div><strong>{stats.total}</strong><span>registros</span></div>
        <div><strong>{stats.uniquePatients}</strong><span>pacientes</span></div>
        <div><strong>{stats.avgCompletion}%</strong><span>ejercicio medio</span></div>
        <div><strong>{stats.avgOlive} ml</strong><span>AOVE medio</span></div>
        <div><strong>{stats.avgPain}/10</strong><span>dolor medio</span></div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>Paciente</th><th>Ejercicio</th><th>Completo</th><th>%</th><th>Dolor</th><th>Cansancio</th><th>AOVE</th><th>Comentarios</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.record_date}</td>
                <td>{r.patient_code}</td>
                <td>{r.exercise_done ? 'Sí' : 'No'}</td>
                <td>{r.completed_program ? 'Sí' : 'No'}</td>
                <td>{r.completion_percentage}%</td>
                <td>{r.pain}/10</td>
                <td>{r.fatigue}/10</td>
                <td>{r.olive_tablespoons} cuch. / {r.olive_ml} ml</td>
                <td>{r.comments || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty">Todavía no hay registros guardados.</p>}
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('patient');
  return (
    <main className="page">
      <header className="app-header">
        <div className="logo">🫒</div>
        <h1>VIVI-OLIVE</h1>
        <p>Registro diario de ejercicio y aceite de oliva</p>
        <SetupWarning />
      </header>

      {view === 'patient' ? <PatientForm /> : <ProfessionalPanel onBack={() => setView('patient')} />}

      {view === 'patient' && (
        <button className="professional-link" onClick={() => setView('professional')}>
          <UserRound size={18} /> Acceso profesional
        </button>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
