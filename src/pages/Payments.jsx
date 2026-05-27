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
      const fee = cat?.fee || 25;
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
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div className="circular-progress">
              <svg width="64" height="64" viewBox="0 0 64 64">
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
              <div className="circular-progress__text">{financialSummary.collectionRate}%</div>
            </div>
            <div>
              <div className="stat-card__label">Tasa de Cobro</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Mayo 2026
              </div>
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

      {/* Payments Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Categoría</th>
              {months.map(m => <th key={m.id}>{m.label}</th>)}
              <th>Mensualidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const cat = categories.find(c => c.id === student.categoryId);

              return (
                <tr key={student.id}>
                  <td>
                    <div className="table__user">
                      <div
                        className="table__avatar"
                        style={{ background: getAvatarColor(student.name) }}
                      >
                        {getInitials(student.name)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{student.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--info" style={cat ? { background: `${cat.color}20`, color: cat.color } : {}}>
                      {cat?.name || student.categoryId}
                    </span>
                  </td>
                  {months.map(m => {
                    const p = payments[student.id]?.[m.id];
                    const status = p?.status || 'pending';
                    return (
                      <td key={m.id}>
                        <span className={`badge badge--${statusClasses[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ fontWeight: 600 }}>${cat?.fee || 25}</td>
                  <td>
                    <div className="table__actions">
                      <button
                        className="btn btn--sm btn--secondary"
                        onClick={() => openPaymentModal(student.id, '2026-05')}
                      >
                        💳 Registrar
                      </button>
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
