import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Coaches() {
  const { currentSchool, mockCoaches, showToast } = useApp();
  const [coaches, setCoaches] = useState(
    mockCoaches.filter(c => c.schoolId === currentSchool?.id).map(c => ({ ...c, active: true }))
  );
  const [showModal, setShowModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCategories, setFormCategories] = useState([]);

  const categories = currentSchool?.categories || [];

  const toggleCategory = (catId) => {
    setFormCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCategories([]);
    setEditingCoach(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (coach) => {
    setEditingCoach(coach);
    setFormName(coach.name);
    setFormEmail(coach.email);
    setFormPhone(coach.phone || '');
    setFormCategories([...coach.assignedCategories]);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName || !formEmail || formCategories.length === 0) return;

    if (editingCoach) {
      // Update existing
      setCoaches(prev => prev.map(c =>
        c.id === editingCoach.id
          ? { ...c, name: formName, email: formEmail, phone: formPhone, assignedCategories: formCategories }
          : c
      ));
      showToast('✅ Entrenador actualizado exitosamente');
    } else {
      // Create new
      const newCoach = {
        id: `coach_${Date.now()}`,
        schoolId: currentSchool.id,
        name: formName,
        email: formEmail,
        phone: formPhone,
        password: 'demo123',
        assignedCategories: formCategories,
        active: true,
      };
      setCoaches(prev => [newCoach, ...prev]);
      showToast('✅ Entrenador registrado exitosamente');
    }
    setShowModal(false);
    resetForm();
  };

  const toggleCoachActive = (coachId) => {
    setCoaches(prev => prev.map(c =>
      c.id === coachId ? { ...c, active: !c.active } : c
    ));
    const coach = coaches.find(c => c.id === coachId);
    showToast(coach?.active ? '🚫 Entrenador desactivado' : '✅ Entrenador activado');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Entrenadores</h1>
          <p className="page-header__date">{coaches.filter(c => c.active).length} activos · {coaches.length} total</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          ➕ Nuevo Entrenador
        </button>
      </div>

      {/* Coaches Grid */}
      <div className="coaches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
        {coaches.map(coach => (
          <div className="card" key={coach.id} style={{ opacity: coach.active ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--accent-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, flexShrink: 0,
              }}>
                {coach.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{coach.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{coach.email}</div>
              </div>
              <span className={`badge ${coach.active ? 'badge--success' : 'badge--danger'}`}>
                {coach.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>Categorías:</span>
              {coach.assignedCategories.map(catId => {
                const cat = categories.find(c => c.id === catId);
                return (
                  <span
                    key={catId}
                    className="badge"
                    style={{ background: `${cat?.color || '#1B73E8'}20`, color: cat?.color || '#1B73E8', fontSize: '0.7rem', padding: '2px 8px' }}
                  >
                    {cat?.name || catId}
                  </span>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              📞 {coach.phone || '—'}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-md)' }}>
              <button
                className="btn btn--sm btn--secondary"
                onClick={() => openEditModal(coach)}
                style={{ flex: 1 }}
              >
                ✏️ Editar
              </button>
              <button
                className={`btn btn--sm ${coach.active ? 'btn--danger' : 'btn--primary'}`}
                onClick={() => toggleCoachActive(coach.id)}
                style={{ flex: 1 }}
              >
                {coach.active ? '🚫 Desactivar' : '✅ Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {coaches.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🏋️</div>
          <div className="empty-state__title">Sin entrenadores</div>
          <div className="empty-state__text">Agrega entrenadores para que gestionen la asistencia de sus categorías</div>
        </div>
      )}

      {/* Add/Edit Coach Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingCoach ? 'Editar Entrenador' : 'Nuevo Entrenador'}
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</button>
            <button className="btn btn--primary" onClick={handleSave}>
              {editingCoach ? '💾 Guardar Cambios' : '✅ Registrar Entrenador'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Nombre Completo</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nombre del entrenador..."
            value={formName}
            onChange={e => setFormName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="correo@escuela.com"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              className="form-input"
              placeholder="09XXXXXXXX"
              value={formPhone}
              onChange={e => setFormPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Categorías Asignadas</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn btn--sm ${formCategories.includes(cat.id) ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => toggleCategory(cat.id)}
                style={formCategories.includes(cat.id) ? { background: cat.color, borderColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        {!editingCoach && (
          <div className="form-group">
            <label>Contraseña Inicial</label>
            <input
              type="text"
              className="form-input"
              value="demo123"
              disabled
              style={{ opacity: 0.6 }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              El entrenador podrá cambiarla después del primer inicio de sesión
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
}
