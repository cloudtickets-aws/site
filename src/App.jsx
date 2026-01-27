import { useState } from 'react'
import './App.css'

function App() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Precios diferenciados
  const PRECIO_PLATEA = 450000;
  const PRECIO_GENERAL = 180000;
  const SERVICIO = 25000;

  const plateaSeats = Array.from({ length: 40 }, (_, i) => `P-${i + 1}`);
  const generalSeats = Array.from({ length: 80 }, (_, i) => `G-${i + 1}`);

  const handleSelect = (id) => setSelected(id);
  const currentPrice = selected?.startsWith('P') ? PRECIO_PLATEA : PRECIO_GENERAL;

  const confirmBooking = () => {
    setLoading(true);
    setTimeout(() => {
      alert(`✅ Reserva exitosa para el AWS Cloud Tour\nAsiento: ${selected}\nEnviando evento a AWS EventBridge/SNS...`);
      setLoading(false);
      setSelected(null);
    }, 1500);
  };

  return (
    <div className="main-layout">
      {/* Banner Principal con AWS Cloud Tour */}
      <div className="event-banner">
        <div className="live-indicator">
          <span className="dot"></span> EN VIVO
        </div>
        <h1 className="main-title">AWS Cloud Tour 2026 ☁️</h1>
        <h2 className="sub-title">Los Libertadores Arena</h2>
        <p className="event-info">29 de febrero 2026 | 17:00 | Bogotá, Colombia</p>
      </div>

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
          <div className="row">
            <span>Ubicación:</span>
            <span className="highlight">{selected || 'No seleccionado'}</span>
          </div>
          <div className="row">
            <span>Precio Unitario:</span>
            <span>{selected ? `$${currentPrice.toLocaleString()}` : '-'}</span>
          </div>
          <div className="row">
            <span>Cargo Servicio:</span>
            <span>{selected ? `$${SERVICIO.toLocaleString()}` : '-'}</span>
          </div>
          <div className="total-box">
            <span>TOTAL</span>
            <span className="total-amount">
              {selected ? `$${(currentPrice + SERVICIO).toLocaleString()}` : '$0'}
            </span>
          </div>
        </div>
        <button 
          className="btn-confirm" 
          disabled={!selected || loading} 
          onClick={confirmBooking}
        >
          {loading ? 'CONECTANDO A AWS...' : 'Añadir al carrito'}
        </button>
      </aside>
    </div>
  )
}

export default App