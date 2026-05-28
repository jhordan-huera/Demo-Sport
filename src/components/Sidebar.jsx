import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentSchool, logout, userRole, currentUser, students } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({ students: false, attendance: false });

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isCoach = userRole === 'coach';
  const categories = currentSchool?.categories || [];
  const coachCategories = currentUser?.assignedCategories || [];
  const visibleCategories = isCoach
    ? categories.filter(c => coachCategories.includes(c.id))
    : categories;

  // Count students per category
  const countByCategory = (catId) => students.filter(s => s.categoryId === catId && s.active).length;

  const isStudentsActive = location.pathname.startsWith('/students');
  const isAttendanceActive = location.pathname === '/attendance';

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">🏆</div>
          <span className="sidebar__logo-text">SportSync</span>
        </div>
        {currentSchool && (
          <div className="sidebar__school">
            <div className="sidebar__school-name">
              {currentSchool.sportIcon} {currentSchool.name}
            </div>
            <div className="sidebar__school-sport">{currentSchool.sport}</div>
          </div>
        )}
      </div>

      {/* User info */}
      {currentUser && (
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
          }}>
            {currentUser.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </div>
            <span className={`badge ${userRole === 'director' ? 'badge--info' : 'badge--success'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
              {userRole === 'director' ? '👔 Director' : '🏋️ Entrenador'}
            </span>
          </div>
        </div>
      )}

      <nav className="sidebar__nav">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>
          <span className="sidebar__link-icon">📊</span>
          Dashboard
        </NavLink>

        {/* Estudiantes with dropdown */}
        <div className="sidebar__dropdown">
          <button
            className={`sidebar__link sidebar__link--dropdown${isStudentsActive ? ' sidebar__link--active' : ''}`}
            onClick={() => toggleMenu('students')}
          >
            <span className="sidebar__link-icon">👥</span>
            Estudiantes
            <span className={`sidebar__dropdown-arrow${openMenus.students ? ' sidebar__dropdown-arrow--open' : ''}`}>▸</span>
          </button>
          {openMenus.students && (
            <div className="sidebar__submenu">
              <button
                className={`sidebar__sublink${location.pathname === '/students' && !location.search ? ' sidebar__sublink--active' : ''}`}
                onClick={() => navigate('/students')}
              >
                <span className="sidebar__sublink-dot" style={{ background: 'var(--accent-primary)' }} />
                Todos
                <span className="sidebar__sublink-count">{students.filter(s => s.active).length}</span>
              </button>
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`sidebar__sublink${location.search === `?category=${cat.id}` && location.pathname === '/students' ? ' sidebar__sublink--active' : ''}`}
                  onClick={() => navigate(`/students?category=${cat.id}`)}
                >
                  <span className="sidebar__sublink-dot" style={{ background: cat.color }} />
                  {cat.name}
                  <span className="sidebar__sublink-count">{countByCategory(cat.id)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Asistencia with dropdown */}
        <div className="sidebar__dropdown">
          <button
            className={`sidebar__link sidebar__link--dropdown${isAttendanceActive ? ' sidebar__link--active' : ''}`}
            onClick={() => toggleMenu('attendance')}
          >
            <span className="sidebar__link-icon">📅</span>
            Asistencia
            <span className={`sidebar__dropdown-arrow${openMenus.attendance ? ' sidebar__dropdown-arrow--open' : ''}`}>▸</span>
          </button>
          {openMenus.attendance && (
            <div className="sidebar__submenu">
              <button
                className={`sidebar__sublink${location.pathname === '/attendance' && !location.search ? ' sidebar__sublink--active' : ''}`}
                onClick={() => navigate('/attendance')}
              >
                <span className="sidebar__sublink-dot" style={{ background: 'var(--accent-primary)' }} />
                Todas
              </button>
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`sidebar__sublink${location.search === `?category=${cat.id}` && location.pathname === '/attendance' ? ' sidebar__sublink--active' : ''}`}
                  onClick={() => navigate(`/attendance?category=${cat.id}`)}
                >
                  <span className="sidebar__sublink-dot" style={{ background: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Entrenadores - Director only */}
        {userRole === 'director' && (
          <NavLink to="/coaches" className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>
            <span className="sidebar__link-icon">🏋️</span>
            Entrenadores
          </NavLink>
        )}

        {/* Pagos - Director only */}
        {userRole === 'director' && (
          <NavLink to="/payments" className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>
            <span className="sidebar__link-icon">💰</span>
            Pagos
          </NavLink>
        )}

        {/* Configuración - Director only */}
        {userRole === 'director' && (
          <NavLink to="/settings" className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>
            <span className="sidebar__link-icon">⚙️</span>
            Configuración
          </NavLink>
        )}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={handleLogout}>
          <span className="sidebar__link-icon">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
