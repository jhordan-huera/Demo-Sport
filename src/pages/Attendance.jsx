import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const { activeStudents, currentSchool, attendance, saveAttendanceForGroup, userRole, currentUser } = useApp();
  const isCoach = userRole === 'coach';
  const coachCategories = currentUser?.assignedCategories || [];
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const [activeTab, setActiveTab] = useState('roll');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
  const [selectedDate, setSelectedDate] = useState('2026-05-27');
  const [rollCall, setRollCall] = useState({});

  // Sync filter with URL param when navigating from sidebar
  useEffect(() => {
    setSelectedCategory(urlCategory || 'all');
  }, [urlCategory]);

  const categories = currentSchool?.categories || [];
  // Coaches only see their assigned categories
  const visibleCategories = isCoach ? categories.filter(c => coachCategories.includes(c.id)) : categories;

  const filteredStudents = useMemo(() => {
    let base = activeStudents;
    // Coaches: filter to their categories first
    if (isCoach) base = base.filter(s => coachCategories.includes(s.categoryId));
    if (selectedCategory === 'all') return base;
    return base.filter(s => s.categoryId === selectedCategory);
  }, [activeStudents, selectedCategory, isCoach, coachCategories]);

  // Initialize roll call when category, date, or students change — useEffect not useMemo!
  useEffect(() => {
    const initial = {};
    filteredStudents.forEach(s => {
      const existing = attendance[s.id]?.[selectedDate];
      initial[s.id] = existing !== undefined ? existing : false;
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

    // Get training days based on selected category or all categories
    const relevantCats = selectedCategory === 'all'
      ? (currentSchool?.categories || [])
      : (currentSchool?.categories || []).filter(c => c.id === selectedCategory);
    const allTrainingDays = [...new Set(relevantCats.flatMap(c => c.trainingDays || []))];
    const trainingDayNumbers = allTrainingDays.map(d => dayMap[d]);

    // Students relevant to the calendar view
    const calStudents = selectedCategory === 'all' ? filteredStudents : filteredStudents;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isTrainingDay = trainingDayNumbers.includes(dayOfWeek);
      const isToday = d === 27;

      let type = 'no-class';
      if (isTrainingDay && d <= 27) {
        let present = 0, total = 0;
        calStudents.forEach(s => {
          // Only count if this student's category trains on this day
          const sCat = (currentSchool?.categories || []).find(c => c.id === s.categoryId);
          const sDayNums = (sCat?.trainingDays || []).map(dd => dayMap[dd]);
          if (!sDayNums.includes(dayOfWeek)) return;

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
  }, [currentSchool, filteredStudents, attendance, selectedCategory]);

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
                {visibleCategories.map(c => (
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

          {/* Summary Cards */}
          <div className="att-summary">
            <div className="att-summary__card att-summary__card--present">
              <div className="att-summary__number">{presentCount}</div>
              <div className="att-summary__label">Presentes</div>
            </div>
            <div className="att-summary__card att-summary__card--absent">
              <div className="att-summary__number">{absentCount}</div>
              <div className="att-summary__label">Ausentes</div>
            </div>
            <div className="att-summary__card att-summary__card--total">
              <div className="att-summary__number">{filteredStudents.length}</div>
              <div className="att-summary__label">Total</div>
            </div>
            <div className="att-summary__card att-summary__card--rate">
              <div className="att-summary__number">
                {filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 0}%
              </div>
              <div className="att-summary__label">Asistencia</div>
            </div>
          </div>

          {/* Attendance List */}
          <div className="att-list">
            {filteredStudents.map((student, idx) => {
              const isPresent = rollCall[student.id] ?? true;
              const cat = categories.find(c => c.id === student.categoryId);

              return (
                <div
                  className={`att-row ${isPresent ? 'att-row--present' : 'att-row--absent'}`}
                  key={student.id}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="att-row__left">
                    <div className="att-row__number">{idx + 1}</div>
                    <div
                      className="table__avatar"
                      style={{ background: getAvatarColor(student.name), width: 38, height: 38, fontSize: '0.75rem' }}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div className="att-row__info">
                      <div className="att-row__name">{student.name}</div>
                      <span
                        className="badge badge--info"
                        style={cat ? { background: `${cat.color}15`, color: cat.color, fontSize: '0.65rem', padding: '1px 6px' } : {}}
                      >
                        {cat?.name || student.categoryId}
                      </span>
                    </div>
                  </div>
                  <div className="att-row__right">
                    <button
                      className={`att-btn ${isPresent ? 'att-btn--present' : 'att-btn--absent'}`}
                      onClick={() => togglePresent(student.id)}
                    >
                      {isPresent ? '✓ Presente' : '✗ Ausente'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="empty-state" style={{ marginTop: 'var(--space-xl)' }}>
              <div className="empty-state__icon">📋</div>
              <div className="empty-state__title">Sin estudiantes</div>
              <div className="empty-state__text">No hay estudiantes para la categoría seleccionada</div>
            </div>
          )}

          {filteredStudents.length > 0 && (
            <div className="att-save">
              <button className="btn btn--primary btn--lg" onClick={handleSaveAttendance}>
                💾 Guardar Asistencia ({presentCount}/{filteredStudents.length})
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
