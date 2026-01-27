import { useState } from 'react'
import './App.css'

function App() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Control del modal
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    celular: ''
  });

  const PRECIO_PLATEA = 450000;
  const PRECIO_GENERAL = 180000;
  const SERVICIO = 25000;

  const plateaSeats = Array.from({ length: 40 }, (_, i) => `P-${i + 1}`);
  const generalSeats = Array.from({ length: 80 }, (_, i) => `G-${i + 1}`);

  const handleSelect = (id) => setSelected(id);
  const currentPrice = selected?.startsWith('P') ? PRECIO_PLATEA : PRECIO_GENERAL;

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const confirmBooking = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Aquí es donde enviaremos los datos a AWS API Gateway más adelante
    setTimeout(() => {
      alert(`✅ Reserva exitosa para ${formData.nombre}\nAsiento: ${selected}\nEnviando confirmación a: ${formData.email}`);
      setLoading(false);
      setSelected(null);
      setShowModal(false);
      setFormData({ nombre: '', email: '', cedula: '', celular: '' });
    }, 1500);
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

      {/* MODAL DE DATOS DEL CLIENTE */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Finalizar Reserva</h3>
            <p>Tienes 30 segundos para completar tus datos y asegurar tu asiento.</p>
            <form onSubmit={confirmBooking}>
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
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'RESERVANDO...' : 'CONFIRMAR Y PAGAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App