import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) return null;

  const links = [
    { to: '/dashboard', icon: '📊', label: 'Inicio' },
    { to: '/students', icon: '👥', label: 'Alumnos' },
    { to: '/attendance', icon: '📅', label: 'Asistencia' },
    { to: '/payments', icon: '💰', label: 'Pagos' },
    { to: '/settings', icon: '⚙️', label: 'Config' },
  ];

  return (
    <nav className="mobile-nav">
      <ul className="mobile-nav__list">
        {links.map(link => (
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
      </ul>
    </nav>
  );
}
