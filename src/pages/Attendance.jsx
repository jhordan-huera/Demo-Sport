import { useState, useMemo, useEffect } from 'react';
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

export default function Attendance() {
  const { activeStudents, currentSchool, attendance, saveAttendanceForGroup } = useApp();
  const [activeTab, setActiveTab] = useState('roll');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-05-27');
  const [rollCall, setRollCall] = useState({});

  const categories = currentSchool?.categories || [];

  const filteredStudents = useMemo(() => {
    if (selectedCategory === 'all') return activeStudents;
    return activeStudents.filter(s => s.categoryId === selectedCategory);
  }, [activeStudents, selectedCategory]);

  // Initialize roll call when category, date, or students change — useEffect not useMemo!
  useEffect(() => {
    const initial = {};
    filteredStudents.forEach(s => {
      const existing = attendance[s.id]?.[selectedDate];
      initial[s.id] = existing !== undefined ? existing : true;
    });
    setRollCall(initial);
  }, [filteredStudents, selectedDate, attendance]);

  const togglePresent = (studentId) => {
    setRollCall(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSaveAttendance = () => {
    saveAttendanceForGroup(rollCall, selectedDate);
  };

  const presentCount = Object.values(rollCall).filter(Boolean).length;
  const absentCount = Object.values(rollCall).filter(v => !v).length;

  // Calendar data for calendar tab
  const calendarDays = useMemo(() => {
    const year = 2026;
    const month = 4; // May
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

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
      const isToday = d === 27;

      let type = 'no-class';
      if (isTrainingDay && d <= 27) {
        let present = 0, total = 0;
        activeStudents.forEach(s => {
          const record = attendance[s.id]?.[dateKey];
          if (record !== undefined) {
            total++;
            if (record) present++;
          }
        });
        if (total > 0) {
          type = (present / total) >= 0.5 ? 'present' : 'absent';
        }
      }

      days.push({ day: d, type, isToday, dateKey });
    }

    return days;
  }, [currentSchool, activeStudents, attendance]);

  const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Control de Asistencia</h1>
          <p className="page-header__date">{currentSchool?.name} — {currentSchool?.sport}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab${activeTab === 'roll' ? ' tab--active' : ''}`}
          onClick={() => setActiveTab('roll')}
        >
          📋 Pasar Lista
        </button>
        <button
          className={`tab${activeTab === 'calendar' ? ' tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendario
        </button>
      </div>

      {activeTab === 'roll' && (
        <>
          {/* Filters */}
          <div className="search-bar">
            <div className="search-bar__filters" style={{ width: '100%' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <span className="badge badge--success" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              ✅ Presentes: {presentCount}
            </span>
            <span className="badge badge--danger" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              ❌ Ausentes: {absentCount}
            </span>
            <span className="badge badge--neutral" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              📊 Total: {filteredStudents.length}
            </span>
          </div>

          {/* Attendance Grid */}
          <div className="attendance-grid">
            {filteredStudents.map(student => {
              const isPresent = rollCall[student.id] ?? true;
              const cat = categories.find(c => c.id === student.categoryId);

              return (
                <div className="attendance-card" key={student.id}>
                  <div
                    className="table__avatar"
                    style={{ background: getAvatarColor(student.name), width: 40, height: 40 }}
                  >
                    {getInitials(student.name)}
                  </div>
                  <div className="attendance-card__info">
                    <div className="attendance-card__name">{student.name}</div>
                    <div className="attendance-card__category">{cat?.name || ''}</div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={() => togglePresent(student.id)}
                    />
                    <span className="toggle__slider" />
                  </label>
                </div>
              );
            })}
          </div>

          {filteredStudents.length > 0 && (
            <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
              <button className="btn btn--primary btn--lg" onClick={handleSaveAttendance}>
                💾 Guardar Asistencia
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'calendar' && (
        <div className="card card--no-hover" style={{ maxWidth: '500px' }}>
          <div className="card__title">📅 Mayo 2026 — Asistencia General</div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-success-bg)', border: '1px solid rgba(0,230,118,0.3)' }} />
              Buena asistencia
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-danger-bg)', border: '1px solid rgba(255,82,82,0.3)' }} />
              Baja asistencia
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--bg-tertiary)' }} />
              Sin clase
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
