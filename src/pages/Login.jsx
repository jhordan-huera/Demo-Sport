import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, mockSchools } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error);
        setLoading(false);
      }
      // If success, isLoggedIn changes and App re-renders to dashboard automatically
    }, 600);
  };

  const fillCredentials = (schoolEmail, schoolPassword) => {
    setEmail(schoolEmail);
    setPassword(schoolPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card card card--no-hover">
        <div className="login-card__brand">
          <div className="login-card__logo-icon">🏆</div>
          <h1 className="login-card__title">SportSync</h1>
          <p className="login-card__subtitle">Gestión Deportiva Inteligente</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="form-icon-wrapper">
              <span className="form-icon">📧</span>
              <input
                id="email"
                type="email"
                className="form-input form-input--with-icon"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="form-icon-wrapper">
              <span className="form-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input form-input--with-icon"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setShowPassword(!showPassword)}
              style={{ alignSelf: 'flex-end', marginTop: '-4px' }}
            >
              {showPassword ? '🙈 Ocultar' : '👁️ Mostrar'}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            disabled={loading}
          >
            {loading ? '⏳ Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-card__demo">
          <p className="login-card__demo-title">Credenciales Demo</p>
          <div className="login-card__demo-grid">
            {mockSchools.map(school => (
              <div
                key={school.id}
                className="demo-credential"
                onClick={() => fillCredentials(school.email, school.password)}
              >
                <div className="demo-credential__icon">{school.sportIcon}</div>
                <div className="demo-credential__name">{school.name}</div>
                <div className="demo-credential__info">
                  {school.email}<br />
                  {school.password}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="login-card__footer">© 2026 SportSync — Todos los derechos reservados</p>
      </div>
    </div>
  );
}
