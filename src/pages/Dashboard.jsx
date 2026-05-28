import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { currentSchool, currentUser, userRole, stats, categoryAttendance, alerts, students, attendance } = useApp();

  if (!currentSchool) return null;

  // For coaches: compute stats only for their assigned categories
  const coachStats = useMemo(() => {
    if (userRole !== 'coach' || !currentUser?.assignedCategories) return null;
    const assignedCats = currentUser.assignedCategories;
    const myStudents = students.filter(s => assignedCats.includes(s.categoryId) && s.active);

    // Attendance rate for my students
    let totalRecords = 0, totalPresent = 0;
    myStudents.forEach(s => {
      const records = attendance[s.id] || {};
      const entries = Object.values(records);
      totalRecords += entries.length;
      totalPresent += entries.filter(Boolean).length;
    });
    const attRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
    const catNames = assignedCats.map(catId => currentSchool.categories.find(c => c.id === catId)?.name || catId);

    return {
      totalStudents: myStudents.length,
      attendanceRate: attRate,
      categoryNames: catNames,
    };
  }, [userRole, currentUser, students, attendance, currentSchool]);

  // Filter categories based on role
  const visibleCategories = categoryAttendance.filter(c =>
    userRole === 'director' || currentUser?.assignedCategories?.includes(c.id)
  );
  const maxRate = Math.max(...visibleCategories.map(w => w.rate), 1);
  const userName = currentUser?.name || currentSchool.adminName;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header__left">
          <p className="page-header__greeting">
            Bienvenido, {userName}
          </p>
          <h1 className="page-header__title">Dashboard</h1>
          {userRole === 'coach' && coachStats && (
            <p className="page-header__date" style={{ marginTop: '4px' }}>
              <span className="badge badge--success" style={{ fontSize: '0.7rem' }}>🏋️ Entrenador</span>
              {' '}Categorías: {coachStats.categoryNames.join(', ')}
            </p>
          )}
        </div>
        <p className="page-header__date">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className={`stat-grid${userRole === 'coach' ? '' : ''}`}>
        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--blue">👥</div>
            {userRole === 'director' && (
              <span className="stat-card__trend stat-card__trend--up">+{stats.newThisMonth} este mes</span>
            )}
          </div>
          <div className="stat-card__value">
            {userRole === 'coach' ? coachStats?.totalStudents : stats.totalStudents}
          </div>
          <div className="stat-card__label">
            {userRole === 'coach' ? 'Mis Estudiantes' : 'Total Estudiantes'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--green">✅</div>
          </div>
          <div className="stat-card__value">
            {userRole === 'coach' ? coachStats?.attendanceRate : stats.attendanceRate}%
          </div>
          <div className="stat-card__label">Asistencia Mensual</div>
          <div className="progress-bar">
            <div
              className="progress-bar__fill progress-bar__fill--green"
              style={{ width: `${userRole === 'coach' ? coachStats?.attendanceRate : stats.attendanceRate}%` }}
            />
          </div>
        </div>

        {userRole === 'director' && (
          <>
            <div className="stat-card">
              <div className="stat-card__header">
                <div className="stat-card__icon stat-card__icon--yellow">💳</div>
              </div>
              <div className="stat-card__value">{stats.paymentRate}%</div>
              <div className="stat-card__label">Pagos al Día</div>
              <div className="progress-bar">
                <div
                  className={`progress-bar__fill ${stats.paymentRate >= 75 ? 'progress-bar__fill--green' : 'progress-bar__fill--yellow'}`}
                  style={{ width: `${stats.paymentRate}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card__header">
                <div className="stat-card__icon stat-card__icon--cyan">💵</div>
                <span className="stat-card__trend stat-card__trend--up">+$125</span>
              </div>
              <div className="stat-card__value">${stats.monthlyIncome.toLocaleString()}</div>
              <div className="stat-card__label">Ingresos del Mes</div>
            </div>
          </>
        )}
      </div>

      {/* Charts & Alerts */}
      <div className="content-grid">
        {/* Attendance by Category Chart */}
        <div className="card card--no-hover">
          <div className="card__title">📊 Asistencia por Categoría</div>
          <div className="chart-container">
            <div className="chart-bars">
              {visibleCategories.map((item, idx) => (
                <div className="chart-bar" key={idx}>
                  <div className="chart-bar__value">{item.rate}%</div>
                  <div
                    className="chart-bar__fill"
                    style={{ height: `${(item.rate / maxRate) * 100}%`, background: item.color }}
                  />
                  <div className="chart-bar__label">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts / Info */}
        <div className="card card--no-hover">
          {userRole === 'director' ? (
            <>
              <div className="card__title">🔔 Alertas Recientes</div>
              <div className="alerts-list">
                {alerts.map((alert, idx) => (
                  <div className="alert-item" key={idx} style={{ animationDelay: `${idx * 0.08}s` }}>
                    <div className={`alert-item__dot alert-item__dot--${alert.type}`} />
                    <span className="alert-item__text">{alert.text}</span>
                    <span className="alert-item__time">{alert.time}</span>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state__icon">✨</div>
                    <div className="empty-state__title">¡Todo en orden!</div>
                    <div className="empty-state__text">No hay alertas pendientes</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="card__title">📋 Información</div>
              <div className="alerts-list">
                <div className="alert-item">
                  <div className="alert-item__dot alert-item__dot--info" />
                  <span className="alert-item__text">
                    Categorías a cargo: <strong>{coachStats?.categoryNames.join(', ')}</strong>
                  </span>
                </div>
                <div className="alert-item">
                  <div className="alert-item__dot alert-item__dot--success" />
                  <span className="alert-item__text">
                    Horarios: {(currentSchool.categories || [])
                      .filter(c => currentUser?.assignedCategories?.includes(c.id))
                      .map(c => `${c.name}: ${(c.trainingDays || []).join(', ')} (${c.trainingStart || '—'}–${c.trainingEnd || '—'})`)
                      .join(' · ')}
                  </span>
                </div>
                <div className="alert-item">
                  <div className="alert-item__dot alert-item__dot--info" />
                  <span className="alert-item__text">
                    Para pagos y configuración, contacta al Director
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule Grid — all categories */}
      <div className="card card--no-hover" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card__title">🗓️ Horarios de Entrenamiento</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          {(currentSchool.categories || [])
            .filter(c => userRole === 'director' || currentUser?.assignedCategories?.includes(c.id))
            .map(cat => (
              <div key={cat.id} style={{
                background: `${cat.color}08`,
                border: `1px solid ${cat.color}30`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                borderLeft: `3px solid ${cat.color}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: cat.color, marginBottom: '4px' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  📅 {(cat.trainingDays || []).join(', ') || 'Sin definir'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  🕐 {cat.trainingStart || '—'} – {cat.trainingEnd || '—'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
