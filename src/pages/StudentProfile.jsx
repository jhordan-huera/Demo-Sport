import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

const AVATAR_COLORS = ['#1B73E8', '#0891B2', '#0D9F6F', '#D96716', '#E8A317', '#DC3545', '#C2185B', '#0D47A1'];

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, currentSchool, attendance, payments } = useApp();

  const student = students.find(s => s.id === id);
  const category = currentSchool?.categories.find(c => c.id === student?.categoryId);

  const attendanceData = useMemo(() => {
    if (!student) return { records: {}, rate: 0, present: 0, total: 0 };
    const records = attendance[student.id] || {};
    const entries = Object.values(records);
    const present = entries.filter(Boolean).length;
    const total = entries.length;
    return {
      records,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      present,
      total,
    };
  }, [student, attendance]);

  const paymentHistory = useMemo(() => {
    if (!student) return [];
    const p = payments[student.id] || {};
    const months = [
      { id: '2026-05', label: 'Mayo 2026' },
      { id: '2026-04', label: 'Abril 2026' },
      { id: '2026-03', label: 'Marzo 2026' },
    ];
    return months.map(m => ({
      ...m,
      ...(p[m.id] || { status: 'pending', amount: category?.fee || 25, date: null, method: null }),
    }));
  }, [student, payments, category]);

  // Generate calendar for May 2026
  const calendarDays = useMemo(() => {
    const year = 2026;
    const month = 4; // May (0-indexed)
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, type: 'empty' });
    }

    const dayMap = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 0 };
    const trainingDayNumbers = (currentSchool?.trainingDays || []).map(d => dayMap[d]);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isTrainingDay = trainingDayNumbers.includes(dayOfWeek);
      const record = attendanceData.records[dateKey];
      const isToday = d === 27;

      let type = 'no-class';
      if (isTrainingDay) {
        if (record === true) type = 'present';
        else if (record === false) type = 'absent';
        else if (d <= 27) type = 'no-class';
      }

      days.push({ day: d, type, isToday });
    }

    return days;
  }, [currentSchool, attendanceData]);

  if (!student) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">❌</div>
        <div className="empty-state__title">Estudiante no encontrado</div>
        <button className="btn btn--primary" onClick={() => navigate('/students')}>
          Volver a Estudiantes
        </button>
      </div>
    );
  }

  const statusLabels = { paid: 'Al día', pending: 'Pendiente', overdue: 'Vencido' };
  const statusClasses = { paid: 'success', pending: 'warning', overdue: 'danger' };
  const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <button className="page-header__back" onClick={() => navigate('/students')}>
            ← Volver a Estudiantes
          </button>
          <h1 className="page-header__title">Perfil del Estudiante</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card card--no-hover" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="profile-header">
          <div
            className="profile-avatar"
            style={{ background: getAvatarColor(student.name) }}
          >
            {getInitials(student.name)}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{student.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge--info" style={category ? { background: `${category.color}20`, color: category.color } : {}}>
                {category?.name || student.categoryId}
              </span>
              <span className={`badge badge--${student.active ? 'success' : 'danger'}`}>
                {student.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="profile-details">
              <div className="profile-detail">
                <span className="profile-detail__label">Edad</span>
                <span className="profile-detail__value">{student.age} años</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail__label">Representante</span>
                <span className="profile-detail__value">{student.representative}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail__label">Teléfono</span>
                <span className="profile-detail__value">{student.phone}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail__label">Registro</span>
                <span className="profile-detail__value">{student.registeredAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        {/* Attendance Calendar */}
        <div className="card card--no-hover">
          <div className="card__title">📅 Asistencia — Mayo 2026</div>

          <div className="calendar">
            {dayHeaders.map(d => (
              <div className="calendar__day-header" key={d}>{d}</div>
            ))}
            {calendarDays.map((cell, idx) => (
              <div
                key={idx}
                className={`calendar__day calendar__day--${cell.type}${cell.isToday ? ' calendar__day--today' : ''}`}
              >
                {cell.day}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <div className="profile-detail">
              <span className="profile-detail__label">Asistencia</span>
              <span className="profile-detail__value" style={{ color: 'var(--color-success)' }}>{attendanceData.rate}%</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail__label">Días Asistidos</span>
              <span className="profile-detail__value">{attendanceData.present}/{attendanceData.total}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="card card--no-hover">
          <div className="card__title">💰 Historial de Pagos</div>
          <div className="table-container" style={{ border: 'none', background: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Estado</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.label}</td>
                    <td>
                      <span className={`badge badge--${statusClasses[p.status]}`}>
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td>${p.amount}</td>
                    <td>{p.date || '—'}</td>
                    <td>{p.method || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
