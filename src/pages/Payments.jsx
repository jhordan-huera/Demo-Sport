import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const AVATAR_COLORS = ['#1B73E8', '#0891B2', '#0D9F6F', '#D96716', '#E8A317', '#DC3545', '#C2185B', '#0D47A1'];

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Payments() {
  const { activeStudents, currentSchool, payments, registerPayment } = useApp();
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // for history view

  // Modal form
  const [payStudentId, setPayStudentId] = useState('');
  const [payMonth, setPayMonth] = useState('2026-05');
  const [payMethod, setPayMethod] = useState('Efectivo');
  const [payObservation, setPayObservation] = useState('');

  const categories = currentSchool?.categories || [];
  const months = [
    { id: '2026-05', label: 'Mayo 2026' },
    { id: '2026-04', label: 'Abril 2026' },
    { id: '2026-03', label: 'Marzo 2026' },
    { id: '2026-02', label: 'Febrero 2026' },
    { id: '2026-01', label: 'Enero 2026' },
  ];

  // Financial summary
  const financialSummary = useMemo(() => {
    let totalCollected = 0;
    let totalPending = 0;
    let paidCount = 0;
    let totalCount = 0;

    activeStudents.forEach(s => {
      const p = payments[s.id]?.['2026-05'];
      const cat = categories.find(c => c.id === s.categoryId);
      const fee = s.customFee ?? cat?.fee ?? 25;
      totalCount++;

      if (p?.status === 'paid') {
        totalCollected += fee;
        paidCount++;
      } else {
        totalPending += fee;
      }
    });

    return {
      totalCollected,
      totalPending,
      collectionRate: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0,
    };
  }, [activeStudents, payments, categories]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (filterStatus === 'all') return activeStudents;
    return activeStudents.filter(s => {
      const p = payments[s.id]?.['2026-05'];
      return p?.status === filterStatus || (!p && filterStatus === 'pending');
    });
  }, [activeStudents, payments, filterStatus]);

  const handleRegisterPayment = () => {
    if (!payStudentId || !payMonth || !payMethod) return;
    registerPayment(payStudentId, payMonth, payMethod, payObservation);
    setShowModal(false);
    setPayStudentId('');
    setPayObservation('');
    // If we have a selected student open, refresh their view
    if (selectedStudent && payStudentId === selectedStudent.id) {
      setSelectedStudent({ ...selectedStudent });
    }
  };

  const openPaymentModal = (studentId, monthId) => {
    setPayStudentId(studentId || '');
    setPayMonth(monthId || '2026-05');
    setPayMethod('Efectivo');
    setPayObservation('');
    setShowModal(true);
  };

  const statusLabels = { paid: 'Al día', pending: 'Pendiente', overdue: 'Vencido' };
  const statusClasses = { paid: 'success', pending: 'warning', overdue: 'danger' };
  const circumference = 2 * Math.PI * 26;
  const dashOffset = circumference - (financialSummary.collectionRate / 100) * circumference;

  // ============ HISTORY VIEW ============
  if (selectedStudent) {
    const student = selectedStudent;
    const cat = categories.find(c => c.id === student.categoryId);
    const fee = student.customFee ?? cat?.fee ?? 25;

    return (
      <div>
        <div className="page-header">
          <div className="page-header__left">
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setSelectedStudent(null)}
              style={{ marginBottom: 'var(--space-sm)' }}
            >
              ← Volver a Pagos
            </button>
            <h1 className="page-header__title">Historial de Pagos</h1>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="card card--no-hover" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div
              className="table__avatar"
              style={{ background: getAvatarColor(student.name), width: 56, height: 56, fontSize: '1rem' }}
            >
              {getInitials(student.name)}
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {student.name}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                <span className="badge badge--info" style={cat ? { background: `${cat.color}20`, color: cat.color } : {}}>
                  {cat?.name || student.categoryId}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Mensualidad: <strong>${fee}</strong>
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {months.filter(m => payments[student.id]?.[m.id]?.status === 'paid').length}/{months.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Meses Pagados
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Timeline */}
        <div className="pay-history">
          {months.map((month, idx) => {
            const p = payments[student.id]?.[month.id];
            const status = p?.status || 'pending';
            const isPaid = status === 'paid';

            return (
              <div
                className={`pay-history__item ${isPaid ? 'pay-history__item--paid' : status === 'overdue' ? 'pay-history__item--overdue' : 'pay-history__item--pending'}`}
                key={month.id}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="pay-history__indicator">
                  <div className={`pay-history__dot ${isPaid ? 'pay-history__dot--paid' : status === 'overdue' ? 'pay-history__dot--overdue' : 'pay-history__dot--pending'}`}>
                    {isPaid ? '✓' : status === 'overdue' ? '!' : '•'}
                  </div>
                  {idx < months.length - 1 && <div className="pay-history__line" />}
                </div>
                <div className="pay-history__content">
                  <div className="pay-history__header">
                    <div>
                      <div className="pay-history__month">{month.label}</div>
                      <div className="pay-history__fee">${fee}</div>
                    </div>
                    <div className="pay-history__status">
                      {isPaid ? (
                        <span className="badge badge--success">✅ Pagado</span>
                      ) : (
                        <button
                          className={`btn btn--sm ${status === 'overdue' ? 'btn--danger' : 'btn--primary'}`}
                          onClick={() => openPaymentModal(student.id, month.id)}
                        >
                          💳 Registrar
                        </button>
                      )}
                    </div>
                  </div>
                  {isPaid && p && (
                    <div className="pay-history__details">
                      <div className="pay-history__detail">
                        <span>📅 Fecha:</span> <strong>{p.date}</strong>
                      </div>
                      <div className="pay-history__detail">
                        <span>💳 Método:</span> <strong>{p.method}</strong>
                      </div>
                      {p.observation && (
                        <div className="pay-history__detail">
                          <span>📝 Nota:</span> {p.observation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Modal (same as main view) */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Registrar Pago"
          footer={
            <>
              <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={handleRegisterPayment}>
                💳 Registrar Pago
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Estudiante</label>
            <input className="form-input" value={student.name} disabled />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mes</label>
              <select className="form-select" value={payMonth} onChange={e => setPayMonth(e.target.value)}>
                {months.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Método de Pago</label>
              <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Observaciones (opcional)</label>
            <textarea
              className="form-textarea"
              placeholder="Notas sobre el pago..."
              value={payObservation}
              onChange={e => setPayObservation(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    );
  }

  // ============ MAIN VIEW ============
  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Pagos y Mensualidades</h1>
          <p className="page-header__date">{currentSchool?.name}</p>
        </div>
        <button className="btn btn--primary" onClick={() => openPaymentModal()}>
          ➕ Registrar Pago
        </button>
      </div>

      {/* Financial Summary */}
      <div className="finance-grid">
        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--green">💵</div>
          </div>
          <div className="stat-card__value" style={{ color: 'var(--color-success)' }}>
            ${financialSummary.totalCollected.toLocaleString()}
          </div>
          <div className="stat-card__label">Total Recaudado</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--yellow">⏳</div>
          </div>
          <div className="stat-card__value" style={{ color: 'var(--color-warning)' }}>
            ${financialSummary.totalPending.toLocaleString()}
          </div>
          <div className="stat-card__label">Pendiente de Cobro</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--cyan">📊</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mayo 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginTop: 'var(--space-sm)' }}>
            <div className="circular-progress" style={{ flexShrink: 0 }}>
              <svg width="56" height="56" viewBox="0 0 64 64">
                <circle className="circular-progress__bg" cx="32" cy="32" r="26" />
                <circle
                  className="circular-progress__fill"
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="var(--accent-secondary)"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="circular-progress__text" style={{ fontSize: '0.75rem' }}>{financialSummary.collectionRate}%</div>
            </div>
            <div>
              <div className="stat-card__value" style={{ fontSize: '1.5rem' }}>{financialSummary.collectionRate}%</div>
              <div className="stat-card__label">Tasa de Cobro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <div className="search-bar__filters">
          <select
            className="form-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="paid">Al Día</option>
            <option value="pending">Pendiente</option>
            <option value="overdue">Vencido</option>
          </select>
        </div>
      </div>

      {/* Payments Table — Desktop (simplified) */}
      <div className="table-container payments-desktop">
        <table className="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Categoría</th>
              <th>Mensualidad</th>
              <th>Estado Mayo 2026</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const cat = categories.find(c => c.id === student.categoryId);
              const currentPayment = payments[student.id]?.['2026-05'];
              const currentStatus = currentPayment?.status || 'pending';
              const isPaid = currentStatus === 'paid';

              return (
                <tr key={student.id}>
                  <td>
                    <div className="table__user" style={{ cursor: 'pointer' }} onClick={() => setSelectedStudent(student)}>
                      <div
                        className="table__avatar"
                        style={{ background: getAvatarColor(student.name) }}
                      >
                        {getInitials(student.name)}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--info" style={cat ? { background: `${cat.color}20`, color: cat.color } : {}}>
                      {cat?.name || student.categoryId}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${student.customFee ?? cat?.fee ?? 25}</td>
                  <td>
                    <span className={`badge badge--${statusClasses[currentStatus]}`}>
                      {statusLabels[currentStatus]}
                    </span>
                    {isPaid && currentPayment && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        {currentPayment.date}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="table__actions">
                      {isPaid ? (
                        <span className="badge badge--success" style={{ fontSize: '0.7rem' }}>✅ Pagado</span>
                      ) : (
                        <button
                          className="btn btn--sm btn--secondary"
                          onClick={() => openPaymentModal(student.id, '2026-05')}
                        >
                          💳 Registrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <div className="empty-state__title">Sin resultados</div>
            <div className="empty-state__text">No hay estudiantes con el filtro seleccionado</div>
          </div>
        )}
      </div>

      {/* Payments Cards — Mobile */}
      <div className="payments-mobile">
        {filteredStudents.map(student => {
          const cat = categories.find(c => c.id === student.categoryId);
          const currentPayment = payments[student.id]?.['2026-05'];
          const payStatus = currentPayment?.status || 'pending';

          return (
            <div className="payment-card" key={student.id} style={payStatus === 'paid' ? { borderLeft: '3px solid var(--color-success)' } : payStatus === 'overdue' ? { borderLeft: '3px solid var(--color-danger)' } : {}}>
              <div className="payment-card__header" onClick={() => setSelectedStudent(student)} style={{ cursor: 'pointer' }}>
                <div
                  className="table__avatar"
                  style={{ background: getAvatarColor(student.name), width: 36, height: 36, fontSize: '0.7rem' }}
                >
                  {getInitials(student.name)}
                </div>
                <div className="payment-card__info">
                  <div className="payment-card__name" style={{ color: 'var(--accent-primary)' }}>
                    {student.name}
                  </div>
                  <span className="badge badge--info" style={cat ? { background: `${cat.color}20`, color: cat.color, fontSize: '0.65rem', padding: '2px 6px' } : {}}>
                    {cat?.name || student.categoryId}
                  </span>
                </div>
                <span className={`badge badge--${statusClasses[payStatus]}`}>
                  {statusLabels[payStatus]}
                </span>
              </div>
              <div className="payment-card__details">
                <div className="payment-card__row">
                  <span className="payment-card__label">Mensualidad</span>
                  <span className="payment-card__value">${student.customFee ?? cat?.fee ?? 25}</span>
                </div>
              </div>
              {payStatus === 'paid' ? (
                <div style={{ width: '100%', marginTop: 'var(--space-sm)', textAlign: 'center', padding: '8px', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.8rem' }}>
                  ✅ Pago Registrado
                </div>
              ) : (
                <button
                  className="btn btn--sm btn--primary"
                  onClick={() => openPaymentModal(student.id, '2026-05')}
                  style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                >
                  💳 Registrar Pago
                </button>
              )}
            </div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <div className="empty-state__title">Sin resultados</div>
            <div className="empty-state__text">No hay estudiantes con el filtro seleccionado</div>
          </div>
        )}
      </div>

      {/* Register Payment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Pago"
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn--primary" onClick={handleRegisterPayment}>
              💳 Registrar Pago
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Estudiante</label>
          <select
            className="form-select"
            value={payStudentId}
            onChange={e => setPayStudentId(e.target.value)}
          >
            <option value="">Seleccionar estudiante...</option>
            {activeStudents.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Mes</label>
            <select
              className="form-select"
              value={payMonth}
              onChange={e => setPayMonth(e.target.value)}
            >
              {months.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Método de Pago</label>
            <select
              className="form-select"
              value={payMethod}
              onChange={e => setPayMethod(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Observaciones (opcional)</label>
          <textarea
            className="form-textarea"
            placeholder="Notas sobre el pago..."
            value={payObservation}
            onChange={e => setPayObservation(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
