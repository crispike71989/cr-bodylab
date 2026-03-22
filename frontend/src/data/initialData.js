export const INITIAL_STUDENTS = [
  {
    id: 1, firstName: "María", lastName: "González", age: 28, avatar: "MG", username: "maria", password: "maria123",
    goal: "perdida", metrics: { weight: 72, height: 165, bmi: 26.4, fatPct: 32, musclePct: 35, waterPct: 48 },
    billing: { mode: "paquete", packageSize: 8, pricePerPackage: 4000, pricePerClass: null },
    trainingDays: 3,
    dayNames: ["Piernas", "Pecho y tríceps", "Espalda y bíceps"],
  },
  {
    id: 2, firstName: "Carlos", lastName: "Ruiz", age: 34, avatar: "CR", username: "carlos", password: "carlos123",
    goal: "musculo", metrics: { weight: 80, height: 178, bmi: 25.2, fatPct: 18, musclePct: 44, waterPct: 58 },
    billing: { mode: "individual", packageSize: null, pricePerPackage: null, pricePerClass: 600 },
    trainingDays: 4,
    dayNames: ["Pecho", "Espalda", "Piernas", "Hombros y brazos"],
  },
  {
    id: 3, firstName: "Laura", lastName: "Pérez", age: 25, avatar: "LP", username: "laura", password: "laura123",
    goal: null, metrics: null, billing: null,
    trainingDays: null, dayNames: null,
  },
  {
    id: 4, firstName: "Christian", lastName: "R.", age: 32, avatar: "💪", username: "christian_r", password: "christian123",
    goal: "perdida",
    metrics: { weight: 100.9, height: 179, waist: 95, bmi: 31.1, fatPct: 27.6, musclePct: 37.2, waterPct: 53.8 },
    billing: false, trainingDays: 4, dayNames: ["Pecho", "Espalda", "Piernas", "Hombros"],
  },
  {
    id: 5, firstName: "Antonio", lastName: "Rojas", age: 28, avatar: "AR", username: "antonio", password: "antonio123",
    gender: "hombre", goal: "perdida",
    metrics: { weight: 78, height: 170, waist: null, bmi: 27.0, fatPct: 39, musclePct: 35, waterPct: 50 },
    billing: null, trainingDays: 4,
    dayNames: ["Pecho y tríceps", "Espalda y bíceps", "Piernas y glúteos", "Hombros y core"],
    health: { pathologies: "", restrictedExercises: "", foodAllergies: "", avoidedFoods: "" },
    studentType: "alumno",
  },
];

export const INITIAL_PAYMENTS = {
  1: [
    { id: 1, date: "2025-01-05", amount: 4000, classesCount: 8, note: "Enero" },
    { id: 2, date: "2025-02-03", amount: 4000, classesCount: 8, note: "Febrero" },
    { id: 3, date: "2025-03-01", amount: 4000, classesCount: 8, note: "Marzo" },
  ],
  2: [
    { id: 1, date: "2025-02-10", amount: 3000, classesCount: 5, note: "" },
    { id: 2, date: "2025-03-05", amount: 1800, classesCount: 3, note: "" },
  ],
  3: [],
  4: [],
  5: [],
};

export const INITIAL_CLASSES = {
  1: [
    { id: 1, date: "2025-03-01" }, { id: 2, date: "2025-03-03" }, { id: 3, date: "2025-03-05" },
    { id: 4, date: "2025-03-08" }, { id: 5, date: "2025-03-10" }, { id: 6, date: "2025-03-12" },
    { id: 7, date: "2025-03-15" },
  ],
  2: [
    { id: 1, date: "2025-03-02" }, { id: 2, date: "2025-03-04" }, { id: 3, date: "2025-03-07" },
    { id: 4, date: "2025-03-09" }, { id: 5, date: "2025-03-11" }, { id: 6, date: "2025-03-14" },
    { id: 7, date: "2025-03-16" }, { id: 8, date: "2025-03-18" },
  ],
  3: [],
  4: [],
  5: [],
};

export const INITIAL_WEIGHT_LOG = {
  4: [
    { date: "2024-09-01", weight: 107.1 }, { date: "2024-09-08", weight: 105.6 },
    { date: "2024-09-15", weight: 105.0 }, { date: "2024-09-22", weight: 104.9 },
    { date: "2024-09-29", weight: 104.3 }, { date: "2024-10-06", weight: 103.7 },
    { date: "2024-10-13", weight: 103.3 }, { date: "2024-10-20", weight: 103.7 },
    { date: "2024-10-27", weight: 103.6 }, { date: "2024-11-03", weight: 103.0 },
    { date: "2024-11-10", weight: 102.7 }, { date: "2024-11-17", weight: 102.7 },
    { date: "2024-11-24", weight: 102.3 }, { date: "2024-12-01", weight: 101.9 },
    { date: "2024-12-08", weight: 101.8 }, { date: "2024-12-15", weight: 102.2 },
    { date: "2024-12-22", weight: 101.4 }, { date: "2024-12-29", weight: 101.2 },
    { date: "2025-01-05", weight: 100.9 },
  ],
  1: [
    { date: "2025-01-05", weight: 76 }, { date: "2025-02-03", weight: 74.5 },
    { date: "2025-03-01", weight: 73 }, { date: "2025-03-19", weight: 72 },
  ],
  2: [
    { date: "2025-01-10", weight: 83 }, { date: "2025-02-15", weight: 81.5 },
    { date: "2025-03-19", weight: 80 },
  ],
  3: [],
  5: [{ date: "2026-03-20", weight: 78 }],
};

export const INITIAL_ROUTINES = {
  1: [
    { id: 1, exercise: "Sentadilla", sets: 3, reps: 12, weight: 40, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 2, exercise: "Press de banca", sets: 4, reps: 10, weight: 30, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
  ],
  2: [
    { id: 1, exercise: "Dominadas", sets: 4, reps: 8, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 2, exercise: "Press militar", sets: 3, reps: 10, weight: 35, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
  ],
  3: [],
  4: [
    { id: 401, exercise: "M. Jalón al pecho", sets: 4, reps: 12, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 402, exercise: "M. Dominadas", sets: 3, reps: 10, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 403, exercise: "Sentadilla libre", sets: 4, reps: 12, weight: 40, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 404, exercise: "M. Hip thrust", sets: 4, reps: 15, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
  ],
  5: [
    { id: 5001, exercise: "M. Press de pecho", sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d0a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5002, exercise: "Jumping jacks", sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d0a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80", imageCustom: null, dayIndex: 0 },
    { id: 5003, exercise: "M. Apertura de pecho", sets: 3, reps: 15, weight: 0, method: "dropset", methodGroup: null, tempo: null, drops: 3, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5004, exercise: "Press con mancuernas inclinado", sets: 3, reps: 15, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5005, exercise: "Jalón de tríceps en polea (cuerda)", sets: 3, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d0b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5006, exercise: "Mountain climbers", sets: 3, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d0b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", imageCustom: null, dayIndex: 0 },
    { id: 5007, exercise: "M. Jalón al pecho", sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d1a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5008, exercise: "Skipping en step", sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d1a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=400&q=80", imageCustom: null, dayIndex: 1 },
    { id: 5009, exercise: "Remo con mancuerna un brazo", sets: 3, reps: 15, weight: 0, method: "dropset", methodGroup: null, tempo: null, drops: 3, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5010, exercise: "Remo en polea baja", sets: 3, reps: 15, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5011, exercise: "Curl con mancuernas alternado", sets: 3, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d1b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5012, exercise: "Jumping jacks", sets: 3, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d1b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80", imageCustom: null, dayIndex: 1 },
    { id: 5013, exercise: "M. Prensa", sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d2a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5014, exercise: "Mountain climbers", sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d2a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", imageCustom: null, dayIndex: 2 },
    { id: 5015, exercise: "M. Hip thrust", sets: 4, reps: 15, weight: 0, method: "dropset", methodGroup: null, tempo: null, drops: 3, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5016, exercise: "Peso muerto rumano con mancuernas", sets: 3, reps: 15, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5017, exercise: "M. Curl femoral sentado", sets: 3, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d2b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5018, exercise: "Skipping en step", sets: 3, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d2b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=400&q=80", imageCustom: null, dayIndex: 2 },
    { id: 5019, exercise: "Press militar con mancuernas", sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d3a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5020, exercise: "Jumping jacks", sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d3a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80", imageCustom: null, dayIndex: 3 },
    { id: 5021, exercise: "Elevaciones laterales", sets: 3, reps: 15, weight: 0, method: "dropset", methodGroup: null, tempo: null, drops: 3, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5022, exercise: "Face pull en polea", sets: 3, reps: 15, weight: 0, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5023, exercise: "Plancha frontal", sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d3b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5024, exercise: "Mountain climbers", sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d3b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", imageCustom: null, dayIndex: 3 },
  ],
};

export const INITIAL_MY_LIBRARY = [
  { id: 1, name: "Sentadilla", muscle: "Piernas", method: null, tempo: null, drops: null, notes: "Rodillas alineadas con pies, espalda recta", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { id: 2, name: "Press de banca", muscle: "Pecho", method: null, tempo: null, drops: null, notes: "Bajar controlado 4 segundos", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { id: 3, name: "Hip thrust", muscle: "Glúteos", method: null, tempo: null, drops: null, notes: "Empuje de cadera completo en cada rep", imageUrl: "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80" },
];
