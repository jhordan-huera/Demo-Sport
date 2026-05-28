import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ===== MOCK SCHOOLS =====
const MOCK_SCHOOLS = [
  {
    id: 'tigres',
    name: 'Academia Tigres FC',
    sport: 'Fútbol',
    sportIcon: '⚽',
    email: 'admin@tigresfc.com',
    password: 'demo123',
    adminName: 'Carlos Mendoza',
    phone: '0998765432',
    address: 'Av. Principal 123, Ibarra',
    primaryColor: '#1B73E8',
    secondaryColor: '#0D47A1',
    baseFee: 25,
    categories: [
      { id: 'sub8', name: 'Sub-8', fee: 20, color: '#0891B2', trainingDays: ['Lun', 'Mié'], trainingStart: '15:00', trainingEnd: '16:30' },
      { id: 'sub10', name: 'Sub-10', fee: 25, color: '#1B73E8', trainingDays: ['Mar', 'Jue'], trainingStart: '15:00', trainingEnd: '16:30' },
      { id: 'sub12', name: 'Sub-12', fee: 25, color: '#0D9F6F', trainingDays: ['Lun', 'Mié', 'Vie'], trainingStart: '16:30', trainingEnd: '18:00' },
      { id: 'sub14', name: 'Sub-14', fee: 30, color: '#E8A317', trainingDays: ['Mar', 'Jue', 'Sáb'], trainingStart: '16:30', trainingEnd: '18:00' },
    ],
  },
  {
    id: 'halcones',
    name: 'Club Halcones',
    sport: 'Basketball',
    sportIcon: '🏀',
    email: 'admin@halcones.com',
    password: 'demo123',
    adminName: 'María Fernández',
    phone: '0987654321',
    address: 'Calle Bolívar 456, Otavalo',
    primaryColor: '#FF6B35',
    secondaryColor: '#FFD740',
    baseFee: 30,
    categories: [
      { id: 'mini', name: 'Mini (6-8)', fee: 25, color: '#0891B2', trainingDays: ['Lun', 'Mié', 'Vie'], trainingStart: '15:00', trainingEnd: '16:30' },
      { id: 'infantil', name: 'Infantil (9-11)', fee: 30, color: '#D96716', trainingDays: ['Mar', 'Jue'], trainingStart: '15:00', trainingEnd: '16:30' },
      { id: 'juvenil', name: 'Juvenil (12-15)', fee: 35, color: '#0D9F6F', trainingDays: ['Lun', 'Mié', 'Vie'], trainingStart: '16:30', trainingEnd: '18:00' },
    ],
  },
];

// ===== MOCK COACHES (per school) =====
const MOCK_COACHES = [
  {
    id: 'coach1',
    schoolId: 'tigres',
    name: 'Roberto Silva',
    email: 'entrenador@tigresfc.com',
    password: 'demo123',
    assignedCategories: ['sub8', 'sub10'],
    phone: '0991122334',
  },
  {
    id: 'coach2',
    schoolId: 'tigres',
    name: 'Andrea Gómez',
    email: 'andrea@tigresfc.com',
    password: 'demo123',
    assignedCategories: ['sub12', 'sub14'],
    phone: '0995566778',
  },
  {
    id: 'coach3',
    schoolId: 'halcones',
    name: 'Luis Martínez',
    email: 'entrenador@halcones.com',
    password: 'demo123',
    assignedCategories: ['mini', 'infantil'],
    phone: '0993344556',
  },
];

// ===== MOCK STUDENTS =====
const STUDENTS_BY_SCHOOL = {
  tigres: [
    { id: 's1', name: 'Juan Pablo Pérez', age: 11, categoryId: 'sub12', representative: 'Carlos Pérez', phone: '0998765432', registeredAt: '15 Ene 2026', active: true },
    { id: 's2', name: 'María José López', age: 9, categoryId: 'sub10', representative: 'Ana López', phone: '0991234567', registeredAt: '20 Ene 2026', active: true },
    { id: 's3', name: 'Carlos Andrés Ruiz', age: 12, categoryId: 'sub12', representative: 'Pedro Ruiz', phone: '0987612345', registeredAt: '5 Feb 2026', active: true },
    { id: 's4', name: 'Ana Lucía Torres', age: 7, categoryId: 'sub8', representative: 'Lucía Torres', phone: '0976543210', registeredAt: '10 Feb 2026', active: true },
    { id: 's5', name: 'Diego Alejandro Mora', age: 10, categoryId: 'sub10', representative: 'Roberto Mora', phone: '0965432109', registeredAt: '15 Feb 2026', active: true },
    { id: 's6', name: 'Sofía Valentina García', age: 8, categoryId: 'sub8', representative: 'Miguel García', phone: '0954321098', registeredAt: '1 Mar 2026', active: true },
    { id: 's7', name: 'Mateo Sebastián Herrera', age: 13, categoryId: 'sub14', representative: 'Fernando Herrera', phone: '0943210987', registeredAt: '5 Mar 2026', active: true },
    { id: 's8', name: 'Valentina Camila Ortiz', age: 10, categoryId: 'sub10', representative: 'Diana Ortiz', phone: '0932109876', registeredAt: '10 Mar 2026', active: true },
    { id: 's9', name: 'Sebastián Nicolás Cruz', age: 11, categoryId: 'sub12', representative: 'Jorge Cruz', phone: '0921098765', registeredAt: '15 Mar 2026', active: true },
    { id: 's10', name: 'Camila Andrea Vega', age: 14, categoryId: 'sub14', representative: 'Patricia Vega', phone: '0910987654', registeredAt: '20 Mar 2026', active: true },
    { id: 's11', name: 'Nicolás David Flores', age: 7, categoryId: 'sub8', representative: 'David Flores', phone: '0909876543', registeredAt: '1 Abr 2026', active: true },
    { id: 's12', name: 'Isabella Renata Sánchez', age: 9, categoryId: 'sub10', representative: 'Laura Sánchez', phone: '0898765432', registeredAt: '5 Abr 2026', active: true },
    { id: 's13', name: 'Daniel Esteban Romero', age: 12, categoryId: 'sub12', representative: 'Esteban Romero', phone: '0887654321', registeredAt: '10 Abr 2026', active: false },
    { id: 's14', name: 'Luciana Martina Paredes', age: 13, categoryId: 'sub14', representative: 'Andrés Paredes', phone: '0876543210', registeredAt: '15 Abr 2026', active: true },
    { id: 's15', name: 'Emilio Rafael Guerrero', age: 8, categoryId: 'sub8', representative: 'Rafael Guerrero', phone: '0865432109', registeredAt: '20 Abr 2026', active: true },
  ],
  halcones: [
    { id: 'h1', name: 'Andrés Felipe Caicedo', age: 7, categoryId: 'mini', representative: 'Felipe Caicedo', phone: '0998111222', registeredAt: '10 Ene 2026', active: true },
    { id: 'h2', name: 'Laura Daniela Muñoz', age: 10, categoryId: 'infantil', representative: 'Sandra Muñoz', phone: '0997222333', registeredAt: '15 Ene 2026', active: true },
    { id: 'h3', name: 'Santiago Matías Reyes', age: 14, categoryId: 'juvenil', representative: 'Mario Reyes', phone: '0996333444', registeredAt: '20 Ene 2026', active: true },
    { id: 'h4', name: 'Martina Isabela Córdoba', age: 8, categoryId: 'mini', representative: 'Isabel Córdoba', phone: '0995444555', registeredAt: '1 Feb 2026', active: true },
    { id: 'h5', name: 'Tomás Emiliano Vargas', age: 11, categoryId: 'infantil', representative: 'Emilio Vargas', phone: '0994555666', registeredAt: '5 Feb 2026', active: true },
    { id: 'h6', name: 'Renata Sofía Delgado', age: 13, categoryId: 'juvenil', representative: 'Sofía Delgado', phone: '0993666777', registeredAt: '10 Feb 2026', active: true },
    { id: 'h7', name: 'Samuel Alejandro Ponce', age: 6, categoryId: 'mini', representative: 'Alejandro Ponce', phone: '0992777888', registeredAt: '1 Mar 2026', active: true },
    { id: 'h8', name: 'Emma Victoria Salazar', age: 9, categoryId: 'infantil', representative: 'Victoria Salazar', phone: '0991888999', registeredAt: '5 Mar 2026', active: true },
    { id: 'h9', name: 'Gabriel Antonio Medina', age: 15, categoryId: 'juvenil', representative: 'Antonio Medina', phone: '0990999000', registeredAt: '10 Mar 2026', active: true },
    { id: 'h10', name: 'Paula Andrea Jiménez', age: 10, categoryId: 'infantil', representative: 'Andrea Jiménez', phone: '0989000111', registeredAt: '15 Mar 2026', active: true },
    { id: 'h11', name: 'Joaquín Esteban Ríos', age: 7, categoryId: 'mini', representative: 'Esteban Ríos', phone: '0988111222', registeredAt: '1 Abr 2026', active: true },
    { id: 'h12', name: 'Catalina María Bravo', age: 12, categoryId: 'juvenil', representative: 'María Bravo', phone: '0987222333', registeredAt: '5 Abr 2026', active: false },
  ],
};

// ===== ATTENDANCE MOCK (last 30 days) =====
function generateAttendance(students, categories) {
  const dayMap = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 0 };
  const records = {};
  const today = new Date(2026, 4, 27); // May 27, 2026

  students.forEach(student => {
    const cat = categories.find(c => c.id === student.categoryId);
    const trainingDayNumbers = (cat?.trainingDays || []).map(d => dayMap[d]);
    records[student.id] = {};
    for (let i = 1; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayOfWeek = date.getDay();
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (trainingDayNumbers.includes(dayOfWeek)) {
        records[student.id][dateKey] = Math.random() < 0.85;
      }
    }
  });

  return records;
}

// ===== PAYMENTS MOCK =====
function generatePayments(students, categories) {
  const months = [
    { id: '2026-03', label: 'Marzo 2026' },
    { id: '2026-04', label: 'Abril 2026' },
    { id: '2026-05', label: 'Mayo 2026' },
  ];

  const payments = {};
  const methods = ['Efectivo', 'Transferencia', 'Tarjeta'];

  students.forEach(student => {
    const cat = categories.find(c => c.id === student.categoryId);
    const fee = cat ? cat.fee : 25;
    payments[student.id] = {};

    months.forEach((month, idx) => {
      const rand = Math.random();
      if (idx < 2) {
        if (rand < 0.80) {
          const day = Math.floor(Math.random() * 10) + 1;
          payments[student.id][month.id] = {
            status: 'paid',
            amount: fee,
            date: `${day} ${month.label.split(' ')[0]} 2026`,
            method: methods[Math.floor(Math.random() * methods.length)],
          };
        } else {
          payments[student.id][month.id] = { status: 'overdue', amount: fee, date: null, method: null };
        }
      } else {
        if (rand < 0.55) {
          const day = Math.floor(Math.random() * 20) + 1;
          payments[student.id][month.id] = {
            status: 'paid',
            amount: fee,
            date: `${day} ${month.label.split(' ')[0]} 2026`,
            method: methods[Math.floor(Math.random() * methods.length)],
          };
        } else if (rand < 0.80) {
          payments[student.id][month.id] = { status: 'pending', amount: fee, date: null, method: null };
        } else {
          payments[student.id][month.id] = { status: 'overdue', amount: fee, date: null, method: null };
        }
      }
    });
  });

  return payments;
}

// ===== COLOR HELPERS =====
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function darkenHex(hex, amount = 0.15) {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

// ===== CONTEXT =====
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'director' | 'coach'
  const [currentUser, setCurrentUser] = useState(null); // { name, email, assignedCategories? }
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [payments, setPayments] = useState({});
  const [toast, setToast] = useState(null);
  const [nextStudentId, setNextStudentId] = useState(100);

  // Use ref for toast timer to avoid stale closures
  const toastTimerRef = useRef(null);

  // ===== DYNAMIC THEME: apply school colors to CSS variables =====
  useEffect(() => {
    const root = document.documentElement;
    if (currentSchool) {
      const primary = currentSchool.primaryColor;
      const secondary = currentSchool.secondaryColor;
      const { r, g, b } = hexToRgb(primary);

      root.style.setProperty('--accent-primary', primary);
      root.style.setProperty('--accent-primary-hover', darkenHex(primary, 0.12));
      root.style.setProperty('--accent-primary-glow', `rgba(${r}, ${g}, ${b}, 0.12)`);
      root.style.setProperty('--accent-primary-light', `rgba(${r}, ${g}, ${b}, 0.08)`);
      root.style.setProperty('--accent-secondary', secondary);
      root.style.setProperty('--accent-secondary-glow', `rgba(${hexToRgb(secondary).r}, ${hexToRgb(secondary).g}, ${hexToRgb(secondary).b}, 0.10)`);
      root.style.setProperty('--shadow-focus', `0 0 0 3px rgba(${r}, ${g}, ${b}, 0.20)`);
    } else {
      // Reset to defaults when logged out
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-primary-hover');
      root.style.removeProperty('--accent-primary-glow');
      root.style.removeProperty('--accent-primary-light');
      root.style.removeProperty('--accent-secondary');
      root.style.removeProperty('--accent-secondary-glow');
      root.style.removeProperty('--shadow-focus');
    }
  }, [currentSchool?.primaryColor, currentSchool?.secondaryColor]);

  // ===== TOAST (define first so other callbacks can use it) =====
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ===== AUTH =====
  const login = useCallback((email, password) => {
    // Try admin login first
    const school = MOCK_SCHOOLS.find(
      s => s.email === email && s.password === password
    );
    if (school) {
      const schoolStudents = JSON.parse(JSON.stringify(STUDENTS_BY_SCHOOL[school.id] || []));
      const schoolAttendance = generateAttendance(schoolStudents, school.categories);
      const schoolPayments = generatePayments(schoolStudents, school.categories);

      setIsLoggedIn(true);
      setCurrentSchool({ ...school });
      setUserRole('director');
      setCurrentUser({ name: school.adminName, email: school.email });
      setStudents(schoolStudents);
      setAttendance(schoolAttendance);
      setPayments(schoolPayments);
      return { success: true };
    }

    // Try coach login
    const coach = MOCK_COACHES.find(
      c => c.email === email && c.password === password
    );
    if (coach) {
      const coachSchool = MOCK_SCHOOLS.find(s => s.id === coach.schoolId);
      if (coachSchool) {
        const schoolStudents = JSON.parse(JSON.stringify(STUDENTS_BY_SCHOOL[coachSchool.id] || []));
        const schoolAttendance = generateAttendance(schoolStudents, coachSchool.categories);
        const schoolPayments = generatePayments(schoolStudents, coachSchool.categories);

        setIsLoggedIn(true);
        setCurrentSchool({ ...coachSchool });
        setUserRole('coach');
        setCurrentUser({
          name: coach.name,
          email: coach.email,
          assignedCategories: coach.assignedCategories,
        });
        setStudents(schoolStudents);
        setAttendance(schoolAttendance);
        setPayments(schoolPayments);
        return { success: true };
      }
    }

    return { success: false, error: 'Correo o contraseña incorrecta' };
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentSchool(null);
    setUserRole(null);
    setCurrentUser(null);
    setStudents([]);
    setAttendance({});
    setPayments({});
  }, []);

  // ===== STUDENTS CRUD =====
  const addStudent = useCallback((studentData) => {
    const newStudent = {
      id: `new_${Date.now()}`,
      ...studentData,
      registeredAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      active: true,
    };
    setStudents(prev => [newStudent, ...prev]);
    setAttendance(prev => ({ ...prev, [newStudent.id]: {} }));
    setPayments(prev => ({
      ...prev,
      [newStudent.id]: {
        '2026-05': { status: 'pending', amount: 0, date: null, method: null },
      },
    }));
    showToast('✅ Estudiante registrado exitosamente');
    return newStudent;
  }, [showToast]);

  const updateStudent = useCallback((studentId, updates) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    showToast('✅ Estudiante actualizado');
  }, [showToast]);

  const toggleStudentActive = useCallback((studentId) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === studentId) {
          return { ...s, active: !s.active };
        }
        return s;
      });
      // Show toast after state update
      const student = updated.find(s => s.id === studentId);
      if (student) {
        showToast(student.active ? '✅ Estudiante activado' : '⚠️ Estudiante desactivado');
      }
      return updated;
    });
  }, [showToast]);

  // ===== ATTENDANCE =====
  const markAttendance = useCallback((studentId, dateKey, present) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [dateKey]: present,
      },
    }));
  }, []);

  const saveAttendanceForGroup = useCallback((attendanceMap, dateKey) => {
    setAttendance(prev => {
      const updated = { ...prev };
      Object.entries(attendanceMap).forEach(([studentId, present]) => {
        updated[studentId] = {
          ...(updated[studentId] || {}),
          [dateKey]: present,
        };
      });
      return updated;
    });
    showToast('✅ Asistencia guardada correctamente');
  }, [showToast]);

  // ===== PAYMENTS =====
  const registerPayment = useCallback((studentId, monthId, method, observation) => {
    setPayments(prev => {
      // Find student fee from current state
      const studentList = students;
      const student = studentList.find(s => s.id === studentId);
      const school = currentSchool;
      const cat = school?.categories.find(c => c.id === student?.categoryId);
      const fee = cat?.fee || 25;

      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [monthId]: {
            status: 'paid',
            amount: fee,
            date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
            method: method,
            observation: observation || '',
          },
        },
      };
    });
    showToast('✅ Pago registrado exitosamente');
  }, [students, currentSchool, showToast]);

  // ===== SETTINGS =====
  const updateSchoolSettings = useCallback((updates) => {
    setCurrentSchool(prev => prev ? { ...prev, ...updates } : prev);
    showToast('✅ Configuración guardada');
  }, [showToast]);

  // ===== COMPUTED VALUES =====
  const activeStudents = useMemo(() =>
    students.filter(s => s.active),
    [students]
  );

  const stats = useMemo(() => {
    if (!currentSchool || students.length === 0) {
      return { totalStudents: 0, attendanceRate: 0, paymentRate: 0, monthlyIncome: 0, newThisMonth: 0 };
    }

    const active = students.filter(s => s.active);

    // Attendance rate
    let totalClasses = 0;
    let totalPresent = 0;
    active.forEach(s => {
      const records = attendance[s.id] || {};
      Object.values(records).forEach(present => {
        totalClasses++;
        if (present) totalPresent++;
      });
    });
    const attendanceRate = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // Payment rate for current month
    let paidCount = 0;
    let totalForPayment = 0;
    active.forEach(s => {
      const p = payments[s.id]?.['2026-05'];
      if (p) {
        totalForPayment++;
        if (p.status === 'paid') paidCount++;
      }
    });
    const paymentRate = totalForPayment > 0 ? Math.round((paidCount / totalForPayment) * 100) : 0;

    // Monthly income
    let monthlyIncome = 0;
    active.forEach(s => {
      const p = payments[s.id]?.['2026-05'];
      if (p?.status === 'paid') {
        const cat = currentSchool.categories.find(c => c.id === s.categoryId);
        monthlyIncome += cat?.fee || 25;
      }
    });

    return {
      totalStudents: active.length,
      attendanceRate,
      paymentRate,
      monthlyIncome,
      newThisMonth: 3,
    };
  }, [students, attendance, payments, currentSchool]);

  // Attendance per category for chart
  const categoryAttendance = useMemo(() => {
    if (!currentSchool) return [];
    const categories = currentSchool.categories || [];

    return categories.map(cat => {
      const catStudents = activeStudents.filter(s => s.categoryId === cat.id);
      let present = 0;
      let total = 0;

      catStudents.forEach(s => {
        const records = attendance[s.id] || {};
        Object.values(records).forEach(wasPresent => {
          total++;
          if (wasPresent) present++;
        });
      });

      return {
        name: cat.name,
        color: cat.color,
        id: cat.id,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        students: catStudents.length,
        days: (cat.trainingDays || []).join(', '),
      };
    });
  }, [currentSchool, activeStudents, attendance]);

  // Alerts
  const alerts = useMemo(() => {
    const items = [];

    activeStudents.forEach(s => {
      const currentPayment = payments[s.id]?.['2026-05'];
      if (currentPayment?.status === 'overdue') {
        items.push({ type: 'danger', text: `${s.name} — Pago vencido (Mayo 2026)`, time: 'Hace 2 días' });
      } else if (currentPayment?.status === 'pending') {
        items.push({ type: 'warning', text: `${s.name} — Pago pendiente (Mayo 2026)`, time: 'Hoy' });
      }

      const records = attendance[s.id] || {};
      const sortedDates = Object.keys(records).sort().reverse();
      let consecutive = 0;
      for (const d of sortedDates) {
        if (!records[d]) consecutive++;
        else break;
      }
      if (consecutive >= 3) {
        items.push({ type: 'danger', text: `${s.name} — ${consecutive} faltas consecutivas`, time: 'Reciente' });
      }
    });

    items.push({ type: 'success', text: 'Nuevo estudiante: Ana Lucía Torres registrada', time: 'Hace 1 día' });

    return items.slice(0, 6);
  }, [activeStudents, payments, attendance]);

  const value = {
    isLoggedIn,
    currentSchool,
    userRole,
    currentUser,
    login,
    logout,
    mockSchools: MOCK_SCHOOLS,
    mockCoaches: MOCK_COACHES,
    students,
    activeStudents,
    addStudent,
    updateStudent,
    toggleStudentActive,
    attendance,
    markAttendance,
    saveAttendanceForGroup,
    payments,
    registerPayment,
    updateSchoolSettings,
    stats,
    categoryAttendance,
    alerts,
    toast,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
