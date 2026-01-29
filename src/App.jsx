import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [reservationId, setReservationId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false); // Nuevo para control de descarga
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    celular: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const PRECIO_PLATEA = 450000;
  const PRECIO_GENERAL = 180000;
  const SERVICIO = 25000;

  const plateaSeats = Array.from({ length: 40 }, (_, i) => `P-${i + 1}`);
  const generalSeats = Array.from({ length: 80 }, (_, i) => `G-${i + 1}`);

  const handleSelect = (id) => setSelected(id);
  const currentPrice = selected?.startsWith('P') ? PRECIO_PLATEA : PRECIO_GENERAL;
  const seatType = selected?.startsWith('P') ? 'Platea VIP' : 'Tribuna General';

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Confetti effect
  useEffect(() => {
    if (paymentSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  const createReservation = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: "AWS_CLOUD_TOUR",
          seat_id: selected,
          email: formData.email,
          user_id: formData.cedula
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReservationId(data.reservationId);
        setStep(2);
      } else {
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

  const processPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: reservationId })
      });

      if (response.ok) {
        setPaymentSuccess(true);
        setShowModal(false);
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

  const startOver = () => {
    setPaymentSuccess(false);
    setSelected(null);
    setReservationId(null);
    setStep(1);
    setFormData({ nombre: '', email: '', cedula: '', celular: '' });
  };

  // --- MODIFICACIÓN: Lógica real de descarga ---
  const handleDownloadTicket = async () => {
    if (!reservationId) {
      alert("No hay una reserva activa.");
      return;
    }

    setTicketLoading(true);
    try {
      // 1. Aquí creas el nombre correcto
      const fileName = `ticket-${reservationId}.pdf`; 
      
      // 2. AQUÍ ESTABA EL ERROR: Debes pasar 'fileName' en la URL, no 'reservationId'
      const response = await fetch(`${API_URL}/get-ticket?reservationId=${fileName}`);
      
      const data = await response.json();

      if (response.ok && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert(`❌ Error: ${data.error || "No se pudo obtener el enlace de descarga"}`);
      }
    } catch (error) {
      console.error("Error al obtener ticket:", error);
      alert("❌ Error de conexión al generar el ticket");
    } finally {
      setTicketLoading(false);
    }
  };
  // --- FIN MODIFICACIÓN ---

  const handleAddToCalendar = () => {
    alert('En producción, esto agregaría el evento al calendario');
  };

  // Datos para la página de éxito
  const confirmationCode = reservationId ? 'AWC-' + reservationId.split('-').pop().toUpperCase() : '';
  const purchaseDate = new Date().toLocaleDateString('es-CO', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // PÁGINA DE CONFIRMACIÓN DE PAGO EXITOSO
  if (paymentSuccess) {
    return (
      <div className="success-page">
        {showConfetti && <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 4)]
            }}></div>
          ))}
        </div>}

        <div className="success-container">
          
          {/* Success Header */}
          <div className="success-header">
            <div className="success-icon-wrapper">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <h1 className="success-title">¡Pago Exitoso!</h1>
            <p className="success-subtitle">Tu reserva ha sido confirmada exitosamente</p>
            <div className="confirmation-code">
              <span className="code-label">Código de confirmación</span>
              <span className="code-value">{confirmationCode}</span>
            </div>
          </div>

          {/* Ticket Card */}
          <div className="ticket-card">
            <div className="ticket-header-bg">
              <div className="ticket-pattern"></div>
            </div>
            
            <div className="ticket-content">
              <div className="ticket-top">
                <div className="event-badge">ENTRADA CONFIRMADA</div>
                
                <div className="event-details">
                  <h2 className="event-name">AWS Cloud Tour 2026</h2>
                  <div className="event-meta">
                    <div className="meta-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>29 de Febrero 2026</span>
                    </div>
                    <div className="meta-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>17:00</span>
                    </div>
                    <div className="meta-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>Libertadores Stadium, Bogotá</span>
                    </div>
                  </div>
                </div>

                <div className="ticket-divider">
                  <div className="divider-circle left"></div>
                  <div className="divider-line"></div>
                  <div className="divider-circle right"></div>
                </div>

                <div className="seat-info">
                  <div className="seat-detail">
                    <span className="seat-label">Sección</span>
                    <span className="seat-value">{seatType}</span>
                  </div>
                  <div className="seat-detail">
                    <span className="seat-label">Asiento</span>
                    <span className="seat-value seat-number">{selected}</span>
                  </div>
                  <div className="seat-detail">
                    <span className="seat-label">Entrada</span>
                    <span className="seat-value">General</span>
                  </div>
                </div>
              </div>

              <div className="ticket-barcode">
                <div className="barcode">
                  <div className="barcode-line" style={{width: '2px'}}></div>
                  <div className="barcode-line" style={{width: '4px'}}></div>
                  <div className="barcode-line" style={{width: '2px'}}></div>
                  <div className="barcode-line" style={{width: '6px'}}></div>
                  <div className="barcode-line" style={{width: '3px'}}></div>
                  <div className="barcode-line" style={{width: '2px'}}></div>
                  <div className="barcode-line" style={{width: '5px'}}></div>
                  <div className="barcode-line" style={{width: '2px'}}></div>
                  <div className="barcode-line" style={{width: '4px'}}></div>
                  <div className="barcode-line" style={{width: '2px'}}></div>
                  <div className="barcode-line" style={{width: '3px'}}></div>
                  <div className="barcode-line" style={{width: '6px'}}></div>
                  <div className="barcode-line" style={{width: '2px'}}></div>
                  <div className="barcode-line" style={{width: '4px'}}></div>
                  <div className="barcode-line" style={{width: '2px'}}></div>
                </div>
                <div className="barcode-number">{reservationId}</div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="payment-summary">
            <h3 className="summary-title">Resumen de pago</h3>
            <div className="summary-content">
              <div className="summary-row">
                <span>Entrada {seatType}</span>
                <span>${currentPrice.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Cargo por servicio</span>
                <span>${SERVICIO.toLocaleString()}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total pagado</span>
                <span>${(currentPrice + SERVICIO).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="order-details">
            <h3 className="details-title">Detalles de la orden</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">ID de reserva</span>
                <span className="detail-value">{reservationId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de compra</span>
                <span className="detail-value">{purchaseDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nombre</span>
                <span className="detail-value">{formData.nombre}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{formData.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-download" onClick={handleDownloadTicket} disabled={ticketLoading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {ticketLoading ? 'Generando...' : 'Descargar Ticket (PDF)'}
            </button>
            <button className="btn-calendar" onClick={handleAddToCalendar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Agregar al Calendario
            </button>
          </div>

          {/* Email Confirmation Notice */}
          <div className="email-notice">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <div className="notice-content">
              <strong>Confirmación enviada</strong>
              <p>Hemos enviado los detalles de tu reserva a <strong>{formData.email}</strong></p>
            </div>
          </div>

          {/* Important Info */}
          <div className="important-info">
            <h4>Información importante</h4>
            <ul>
              <li>Presenta tu ticket (digital o impreso) en la entrada del evento</li>
              <li>Llega con al menos 30 minutos de anticipación</li>
              <li>El código de barras será escaneado al ingresar</li>
              <li>No se permiten reembolsos después de la compra</li>
            </ul>
          </div>

          {/* Home Button */}
          <button onClick={startOver} className="btn-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Volver al inicio
          </button>

        </div>
      </div>
    );
  }

  // PÁGINA PRINCIPAL DE SELECCIÓN DE SILLAS
  return (
    <div className="page-container">
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="event-tag">
            <span className="tag-dot"></span>
            EN VIVO • EVENTO EXCLUSIVO
          </div>
          <h1 className="hero-title">AWS Cloud Tour 2026</h1>
          <div className="hero-details">
            <span className="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              29 Febrero 2026
            </span>
            <span className="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              17:00
            </span>
            <span className="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Bogotá, Colombia
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Stadium Visualization */}
        <div className="stadium-section">
          <div className="section-header">
            <h2>Selecciona tu ubicación</h2>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color vip-color"></div>
                <span>Platea VIP</span>
              </div>
              <div className="legend-item">
                <div className="legend-color general-color"></div>
                <span>Tribuna General</span>
              </div>
              <div className="legend-item">
                <div className="legend-color selected-color"></div>
                <span>Seleccionado</span>
              </div>
            </div>
          </div>

          <div className="stadium-view">
            {/* Stage */}
            <div className="stage-area">
              <div className="stage-label">ESCENARIO</div>
            </div>

            {/* VIP Section */}
            <div className="seating-zone vip-zone">
              <div className="zone-label">
                <span className="zone-badge vip-badge">VIP</span>
                <span className="zone-name">Platea VIP</span>
                <span className="zone-price">${(PRECIO_PLATEA/1000).toFixed(0)}K</span>
              </div>
              <div className="seats-grid vip-grid">
                {plateaSeats.map(id => (
                  <button 
                    key={id} 
                    className={`seat ${selected === id ? 'selected' : ''}`}
                    onClick={() => handleSelect(id)}
                    title={id}
                  >
                    {id.split('-')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* General Section */}
            <div className="seating-zone general-zone">
              <div className="zone-label">
                <span className="zone-badge general-badge">GENERAL</span>
                <span className="zone-name">Tribuna General</span>
                <span className="zone-price">${(PRECIO_GENERAL/1000).toFixed(0)}K</span>
              </div>
              <div className="seats-grid general-grid">
                {generalSeats.map(id => (
                  <button 
                    key={id} 
                    className={`seat ${selected === id ? 'selected' : ''}`}
                    onClick={() => handleSelect(id)}
                    title={id}
                  >
                    {id.split('-')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Card */}
        <aside className="checkout-section">
          <div className="checkout-card">
            <h3 className="checkout-title">Tu Reserva</h3>
            
            {selected ? (
              <div className="ticket-preview">
                <div className="ticket-header">
                  <div className="ticket-type">
                    {selected.startsWith('P') ? 'PLATEA VIP' : 'TRIBUNA GENERAL'}
                  </div>
                  <div className="ticket-seat">{selected}</div>
                </div>
                <div className="ticket-divider"></div>
                <div className="ticket-event">AWS Cloud Tour 2026</div>
                <div className="ticket-date">29 Feb 2026 • 17:00</div>
              </div>
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 2v4"></path>
                  <path d="M15 2v4"></path>
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
                <p>Selecciona un asiento para continuar</p>
              </div>
            )}

            <div className="price-breakdown">
              <div className="price-row">
                <span>Precio entrada</span>
                <span>{selected ? `$${currentPrice.toLocaleString()}` : '-'}</span>
              </div>
              <div className="price-row">
                <span>Cargo por servicio</span>
                <span>{selected ? `$${SERVICIO.toLocaleString()}` : '-'}</span>
              </div>
              <div className="price-total">
                <span>Total</span>
                <span>{selected ? `$${(currentPrice + SERVICIO).toLocaleString()}` : '$0'}</span>
              </div>
            </div>

            <button 
              className="checkout-btn" 
              disabled={!selected}
              onClick={() => setShowModal(true)}
            >
              {selected ? 'Continuar a Checkout' : 'Selecciona un asiento'}
            </button>

            <div className="trust-badges">
              <div className="badge-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                Compra Segura
              </div>
              <div className="badge-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
                Confirmación Instantánea
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetFlow()}>
          <div className="modal-container">
            <button className="modal-close" onClick={resetFlow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {step === 1 ? (
              <>
                <h2 className="modal-title">Completa tu información</h2>
                <p className="modal-subtitle">Tu asiento se reservará por 30 segundos</p>
                
                <form onSubmit={createReservation} className="checkout-form">
                  <div className="form-group">
                    <label>Nombre completo</label>
                    <input 
                      type="text" 
                      name="nombre" 
                      placeholder="Juan Pérez" 
                      required 
                      onChange={handleInputChange} 
                      value={formData.nombre} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="juan@ejemplo.com" 
                      required 
                      onChange={handleInputChange} 
                      value={formData.email} 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cédula / ID</label>
                      <input 
                        type="text" 
                        name="cedula" 
                        placeholder="1234567890" 
                        required 
                        onChange={handleInputChange} 
                        value={formData.cedula} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Celular</label>
                      <input 
                        type="tel" 
                        name="celular" 
                        placeholder="300 123 4567" 
                        required 
                        onChange={handleInputChange} 
                        value={formData.celular} 
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={resetFlow}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner"></span>
                          Reservando...
                        </>
                      ) : 'Reservar Ahora'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="payment-step">
                <div className="success-icon-modal">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 className="modal-title">¡Reserva Confirmada!</h2>
                <p className="modal-subtitle">ID: <strong>{reservationId}</strong></p>
                
                <div className="reservation-details">
                  <div className="detail-row">
                    <span>Asiento</span>
                    <strong>{selected}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Total a pagar</span>
                    <strong>${(currentPrice + SERVICIO).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="timer-warning">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Tienes 30 segundos para completar el pago
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetFlow}>
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary btn-payment" 
                    onClick={processPayment} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Pagar ${(currentPrice + SERVICIO).toLocaleString()}
                      </>
                    )}
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