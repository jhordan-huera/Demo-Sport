import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { currentSchool, logout } = useApp();

  const handleLogout = () => {
    logout();
    // App.jsx conditional rendering will automatically show Login when isLoggedIn becomes false
  };

  const links = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/students', icon: '👥', label: 'Estudiantes' },
    { to: '/attendance', icon: '📅', label: 'Asistencia' },
    { to: '/payments', icon: '💰', label: 'Pagos' },
    { to: '/settings', icon: '⚙️', label: 'Configuración' },
  ];

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

      <nav className="sidebar__nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
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
