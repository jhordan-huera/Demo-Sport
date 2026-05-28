import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { isLoggedIn, userRole, logout, currentUser } = useApp();
  const [showMore, setShowMore] = useState(false);

  if (!isLoggedIn) return null;

  const mainLinks = [
    { to: '/dashboard', icon: '📊', label: 'Inicio', roles: ['director', 'coach'] },
    { to: '/students', icon: '👥', label: 'Alumnos', roles: ['director', 'coach'] },
    { to: '/attendance', icon: '📅', label: 'Asistencia', roles: ['director', 'coach'] },
    { to: '/payments', icon: '💰', label: 'Pagos', roles: ['director'] },
  ];

  const moreLinks = [
    { to: '/coaches', icon: '🏋️', label: 'Entrenadores', roles: ['director'] },
    { to: '/settings', icon: '⚙️', label: 'Configuración', roles: ['director'] },
  ];

  const visibleMain = mainLinks.filter(link => link.roles.includes(userRole));
  const visibleMore = moreLinks.filter(link => link.roles.includes(userRole));

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="mobile-more-overlay" onClick={() => setShowMore(false)}>
          <div className="mobile-more-menu" onClick={e => e.stopPropagation()}>
            {/* User info */}
            {currentUser && (
              <div className="mobile-more-user">
                <div className="mobile-more-avatar">
                  {currentUser.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser.name}</div>
                  <span className={`badge ${userRole === 'director' ? 'badge--info' : 'badge--success'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                    {userRole === 'director' ? '👔 Director' : '🏋️ Entrenador'}
                  </span>
                </div>
              </div>
            )}

            {visibleMore.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className="mobile-more-item"
                onClick={() => setShowMore(false)}
              >
                <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            <button
              className="mobile-more-item mobile-more-item--danger"
              onClick={() => { setShowMore(false); logout(); }}
            >
              <span style={{ fontSize: '1.1rem' }}>🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      <nav className="mobile-nav">
        <ul className="mobile-nav__list">
          {visibleMain.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`
                }
              >
                <span className="mobile-nav__icon">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              className={`mobile-nav__item${showMore ? ' mobile-nav__item--active' : ''}`}
              onClick={() => setShowMore(!showMore)}
            >
              <span className="mobile-nav__icon">☰</span>
              Más
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
