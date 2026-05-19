import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{
      fontFamily:'Arial',
      minHeight:'100vh',
      background:'#f4f7f4',
      padding:'20px'
    }}>
      
      <h1 style={{
        textAlign:'center',
        color:'#1f2937'
      }}>
        🫒 VIVI-OLIVE
      </h1>

      <p style={{
        textAlign:'center',
        color:'#4b5563',
        fontSize:'18px'
      }}>
        Registro diario de ejercicio y aceite de oliva
      </p>

      <div style={{
        maxWidth:'700px',
        margin:'30px auto',
        background:'white',
        borderRadius:'20px',
        padding:'25px',
        boxShadow:'0 4px 12px rgba(0,0,0,0.08)'
      }}>

        <h2>💪 Ejercicio físico</h2>

        <p>¿Has realizado ejercicio hoy?</p>

        <div style={{display:'flex', gap:'10px'}}>
          <button style={btn}>✅ Sí</button>
          <button style={btn}>❌ No</button>
        </div>

        <br/>

        <p>¿Has completado el programa?</p>

        <div style={{display:'flex', gap:'10px'}}>
          <button style={btn}>✅ Completo</button>
          <button style={btn}>🟡 Parcial</button>
        </div>

        <br/>

        <h2>🫒 Aceite de oliva virgen extra</h2>

        <p>
          Objetivo diario:
          <strong> 4 cucharadas = 60 ml</strong>
        </p>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(5,1fr)',
          gap:'10px'
        }}>
          {[0,1,2,3,4].map(n=>(
            <button key={n} style={oliveBtn}>
              🫒
              <br/>
              {n}
            </button>
          ))}
        </div>

        <br/>

        <h2>😊 Dolor hoy</h2>

        <input type="range" min="0" max="10" style={{width:'100%'}} />

        <div style={{
          marginTop:'30px',
          padding:'20px',
          background:'#ecfdf5',
          borderRadius:'16px',
          textAlign:'center'
        }}>
          <h2>🏆 Recompensa del día</h2>

          <p style={{fontSize:'18px'}}>
            ¡Cada día que completas el programa estás ayudando a tu salud!
          </p>

          <div style={{fontSize:'40px'}}>
            🌟 💪 🫒
          </div>
        </div>

      </div>
    </div>
  )
}

const btn = {
  padding:'15px',
  borderRadius:'14px',
  border:'none',
  background:'#2563eb',
  color:'white',
  fontSize:'18px',
  cursor:'pointer',
  flex:1
}

const oliveBtn = {
  padding:'18px',
  borderRadius:'18px',
  border:'2px solid #10b981',
  background:'white',
  fontSize:'22px',
  cursor:'pointer'
}

createRoot(document.getElementById('root')).render(<App />);
