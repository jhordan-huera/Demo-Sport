import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const AVATAR_COLORS = ['#1B73E8', '#0891B2', '#0D9F6F', '#D96716', '#E8A317', '#DC3545', '#C2185B', '#0D47A1'];

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Students() {
  const { students, currentSchool, addStudent, updateStudent, toggleStudentActive, payments, attendance } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Form state
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formRepresentative, setFormRepresentative] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const categories = currentSchool?.categories || [];

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.representative.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || s.categoryId === filterCategory;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && s.active) ||
        (filterStatus === 'inactive' && !s.active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [students, search, filterCategory, filterStatus]);

  const getPaymentStatus = (studentId) => {
    const p = payments[studentId]?.['2026-05'];
    if (!p) return 'pending';
    return p.status;
  };

  const getAttendanceRate = (studentId) => {
    const records = attendance[studentId] || {};
    const entries = Object.values(records);
    if (entries.length === 0) return 0;
    const present = entries.filter(Boolean).length;
    return Math.round((present / entries.length) * 100);
  };

  // ===== SORTING =====
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    if (!sortColumn) return filteredStudents;

    const paymentOrder = { paid: 0, pending: 1, overdue: 2 };

    return [...filteredStudents].sort((a, b) => {
      let valA, valB;

      switch (sortColumn) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'category': {
          const nameA = categories.find(c => c.id === a.categoryId)?.name || '';
          const nameB = categories.find(c => c.id === b.categoryId)?.name || '';
          const numA = parseInt(nameA.replace(/\D/g, '')) || 0;
          const numB = parseInt(nameB.replace(/\D/g, '')) || 0;
          valA = numA || nameA.toLowerCase();
          valB = numB || nameB.toLowerCase();
          break;
        }
        case 'representative':
          valA = a.representative.toLowerCase();
          valB = b.representative.toLowerCase();
          break;
        case 'phone':
          valA = a.phone;
          valB = b.phone;
          break;
        case 'payment':
          valA = paymentOrder[getPaymentStatus(a.id)] ?? 3;
          valB = paymentOrder[getPaymentStatus(b.id)] ?? 3;
          break;
        case 'attendance':
          valA = getAttendanceRate(a.id);
          valB = getAttendanceRate(b.id);
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortColumn, sortDirection, categories, payments, attendance]);

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <span className="sort-icon sort-icon--inactive">↕</span>;
    return <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormAge('');
    setFormCategory(categories[0]?.id || '');
    setFormRepresentative('');
    setFormPhone('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormAge(String(student.age));
    setFormCategory(student.categoryId);
    setFormRepresentative(student.representative);
    setFormPhone(student.phone);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName || !formAge || !formCategory || !formRepresentative) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: formName,
        age: parseInt(formAge),
        categoryId: formCategory,
        representative: formRepresentative,
        phone: formPhone,
      });
    } else {
      addStudent({
        name: formName,
        age: parseInt(formAge),
        categoryId: formCategory,
        representative: formRepresentative,
        phone: formPhone,
      });
    }
    setShowModal(false);
  };

  const statusLabels = { paid: 'Al día', pending: 'Pendiente', overdue: 'Vencido' };
  const statusClasses = { paid: 'success', pending: 'warning', overdue: 'danger' };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Estudiantes</h1>
          <p className="page-header__date">{students.filter(s => s.active).length} activos · {students.length} total</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          ➕ Nuevo Estudiante
        </button>
      </div>

      {/* Search & Filters */}
      <div className="search-bar">
        <div className="search-bar__input-wrapper">
          <div className="form-icon-wrapper">
            <span className="form-icon">🔍</span>
            <input
              type="text"
              className="form-input form-input--with-icon"
              placeholder="Buscar por nombre o representante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="search-bar__filters">
          <select
            className="form-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas las Categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th--sortable" onClick={() => handleSort('name')}>
                Estudiante <SortIcon column="name" />
              </th>
              <th className="th--sortable" onClick={() => handleSort('category')}>
                Categoría <SortIcon column="category" />
              </th>
              <th className="th--sortable" onClick={() => handleSort('representative')}>
                Representante <SortIcon column="representative" />
              </th>
              <th className="th--sortable" onClick={() => handleSort('phone')}>
                Teléfono <SortIcon column="phone" />
              </th>
              <th className="th--sortable" onClick={() => handleSort('payment')}>
                Pago <SortIcon column="payment" />
              </th>
              <th className="th--sortable" onClick={() => handleSort('attendance')}>
                Asistencia <SortIcon column="attendance" />
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map(student => {
              const cat = categories.find(c => c.id === student.categoryId);
              const payStatus = getPaymentStatus(student.id);
              const attRate = getAttendanceRate(student.id);

              return (
                <tr key={student.id} style={{ opacity: student.active ? 1 : 0.5 }}>
                  <td>
                    <div className="table__user">
                      <div
                        className="table__avatar"
                        style={{ background: getAvatarColor(student.name) }}
                      >
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {student.age} años
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--info" style={cat ? { background: `${cat.color}20`, color: cat.color } : {}}>
                      {cat?.name || student.categoryId}
                    </span>
                  </td>
                  <td>{student.representative}</td>
                  <td>{student.phone}</td>
                  <td>
                    <span className={`badge badge--${statusClasses[payStatus]}`}>
                      {statusLabels[payStatus]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '36px' }}>{attRate}%</span>
                      <div className="progress-bar" style={{ width: '60px' }}>
                        <div
                          className={`progress-bar__fill ${attRate >= 80 ? 'progress-bar__fill--green' : attRate >= 60 ? 'progress-bar__fill--yellow' : 'progress-bar__fill--blue'}`}
                          style={{ width: `${attRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="table__actions">
                      <button
                        className="btn btn--icon btn--ghost"
                        title="Ver perfil"
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
                        👤
                      </button>
                      <button
                        className="btn btn--icon btn--ghost"
                        title="Editar"
                        onClick={() => openEditModal(student)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn--icon btn--ghost"
                        title={student.active ? 'Desactivar' : 'Activar'}
                        onClick={() => toggleStudentActive(student.id)}
                      >
                        {student.active ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__title">Sin resultados</div>
            <div className="empty-state__text">No se encontraron estudiantes con los filtros aplicados</div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn--primary" onClick={handleSave}>
              {editingStudent ? 'Guardar Cambios' : 'Registrar Estudiante'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Nombre Completo</label>
          <input
            className="form-input"
            placeholder="Nombre del estudiante"
            value={formName}
            onChange={e => setFormName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Edad</label>
            <input
              className="form-input"
              type="number"
              min="3"
              max="18"
              placeholder="Edad"
              value={formAge}
              onChange={e => setFormAge(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select
              className="form-select"
              value={formCategory}
              onChange={e => setFormCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Representante</label>
          <input
            className="form-input"
            placeholder="Nombre del representante"
            value={formRepresentative}
            onChange={e => setFormRepresentative(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input
            className="form-input"
            placeholder="Teléfono de contacto"
            value={formPhone}
            onChange={e => setFormPhone(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
