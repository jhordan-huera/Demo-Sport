import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Helper to convert hex to rgb components
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function darkenHex(hex, amount = 0.12) {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export default function Settings() {
  const { currentSchool, updateSchoolSettings } = useApp();

  const [schoolName, setSchoolName] = useState(currentSchool?.name || '');
  const [sport, setSport] = useState(currentSchool?.sport || '');
  const [address, setAddress] = useState(currentSchool?.address || '');
  const [phone, setPhone] = useState(currentSchool?.phone || '');
  const [primaryColor, setPrimaryColor] = useState(currentSchool?.primaryColor || '#1B73E8');
  const [secondaryColor, setSecondaryColor] = useState(currentSchool?.secondaryColor || '#0D47A1');
  const [trainingDays, setTrainingDays] = useState(currentSchool?.trainingDays || []);
  const [trainingStart, setTrainingStart] = useState(currentSchool?.trainingStart || '16:00');
  const [trainingEnd, setTrainingEnd] = useState(currentSchool?.trainingEnd || '18:00');
  const [categories, setCategories] = useState(currentSchool?.categories || []);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryFee, setNewCategoryFee] = useState('');

  // ===== LIVE COLOR PREVIEW: update CSS variables in real-time as user picks colors =====
  useEffect(() => {
    const root = document.documentElement;
    const { r, g, b } = hexToRgb(primaryColor);
    const { r: sr, g: sg, b: sb } = hexToRgb(secondaryColor);

    root.style.setProperty('--accent-primary', primaryColor);
    root.style.setProperty('--accent-primary-hover', darkenHex(primaryColor));
    root.style.setProperty('--accent-primary-glow', `rgba(${r}, ${g}, ${b}, 0.12)`);
    root.style.setProperty('--accent-primary-light', `rgba(${r}, ${g}, ${b}, 0.08)`);
    root.style.setProperty('--accent-secondary', secondaryColor);
    root.style.setProperty('--accent-secondary-glow', `rgba(${sr}, ${sg}, ${sb}, 0.10)`);
    root.style.setProperty('--shadow-focus', `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.20)`);
  }, [primaryColor, secondaryColor]);

  const allDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const sports = ['Fútbol', 'Basketball', 'Ciclismo', 'Natación', 'Voleibol', 'Atletismo', 'Tenis', 'Artes Marciales'];

  const toggleDay = (day) => {
    setTrainingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addCategory = () => {
    if (!newCategoryName || !newCategoryFee) return;
    const colors = ['#0891B2', '#1B73E8', '#0D9F6F', '#E8A317', '#D96716', '#C2185B'];
    setCategories(prev => [
      ...prev,
      {
        id: `cat_${Date.now()}`,
        name: newCategoryName,
        fee: parseInt(newCategoryFee),
        color: colors[prev.length % colors.length],
      },
    ]);
    setNewCategoryName('');
    setNewCategoryFee('');
  };

  const removeCategory = (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const handleSave = () => {
    updateSchoolSettings({
      name: schoolName,
      sport,
      address,
      phone,
      primaryColor,
      secondaryColor,
      trainingDays,
      trainingStart,
      trainingEnd,
      categories,
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Configuración</h1>
          <p className="page-header__date">Personaliza tu escuela deportiva</p>
        </div>
        <button className="btn btn--primary btn--lg" onClick={handleSave}>
          💾 Guardar Cambios
        </button>
      </div>

      <div className="settings-grid">
        {/* School Data */}
        <div className="settings-section">
          <h3 className="settings-section__title">🏫 Datos de la Escuela</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Escuela</label>
                <input
                  className="form-input"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Deporte</label>
                <select
                  className="form-select"
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                >
                  {sports.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input
                className="form-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Teléfono de Contacto</label>
              <input
                className="form-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="settings-section">
          <h3 className="settings-section__title">🎨 Colores del Club</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            Personaliza los colores de tu escuela para que coincidan con la identidad de tu club.
          </p>
          <div className="color-picker-group">
            <div className="color-picker-item">
              <div className="color-picker-swatch" style={{ background: primaryColor }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                />
              </div>
              <label>Color Primario</label>
            </div>
            <div className="color-picker-item">
              <div className="color-picker-swatch" style={{ background: secondaryColor }}>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                />
              </div>
              <label>Color Secundario</label>
            </div>
            <div className="color-picker-item" style={{ marginLeft: 'var(--space-xl)' }}>
              <div
                style={{
                  width: 120,
                  height: 56,
                  borderRadius: 'var(--radius-md)',
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  border: '1px solid var(--glass-border)',
                }}
              />
              <label>Vista Previa</label>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="settings-section">
          <h3 className="settings-section__title">📋 Categorías / Grupos</h3>
          <div className="categories-list">
            {categories.map(cat => (
              <div className="category-item" key={cat.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: cat.color,
                    }}
                  />
                  <span className="category-item__name">{cat.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    — ${cat.fee}/mes
                  </span>
                </div>
                <div className="category-item__actions">
                  <button
                    className="btn btn--icon btn--ghost"
                    onClick={() => removeCategory(cat.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombre</label>
              <input
                className="form-input"
                placeholder="Ej: Sub-16"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ width: '120px' }}>
              <label>Mensualidad ($)</label>
              <input
                className="form-input"
                type="number"
                placeholder="25"
                value={newCategoryFee}
                onChange={e => setNewCategoryFee(e.target.value)}
              />
            </div>
            <button className="btn btn--secondary" onClick={addCategory} style={{ marginBottom: '0' }}>
              ➕ Agregar
            </button>
          </div>
        </div>

        {/* Training Schedule */}
        <div className="settings-section">
          <h3 className="settings-section__title">🕐 Horarios de Entrenamiento</h3>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-sm)' }}>
              Días de entrenamiento
            </label>
            <div className="day-checkboxes">
              {allDays.map(day => (
                <label className="day-checkbox" key={day}>
                  <input
                    type="checkbox"
                    checked={trainingDays.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="time-inputs">
            <div className="form-group">
              <label>Hora Inicio</label>
              <input
                className="form-input"
                type="time"
                value={trainingStart}
                onChange={e => setTrainingStart(e.target.value)}
              />
            </div>
            <span style={{ paddingTop: '24px' }}>—</span>
            <div className="form-group">
              <label>Hora Fin</label>
              <input
                className="form-input"
                type="time"
                value={trainingEnd}
                onChange={e => setTrainingEnd(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
