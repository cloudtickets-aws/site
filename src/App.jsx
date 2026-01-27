import { useState } from 'react'
import './App.css'

function App() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Formulario, 2: Botón de Pago
  const [reservationId, setReservationId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    celular: ''
  });

  // URL de tu API desde las variables de entorno de Vite (GitHub Actions / .env.local)
  const API_URL = import.meta.env.VITE_API_URL;

  const PRECIO_PLATEA = 450000;
  const PRECIO_GENERAL = 180000;
  const SERVICIO = 25000;

  const plateaSeats = Array.from({ length: 40 }, (_, i) => `P-${i + 1}`);
  const generalSeats = Array.from({ length: 80 }, (_, i) => `G-${i + 1}`);

  const handleSelect = (id) => setSelected(id);
  const currentPrice = selected?.startsWith('P') ? PRECIO_PLATEA : PRECIO_GENERAL;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FUNCIÓN 1: LLAMADA A /RESERVE ---
  const createReservation = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: "CONCIERTO_2026",
          seat_id: selected,
          email: formData.email,
          user_id: formData.cedula
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReservationId(data.reservationId);
        setStep(2); // Pasamos al estado de "Pagar"
      } else {
        // --- MODIFICACIÓN: Interceptamos el 409 para el mensaje amigable ---
        if (response.status === 409) {
          alert("❌ Silla no disponible");
        } else {
          alert(`❌ Error: ${data.error || "No se pudo realizar la reserva"}`);
        }
      }
    } catch (error) {
      alert("❌ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN 2: LLAMADA A /PAY ---
  const processPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservationId })
      });

      if (response.ok) {
        alert(`✅ ¡Pago Exitoso!\nTu reserva ${reservationId} ha sido confirmada.`);
        resetFlow();
      } else {
        alert("❌ El pago falló o la reserva expiró.");
      }
    } catch (error) {
      alert("❌ Error procesando el pago");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setShowModal(false);
    setStep(1);
    setSelected(null);
    setReservationId(null);
    setFormData({ nombre: '', email: '', cedula: '', celular: '' });
  };

  return (
    <div className="main-layout">
      {/* Banner Principal */}
      <div className="event-banner">
        <div className="live-indicator"><span className="dot"></span> EN VIVO</div>
        <h1 className="main-title">AWS Cloud Tour 2026 ☁️</h1>
        <h2 className="sub-title">Los Libertadores Arena</h2>
        <p className="event-info">29 de febrero 2026 | 17:00 | Bogotá, Colombia</p>
      </div>

      {/* Mapa de Asientos */}
      <div className="arena-map">
        <div className="stage-box">ESCENARIO PRINCIPAL</div>
        <div className="section-header">
          <span>Platea VIP</span>
          <span className="price-tag">${PRECIO_PLATEA.toLocaleString()}</span>
        </div>
        <div className="seating-section">
          {plateaSeats.map(id => (
            <button 
              key={id} 
              className={`seat ${selected === id ? 'selected' : ''}`} 
              style={{ backgroundColor: selected === id ? '#f59e0b' : '#10b981' }}
              onClick={() => handleSelect(id)}
            />
          ))}
        </div>

        <div className="section-header">
          <span>Tribuna General</span>
          <span className="price-tag">${PRECIO_GENERAL.toLocaleString()}</span>
        </div>
        <div className="seating-section">
          {generalSeats.map(id => (
            <button 
              key={id} 
              className={`seat ${selected === id ? 'selected' : ''}`} 
              style={{ backgroundColor: selected === id ? '#f59e0b' : '#3b82f6' }}
              onClick={() => handleSelect(id)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar de Resumen */}
      <aside className="checkout-card">
        <h2 className="summary-title">Resumen de Compra</h2>
        <div className="details-box">
          <div className="row"><span>Ubicación:</span><span className="highlight">{selected || 'No seleccionado'}</span></div>
          <div className="row"><span>Precio Unitario:</span><span>{selected ? `$${currentPrice.toLocaleString()}` : '-'}</span></div>
          <div className="row"><span>Cargo Servicio:</span><span>{selected ? `$${SERVICIO.toLocaleString()}` : '-'}</span></div>
          <div className="total-box">
            <span>TOTAL</span>
            <span className="total-amount">
              {selected ? `$${(currentPrice + SERVICIO).toLocaleString()}` : '$0'}
            </span>
          </div>
        </div>
        <button 
          className="btn-confirm" 
          disabled={!selected} 
          onClick={() => setShowModal(true)}
        >
          AÑADIR AL CARRITO
        </button>
      </aside>

      {/* MODAL MULTI-PASO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {step === 1 ? (
              <>
                <h3>Finalizar Reserva</h3>
                <p>Al confirmar, el asiento se bloqueará por 30 segundos.</p>
                <form onSubmit={createReservation}>
                  <input 
                    type="text" name="nombre" placeholder="Nombre Completo" 
                    required onChange={handleInputChange} value={formData.nombre} 
                  />
                  <input 
                    type="email" name="email" placeholder="Correo Electrónico" 
                    required onChange={handleInputChange} value={formData.email} 
                  />
                  <div className="form-row">
                    <input 
                      type="text" name="cedula" placeholder="Cédula/ID" 
                      required onChange={handleInputChange} value={formData.cedula} 
                    />
                    <input 
                      type="tel" name="celular" placeholder="Celular" 
                      required onChange={handleInputChange} value={formData.celular} 
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={resetFlow}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? 'RESERVANDO...' : 'RESERVAR AHORA'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3>💳 Pasarela de Pago</h3>
                <p>Reserva generada: <strong>{reservationId}</strong></p>
                <p>Asiento: <strong>{selected}</strong></p>
                <div style={{ background: '#334155', padding: '15px', borderRadius: '10px', margin: '20px 0', fontSize: '0.85rem', color: '#fbbf24' }}>
                   ⚠️ Tienes 30 segundos para pagar o perderás tu lugar.
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={resetFlow}>Cancelar</button>
                  <button type="button" className="btn-submit" style={{ background: '#10b981' }} onClick={processPayment} disabled={loading}>
                    {loading ? 'PROCESANDO...' : 'PAGAR TOTAL'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App