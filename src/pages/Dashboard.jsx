import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { currentSchool, stats, weeklyAttendance, alerts } = useApp();

  if (!currentSchool) return null;

  const maxRate = Math.max(...weeklyAttendance.map(w => w.rate), 1);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header__left">
          <p className="page-header__greeting">
            Bienvenido, {currentSchool.adminName}
          </p>
          <h1 className="page-header__title">Dashboard</h1>
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
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--blue">👥</div>
            <span className="stat-card__trend stat-card__trend--up">+{stats.newThisMonth} este mes</span>
          </div>
          <div className="stat-card__value">{stats.totalStudents}</div>
          <div className="stat-card__label">Total Estudiantes</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--green">✅</div>
          </div>
          <div className="stat-card__value">{stats.attendanceRate}%</div>
          <div className="stat-card__label">Asistencia Mensual</div>
          <div className="progress-bar">
            <div
              className="progress-bar__fill progress-bar__fill--green"
              style={{ width: `${stats.attendanceRate}%` }}
            />
          </div>
        </div>

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
      </div>

      {/* Charts & Alerts */}
      <div className="content-grid">
        {/* Weekly Attendance Chart */}
        <div className="card card--no-hover">
          <div className="card__title">📊 Asistencia Semanal</div>
          <div className="chart-container">
            <div className="chart-bars">
              {weeklyAttendance.map((item, idx) => (
                <div className="chart-bar" key={idx}>
                  <div className="chart-bar__value">{item.rate}%</div>
                  <div
                    className="chart-bar__fill"
                    style={{ height: `${(item.rate / maxRate) * 100}%` }}
                  />
                  <div className="chart-bar__label">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card card--no-hover">
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
        </div>
      </div>
    </div>
  );
}
