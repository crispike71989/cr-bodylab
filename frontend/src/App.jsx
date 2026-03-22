import { useState, useEffect, useRef } from "react";

const API = "http://localhost:3001/api";

async function callAI(prompt, system = null, max_tokens = 2000) {
  try {
    const res = await fetch(`${API}/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, max_tokens }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.content?.map(c => c.text || "").join("") || "";
  } catch (e) {
    console.error("callAI error:", e);
    return "Error: " + e.message;
  }
}

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────
const INITIAL_STUDENTS = [
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

// Historial de pagos: { id, date, amount, classesCount, note }
const INITIAL_PAYMENTS = {
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
  5: [],
};

// Clases asistidas: { id, date }
const INITIAL_CLASSES = {
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
  5: [],
};

// Helper para nombre completo
const fullName = (st) => `${st.firstName} ${st.lastName}`.trim();

// ─── HISTORIAL DE PESO ────────────────────────────────────────────────────────
const INITIAL_WEIGHT_LOG = {
  4: [
    { "date": "2024-09-01", "weight": 107.1 },
    { "date": "2024-09-08", "weight": 105.6 },
    { "date": "2024-09-15", "weight": 105.0 },
    { "date": "2024-09-22", "weight": 104.9 },
    { "date": "2024-09-29", "weight": 104.3 },
    { "date": "2024-10-06", "weight": 103.7 },
    { "date": "2024-10-13", "weight": 103.3 },
    { "date": "2024-10-20", "weight": 103.7 },
    { "date": "2024-10-27", "weight": 103.6 },
    { "date": "2024-11-03", "weight": 103.0 },
    { "date": "2024-11-10", "weight": 102.7 },
    { "date": "2024-11-17", "weight": 102.7 },
    { "date": "2024-11-24", "weight": 102.3 },
    { "date": "2024-12-01", "weight": 101.9 },
    { "date": "2024-12-08", "weight": 101.8 },
    { "date": "2024-12-15", "weight": 102.2 },
    { "date": "2024-12-22", "weight": 101.4 },
    { "date": "2024-12-29", "weight": 101.2 },
    { "date": "2025-01-05", "weight": 100.9 },
  ],
  1: [
    { date: "2025-01-05", weight: 76 },
    { date: "2025-02-03", weight: 74.5 },
    { date: "2025-03-01", weight: 73 },
    { date: "2025-03-19", weight: 72 },
  ],
  2: [
    { date: "2025-01-10", weight: 83 },
    { date: "2025-02-15", weight: 81.5 },
    { date: "2025-03-19", weight: 80 },
  ],
  3: [],
  5: [{ date: "2026-03-20", weight: 78 }],
};
function getBillingStatus(payments, classes) {
  const totalPaid = payments.reduce((a, p) => a + p.classesCount, 0);
  const totalDone = classes.length;
  const remaining = totalPaid - totalDone;
  let status, color, label;
  if (remaining < 0) {
    status = "deuda"; color = "#ff5555"; label = `Debe ${Math.abs(remaining)} clase${Math.abs(remaining) !== 1 ? "s" : ""}`;
  } else if (remaining === 0) {
    status = "justo"; color = "#fbbf24"; label = "Sin clases disponibles";
  } else if (remaining <= 2) {
    status = "por_vencer"; color = "#fbbf24"; label = `⚠️ Quedan solo ${remaining} clase${remaining !== 1 ? "s" : ""}`;
  } else {
    status = "al_dia"; color = "#A8FFD8"; label = `${remaining} clases disponibles`;
  }
  return { status, color, label, totalPaid, totalDone, remaining };
}

const INITIAL_ROUTINES = {
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
    // ── DÍA 0: Pecho y tríceps ──────────────────────────────────────────
    { id: 5001, exercise: "M. Press de pecho",              sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d0a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5002, exercise: "Jumping jacks",                  sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d0a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80", imageCustom: null, dayIndex: 0 },
    { id: 5003, exercise: "M. Apertura de pecho",           sets: 3, reps: 15, weight: 0, method: "dropset", methodGroup: null,    tempo: null, drops: 3,    imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5004, exercise: "Press con mancuernas inclinado", sets: 3, reps: 15, weight: 0, method: null,      methodGroup: null,    tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5005, exercise: "Jalón de tríceps en polea (cuerda)", sets: 3, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d0b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 0 },
    { id: 5006, exercise: "Mountain climbers",              sets: 3, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d0b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", imageCustom: null, dayIndex: 0 },
    // ── DÍA 1: Espalda y bíceps ─────────────────────────────────────────
    { id: 5007, exercise: "M. Jalón al pecho",              sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d1a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5008, exercise: "Skipping en step",               sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d1a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=400&q=80", imageCustom: null, dayIndex: 1 },
    { id: 5009, exercise: "Remo con mancuerna un brazo",    sets: 3, reps: 15, weight: 0, method: "dropset", methodGroup: null,    tempo: null, drops: 3,    imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5010, exercise: "Remo en polea baja",             sets: 3, reps: 15, weight: 0, method: null,      methodGroup: null,    tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5011, exercise: "Curl con mancuernas alternado",  sets: 3, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d1b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 1 },
    { id: 5012, exercise: "Jumping jacks",                  sets: 3, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d1b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80", imageCustom: null, dayIndex: 1 },
    // ── DÍA 2: Piernas y glúteos ─────────────────────────────────────────
    { id: 5013, exercise: "M. Prensa",                      sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d2a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5014, exercise: "Mountain climbers",              sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d2a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", imageCustom: null, dayIndex: 2 },
    { id: 5015, exercise: "M. Hip thrust",                  sets: 4, reps: 15, weight: 0, method: "dropset", methodGroup: null,    tempo: null, drops: 3,    imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5016, exercise: "Peso muerto rumano con mancuernas", sets: 3, reps: 15, weight: 0, method: null,   methodGroup: null,    tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5017, exercise: "M. Curl femoral sentado",        sets: 3, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d2b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 2 },
    { id: 5018, exercise: "Skipping en step",               sets: 3, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d2b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=400&q=80", imageCustom: null, dayIndex: 2 },
    // ── DÍA 3: Hombros y core ────────────────────────────────────────────
    { id: 5019, exercise: "Press militar con mancuernas",   sets: 4, reps: 15, weight: 0, method: "biserie", methodGroup: "g5d3a", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5020, exercise: "Jumping jacks",                  sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d3a", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80", imageCustom: null, dayIndex: 3 },
    { id: 5021, exercise: "Elevaciones laterales",          sets: 3, reps: 15, weight: 0, method: "dropset", methodGroup: null,    tempo: null, drops: 3,    imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5022, exercise: "Face pull en polea",             sets: 3, reps: 15, weight: 0, method: null,      methodGroup: null,    tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5023, exercise: "Plancha frontal",                sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d3b", tempo: null, drops: null, imageUrl: null, imageCustom: null, dayIndex: 3 },
    { id: 5024, exercise: "Mountain climbers",              sets: 4, reps: 20, weight: 0, method: "biserie", methodGroup: "g5d3b", tempo: null, drops: null, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", imageCustom: null, dayIndex: 3 },
  ],
};

// ─── BIBLIOTECA PERSONALIZADA DEL COACH ──────────────────────────────────────
const INITIAL_MY_LIBRARY = [
  { id: 1, name: "Sentadilla", muscle: "Piernas", method: null, tempo: null, drops: null, notes: "Rodillas alineadas con pies, espalda recta", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { id: 2, name: "Press de banca", muscle: "Pecho", method: null, tempo: null, drops: null, notes: "Bajar controlado 4 segundos", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { id: 3, name: "Hip thrust", muscle: "Glúteos", method: null, tempo: null, drops: null, notes: "Empuje de cadera completo en cada rep", imageUrl: "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80" },
];
const EXERCISE_LIBRARY = [
  // Cardio
  { name: "Caminadora", type: "cardio",                  muscle: "Cardio",               imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80" },
  { name: "Elíptica", type: "cardio",                    muscle: "Cardio",               imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80" },
  { name: "Remo", type: "cardio",                        muscle: "Cardio / Espalda",     imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" },
  { name: "Escaladora", type: "cardio",                  muscle: "Cardio / Piernas",     imageUrl: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=400&q=80" },
  { name: "Bicicleta", type: "cardio",                   muscle: "Cardio",               imageUrl: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400&q=80" },
  // Máquinas - Brazos
  { name: "M. Curl de bíceps",           muscle: "Bíceps",               imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" },
  { name: "M. Press de tríceps",         muscle: "Tríceps",              imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  { name: "M. Predicador",               muscle: "Bíceps",               imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" },
  // Máquinas - Hombros
  { name: "M. Press de hombro",          muscle: "Hombros",              imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  // Máquinas - Pecho
  { name: "M. Press de pecho",           muscle: "Pecho",                imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { name: "M. Press de pecho inclinado", muscle: "Pecho",                imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { name: "M. Apertura de pecho",        muscle: "Pecho",                imageUrl: "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80" },
  // Máquinas - Espalda
  { name: "M. Remo sentado",             muscle: "Espalda",              imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" },
  { name: "M. Jalón al pecho guiado",    muscle: "Espalda",              imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&q=80" },
  { name: "M. Jalón al pecho",           muscle: "Espalda",              imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&q=80" },
  { name: "M. Jalón asistido",           muscle: "Espalda",              imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80" },
  { name: "M. Dominadas",                muscle: "Espalda",              imageUrl: "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=400&q=80" },
  { name: "M. Extensión lumbar",         muscle: "Espalda baja",         imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  // Máquinas - Fondos
  { name: "M. De fondos asistidos",      muscle: "Tríceps / Pecho",      imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  // Máquinas - Piernas
  { name: "M. Extensión de pantorrilla", muscle: "Pantorrilla",          imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "M. Abductores",               muscle: "Glúteos / Piernas",    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  { name: "M. Aductores",                muscle: "Piernas",              imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80" },
  { name: "M. Extensión",                muscle: "Cuádriceps",           imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "M. Prensa horizontal",        muscle: "Piernas",              imageUrl: "data:image/jpeg;base64,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" },
  { name: "M. Curl femoral sentado",     muscle: "Femoral",              imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80" },
  { name: "M. Prensa",                   muscle: "Piernas",              imageUrl: "data:image/jpeg;base64,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" },
  { name: "M. Hack Squat",               muscle: "Cuádriceps",           imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80" },
  { name: "M. Hack Squat invertida",     muscle: "Cuádriceps / Glúteos", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80" },
  { name: "M. Sentadilla libre",         muscle: "Piernas",              imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "M. Smith",                    muscle: "Piernas",              imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80" },
  { name: "M. Hip thrust",               muscle: "Glúteos",              imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  // Máquinas - Core
  { name: "M. Abdomen",                  muscle: "Core",                 imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "M. Abdomen inclinado",        muscle: "Core",                 imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },

  // ── PECHO ─────────────────────────────────────────────────────────────────
  { name: "Press con mancuernas plano",         muscle: "Pecho",       imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { name: "Press con mancuernas inclinado",     muscle: "Pecho",       imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { name: "Fondos en paralelas",                muscle: "Pecho / Tríceps", imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" },
  { name: "Crossover polea alta",               muscle: "Pecho",       imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { name: "Polea cruzada al centro",            muscle: "Pecho",       imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },
  { name: "Flexiones",                          muscle: "Pecho",       imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" },

  // ── ESPALDA ────────────────────────────────────────────────────────────────
  { name: "Remo con mancuerna un brazo",        muscle: "Espalda",     imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" },
  { name: "Remo con barra",                     muscle: "Espalda",     imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" },
  { name: "Remo en polea baja",                 muscle: "Espalda",     imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80" },
  { name: "Polea al pecho sentado",             muscle: "Espalda",     imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&q=80" },
  { name: "Buenos días",                        muscle: "Espalda baja / Femoral", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Superman",                           muscle: "Espalda baja", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Hiperextensión",                     muscle: "Espalda baja", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },

  // ── HOMBROS ────────────────────────────────────────────────────────────────
  { name: "Press militar con mancuernas",       muscle: "Hombros",     imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  { name: "Elevaciones laterales",              muscle: "Hombros",     imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  { name: "Elevaciones frontales",              muscle: "Hombros",     imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  { name: "Pájaro con mancuernas",              muscle: "Hombros",     imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  { name: "Elevaciones laterales en polea",     muscle: "Hombros",     imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  { name: "Face pull en polea",                 muscle: "Hombros / Espalda", imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },
  { name: "Encogimiento de hombros",            muscle: "Hombros",     imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80" },

  // ── BÍCEPS ─────────────────────────────────────────────────────────────────
  { name: "Curl con mancuernas alternado",      muscle: "Bíceps",      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" },
  { name: "Curl martillo",                      muscle: "Bíceps",      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" },
  { name: "Curl concentrado",                   muscle: "Bíceps",      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" },
  { name: "Curl en polea baja",                 muscle: "Bíceps",      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" },
  { name: "Curl predicador con mancuerna",      muscle: "Bíceps",      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" },

  // ── TRÍCEPS ────────────────────────────────────────────────────────────────
  { name: "Tríceps en copa",                    muscle: "Tríceps",     imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  { name: "Patada de tríceps con mancuerna",    muscle: "Tríceps",     imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  { name: "Jalón de tríceps en polea (cuerda)", muscle: "Tríceps",     imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  { name: "Jalón de tríceps invertido",         muscle: "Tríceps",     imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  { name: "Extensión tríceps en polea baja",    muscle: "Tríceps",     imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },
  { name: "Fondos en banco",                    muscle: "Tríceps",     imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400&q=80" },

  // ── PIERNAS / CUÁDRICEPS ───────────────────────────────────────────────────
  { name: "Sentadilla libre",                   muscle: "Piernas",     imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Sentadilla sumo",                    muscle: "Piernas / Glúteos", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Zancada caminando",                  muscle: "Piernas / Glúteos", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Zancada estática",                   muscle: "Piernas / Glúteos", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Zancada lateral",                    muscle: "Piernas / Glúteos", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Step up al cajón",                   muscle: "Cuádriceps / Glúteos", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Sentadilla búlgara",                 muscle: "Cuádriceps / Glúteos", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },

  // ── FEMORAL / GLÚTEOS ──────────────────────────────────────────────────────
  { name: "Peso muerto rumano con mancuernas",  muscle: "Femoral / Glúteos", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  { name: "Peso muerto",                        muscle: "Glúteos / Espalda baja", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  { name: "Peso muerto con mancuerna unilateral", muscle: "Femoral / Glúteos", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  { name: "Patada de glúteo en polea",          muscle: "Glúteos",     imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  { name: "Patada lateral de glúteo",           muscle: "Glúteos",     imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },
  { name: "Puente de glúteo",                   muscle: "Glúteos",     imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80" },

  // ── PANTORRILLA ────────────────────────────────────────────────────────────
  { name: "Elevación de talones de pie",        muscle: "Pantorrilla", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },
  { name: "Elevación de talones sentado",       muscle: "Pantorrilla", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80" },

  // ── CORE / ABDOMEN ─────────────────────────────────────────────────────────
  { name: "Crunch abdominal",                   muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Crunch inverso",                     muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Plancha frontal",                    muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Plancha lateral",                    muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Elevación de piernas colgado",       muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Tijeras",                            muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Bicicleta abdominal",                muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Mountain climbers",                  muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
  { name: "Russian twist",                      muscle: "Core",        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },

  // ── CALENTAMIENTO / SIEMPRE DISPONIBLES ───────────────────────────────────
  { name: "Jumping jacks",                      muscle: "Cardio",      imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80" },
  { name: "Skipping en step",                   muscle: "Cardio",      imageUrl: "https://images.unsplash.com/photo-1486739985386-d4fae04ca6f7?w=400&q=80" },
];

// ─── MÉTODOS DE ENTRENAMIENTO ─────────────────────────────────────────────────
const METHODS = {
  biserie:    { label: "Biserie",     emoji: "2️⃣",  color: "#a78bfa", desc: "2 ejercicios seguidos sin descanso" },
  triserie:   { label: "Triserie",    emoji: "3️⃣",  color: "#f472b6", desc: "3 ejercicios consecutivos sin descanso" },
  dropset:    { label: "Drop Set",    emoji: "📉",  color: "#fb923c", desc: "Bajar peso sin descanso hasta el fallo" },

  restpause:  { label: "Rest & Pause", emoji: "⏸️",  color: "#e879f9", desc: "Pausa corta entre mini-series (ej: 10 + 2)" },
  fuerzabase: { label: "Serie de Fuerza", emoji: "💪",  color: "#f87171", desc: "Serie estándar de fuerza" },
};

const TEMPO_OPTIONS = ["2-0-2", "3-0-1", "3-1-1", "4-0-1", "4-1-1", "2-1-2"];
const GROUP_OPTIONS = ["A", "B", "C", "D"];

const INITIAL_PROGRESS = {
  1: [{ date: "2025-01-10", exercise: "Sentadilla", weight: 30, reps: 10 }, { date: "2025-03-01", exercise: "Sentadilla", weight: 40, reps: 12 }],
  2: [{ date: "2025-01-15", exercise: "Press militar", weight: 25, reps: 8 }, { date: "2025-03-05", exercise: "Press militar", weight: 35, reps: 10 }],
  3: [],
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: "linear-gradient(160deg, #0D1B2A 0%, #1B3A5C 100%)", fontFamily: "'Barlow', 'Helvetica Neue', sans-serif", color: "#B8D4F0", maxWidth: 480, margin: "0 auto", position: "relative" },
  header: { background: "#0B1428", borderBottom: "1px solid #2a2a2a", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, position: "sticky" },
  logo: { fontWeight: 900, letterSpacing: 2, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", lineHeight: 1, textAlign: "center" },
  logoSub: { fontSize: 10, color: "#6B91BB", letterSpacing: 2, textTransform: "uppercase", textAlign: "center" },
  content: { padding: "20px 16px 100px" },
  card: { background: "#0B1428", border: "1px solid #252525", borderRadius: 12, padding: 16, marginBottom: 12 },
  avatar: (size = 44) => ({ width: size, height: size, borderRadius: 10, background: "#B8D4F0", color: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: size * 0.32, flexShrink: 0 }),
  badge: { background: "#0A1225", color: "#8AAFD4", fontSize: 11, padding: "3px 8px", borderRadius: 4 },
  accentBadge: { background: "#5BB8F522", color: "#5BB8F5", fontSize: 11, padding: "3px 8px", borderRadius: 4 },
  goalBadge: (goal) => ({ background: goal === "perdida" ? "#FF9E8022" : "#3BFF9122", color: goal === "perdida" ? "#FF8C6B" : "#A8FFD8", fontSize: 11, padding: "3px 8px", borderRadius: 4 }),
  sectionTitle: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6B91BB", marginBottom: 10, marginTop: 22 },
  input: { background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" },
  btn: { background: "#5BB8F5", color: "#0A0F1E", border: "none", padding: "11px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  btnSecondary: { background: "#0B1428", color: "#B8D4F0", border: "1px solid #2a2a2a", padding: "10px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnDanger: { background: "transparent", color: "#ff5555", border: "1px solid #ff555533", padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  tab: (a) => ({ flex: 1, padding: "9px 0", background: a ? "#5BB8F5" : "transparent", color: a ? "#070C18" : "#7AA0C8", border: "none", borderRadius: 8, fontWeight: a ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }),
  exRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e1e1e" },
  aiBox: { background: "#0B1428", border: "1px solid #5BB8F533", borderRadius: 12, padding: 16, marginTop: 16 },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  statCard: { background: "#0B1428", border: "1px solid #252525", borderRadius: 10, padding: 12, textAlign: "center" },
  errorBox: { background: "#ff444411", border: "1px solid #ff444433", color: "#ff6666", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginTop: 8 },
};

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  input::placeholder { color: #444; }
  select option { background: #1a1a1a; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #354037; border-radius: 2px; }
`;

const GOAL_LABELS = { perdida: "Pérdida de peso", musculo: "Ganancia muscular" };

// Mapeo nombre de día → grupos musculares que deben aparecer
const MUSCLE_KEYWORDS = {
  pecho:      ["Pecho"],
  espalda:    ["Espalda", "Espalda baja"],
  "bíceps":   ["Bíceps"],
  "tríceps":  ["Tríceps"],
  hombro:     ["Hombros"],
  pierna:     ["Piernas", "Cuádriceps", "Femoral"],
  "cuádricep":["Cuádriceps", "Piernas"],
  femoral:    ["Femoral", "Glúteos"],
  "glúteo":   ["Glúteos", "Femoral"],
  core:       ["Core"],
  abdomen:    ["Core"],
  pantorrilla:["Pantorrilla"],
  cardio:     ["Cardio"],
  push:       ["Pecho", "Hombros", "Tríceps"],
  pull:       ["Espalda", "Bíceps", "Espalda baja"],
  "full body":["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Piernas", "Cuádriceps", "Femoral", "Glúteos", "Core"],
};

// Ejercicios que SIEMPRE aparecen (calentamiento/cardio)
const ALWAYS_SHOW_KEYWORDS = ["Cardio", "Core"];
const ALWAYS_SHOW_NAMES = ["Jumping jacks", "Mountain climbers", "Skipping en step"];

function getMusclesForDay(dayName) {
  if (!dayName) return null; // null = mostrar todos
  const lower = dayName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const muscles = new Set();
  for (const [kw, groups] of Object.entries(MUSCLE_KEYWORDS)) {
    const kwNorm = kw.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (lower.includes(kwNorm)) groups.forEach(g => muscles.add(g));
  }
  return muscles.size > 0 ? muscles : null;
}

function filterExercisesForDay(library, dayName) {
  const muscles = getMusclesForDay(dayName);
  if (!muscles) return library; // día genérico → todos
  return library.filter(ex => {
    // Siempre incluir cardio y algunos fijos
    if (ALWAYS_SHOW_KEYWORDS.some(k => ex.muscle?.includes(k))) return true;
    if (ALWAYS_SHOW_NAMES.some(n => ex.name === n)) return true;
    // Filtrar por músculo del día
    return [...muscles].some(m => ex.muscle?.toLowerCase().includes(m.toLowerCase()));
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function calcBMI(weight, height) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#BAD8FF" };
  if (bmi < 25) return { label: "Normal", color: "#A8FFD8" };
  if (bmi < 30) return { label: "Sobrepeso", color: "#fbbf24" };
  return { label: "Obesidad", color: "#ff6b6b" };
}

function MetricsForm({ student, onSave, onCancel, isOnboarding = false }) {
  const [goal, setGoal] = useState(student.goal || null);
  const [trainingDays, setTrainingDays] = useState(student.trainingDays || null);
  const [dayNames, setDayNames] = useState(student.dayNames || []);
  const [form, setForm] = useState({
    weight: student.metrics?.weight || "",
    height: student.metrics?.height || "",
    fatPct: student.metrics?.fatPct || "",
    musclePct: student.metrics?.musclePct || "",
    waterPct: student.metrics?.waterPct || "",
  });
  const [step, setStep] = useState(isOnboarding ? "goal" : "metrics");

  const bmi = form.weight && form.height ? calcBMI(Number(form.weight), Number(form.height)) : null;

  const handleSave = () => {
    if (!goal || !form.weight || !form.height) return;
    onSave({
      goal,
      trainingDays,
      dayNames,
      metrics: { ...form, weight: Number(form.weight), height: Number(form.height), bmi: Number(bmi), fatPct: Number(form.fatPct), musclePct: Number(form.musclePct), waterPct: Number(form.waterPct) }
    });
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const DAY_SUGGESTIONS = ["Piernas", "Pecho", "Espalda", "Hombros", "Bíceps y tríceps", "Espalda y bíceps", "Pecho y tríceps", "Hombros y brazos", "Full body", "Cardio", "Glúteos", "Tren superior", "Tren inferior"];

  const wrapStyle = { minHeight: "100vh", background: "#0A0F1E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Barlow', sans-serif" };

  // STEP 1: Objetivo
  if (step === "goal") return (
    <div style={wrapStyle}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#5BB8F5", marginBottom: 8 }}>¡Hola, {student.firstName}! 👋</div>
        <div style={{ fontSize: 14, color: "#7AA0C8" }}>¿Cuál es tu objetivo principal?</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { key: "perdida", emoji: "🔥", title: "Pérdida de peso", desc: "Quemo grasa y mejoro mi composición corporal", color: "#FF9E80" },
          { key: "musculo", emoji: "💪", title: "Ganancia muscular", desc: "Aumento masa muscular y me pongo más fuerte", color: "#A8FFD8" },
        ].map((opt) => (
          <div key={opt.key} onClick={() => setGoal(opt.key)}
            style={{ background: goal === opt.key ? `${opt.color}18` : "#0B1428", border: `2px solid ${goal === opt.key ? opt.color : "#0A1225"}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{opt.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: goal === opt.key ? opt.color : "#5BB8F5", marginBottom: 4 }}>{opt.title}</div>
            <div style={{ fontSize: 13, color: "#7AA0C8" }}>{opt.desc}</div>
          </div>
        ))}
        <button style={{ ...S.btn, width: "100%", marginTop: 8, opacity: goal ? 1 : 0.4 }} onClick={() => goal && setStep("days")}>Continuar →</button>
        {onCancel && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );

  // STEP 2: Días de entrenamiento
  if (step === "days") return (
    <div style={wrapStyle}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#5BB8F5", marginBottom: 8 }}>¿Cuántos días entrenás por semana? 📅</div>
        <div style={{ fontSize: 13, color: "#7AA0C8" }}>Contá todos los días, incluso los que venís solo.</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <div key={n} onClick={() => { setTrainingDays(n); setDayNames(Array(n).fill("").map((_, i) => dayNames[i] || "")); }}
              style={{ background: trainingDays === n ? "#5BB8F5" : "#0B1428", border: `2px solid ${trainingDays === n ? "#5BB8F5" : "#0A1225"}`, borderRadius: 12, padding: "18px 0", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: trainingDays === n ? "#070C18" : "#5BB8F5" }}>{n}</div>
              <div style={{ fontSize: 10, color: trainingDays === n ? "#456E9E" : "#6B91BB", marginTop: 2 }}>{n === 1 ? "día" : "días"}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setStep("goal")}>← Volver</button>
          <button style={{ ...S.btn, flex: 2, opacity: trainingDays ? 1 : 0.4 }} onClick={() => trainingDays && setStep("daynames")}>Continuar →</button>
        </div>
        {onCancel && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );

  // STEP 3: Nombre de cada día
  if (step === "daynames") return (
    <div style={{ ...wrapStyle, justifyContent: "flex-start", paddingTop: 40 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 28, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5", marginBottom: 6 }}>Poné nombre a cada día 🏷️</div>
        <div style={{ fontSize: 13, color: "#7AA0C8" }}>Podés escribirlo vos o elegir una sugerencia.</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: trainingDays }).map((_, i) => (
          <div key={i} style={{ background: "#0B1428", border: "1px solid #252525", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#5BB8F5", letterSpacing: 2, marginBottom: 8 }}>DÍA {i + 1}</div>
            <input style={S.input} placeholder={`ej: Piernas, Pecho, Full body...`}
              value={dayNames[i] || ""}
              onChange={e => setDayNames(prev => prev.map((d, j) => j === i ? e.target.value : d))} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {DAY_SUGGESTIONS.map(sug => (
                <button key={sug} onClick={() => setDayNames(prev => prev.map((d, j) => j === i ? sug : d))}
                  style={{ background: dayNames[i] === sug ? "#5BB8F5" : "#0B1428", border: `1px solid ${dayNames[i] === sug ? "#5BB8F5" : "#0F1C35"}`, color: dayNames[i] === sug ? "#070C18" : "#B8D4F0", padding: "4px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setStep("days")}>← Volver</button>
          <button style={{ ...S.btn, flex: 2 }} onClick={() => setStep("metrics")}>Continuar →</button>
        </div>
        {onCancel && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );

  // STEP 4: Datos corporales
  return (
    <div style={{ ...wrapStyle, justifyContent: "flex-start", paddingTop: 40 }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ textAlign: "center", marginBottom: 28, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5", marginBottom: 6 }}>Mis datos corporales 📊</div>
        <div style={{ fontSize: 13, color: "#7AA0C8" }}>Esta info nos ayuda a personalizar tu plan</div>
      </div>
      <div style={{ width: "100%", maxWidth: 380, background: "#0B1428", border: "1px solid #252525", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><div style={S.sectionTitle}>PESO (KG)</div><input style={S.input} type="number" placeholder="ej: 75" value={form.weight} onChange={(e) => f("weight", e.target.value)} /></div>
          <div><div style={S.sectionTitle}>ALTURA (CM)</div><input style={S.input} type="number" placeholder="ej: 175" value={form.height} onChange={(e) => f("height", e.target.value)} /></div>
        </div>
        {bmi && (() => { const cat = bmiCategory(Number(bmi)); return (
          <div style={{ background: "#0B1428", border: `1px solid ${cat.color}44`, borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>IMC</div><div style={{ fontSize: 22, fontWeight: 800, color: cat.color, marginTop: 2 }}>{bmi}</div></div>
            <div style={{ background: `${cat.color}22`, color: cat.color, fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>{cat.label}</div>
          </div>
        ); })()}
        <div style={S.sectionTitle}>COMPOSICIÓN CORPORAL (%)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[{ key: "fatPct", label: "GRASA", color: "#FF9E80", icon: "🔥" }, { key: "musclePct", label: "MÚSCULO", color: "#A8FFD8", icon: "💪" }, { key: "waterPct", label: "AGUA", color: "#BAD8FF", icon: "💧" }].map((m) => (
            <div key={m.key}>
              <div style={{ fontSize: 10, color: m.color, letterSpacing: 1, marginBottom: 6 }}>{m.icon} {m.label}</div>
              <input style={{ ...S.input, borderColor: form[m.key] ? `${m.color}44` : "#0F1C35" }} type="number" placeholder="%" value={form[m.key]} onChange={(e) => f(m.key, e.target.value)} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={{ ...S.btn, width: "100%" }} onClick={handleSave}>Guardar y continuar →</button>
          {isOnboarding && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={() => setStep("daynames")}>← Volver</button>}
          {onCancel && !isOnboarding && <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }} onClick={onCancel}>Cancelar</button>}
        </div>
      </div>
    </div>
  );
}

// ─── METRICS CARD (display) ───────────────────────────────────────────────────
function MetricsCard({ metrics, goal }) {
  if (!metrics) return null;
  const cat = bmiCategory(metrics.bmi);
  const bars = [
    { label: "Grasa", value: metrics.fatPct, color: "#FF9E80", icon: "🔥" },
    { label: "Músculo", value: metrics.musclePct, color: "#A8FFD8", icon: "💪" },
    { label: "Agua", value: metrics.waterPct, color: "#BAD8FF", icon: "💧" },
  ];
  return (
    <div style={{ ...S.card, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>PESO ACTUAL</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{metrics.weight}<span style={{ fontSize: 14, color: "#7AA0C8", fontWeight: 400 }}> kg</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>BMI</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: cat.color }}>{metrics.bmi}</div>
          <div style={{ fontSize: 11, color: cat.color }}>{cat.label}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bars.map((b) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#777" }}>{b.icon} {b.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}%</span>
            </div>
            <div style={{ height: 6, background: "#0A1225", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(b.value, 100)}%`, background: b.color, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: "#6B91BB" }}>Altura: {metrics.height} cm</div>
    </div>
  );
}

// ─── WEIGHT CHART ────────────────────────────────────────────────────────────
function WeightChart({ log }) {
  if (!log || log.length < 2) return null;
  const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date));
  const W = 300, H = 80, padL = 8, padR = 8, padT = 16, padB = 20;
  const weights = sorted.map(d => d.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const toX = i => padL + (i / (sorted.length - 1)) * (W - padL - padR);
  const toY = v => padT + (1 - (v - minW) / (maxW - minW)) * (H - padT - padB);
  const poly = sorted.map((p, i) => `${toX(i)},${toY(p.weight)}`).join(" ");
  const first = sorted[0], last = sorted[sorted.length - 1];
  const delta = (last.weight - first.weight).toFixed(1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#527BA8" }}>{first.date.slice(5)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0" }}>{first.weight} kg</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#527BA8" }}>variación</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: parseFloat(delta) < 0 ? "#A8FFD8" : "#FF9E80" }}>
            {parseFloat(delta) < 0 ? "▼" : "▲"} {Math.abs(delta)} kg
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#527BA8" }}>{last.date.slice(5)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#5BB8F5" }}>{last.weight} kg</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5BB8F5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#5BB8F5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${toX(0)},${H-padB} ${poly} ${toX(sorted.length-1)},${H-padB}`} fill="url(#wgrad)" />
        <polyline points={poly} fill="none" stroke="#5BB8F5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={toX(0)} cy={toY(first.weight)} r="4" fill="#B8D4F0" stroke="#070C18" strokeWidth="2" />
        <circle cx={toX(sorted.length-1)} cy={toY(last.weight)} r="5" fill="#5BB8F5" stroke="#070C18" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ─── WEIGHT CARD ──────────────────────────────────────────────────────────────
function WeightCard({ studentId, metrics, weightLog, setWeightLog, setStudents, canEdit = true }) {
  const [newWeight, setNewWeight] = useState("");
  const [newFat, setNewFat] = useState("");
  const [newMuscle, setNewMuscle] = useState("");
  const [newWater, setNewWater] = useState("");
  const [newWaist, setNewWaist] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [showForm, setShowForm] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // { index, weight, date }
  const log = weightLog[studentId] || [];
  const today = new Date().toISOString().slice(0, 10);

  const saveMetrics = () => {
    const weight = parseFloat(newWeight);
    if (!weight && !newFat && !newMuscle && !newWater && !newWaist) return;
    const entryDate = newDate || today;
    if (weight && weight > 20 && weight < 300) {
      // Insert sorted by date
      const newEntry = { date: entryDate, weight };
      const sorted = [...(weightLog[studentId] || []), newEntry].sort((a, b) => a.date.localeCompare(b.date));
      setWeightLog(prev => ({ ...prev, [studentId]: sorted }));
    }
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const currentMetrics = s.metrics || {};
      const h = currentMetrics.height;
      const w = weight || currentMetrics.weight;
      const bmi = w && h ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : currentMetrics.bmi;
      return {
        ...s, metrics: {
          ...currentMetrics,
          weight: weight || currentMetrics.weight,
          bmi,
          fatPct: newFat ? Number(newFat) : currentMetrics.fatPct,
          musclePct: newMuscle ? Number(newMuscle) : currentMetrics.musclePct,
          waterPct: newWater ? Number(newWater) : currentMetrics.waterPct,
          waist: newWaist ? Number(newWaist) : currentMetrics.waist,
        }
      };
    }));
    setNewWeight(""); setNewFat(""); setNewMuscle(""); setNewWater(""); setNewWaist("");
    setNewDate(today);
    setShowForm(false);
  };

  const saveEditEntry = () => {
    if (!editingEntry) return;
    const updated = log.map((e, i) => i === editingEntry.index ? { date: editingEntry.date, weight: parseFloat(editingEntry.weight) } : e)
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightLog(prev => ({ ...prev, [studentId]: updated }));
    setEditingEntry(null);
  };

  const deleteEntry = (idx) => {
    const updated = log.filter((_, i) => i !== idx);
    setWeightLog(prev => ({ ...prev, [studentId]: updated }));
  };

  const current = log.length > 0 ? log[log.length - 1] : null;
  const first = log.length > 0 ? log[0] : null;
  const delta = (current && first && log.length > 1) ? (current.weight - first.weight).toFixed(1) : null;
  const cat = metrics?.bmi ? bmiCategory(metrics.bmi) : null;


    return (
    <div style={{ ...S.card, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>PESO Y COMPOSICIÓN</div>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: showForm ? "#5BB8F5" : "#0B1428", color: showForm ? "#070C18" : "#5BB8F5", border: "1px solid #5BB8F544", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
            {showForm ? "✕ Cancelar" : "+ Actualizar"}
          </button>
        )}
      </div>

      {/* Current stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#070C18", borderRadius: 10, padding: "10px 12px", border: "1px solid #5BB8F533" }}>
          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 1, marginBottom: 2 }}>PESO</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
            {current?.weight ?? metrics?.weight ?? "—"}
            <span style={{ fontSize: 13, color: "#7AA0C8", fontWeight: 400 }}> kg</span>
          </div>
          {delta && (
            <div style={{ fontSize: 11, marginTop: 4, color: parseFloat(delta) < 0 ? "#A8FFD8" : "#FF9E80", fontWeight: 700 }}>
              {parseFloat(delta) < 0 ? "▼" : "▲"} {Math.abs(delta)} kg
            </div>
          )}
          {current && <div style={{ fontSize: 10, color: "#527BA8", marginTop: 4 }}>{current.date}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          {cat && (
            <>
              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 1, marginBottom: 2 }}>IMC</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: cat.color }}>{metrics.bmi}</div>
              <div style={{ fontSize: 10, color: cat.color }}>{cat.label}</div>
            </>
          )}
          {metrics?.waist && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#6B91BB" }}>Cintura: <span style={{ color: "#B8D4F0", fontWeight: 700 }}>{metrics.waist} cm</span></div>
          )}
        </div>
      </div>

      {/* Composition mini bars */}
      {metrics && (metrics.fatPct || metrics.musclePct || metrics.waterPct) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Grasa", val: metrics.fatPct, color: "#FF9E80", icon: "🔥" },
            { label: "Músculo", val: metrics.musclePct, color: "#A8FFD8", icon: "💪" },
            { label: "Agua", val: metrics.waterPct, color: "#BAD8FF", icon: "💧" },
          ].map(b => b.val ? (
            <div key={b.label} style={{ background: "#070C18", border: `1px solid ${b.color}55`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14 }}>{b.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: b.color, marginTop: 2 }}>{b.val}<span style={{ fontSize: 10 }}>%</span></div>
              <div style={{ fontSize: 9, color: "#B8D4F0", marginTop: 1 }}>{b.label}</div>
            </div>
          ) : null)}
        </div>
      ) : null}

      {/* Weight chart */}
      {log.length >= 2 && <div style={{ marginBottom: 14 }}><WeightChart log={log} /></div>}
      {log.length === 1 && <div style={{ fontSize: 11, color: "#527BA8", marginBottom: 12, textAlign: "center" }}>Registrá más pesajes para ver la evolución 📈</div>}

      {/* Update form */}
      {showForm && canEdit && (
        <div style={{ background: "#070C18", border: "1px solid #5BB8F544", borderRadius: 10, padding: 14, marginBottom: 12 }}>

          {/* Date field - prominent at top */}
          <div style={{ marginBottom: 12 }}>
            <div style={S.sectionTitle}>FECHA DEL REGISTRO</div>
            <input style={{ ...S.input, fontSize: 14 }} type="date" value={newDate}
              onChange={e => setNewDate(e.target.value)}
              max={today} />
            {newDate !== today && (
              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 5 }}>
                📅 Registrando para una fecha pasada
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <div style={S.sectionTitle}>PESO (KG)</div>
              <input style={S.input} type="number" placeholder="ej: 73.5" value={newWeight}
                onChange={e => setNewWeight(e.target.value)} />
            </div>
            <div>
              <div style={S.sectionTitle}>CINTURA (CM)</div>
              <input style={S.input} type="number" placeholder="ej: 78" value={newWaist}
                onChange={e => setNewWaist(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#FF9E80", letterSpacing: 1, marginBottom: 6 }}>🔥 GRASA %</div>
              <input style={S.input} type="number" placeholder={metrics?.fatPct || "20"} value={newFat} onChange={e => setNewFat(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#A8FFD8", letterSpacing: 1, marginBottom: 6 }}>💪 MÚSCULO %</div>
              <input style={S.input} type="number" placeholder={metrics?.musclePct || "40"} value={newMuscle} onChange={e => setNewMuscle(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#BAD8FF", letterSpacing: 1, marginBottom: 6 }}>💧 AGUA %</div>
              <input style={S.input} type="number" placeholder={metrics?.waterPct || "55"} value={newWater} onChange={e => setNewWater(e.target.value)} />
            </div>
          </div>
          <button style={{ ...S.btn, width: "100%" }} onClick={saveMetrics}>Guardar</button>
          <div style={{ fontSize: 10, color: "#527BA8", marginTop: 8, textAlign: "center" }}>Solo completá los campos que cambiaron</div>
        </div>
      )}

      {/* History toggle */}
      {log.length > 0 && (
        <button onClick={() => setShowLog(!showLog)}
          style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: 0 }}>
          {showLog ? "▲ Ocultar historial" : `▼ Historial de peso (${log.length} registros)`}
        </button>
      )}
      {showLog && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {[...log].map((entry, i) => {
            const realIdx = log.length - 1 - [...log].reverse().indexOf(entry); // preserve original index for delete
            const origIdx = log.indexOf(entry);
            const isEditing = editingEntry?.index === origIdx;
            return (
              <div key={i} style={{ background: "#070C18", border: `1px solid ${b.color}55`, borderRadius: 8, overflow: "hidden" }}>
                {isEditing ? (
                  <div style={{ padding: "10px 10px 8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={S.sectionTitle}>FECHA</div>
                        <input style={S.input} type="date" value={editingEntry.date} max={today}
                          onChange={e => setEditingEntry(p => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div>
                        <div style={S.sectionTitle}>PESO (KG)</div>
                        <input style={S.input} type="number" value={editingEntry.weight}
                          onChange={e => setEditingEntry(p => ({ ...p, weight: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ ...S.btn, flex: 1, padding: "8px 0", fontSize: 12 }} onClick={saveEditEntry}>Guardar</button>
                      <button style={{ ...S.btnSecondary, flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => setEditingEntry(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#7AA0C8" }}>{entry.date}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#5BB8F5", marginLeft: 12 }}>{entry.weight} kg</span>
                    </div>
                    {canEdit && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingEntry({ index: origIdx, date: entry.date, weight: entry.weight })}
                          style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>✏️</button>
                        <button onClick={() => deleteEntry(origIdx)}
                          style={{ background: "none", border: "none", color: "#456E9E", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>🗑️</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function LoginScreen({ onLogin, students }) {
  const [roleView, setRoleView] = useState("select");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleCoachLogin = () => {
    if (username === "christian" && password === "coach123") {
      onLogin({ id: "coach", role: "coach", name: "Chris R.", username: "christian" });
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleStudentLogin = () => {
    const st = (students || []).find(s => s.username === username && s.password === password);
    if (st) {
      onLogin({ id: st.id, role: "student", name: st.firstName, username: st.username });
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const goBack = () => { setRoleView("select"); setUsername(""); setPassword(""); setError(""); };

  const logoBlock = (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ fontSize: 42, color: "#D4A017", fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>CR</div>
      <div style={{ fontSize: 48, color: "#D4A017", fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>BODY</div>
      <div style={{ fontSize: 24, color: "#D4A017", letterSpacing: 6, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>LAB</div>
      <div style={{ fontSize: 12, color: "#6B91BB", letterSpacing: 3, marginTop: 8 }}>Entrenamiento personalizado</div>
    </div>
  );

  if (roleView === "select") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0A0F1E 0%, #0D2137 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow', sans-serif", padding: 24 }}>
        {logoBlock}
        <div style={{ background: "#0B1428", border: "1px solid #1e3a5f", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 14, color: "#6B91BB", textAlign: "center", marginBottom: 4 }}>¿Cómo querés ingresar?</div>
          <button style={{ background: "#5BB8F5", color: "#0A0F1E", border: "none", padding: "14px 20px", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => setRoleView("coach")}>
            🏋️ SOY ENTRENADOR
          </button>
          <button style={{ background: "#A8FFD8", color: "#0A0F1E", border: "none", padding: "14px 20px", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => setRoleView("student")}>
            👤 SOY ALUMNO
          </button>
        </div>
      </div>
    );
  }

  if (roleView === "coach") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0A0F1E 0%, #0D2137 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow', sans-serif", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 360, marginBottom: 8 }}>
          <button onClick={goBack} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit" }}>← Volver</button>
        </div>
        {logoBlock}
        <div style={{ background: "#0B1428", border: "1px solid #1e3a5f", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "#5BB8F5", fontWeight: 700, textAlign: "center", letterSpacing: 2 }}>ACCESO ENTRENADOR</div>
          <div>
            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>USUARIO</div>
            <input style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              type="text" placeholder="usuario" value={username} onChange={e => { setUsername(e.target.value); setError(""); }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>CONTRASEÑA</div>
            <input style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              type="password" placeholder="••••••" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleCoachLogin()} />
          </div>
          {error && <div style={{ color: "#ff6666", fontSize: 13, textAlign: "center" }}>{error}</div>}
          <button style={{ background: "#5BB8F5", color: "#0A0F1E", border: "none", padding: "12px 20px", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
            onClick={handleCoachLogin}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (roleView === "student") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0A0F1E 0%, #0D2137 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow', sans-serif", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 360, marginBottom: 8 }}>
          <button onClick={goBack} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit" }}>← Volver</button>
        </div>
        {logoBlock}
        <div style={{ background: "#0B1428", border: "1px solid #1e3a5f", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, color: "#A8FFD8", fontWeight: 700, textAlign: "center", letterSpacing: 2 }}>ACCESO ALUMNO</div>
          <div>
            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>USUARIO</div>
            <input style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#A8FFD8", padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              type="text" placeholder="usuario" value={username} onChange={e => { setUsername(e.target.value); setError(""); }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>CONTRASEÑA</div>
            <input style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#A8FFD8", padding: "10px 12px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              type="password" placeholder="••••••" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleStudentLogin()} />
          </div>
          {error && <div style={{ color: "#ff6666", fontSize: 13, textAlign: "center" }}>{error}</div>}
          <button style={{ background: "#A8FFD8", color: "#0A0F1E", border: "none", padding: "12px 20px", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
            onClick={handleStudentLogin}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── EXERCISE CONFIG FORM (reusable) ─────────────────────────────────────────
function ExerciseConfigForm({ ex, setEx, studentRoutine }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["SERIES", "sets"], ["REPS", "reps"], ["KG", "weight"]].map(([label, key]) => (
          <div key={key}>
            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>{label}</div>
            <input style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "9px 10px", borderRadius: 8, fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
              type="number" value={ex[key]} onChange={e => setEx(p => ({ ...p, [key]: Number(e.target.value) }))} />
          </div>
        ))}
      </div>

      {/* Photo URL */}
      <div>
        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>FOTO (URL)</div>
        <input style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", padding: "9px 10px", borderRadius: 8, fontSize: 12, width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
          placeholder="https://..." value={ex.imageUrl || ""} onChange={e => setEx(p => ({ ...p, imageUrl: e.target.value }))} />
        {ex.imageUrl && (
          <img src={ex.imageUrl} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display = "none"} />
        )}
      </div>

      {/* Method */}
      <div>
        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>MÉTODO</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button onClick={() => setEx(p => ({ ...p, method: null, methodGroup: null, tempo: null, drops: null }))}
            style={{ background: !ex.method ? "#5BB8F5" : "#0B1428", color: !ex.method ? "#070C18" : "#7AA0C8", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            Ninguno
          </button>
          {Object.entries(METHODS).map(([key, m]) => (
            <button key={key} onClick={() => setEx(p => ({ ...p, method: key, methodGroup: null, tempo: null, drops: null }))}
              style={{ background: ex.method === key ? `${m.color}33` : "#0B1428", border: `1px solid ${ex.method === key ? m.color : "#0F1C35"}`, color: ex.method === key ? m.color : "#7AA0C8", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Method-specific */}
      {ex.method && (
        <div style={{ background: "#070C18", border: `1px solid ${METHODS[ex.method].color}55`, borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: METHODS[ex.method].color, marginBottom: 8, fontWeight: 600 }}>{METHODS[ex.method].desc}</div>
          {(ex.method === "biserie" || ex.method === "triserie" ) && (
            <div style={{ fontSize: 11, color: "#6B91BB", padding: "6px 0" }}>Los ejercicios se agrupan automáticamente.</div>
          )}
          
          {ex.method === "restpause" && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#6B91BB", marginBottom: 6 }}>REPS REST & PAUSE (Principal + Pausa)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", marginBottom: 4 }}>Reps principales</div>
                  <input type="number" value={ex.repsMain ?? ex.reps ?? 10} onChange={e => setEx(p => ({ ...p, repsMain: +e.target.value }))}
                    style={{ ...S.input, textAlign: "center" }} min={1} />
                </div>
                <div style={{ fontSize: 18, color: "#e879f9", paddingTop: 18 }}>+</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", marginBottom: 4 }}>Reps pausa</div>
                  <input type="number" value={ex.repsPause ?? 2} onChange={e => setEx(p => ({ ...p, repsPause: +e.target.value }))}
                    style={{ ...S.input, textAlign: "center" }} min={1} />
                </div>
              </div>
            </div>
          )}
          {ex.method === "dropset" && (
            <div>
              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 6 }}>CANTIDAD DE DROPS</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setEx(p => ({ ...p, drops: n }))}
                    style={{ background: ex.drops === n ? "#5BB8F5" : "#0B1428", color: ex.drops === n ? "#070C18" : "#B8D4F0", border: "1px solid #2a2a2a", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STUDENT PORTAL ───────────────────────────────────────────────────────────
function ProgressionPanel({ ex, studentId, progressData, progressionExId, setProgressionExId }) {
  const exHistory = (progressData[studentId] || []).filter(p => p.exercise === ex.exercise);
  const isOpen = progressionExId === ex.id;
  return (
    <div style={{ marginTop: 6 }}>
      <button onClick={() => setProgressionExId(isOpen ? null : ex.id)}
        style={{ background: isOpen ? "#A8FFD822" : "none", border: `1px solid ${isOpen ? "#A8FFD8" : "#0F1C35"}`, color: isOpen ? "#A8FFD8" : "#7AA0C8", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: isOpen ? 700 : 400 }}>
        📈 {isOpen ? "Cerrar" : "Progresión"}
      </button>
      {isOpen && (
        <div style={{ background: "#070C18", border: "1px solid #A8FFD855", borderRadius: 10, padding: 12, marginTop: 8 }}>
          {exHistory.length === 0 && (
            <div style={{ fontSize: 11, color: "#527BA8", textAlign: "center", padding: "8px 0" }}>
              Sin registros aún. Usá "Actualizar pesos" para guardar tu progreso.
            </div>
          )}
          {exHistory.length >= 2 && (
            <div style={{ marginBottom: 10 }}>
              <MiniChart data={progressData[studentId] || []} exercise={ex.exercise} />
            </div>
          )}
          {exHistory.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 2, marginBottom: 2 }}>HISTORIAL</div>
              {[...exHistory].reverse().map((p, i) => (
                <div key={i} style={{ background: "#0B1428", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px" }}>
                    <span style={{ fontSize: 11, color: "#7AA0C8" }}>{p.date}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#A8FFD8" }}>💪 {p.weight > 0 ? `${p.weight}kg máx` : "PC"}</span>
                  </div>
                  {p.seriesData?.length > 0 && (
                    <div style={{ padding: "0 10px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                      {p.seriesData.map((s, si) => (
                        <div key={si} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ background: "#A8FFD822", color: "#A8FFD8", borderRadius: 4, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{si+1}</div>
                          <span style={{ fontSize: 11, color: "#B8D4F0" }}>{s.reps2 != null ? `${s.reps} + ${s.reps2} reps` : `${s.reps} reps`} · {s.weight > 0 ? `${s.weight}kg` : "PC"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EXERCISE DETAIL VIEW ─────────────────────────────────────────────────────
function ExerciseDetailView({ group, student, progressData, setProgressData, weightLog, setWeightLog, routines, setRoutines, onBack }) {
  const method = group.method ? METHODS[group.method] : null;
  const [editingSeriesExId, setEditingSeriesExId] = useState(null);
  const [editSeriesData, setEditSeriesData] = useState([]);
  const [progressionExId, setProgressionExId] = useState(null);
  const [progressionEx, setProgressionEx] = useState(null); // opens full progression view

  // Always read live data from routines so updates reflect immediately
  const liveItems = group.items.map(ex => {
    const live = (routines[student.id] || []).find(r => r.id === ex.id);
    return live || ex;
  });

  const saveSeriesProgress = (ex, seriesData, dateToUse) => {
    const clean = seriesData.filter(s => !s._date);
    const newEntry = {
      date: dateToUse,
      exercise: ex.exercise,
      weight: Math.max(...clean.map(s => s.weight || 0), 0),
      reps: clean[0]?.reps || 0,
      seriesData: clean,
    };
    setProgressData(prev => ({
      ...prev,
      [student.id]: [...(prev[student.id] || []), newEntry]
    }));
  };

  // ── PROGRESSION VIEW ──
  if (progressionEx) {
    const history = (progressData[student.id] || []).filter(p => p.exercise === progressionEx.exercise && p.seriesData?.length > 0);
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const maxSeries = Math.max(...sorted.map(p => p.seriesData?.length || 0), progressionEx.sets || 3);

    const W = 320, H = 150, padL = 36, padB = 28, padT = 20, padR = 12;
    const toX = (i, n) => padL + (n <= 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR));

    const SeriesChart = ({ serieIdx }) => {
      const pts = sorted.map(p => ({
        date: p.date.slice(5),
        weight: p.seriesData?.[serieIdx]?.weight ?? 0,
        reps: p.seriesData?.[serieIdx]?.reps ?? 0,
      })).filter(p => p.weight > 0 || p.reps > 0);

      if (pts.length < 1) return null;

      const maxW = Math.max(...pts.map(p => p.weight), 1);
      const maxR = Math.max(...pts.map(p => p.reps), 1);
      const n = pts.length;

      const toYW = v => padT + (1 - v / maxW) * (H - padT - padB);
      const toYR = v => padT + (1 - v / maxR) * (H - padT - padB);

      const polyW = pts.map((p, i) => `${toX(i, n)},${toYW(p.weight)}`).join(" ");
      const polyR = pts.map((p, i) => `${toX(i, n)},${toYR(p.reps)}`).join(" ");

      return (
        <div style={{ background: "#070C18", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#B8D4F0", letterSpacing: 1, marginBottom: 12 }}>
            SERIE {serieIdx + 1}
          </div>
          {/* Leyenda */}
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 3, background: "#5BB8F5", borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: "#5BB8F5", fontWeight: 700 }}>PESO (kg)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 3, background: "#A8FFD8", borderRadius: 2, borderTop: "2px dashed #A8FFD8", background: "none" }} />
              <span style={{ fontSize: 10, color: "#A8FFD8", fontWeight: 700 }}>REPS</span>
            </div>
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={`gW${serieIdx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5BB8F5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#5BB8F5" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`gR${serieIdx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8FFD8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A8FFD8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid */}
            {[0, 0.5, 1].map(v => (
              <line key={v} x1={padL} y1={padT + v * (H - padT - padB)} x2={W - padR} y2={padT + v * (H - padT - padB)}
                stroke="#0A1225" strokeWidth="1" />
            ))}
            {/* Y axis — peso izquierda */}
            {[0, 0.5, 1].map(v => (
              <text key={v} x={padL - 5} y={padT + (1-v) * (H - padT - padB) + 4}
                textAnchor="end" fontSize="9" fill="#5BB8F5">{Math.round(maxW * v)}</text>
            ))}
            {/* Y axis — reps derecha */}
            {[0, 0.5, 1].map(v => (
              <text key={v} x={W - padR + 5} y={padT + (1-v) * (H - padT - padB) + 4}
                textAnchor="start" fontSize="9" fill="#A8FFD8">{Math.round(maxR * v)}</text>
            ))}
            {/* Area peso */}
            {n > 1 && <polygon points={`${toX(0,n)},${H-padB} ${polyW} ${toX(n-1,n)},${H-padB}`} fill={`url(#gW${serieIdx})`} />}
            {/* Area reps */}
            {n > 1 && <polygon points={`${toX(0,n)},${H-padB} ${polyR} ${toX(n-1,n)},${H-padB}`} fill={`url(#gR${serieIdx})`} />}
            {/* Línea peso */}
            {n > 1 && <polyline points={polyW} fill="none" stroke="#5BB8F5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
            {/* Línea reps — punteada */}
            {n > 1 && <polyline points={polyR} fill="none" stroke="#A8FFD8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,3" />}
            {/* Puntos y fechas */}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={toX(i,n)} cy={toYW(p.weight)} r="4" fill="#5BB8F5" stroke="#070C18" strokeWidth="2" />
                <circle cx={toX(i,n)} cy={toYR(p.reps)} r="4" fill="#A8FFD8" stroke="#070C18" strokeWidth="2" />
                <text x={toX(i,n)} y={H - 8} textAnchor="middle" fontSize="9" fill="#527BA8">{p.date}</text>
              </g>
            ))}
          </svg>
          {/* Mini tabla */}
          <div style={{ marginTop: 12, borderTop: "1px solid #2F3D30", paddingTop: 10 }}>
            {[...pts].reverse().map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < pts.length - 1 ? "1px solid #2F3D30" : "none" }}>
                <span style={{ fontSize: 12, color: "#B8D4F0" }}>{p.date}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#5BB8F5" }}>{p.weight > 0 ? `${p.weight} kg` : "PC"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#A8FFD8" }}>{p.reps} reps</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div style={{ minHeight: "100vh", background: "#0A0F1E" }}>
        <div style={{ background: "#0B1428", borderBottom: "1px solid #354037", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
          <button onClick={() => setProgressionEx(null)} style={{ background: "none", border: "none", color: "#5BB8F5", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
          <div>
            <div style={{ fontSize: 10, color: "#A8FFD8", letterSpacing: 2, fontWeight: 700 }}>📈 PROGRESIÓN</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#B8D4F0" }}>{progressionEx.exercise}</div>
          </div>
        </div>
        <div style={{ padding: "20px 16px 100px" }}>
          {sorted.length === 0 ? (
            <div style={{ background: "#070C18", borderRadius: 14, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#B8D4F0", marginBottom: 6 }}>Sin datos aún</div>
              <div style={{ fontSize: 13, color: "#7AA0C8" }}>Guardá pesos en "Actualizar pesos" para ver tu evolución</div>
            </div>
          ) : (
            Array.from({ length: maxSeries }).map((_, si) => <SeriesChart key={si} serieIdx={si} />)
          )}
        </div>
      </div>
    );
  }

    return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E" }}>
      {/* Header */}
      <div style={{ background: "#0B1428", borderBottom: "1px solid #354037", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#5BB8F5", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          {method
            ? <span style={{ background: `${method.color}22`, color: method.color, fontSize: 11, padding: "3px 10px", borderRadius: 4, fontWeight: 700 }}>{method.emoji} {method.label}</span>
            : null}
          <div style={{ fontWeight: 800, fontSize: 17, marginTop: method ? 4 : 0, color: "#B8D4F0" }}>
            {group.items.map(e => e.exercise).join(" + ")}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 100px" }}>
        {liveItems.map((ex, idx) => {
          const hasSeries = ex.seriesData?.length > 0;
          const displayData = hasSeries
            ? ex.seriesData
            : Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0 }));
          const accentColor = method ? method.color : "#5BB8F5";

          return (
            <div key={ex.id} style={{ marginBottom: 20 }}>
              {/* Imagen grande */}
              {(ex.imageCustom || ex.imageUrl) && (
                <div style={{ width: "100%", height: 220, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                  <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                </div>
              )}

              {/* Nombre */}
              {liveItems.length > 1 && (
                <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>EJERCICIO {idx + 1}</div>
              )}
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12, color: "#B8D4F0" }}>{ex.exercise}</div>

              {/* Series */}
              <div style={{ background: "#070C18", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                {editingSeriesExId === ex.id ? (
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, marginBottom: 6 }}>FECHA DEL REGISTRO</div>
                    <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px 12px", borderRadius: 8, fontSize: 13, width: "100%", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 12 }}
                      type="date" value={editSeriesData._date || new Date().toISOString().slice(0,10)}
                      max={new Date().toISOString().slice(0,10)}
                      onChange={e => setEditSeriesData(prev => { const n = [...prev]; n._date = e.target.value; return n; })} />

                    <div style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "32px 1fr 14px 1fr 1fr" : "32px 1fr 1fr", gap: 8, marginBottom: 6 }}>
                      <div />
                      <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>{ex.method === "restpause" ? "REPS 1" : "REPS"}</div>
                      {ex.method === "restpause" && <div style={{ fontSize: 10, color: "#e879f9", textAlign: "center" }}>+</div>}
                      {ex.method === "restpause" && <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>REPS 2</div>}
                      <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>KG</div>
                    </div>
                    {editSeriesData.map((s, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "32px 1fr 14px 1fr 1fr" : "32px 1fr 1fr", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <div style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 6, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{i+1}</div>
                        <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit" }}
                          type="number" value={s.reps} onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps: Number(e.target.value) } : sd))} />
                        {ex.method === "restpause" && <div style={{ color: "#e879f9", textAlign: "center", fontWeight: 700, fontSize: 16 }}>+</div>}
                        {ex.method === "restpause" && (
                          <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit" }}
                            type="number" value={s.reps2 ?? 2} onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps2: Number(e.target.value) } : sd))} />
                        )}
                        <input style={{ background: "#0B1428", border: "1px solid #354037", color: "#B8D4F0", padding: "8px", borderRadius: 8, fontSize: 14, textAlign: "center", fontFamily: "inherit" }}
                          type="number" value={s.weight} onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, weight: Number(e.target.value) } : sd))} />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button style={{ flex: 1, background: "#5BB8F5", color: "#070C18", border: "none", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => {
                          const today = new Date().toISOString().slice(0, 10);
                          const dateToUse = editSeriesData._date || today;
                          // strip the _date marker before saving
                          const cleanData = editSeriesData.map(({ _date, ...s }) => s);
                          setRoutines(prev => ({
                            ...prev,
                            [student.id]: (prev[student.id] || []).map(e => e.id === ex.id ? { ...e, seriesData: cleanData } : e)
                          }));
                          saveSeriesProgress(ex, editSeriesData, dateToUse);
                          setEditingSeriesExId(null);
                        }}>Guardar</button>
                      <button style={{ flex: 1, background: "#0A1225", color: "#B8D4F0", border: "1px solid #354037", padding: "10px 0", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => setEditingSeriesExId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 14 }}>
                    {displayData.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#B8D4F0" }}>{ex.method === "restpause" ? `${s.reps} + ${s.reps2 ?? 2} reps` : `${s.reps} reps`}</span>
                          <span style={{ color: "#7AA0C8", fontSize: 13 }}> · </span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#5BB8F5" }}>{s.weight > 0 ? `${s.weight} kg` : "Peso corporal"}</span>
                        </div>
                      </div>
                    ))}
                    <button style={{ width: "100%", background: "#5BB8F511", border: "1px solid #5BB8F544", color: "#5BB8F5", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}
                      onClick={() => { const d = [...displayData]; d._date = new Date().toISOString().slice(0,10); setEditSeriesData(d); setEditingSeriesExId(ex.id); }}>
                      ✏️ Actualizar pesos
                    </button>
                  </div>
                )}
              </div>

              {/* Progresión */}
              <button onClick={() => setProgressionEx(ex)}
                style={{ width: "100%", background: "#A8FFD811", border: "1px solid #A8FFD844", color: "#A8FFD8", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
                📈 Ver Progresión
              </button>

              {/* Separador entre ejercicios de grupo */}
              {idx < liveItems.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
                  <div style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
                  <span style={{ background: `${accentColor}22`, color: accentColor, fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20, border: `1px solid ${accentColor}55` }}>{method?.emoji} + {method?.emoji}</span>
                  <div style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function StudentPortal({ user, students, setStudents, routines, setRoutines, progressData, setProgressData, payments, classes, weightLog, setWeightLog, onLogout, isPreview = false }) {
  const student = students.find((s) => s.id === user.id);
  const [activeTab, setActiveTab] = useState("body");
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [newProgress, setNewProgress] = useState({ exercise: "", weight: 0, reps: 0 });
  const [selectedExercise, setSelectedExercise] = useState("");
  const [aiPlan, setAiPlan] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [activeNutDay, setActiveNutDay] = useState(0);
  const [nutCheatOpen, setNutCheatOpen] = useState(false);
  const [editingSeriesExId, setEditingSeriesExId] = useState(null);
  const [editSeriesData, setEditSeriesData] = useState([]);
  const [progressionExId, setProgressionExId] = useState(null);
  const [progressionForm, setProgressionForm] = useState({ weight: "", reps: "" });
  const [expandedExId, setExpandedExId] = useState(null);
  const [selectedExGroup, setSelectedExGroup] = useState(null);

  if (!student) return null;

  // Coach fills all data — student only views, no onboarding form

  if (editingMetrics) {
    return <MetricsForm student={student} isOnboarding={false}
      onSave={({ goal, metrics, trainingDays, dayNames }) => { setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, goal, metrics, trainingDays, dayNames } : s)); setEditingMetrics(false); }}
      onCancel={() => setEditingMetrics(false)} />;
  }

  const myRoutine = routines[student.id] || [];
  const myProgress = progressData[student.id] || [];
  const myPayments = payments[student.id] || [];
  const myClasses = classes[student.id] || [];
  const billing = student.billing;
  const hasPayments = myPayments.length > 0;
  const billStatus = (billing || hasPayments) ? getBillingStatus(myPayments, myClasses) : null;

  const addProgress = () => {
    if (!newProgress.exercise || !newProgress.weight) return;
    setProgressData((prev) => ({ ...prev, [student.id]: [...(prev[student.id] || []), { date: new Date().toISOString().slice(0, 10), ...newProgress }] }));
    setSelectedExercise(newProgress.exercise);
    setNewProgress({ exercise: "", weight: 0, reps: 0 });
  };

  const fetchAIPlan = async () => {
    setAiLoading(true); setAiPlan("");
    const m = student.metrics;
    const cat = bmiCategory(m.bmi);
    const prompt = `Eres un experto en entrenamiento y nutrición. Genera un plan breve y motivador (máximo 5 puntos cortos) para este alumno basado en sus datos reales.

Alumno: ${fullName(student)}, ${student.age} años
Objetivo: ${GOAL_LABELS[student.goal]}
Peso: ${m.weight}kg | Altura: ${m.height}cm | BMI: ${m.bmi} (${cat.label})
% Grasa: ${m.fatPct}% | % Músculo: ${m.musclePct}% | % Agua: ${m.waterPct}%
Ejercicios en rutina: ${myRoutine.map(e => e.exercise).join(", ") || "ninguno aún"}

Da recomendaciones específicas de entrenamiento y nutrición basadas en estos datos. Responde en español, con formato de lista numerada, directo y práctico. Sé específico con los números (calorías, proteínas, etc.).`;
    setAiPlan(await callAI(prompt));
    setAiLoading(false);
  };

  // Show exercise detail view
  if (selectedExGroup) {
    return <ExerciseDetailView
      group={selectedExGroup}
      student={student}
      progressData={progressData}
      setProgressData={setProgressData}
      weightLog={weightLog}
      setWeightLog={setWeightLog}
      routines={routines}
      setRoutines={setRoutines}
      onBack={() => setSelectedExGroup(null)}
    />;
  }

  return (
    <div style={S.app}>
      
      <style>{GLOBAL_STYLE}</style>
      {isPreview && (
        <div style={{ background: "#5BB8F5", padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>👁️ VISTA PREVIA — {student.firstName}</span>
          <button onClick={onLogout} style={{ background: "#000", color: "#5BB8F5", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>← Volver al panel</button>
        </div>
      )}
      <div style={S.header}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}><div style={S.logo}>
  <span style={{ fontSize: 28, color: "#D4A017" }}>CR </span>
  <span style={{ fontSize: 32, color: "#D4A017" }}>BODY</span>
  <span style={{ fontSize: 18, color: "#D4A017", letterSpacing: 3 }}>LAB</span>
</div><div style={S.logoSub}>MI PORTAL</div></div>
        <div style={S.avatar(32)}>{student.avatar}</div>
      </div>

      <div style={S.content}>
        {/* Welcome */}
        <div style={{ ...S.card, cursor: "default", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={S.avatar(48)}>{student.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: 0.5 }}>Hola, {student.firstName} 💪</div>
            <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 2 }}>@{student.username}</div>
            <div style={{ marginTop: 6 }}><span style={S.goalBadge(student.goal)}>{student.goal === "perdida" ? "🔥" : "💪"} {GOAL_LABELS[student.goal] || "Sin objetivo"}</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 5, background: "#0B1428", padding: 5, borderRadius: 10, marginBottom: 16, border: "1px solid #252525" }}>
          {[["body", "Cuerpo 📊"], ["routine", "Rutina"], ["nutrition", "🥗 Nutrición"], ["billing", "Clases 💳"]].map(([t, l]) => (
            <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{l}</button>
          ))}
        </div>

        {/* BODY TAB */}
        {activeTab === "body" && (
          <>
            {/* Weight card with chart */}
            <WeightCard
              studentId={student.id}
              metrics={student.metrics}
              weightLog={weightLog}
              setWeightLog={setWeightLog}
              setStudents={setStudents}
              canEdit={true}
            />

            {/* Body composition bars */}
            {student.metrics && (() => {
              const bars = [
                { label: "Grasa", value: student.metrics.fatPct, color: "#FF9E80", icon: "🔥" },
                { label: "Músculo", value: student.metrics.musclePct, color: "#A8FFD8", icon: "💪" },
                { label: "Agua", value: student.metrics.waterPct, color: "#BAD8FF", icon: "💧" },
              ];
              return (
                <div style={{ ...S.card, cursor: "default" }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>COMPOSICIÓN CORPORAL</div>
                  {bars.map(b => (
                    <div key={b.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#777" }}>{b.icon} {b.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}%</span>
                      </div>
                      <div style={{ height: 6, background: "#0A1225", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(b.value, 100)}%`, background: b.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, fontSize: 12, color: "#6B91BB" }}>Altura: {student.metrics.height} cm</div>
                </div>
              );
            })()}

            {/* Training days */}
            {student.trainingDays && (
              <div style={{ ...S.card, cursor: "default" }}>
                <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>MI PLAN SEMANAL</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#5BB8F5" }}>{student.trainingDays}</div>
                  <div style={{ fontSize: 13, color: "#7AA0C8" }}>días de entrenamiento por semana</div>
                </div>
                {student.dayNames?.filter(Boolean).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {student.dayNames.map((name, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#070C18", borderRadius: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "#5BB8F522", color: "#5BB8F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: 13, color: "#ccc" }}>{name || `Día ${i + 1}`}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => setEditingMetrics(true)}>✏️ Actualizar composición</button>
          </>
        )}

        {/* ROUTINE TAB */}
        {activeTab === "routine" && (() => {
          const days = (student.dayNames?.length > 0 && student.trainingDays)
            ? student.dayNames.slice(0, student.trainingDays)
            : student.trainingDays
              ? Array.from({ length: student.trainingDays }, (_, i) => `Día ${i + 1}`)
              : null;

          const filteredRoutine = days
            ? myRoutine.filter(ex => (ex.dayIndex ?? 0) === activeDayIdx)
            : myRoutine;

          const grouped = [];
          const seen = new Set();
          filteredRoutine.forEach(ex => {
            if (ex.methodGroup && (ex.method === "biserie" || ex.method === "triserie" )) {
              if (!seen.has(ex.methodGroup)) {
                seen.add(ex.methodGroup);
                // Fetch all exercises with this exact methodGroup from full routine
                const groupItems = myRoutine.filter(e => e.methodGroup && e.methodGroup === ex.methodGroup);
                grouped.push({ type: "group", key: ex.methodGroup, items: groupItems, method: ex.method });
              }
            } else {
              grouped.push({ type: "single", key: String(ex.id), items: [ex] });
            }
          });

          return (
            <>
              {/* Day selector */}
              {days && (
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
                  {days.map((name, i) => (
                    <button key={i} onClick={() => setActiveDayIdx(i)}
                      style={{ background: activeDayIdx === i ? "#5BB8F5" : "#0B1428", color: activeDayIdx === i ? "#070C18" : "#7AA0C8", border: `1px solid ${activeDayIdx === i ? "#5BB8F5" : "#0A1225"}`, padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: activeDayIdx === i ? 700 : 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, opacity: 0.6, marginRight: 3 }}>D{i + 1}</span>
                      {name || `Día ${i + 1}`}
                      <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.5 }}>({myRoutine.filter(e => (e.dayIndex ?? 0) === i).length})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Active day header */}
              {days && (
                <div style={{ background: "#0B1428", border: "1px solid #252525", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>DÍA {activeDayIdx + 1}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{days[activeDayIdx] || `Día ${activeDayIdx + 1}`}</div>
                  </div>
                  <span style={S.accentBadge}>{filteredRoutine.length} ejercicio{filteredRoutine.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              {filteredRoutine.length === 0 && <p style={{ color: "#6B91BB", textAlign: "center", padding: 24, fontSize: 13 }}>Sin ejercicios en este día.</p>}

              {grouped.map(group => {
                const method = group.method ? METHODS[group.method] : null;

                // BISERIE / TRISERIE / DROPSET / REST&PAUSE — tarjeta compacta/expandible
                if (group.type === "group" && method) {
                  const groupKey = group.key;
                  const isGroupExpanded = expandedExId === groupKey;
                  return (
                    <div key={groupKey} style={{ marginBottom: 12 }}>

                      {/* ── VISTA COMPACTA ── */}
                      <div onClick={() => setSelectedExGroup(group)}
                        style={{ background: "#0B1428", border: `2px solid ${method.color}55`, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                        {/* Fila compacta */}
                        <div style={{ display: "flex", alignItems: "stretch", minHeight: 90 }}>
                          {/* Info izquierda */}
                          <div style={{ flex: 1, padding: "14px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ background: `${method.color}22`, color: method.color, fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, alignSelf: "flex-start", marginBottom: 8 }}>
                              {method.emoji} {method.label}
                            </span>
                            {group.items.map((ex, idx) => (
                              <div key={ex.id} style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>
                                {idx > 0 && <span style={{ color: method.color, fontSize: 11, marginRight: 4 }}>+</span>}
                                {ex.exercise}
                              </div>
                            ))}
                            <div style={{ fontSize: 10, color: "#5BB8F599", marginTop: 8 }}>"▼ Ver detalle"</div>
                          </div>
                          {/* Una sola imagen — primer ejercicio */}
                          <div style={{ width: 130, background: "#0A1225", overflow: "hidden", flexShrink: 0, borderLeft: `2px solid ${method.color}55` }}>
                            {(() => { const ex = group.items[0]; return (ex.imageCustom || ex.imageUrl)
                              ? <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏋️</div>; })()}
                          </div>
                        </div>

                        {/* Click navega a detalle — ver ExerciseDetailView */}
                        {false && (
                          <div style={{ borderTop: `1px solid ${method.color}33` }}>
                            {group.items.map((ex, idx) => (
                          <div key={ex.id}>
                            {/* Ejercicio */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px" }}>
                              <div style={{ width: 56, height: 56, borderRadius: 10, background: "#0A1225", overflow: "hidden", flexShrink: 0, border: `2px solid ${method.color}33` }}>
                                {(ex.imageCustom || ex.imageUrl)
                                  ? <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏋️</div>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, color: method.color, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>EJERCICIO {idx + 1}</div>
                                <div style={{ fontWeight: 800, fontSize: 15 }}>{ex.exercise}</div>

                                {/* Series detalladas — siempre editables */}
                                {(() => {
                                  const hasSeries = ex.seriesData?.length > 0;
                                  const displayData = hasSeries
                                    ? ex.seriesData
                                    : Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0 }));

                                  return (
                                    <div style={{ marginTop: 8 }}>
                                      {editingSeriesExId === ex.id ? (
                                        <>
                                          <div style={{ marginBottom: 6 }}>
                                            <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>FECHA DEL REGISTRO</div>
                                            <input style={{ ...S.input, fontSize: 12 }} type="date"
                                              value={editSeriesData._date || new Date().toISOString().slice(0,10)}
                                              max={new Date().toISOString().slice(0,10)}
                                              onChange={e => setEditSeriesData(prev => { const n = [...prev]; n._date = e.target.value; return n; })} />
                                            {editSeriesData._date && editSeriesData._date !== new Date().toISOString().slice(0,10) && (
                                              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 3 }}>📅 Fecha pasada</div>
                                            )}
                                          </div>
                                          <div style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "24px 1fr 10px 1fr 1fr" : "24px 1fr 1fr", gap: 5, marginBottom: 4 }}>
                                            <div />
                                            <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>REPS{ex.method === "restpause" ? " 1" : ""}</div>
                                            {ex.method === "restpause" && <div style={{ fontSize: 9, color: "#e879f9", textAlign: "center" }}>+</div>}
                                            {ex.method === "restpause" && <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>REPS 2</div>}
                                            <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>KG</div>
                                          </div>
                                          {editSeriesData.map((s, i) => (
                                            <div key={i} style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "24px 1fr 10px 1fr 1fr" : "24px 1fr 1fr", gap: 5, alignItems: "center", marginBottom: 4 }}>
                                              <div style={{ background: `${method.color}22`, color: method.color, borderRadius: 4, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{i+1}</div>
                                              <input style={{ ...S.input, textAlign: "center", padding: "5px 4px", fontSize: 12 }} type="number" value={s.reps}
                                                onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps: Number(e.target.value) } : sd))} />
                                              {ex.method === "restpause" && <div style={{ color: "#e879f9", textAlign: "center", fontWeight: 700 }}>+</div>}
                                              {ex.method === "restpause" && (
                                                <input style={{ ...S.input, textAlign: "center", padding: "5px 4px", fontSize: 12 }} type="number" value={s.reps2 ?? 2}
                                                  onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps2: Number(e.target.value) } : sd))} />
                                              )}
                                              <input style={{ ...S.input, textAlign: "center", padding: "5px 4px", fontSize: 12 }} type="number" value={s.weight}
                                                onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, weight: Number(e.target.value) } : sd))} />
                                            </div>
                                          ))}
                                          <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                                            <button style={{ ...S.btn, flex: 1, padding: "6px 0", fontSize: 11 }} onClick={() => {
                                              const today = new Date().toISOString().slice(0,10);
                                              const dateToUse = editSeriesData._date || today;
                                              setRoutines(prev => ({ ...prev, [student.id]: prev[student.id].map(e => e.id === ex.id ? { ...e, seriesData: editSeriesData } : e) }));
                                              saveSeriesProgress(ex, editSeriesData, dateToUse);
                                              setEditingSeriesExId(null);
                                            }}>Guardar</button>
                                            <button style={{ ...S.btnSecondary, flex: 1, padding: "6px 0", fontSize: 11 }} onClick={() => setEditingSeriesExId(null)}>Cancelar</button>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          {displayData.map((s, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                              <div style={{ background: `${method.color}22`, color: method.color, borderRadius: 4, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                                              <span style={{ fontSize: 12 }}>
                                                <span style={{ color: "#fff", fontWeight: 700 }}>{s.reps} reps</span>
                                                {" · "}
                                                <span style={{ color: "#5BB8F5", fontWeight: 700 }}>{s.weight > 0 ? `${s.weight} kg` : "PC"}</span>
                                              </span>
                                            </div>
                                          ))}
                                          <button onClick={() => { setEditingSeriesExId(ex.id); const d = [...displayData]; d._date = new Date().toISOString().slice(0,10); setEditSeriesData(d); }}
                                            style={{ background: "#5BB8F511", border: `1px solid #5BB8F544`, color: "#5BB8F5", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginTop: 5, fontWeight: 700 }}>
                                            ✏️ Actualizar pesos
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  );
                                })()}
                                <button onClick={() => setProgressionEx(ex)}
                style={{ width: "100%", background: "#A8FFD811", border: "1px solid #A8FFD844", color: "#A8FFD8", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
                📈 Ver Progresión
              </button>
                              </div>
                            </div>

                            {/* Separador entre ejercicios */}
                            {idx < liveItems.length - 1 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", margin: "0" }}>
                                <div style={{ flex: 1, height: 1, background: `${method.color}33` }} />
                                <div style={{ background: `${method.color}22`, border: `1px solid ${method.color}55`, color: method.color, fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>
                                  {method.emoji} + {method.emoji}
                                </div>
                                <div style={{ flex: 1, height: 1, background: `${method.color}33` }} />
                              </div>
                            )}
                          </div>
                        ))}

                            {/* Footer dentro del detalle */}
                            <div style={{ background: `${method.color}11`, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 11, color: method.color, fontWeight: 700 }}>{group.items[0]?.sets || 3} rondas completas</span>
                              <span style={{ fontSize: 10, color: "#527BA8" }}>· descanso al final de cada ronda</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // EJERCICIO NORMAL
                const ex = group.items[0];
                const isExpanded = expandedExId === ex.id;
                return (
                  <div key={group.key} style={{ marginBottom: 10 }}>
                    <div style={{ background: "#0B1428", border: `1px solid ${isExpanded ? "#5BB8F566" : "#0A1225"}`, borderRadius: 10, overflow: "hidden", transition: "border 0.2s" }}>

                      {/* ── VISTA COMPACTA (siempre visible) ── */}
                      <div onClick={() => setSelectedExGroup(group)}
                        style={{ display: "flex", alignItems: "stretch", cursor: "pointer", minHeight: 90 }}>
                        {/* Info izquierda */}
                        <div style={{ flex: 1, padding: "14px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>{ex.exercise}</div>
                          {ex.method && METHODS[ex.method] && (
                            <span style={{ background: `${METHODS[ex.method].color}22`, color: METHODS[ex.method].color, fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700, marginTop: 6, alignSelf: "flex-start" }}>
                              {METHODS[ex.method].emoji} {METHODS[ex.method].label}
                            </span>
                          )}
                          <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 6 }}>
                            {ex.type === "cardio" ? `${ex.duration} min 🕐` : `${ex.sets} series · ${ex.method === "restpause" ? `${ex.repsMain ?? ex.reps} + ${ex.repsPause ?? 2}` : ex.reps} reps`}
                          </div>
                          <div style={{ fontSize: 10, color: "#5BB8F599", marginTop: 6 }}>{isExpanded ? "▲ Cerrar" : "▼ Ver detalle"}</div>
                        </div>
                        {/* Imagen derecha grande */}
                        <div style={{ width: 130, background: "#0A1225", overflow: "hidden", flexShrink: 0 }}>
                          {(ex.imageCustom || ex.imageUrl)
                            ? <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🏋️</div>}
                        </div>
                      </div>

                      {/* Click navega a detalle */}
                      {false && (
                        <div style={{ borderTop: "1px solid #354037", padding: "14px 14px" }}>
                          <div style={{ fontSize: 12, color: "#ccc", marginTop: 0 }}>
                            {ex.type === "cardio"
                              ? <>{ex.duration} minutos 🕐{ex.description ? <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 3 }}>{ex.description}</div> : null}</>
                              : (() => {
                                  const hasSeries = ex.seriesData?.length > 0;
                                  const displayData = hasSeries
                                    ? ex.seriesData
                                    : Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0 }));
                                  return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                                      {editingSeriesExId === ex.id ? (
                                        <>
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 2, marginBottom: 4 }}>FECHA DEL REGISTRO</div>
                                            <input style={{ ...S.input, fontSize: 13 }} type="date"
                                              value={editSeriesData._date || new Date().toISOString().slice(0,10)}
                                              max={new Date().toISOString().slice(0,10)}
                                              onChange={e => setEditSeriesData(prev => { const n = [...prev]; n._date = e.target.value; return n; })} />
                                            {editSeriesData._date && editSeriesData._date !== new Date().toISOString().slice(0,10) && (
                                              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 3 }}>📅 Registrando para una fecha pasada</div>
                                            )}
                                          </div>
                                          <div style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "28px 1fr 10px 1fr 1fr" : "28px 1fr 1fr", gap: 6, marginBottom: 2 }}>
                                            <div />
                                            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>REPS{ex.method === "restpause" ? " 1" : ""}</div>
                                            {ex.method === "restpause" && <div style={{ fontSize: 10, color: "#e879f9", textAlign: "center" }}>+</div>}
                                            {ex.method === "restpause" && <div style={{ fontSize: 10, color: "#B8D4F0", letterSpacing: 2, textAlign: "center" }}>REPS 2</div>}
                                            <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>KG</div>
                                          </div>
                                          {editSeriesData.map((s, i) => (
                                            <div key={i} style={{ display: "grid", gridTemplateColumns: ex.method === "restpause" ? "28px 1fr 10px 1fr 1fr" : "28px 1fr 1fr", gap: 6, alignItems: "center" }}>
                                              <div style={{ background: "#5BB8F522", color: "#5BB8F5", borderRadius: 5, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{i+1}</div>
                                              <input style={{ ...S.input, textAlign: "center", padding: "6px 6px", fontSize: 13 }} type="number" value={s.reps}
                                                onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps: Number(e.target.value) } : sd))} />
                                              {ex.method === "restpause" && <div style={{ color: "#e879f9", textAlign: "center", fontWeight: 700 }}>+</div>}
                                              {ex.method === "restpause" && (
                                                <input style={{ ...S.input, textAlign: "center", padding: "6px 6px", fontSize: 13 }} type="number" value={s.reps2 ?? 2}
                                                  onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps2: Number(e.target.value) } : sd))} />
                                              )}
                                              <input style={{ ...S.input, textAlign: "center", padding: "6px 6px", fontSize: 13 }} type="number" value={s.weight}
                                                onChange={e => setEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, weight: Number(e.target.value) } : sd))} />
                                            </div>
                                          ))}
                                          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                            <button style={{ ...S.btn, flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => {
                                              const today = new Date().toISOString().slice(0, 10);
                                              const dateToUse = editSeriesData._date || today;
                                              setRoutines(prev => ({ ...prev, [student.id]: prev[student.id].map(e => e.id === ex.id ? { ...e, seriesData: editSeriesData } : e) }));
                                              saveSeriesProgress(ex, editSeriesData, dateToUse);
                                              setEditingSeriesExId(null);
                                            }}>Guardar</button>
                                            <button style={{ ...S.btnSecondary, flex: 1, padding: "8px 0", fontSize: 12 }} onClick={() => setEditingSeriesExId(null)}>Cancelar</button>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          {displayData.map((s, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                              <div style={{ background: "#5BB8F522", color: "#5BB8F5", borderRadius: 5, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                                              <span style={{ fontSize: 12 }}><span style={{ color: "#fff", fontWeight: 700 }}>{ex.method === "restpause" ? `${s.reps} + ${s.reps2 ?? 2} reps` : `${s.reps} reps`}</span> · <span style={{ color: "#5BB8F5", fontWeight: 700 }}>{s.weight > 0 ? `${s.weight} kg` : "PC"}</span></span>
                                            </div>
                                          ))}
                                          <button onClick={() => { setEditingSeriesExId(ex.id); const d = [...displayData]; d._date = new Date().toISOString().slice(0,10); setEditSeriesData(d); }}
                                            style={{ background: "#5BB8F511", border: "1px solid #5BB8F544", color: "#5BB8F5", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginTop: 4, alignSelf: "flex-start", fontWeight: 700 }}>
                                            ✏️ Actualizar pesos
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  );
                                })()
                            }
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                            
                            {ex.method === "dropset" && ex.dropDetails?.length > 0 && (
                              <div style={{ marginTop: 6 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4 }}>
                                  {ex.dropDetails.map((d, di) => (
                                    <div key={di} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <div style={{ background: "#fb923c22", color: "#fb923c", borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>📉 Drop {di + 1}</div>
                                      <span style={{ fontSize: 12 }}>
                                        <span style={{ color: "#fff", fontWeight: 700 }}>{d.reps} reps</span>
                                        {" · "}
                                        <span style={{ color: "#5BB8F5", fontWeight: 700 }}>{d.weight > 0 ? `${d.weight} kg` : "PC"}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {(ex.sets || 1) > 1 && (
                                  <div style={{ fontSize: 11, color: "#fb923c", marginTop: 4 }}>🔁 Se repite <span style={{ fontWeight: 700 }}>{ex.sets} veces</span></div>
                                )}
                              </div>
                            )}
                            {ex.method === "restpause" && (
                              <span style={{ background: "#e879f922", color: "#e879f9", fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>
                                ⏸️ {ex.repsMain ?? ex.reps ?? "??"} + {ex.repsPause ?? 2} reps
                              </span>
                            )}
                            
                            <button onClick={() => setProgressionEx(ex)}
                style={{ width: "100%", background: "#A8FFD811", border: "1px solid #A8FFD844", color: "#A8FFD8", padding: "10px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
                📈 Ver Progresión
              </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <>
            {myRoutine.length > 0 && (
              <>
                <div style={S.sectionTitle}>EVOLUCIÓN</div>
                <div style={{ ...S.card, cursor: "default" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {myRoutine.map((ex) => <button key={ex.id} onClick={() => setSelectedExercise(ex.exercise)} style={selectedExercise === ex.exercise ? S.btn : S.btnSecondary}>{ex.exercise}</button>)}
                  </div>
                  {selectedExercise && <MiniChart data={myProgress} exercise={selectedExercise} />}
                </div>
              </>
            )}
            <div style={S.sectionTitle}>REGISTRAR SESIÓN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select style={S.input} value={newProgress.exercise} onChange={(e) => setNewProgress((p) => ({ ...p, exercise: e.target.value }))}>
                <option value="">Seleccionar ejercicio</option>
                {myRoutine.map((ex) => <option key={ex.id} value={ex.exercise}>{ex.exercise}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><div style={S.sectionTitle}>PESO (KG)</div><input style={S.input} type="number" value={newProgress.weight} onChange={(e) => setNewProgress((p) => ({ ...p, weight: Number(e.target.value) }))} /></div>
                <div><div style={S.sectionTitle}>REPS</div><input style={S.input} type="number" value={newProgress.reps} onChange={(e) => setNewProgress((p) => ({ ...p, reps: Number(e.target.value) }))} /></div>
              </div>
              <button style={S.btn} onClick={addProgress}>💾 Guardar</button>
            </div>
            {myProgress.length > 0 && (
              <>
                <div style={S.sectionTitle}>HISTORIAL</div>
                {[...myProgress].reverse().slice(0, 8).map((p, i) => (
                  <div key={i} style={S.exRow}>
                    <div><div style={{ fontWeight: 600, fontSize: 14 }}>{p.exercise}</div><div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date}</div></div>
                    <div style={{ display: "flex", gap: 6 }}><span style={S.accentBadge}>{p.weight}kg</span><span style={S.badge}>{p.reps} reps</span></div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* NUTRITION TAB - STUDENT VIEW */}
        {activeTab === "nutrition" && (() => {
          const m = student.metrics || { weight: 70, height: 170 };
          const gender = student.gender || "hombre";
          const goal = student.goal;
          const age = student.age || 25;
          const bmr = gender === "mujer"
            ? 10 * (m.weight||70) + 6.25 * (m.height||170) - 5 * age - 161
            : 10 * (m.weight||70) + 6.25 * (m.height||170) - 5 * age + 5;
          const tdee = Math.round(bmr * 1.375);
          const calories = goal === "perdida" ? tdee - 400 : tdee + 300;
          const protein = Math.round((m.weight||70) * 2);
          const fat = Math.round((calories * 0.25) / 9);
          const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
          const water = (((m.weight||70) * 35) / 1000).toFixed(1);
          const waterTraining = (((m.weight||70) * 35 + 500) / 1000).toFixed(1);

          const nutPlans = {
            "hombre_perdida": [
              { D: "Desayuno", food: "4 claras + 1 huevo entero revueltos + arepa integral" }, { D: "Media mañana", food: "Manzana + puñado de almendras" }, { D: "Almuerzo", food: "Pechuga grillada 200g + arroz integral ½ taza + ensalada" }, { D: "Merienda", food: "Atún en agua + tostadas integrales" }, { D: "Cena", food: "Salmón 150g + verduras al vapor" },
              { D: "Desayuno", food: "Avena con proteína en polvo + frutos rojos" }, { D: "Media mañana", food: "Yogur griego sin azúcar + nueces" }, { D: "Almuerzo", food: "Carne molida magra 200g + papa cocida + ensalada" }, { D: "Merienda", food: "Huevo duro × 2 + pepino" }, { D: "Cena", food: "Pollo al horno 200g + brócoli + batata" },
              { D: "Desayuno", food: "Tostadas integrales + aguacate + huevo pochado" }, { D: "Media mañana", food: "Proteína en polvo + agua" }, { D: "Almuerzo", food: "Tilapia 200g + quinoa + vegetales" }, { D: "Merienda", food: "Queso cottage + zanahoria" }, { D: "Cena", food: "Carne de res magra 150g + espárragos + ensalada" },
            ],
            "mujer_perdida": [
              { D: "Desayuno", food: "2 claras + 1 huevo + fruta fresca" }, { D: "Media mañana", food: "Yogur griego + frutos rojos" }, { D: "Almuerzo", food: "Pechuga 150g + ensalada grande + limón" }, { D: "Merienda", food: "Puñado de almendras + manzana" }, { D: "Cena", food: "Pescado blanco 150g + verduras salteadas" },
              { D: "Desayuno", food: "Avena con leche descremada + canela" }, { D: "Media mañana", food: "Atún + tostada integral" }, { D: "Almuerzo", food: "Pollo grillado 150g + arroz integral ½ taza + ensalada" }, { D: "Merienda", food: "Huevo duro + pepino + zanahoria" }, { D: "Cena", food: "Salmón 120g + brócoli + ½ batata" },
              { D: "Desayuno", food: "Proteína en polvo + leche + banana" }, { D: "Media mañana", food: "Queso cottage + kiwi" }, { D: "Almuerzo", food: "Carne magra 150g + quinoa + vegetales" }, { D: "Merienda", food: "Nueces + pera" }, { D: "Cena", food: "Pollo al horno 150g + espárragos + ensalada" },
            ],
            "hombre_musculo": [
              { D: "Desayuno", food: "4 huevos revueltos + 2 tostadas integrales + jugo natural" }, { D: "Media mañana", food: "Batido proteico + banana + mantequilla de maní" }, { D: "Almuerzo", food: "Pechuga 250g + arroz 1 taza + ensalada + aguacate" }, { D: "Merienda", food: "Yogur griego + granola + frutos secos" }, { D: "Cena", food: "Carne magra 200g + papa + vegetales" },
              { D: "Desayuno", food: "Avena 100g + proteína en polvo + frutas + miel" }, { D: "Media mañana", food: "Pan integral + atún + queso" }, { D: "Almuerzo", food: "Salmón 200g + arroz integral + brócoli" }, { D: "Merienda", food: "Huevos duros ×3 + aguacate" }, { D: "Cena", food: "Pollo 250g + batata + ensalada" },
              { D: "Desayuno", food: "Tostadas + aguacate + 3 huevos + jugo" }, { D: "Media mañana", food: "Proteína + leche + banana" }, { D: "Almuerzo", food: "Res 250g + pasta integral + salsa de tomate" }, { D: "Merienda", food: "Queso + crackers integrales + nueces" }, { D: "Cena", food: "Pollo grillado 200g + arroz + vegetales" },
            ],
            "mujer_musculo": [
              { D: "Desayuno", food: "3 claras + 1 huevo + tostada integral + fruta" }, { D: "Media mañana", food: "Yogur griego + granola + miel" }, { D: "Almuerzo", food: "Pollo 180g + arroz integral ¾ taza + ensalada" }, { D: "Merienda", food: "Batido proteico + banana" }, { D: "Cena", food: "Salmón 150g + batata + brócoli" },
              { D: "Desayuno", food: "Avena + proteína en polvo + frutas" }, { D: "Media mañana", food: "Queso cottage + frutos rojos + nueces" }, { D: "Almuerzo", food: "Carne magra 180g + arroz + ensalada" }, { D: "Merienda", food: "Huevo duro ×2 + fruta" }, { D: "Cena", food: "Pollo al horno 180g + quinoa + vegetales" },
              { D: "Desayuno", food: "Tostadas integrales + aguacate + 2 huevos" }, { D: "Media mañana", food: "Proteína + leche descremada" }, { D: "Almuerzo", food: "Tilapia 180g + pasta integral + vegetales" }, { D: "Merienda", food: "Yogur griego + almendras" }, { D: "Cena", food: "Res magra 150g + papa cocida + ensalada" },
            ],
          };

          const planKey = `${gender === "mujer" ? "mujer" : "hombre"}_${goal === "perdida" ? "perdida" : "musculo"}`;
          const planRows = nutPlans[planKey] || nutPlans["hombre_perdida"];
          const dayMeals = planRows.slice(activeNutDay * 5, activeNutDay * 5 + 5);

          const foodAllergies = student.health?.foodAllergies;
          const avoidedFoods = student.health?.avoidedFoods;

          return (
            <>
              {(foodAllergies || avoidedFoods) && (
                <div style={{ background: "#D4A01722", border: "1px solid #D4A01766", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#D4A017" }}>
                  ⚠️ Recordá que este plan no incluye restricciones: {[foodAllergies, avoidedFoods].filter(Boolean).join(" · ")}
                </div>
              )}

              {/* Caloric Summary */}
              <div style={{ ...S.card, cursor: "default" }}>
                <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Resumen Calórico</div>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: "#B8D4F0", fontFamily: "'Barlow Condensed', sans-serif" }}>{calories.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "#6B91BB" }}>kcal/día</div>
                  <div style={{ fontSize: 11, color: goal === "perdida" ? "#FF8C6B" : "#A8FFD8", marginTop: 4 }}>
                    {goal === "perdida" ? "Déficit -400 kcal" : "Superávit +300 kcal"}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#A8FFD8" }}>{protein}g</div>
                    <div style={{ fontSize: 10, color: "#6B91BB" }}>Proteína</div>
                  </div>
                  <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#5BB8F5" }}>{carbs}g</div>
                    <div style={{ fontSize: 10, color: "#6B91BB" }}>Carbos</div>
                  </div>
                  <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#FF9E80" }}>{fat}g</div>
                    <div style={{ fontSize: 10, color: "#6B91BB" }}>Grasas</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#5BB8F5", textAlign: "center" }}>💧 {water}L mínimo · {waterTraining}L en días de entreno</div>
              </div>

              {/* Forbidden drinks - loss only */}
              {goal === "perdida" && (
                <div style={{ background: "#ff444411", border: "1px solid #ff444433", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#ff6666", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>❌ EVITAR</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Gaseosas", "Jugos de caja", "Agua de panela", "Bebidas azucaradas", "Avena en caja", "Yogures con azúcar", "Bebidas energéticas", "Alcohol"].map(item => (
                      <span key={item} style={{ background: "#ff444422", color: "#ff8888", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3-day meal plan */}
              <div style={{ ...S.card, cursor: "default" }}>
                <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10 }}>PLAN ALIMENTARIO</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {[0, 1, 2].map(d => (
                    <button key={d} onClick={() => setActiveNutDay(d)}
                      style={{ flex: 1, background: activeNutDay === d ? "#5BB8F5" : "#0A1225", color: activeNutDay === d ? "#070C18" : "#7AA0C8", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: activeNutDay === d ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      Día {d + 1}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dayMeals.map((meal, i) => (
                    <div key={i} style={{ background: "#0A1225", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#5BB8F5", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{meal.D.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: "#B8D4F0", lineHeight: 1.4 }}>{meal.food}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cheat meal - loss only */}
              {goal === "perdida" && (
                <div style={{ border: `1px solid ${nutCheatOpen ? "#D4A017" : "#D4A01744"}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
                  <button onClick={() => setNutCheatOpen(p => !p)}
                    style={{ width: "100%", background: nutCheatOpen ? "#D4A01711" : "#0B1428", border: "none", color: "#D4A017", padding: "12px 16px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    🍕 Comida trampa
                    <span>{nutCheatOpen ? "▲" : "▼"}</span>
                  </button>
                  {nutCheatOpen && (
                    <div style={{ padding: "14px 16px", background: "#0B1428", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 13, color: "#B8D4F0" }}>• 1 vez por semana máximo</div>
                      <div style={{ fontSize: 13, color: "#B8D4F0" }}>• Reemplaza UNA sola comida del día</div>
                      <div style={{ fontSize: 12, color: "#D4A017", fontWeight: 700, lineHeight: 1.5 }}>CONDICIÓN: ese día debés hacer entrenamiento de PIERNA completo, o mínimo 1 hora de cardio continuo</div>
                    </div>
                  )}
                </div>
              )}

              {/* Water section */}
              <div style={{ ...S.card, cursor: "default" }}>
                <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 8 }}>HIDRATACIÓN</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5" }}>{water}L</div>
                    <div style={{ fontSize: 10, color: "#6B91BB" }}>Mínimo diario</div>
                  </div>
                  <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#A8FFD8" }}>{waterTraining}L</div>
                    <div style={{ fontSize: 10, color: "#6B91BB" }}>Días de entreno</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#6B91BB", textAlign: "center", lineHeight: 1.6 }}>
                  Tomá un vaso al despertar · uno antes de cada comida · uno antes de dormir
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#456E9E", textAlign: "center", padding: "8px 0 4px", lineHeight: 1.5 }}>
                Este plan es una guía general orientativa. Consultá con un nutricionista certificado.
              </div>
            </>
          );
        })()}

        {/* BILLING TAB - STUDENT VIEW */}
        {activeTab === "billing" && (
          <>
            {!billing && !hasPayments ? (
              <div style={{ ...S.card, cursor: "default", textAlign: "center", color: "#6B91BB", padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                Tu entrenador aún no configuró tu plan.
              </div>
            ) : student.studentType === "asesorado" ? (
              /* ── VISTA ASESORADO ── */
              (() => {
                const plan = billing;
                const startDate = plan?.startDate ? new Date(plan.startDate) : myPayments[0]?.date ? new Date(myPayments[0].date) : new Date();
                const totalMonths = plan?.months || (myPayments[0]?.months) || 1;
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + totalMonths);
                const today = new Date();
                const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
                const daysLeft = Math.max(0, Math.round((endDate - today) / (1000 * 60 * 60 * 24)));
                const daysUsed = Math.max(0, totalDays - daysLeft);
                const pct = Math.min(100, Math.round((daysUsed / totalDays) * 100));
                const isExpired = today > endDate;
                const accentColor = isExpired ? "#ff5555" : daysLeft <= 7 ? "#fbbf24" : "#A8FFD8";
                return (
                  <>
                    {/* Countdown card */}
                    <div style={{ ...S.card, cursor: "default", border: `1px solid ${accentColor}44` }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>MI ASESORÍA</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 48, fontWeight: 900, color: accentColor, lineHeight: 1 }}>{daysLeft}</div>
                          <div style={{ fontSize: 13, color: "#8AAFD4", marginTop: 4 }}>días restantes</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#6B91BB" }}>Inicio</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0" }}>{startDate.toLocaleDateString("es", { day: "numeric", month: "short" })}</div>
                          <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 6 }}>Vence</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>{endDate.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 8, background: "#0A1225", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: accentColor, borderRadius: 4, transition: "width 0.6s" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#527BA8" }}>{daysUsed} de {totalDays} días transcurridos</div>
                    </div>

                    {/* Plan info */}
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>DETALLE DEL PLAN</div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#8AAFD4" }}>Duración</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#B8D4F0" }}>{totalMonths} mes{totalMonths > 1 ? "es" : ""}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#8AAFD4" }}>Valor pagado</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#A8FFD8" }}>${myPayments.reduce((a, p) => a + p.amount, 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment history */}
                    {myPayments.length > 0 && (
                      <>
                        <div style={S.sectionTitle}>HISTORIAL DE PAGOS</div>
                        {[...myPayments].reverse().map(p => (
                          <div key={p.id} style={S.exRow}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.note || "Pago"}</div>
                              <div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date}</div>
                            </div>
                            <span style={S.accentBadge}>${p.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                );
              })()
            ) : (
              /* ── VISTA ALUMNO CLASES ── */
              <>
                {/* Estado actual */}
                {billStatus && (
                  <div style={{ ...S.card, cursor: "default", border: `1px solid ${billStatus.color}44` }}>
                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>ESTADO DE CLASES</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: billStatus.color }}>{billStatus.label}</div>
                        <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 4 }}>{billStatus.totalDone} clases tomadas · {billStatus.totalPaid} pagas</div>
                      </div>
                      <div style={{ fontSize: 36 }}>
                        {billStatus.status === "al_dia" ? "✅" : billStatus.status === "por_vencer" ? "⚠️" : "🔴"}
                      </div>
                    </div>
                    <div style={{ height: 8, background: "#0A1225", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((billStatus.totalDone / Math.max(billStatus.totalPaid, 1)) * 100, 100)}%`, background: billStatus.color, borderRadius: 4, transition: "width 0.6s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#527BA8", marginTop: 6 }}>{billStatus.totalDone} / {billStatus.totalPaid} clases usadas</div>
                  </div>
                )}

                {/* Plan info */}
                {billing?.classesPerMonth && (
                  <div style={{ ...S.card, cursor: "default" }}>
                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>MI PLAN</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#8AAFD4" }}>Clases al mes</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#5BB8F5" }}>{billing.classesPerMonth}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#8AAFD4" }}>Valor mensual</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#B8D4F0" }}>${billing.amount?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clases tomadas */}
                {myClasses.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>MIS CLASES TOMADAS</div>
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ fontSize: 12, color: "#6B91BB", marginBottom: 10 }}>{myClasses.length} clase{myClasses.length !== 1 ? "s" : ""} registrada{myClasses.length !== 1 ? "s" : ""}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
                        {[...myClasses].reverse().map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #132540" }}>
                            <span style={{ fontSize: 12, color: "#5BB8F5", fontWeight: 700 }}>#{myClasses.length - i}</span>
                            <span style={{ fontSize: 12, color: "#8AAFD4" }}>📅 {c.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Historial de pagos */}
                {myPayments.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>HISTORIAL DE PAGOS</div>
                    {[...myPayments].reverse().map(p => (
                      <div key={p.id} style={S.exRow}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.note || "Pago"}</div>
                          <div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date} · {p.classesCount} clases</div>
                        </div>
                        <span style={S.accentBadge}>${p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* AI TAB */}
        {activeTab === "ai" && (
          <>
            <div style={{ ...S.card, cursor: "default", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Plan personalizado con IA</div>
              <div style={{ fontSize: 13, color: "#7AA0C8", marginBottom: 16 }}>Analizo tu BMI, composición corporal y objetivo para darte recomendaciones reales.</div>
              <button style={S.btn} onClick={fetchAIPlan} disabled={aiLoading}>{aiLoading ? "Generando plan..." : "Generar mi plan"}</button>
            </div>
            {(aiLoading || aiPlan) && (
              <div style={S.aiBox}>
                <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10 }}>TU PLAN PERSONALIZADO</div>
                {aiLoading ? <div style={{ color: "#6B91BB", fontSize: 14 }}>⏳ Analizando tus datos...</div>
                  : <div style={{ fontSize: 13, lineHeight: 1.8, color: "#ddd", whiteSpace: "pre-wrap" }}>{aiPlan}</div>}
              </div>
            )}
          </>
        )}
      </div>
      {!isPreview && (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 32px" }}>
          <button style={{ ...S.btnDanger, fontSize: 13, padding: "10px 40px" }} onClick={onLogout}>Salir</button>
        </div>
      )}
    </div>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function LibraryView({ myLibrary, setMyLibrary }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState("");
  const emptyForm = { name: "", muscle: "", method: null, tempo: null, drops: null, methodGroup: null, notes: "", imageUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };

  const save = () => {
    if (!form.name) return;
    if (editItem) {
      setMyLibrary(prev => prev.map(e => e.id === editItem.id ? { ...form, id: editItem.id } : e));
    } else {
      setMyLibrary(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditItem(null);
  };

  const remove = (id) => setMyLibrary(prev => prev.filter(e => e.id !== id));

  const filtered = myLibrary.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    (e.muscle || "").toLowerCase().includes(filter.toLowerCase())
  );

  const muscles = ["Piernas", "Glúteos", "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", "Otro"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Mi Biblioteca</div>
          <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 2 }}>{myLibrary.length} ejercicio{myLibrary.length !== 1 ? "s" : ""} guardado{myLibrary.length !== 1 ? "s" : ""}</div>
        </div>
        <button style={S.btn} onClick={openAdd}>+ Nuevo</button>
      </div>

      <input style={{ ...S.input, marginBottom: 14 }} placeholder="🔍 Buscar ejercicio o músculo..." value={filter} onChange={e => setFilter(e.target.value)} />

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#527BA8", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
          <div>Tu biblioteca está vacía.</div>
          <div style={{ fontSize: 12, marginTop: 6, color: "#456E9E" }}>Agregá ejercicios con foto, músculo y método.</div>
        </div>
      )}

      {filtered.map(item => {
        const method = item.method ? METHODS[item.method] : null;
        return (
          <div key={item.id} style={{ ...S.card, cursor: "default" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
              {/* Info - izquierda */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{item.name}</div>
                {item.muscle && <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 2 }}>💪 {item.muscle}</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {method && (
                    <span style={{ background: `${method.color}22`, color: method.color, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      {method.emoji} {method.label}
                    </span>
                  )}
                  
                  {item.method === "dropset" && item.drops && (
                    <span style={{ background: "#fb923c22", color: "#fb923c", fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>📉 {item.drops} drops</span>
                  )}
                </div>
                {item.notes && <div style={{ fontSize: 11, color: "#527BA8", marginTop: 6, fontStyle: "italic" }}>"{item.notes}"</div>}
              </div>
              {/* Photo - derecha grande */}
              <div style={{ width: 200, minHeight: 160, borderRadius: 10, background: "#0A1225", overflow: "hidden", flexShrink: 0, alignSelf: "stretch" }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🏋️</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => openEdit(item)} style={{ background: "#0A1225", border: "none", color: "#B8D4F0", cursor: "pointer", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>✏️</button>
                <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", color: "#456E9E", cursor: "pointer", fontSize: 16, padding: "5px 4px" }}>✕</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#0B1428", border: "1px solid #2a2a2a", borderRadius: "16px 16px 0 0", padding: 22, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#5BB8F5" }}>{editItem ? "Editar ejercicio" : "Nuevo ejercicio"}</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 22 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Name */}
              <div>
                <div style={S.sectionTitle}>NOMBRE</div>
                <input style={S.input} placeholder="ej: Sentadilla búlgara" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              {/* Muscle */}
              <div>
                <div style={S.sectionTitle}>GRUPO MUSCULAR</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {muscles.map(m => (
                    <button key={m} onClick={() => setForm(p => ({ ...p, muscle: p.muscle === m ? "" : m }))}
                      style={{ background: form.muscle === m ? "#5BB8F5" : "#0B1428", color: form.muscle === m ? "#000" : "#7AA0C8", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <div style={S.sectionTitle}>FOTO (URL)</div>
                <input style={S.input} placeholder="https://..." value={form.imageUrl || ""} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
                    onError={e => e.target.style.display = "none"} />
                )}
              </div>

              {/* Method */}
              <div>
                <div style={S.sectionTitle}>MÉTODO</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setForm(p => ({ ...p, method: null, tempo: null, drops: null }))}
                    style={{ background: !form.method ? "#5BB8F5" : "#0B1428", color: !form.method ? "#000" : "#7AA0C8", border: "1px solid #2a2a2a", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    Ninguno
                  </button>
                  {Object.entries(METHODS).map(([key, m]) => (
                    <button key={key} onClick={() => setForm(p => ({ ...p, method: key, tempo: null, drops: null }))}
                      style={{ background: form.method === key ? `${m.color}33` : "#0B1428", border: `1px solid ${form.method === key ? m.color : "#0F1C35"}`, color: form.method === key ? m.color : "#7AA0C8", padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>

                
                {form.method === "dropset" && (
                  <div style={{ marginTop: 10 }}>
                    <div style={S.sectionTitle}>CANTIDAD DE DROPS</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[2, 3, 4].map(n => (
                        <button key={n} onClick={() => setForm(p => ({ ...p, drops: n }))}
                          style={{ background: form.drops === n ? "#5BB8F5" : "#0B1428", color: form.drops === n ? "#000" : "#B8D4F0", border: "1px solid #2a2a2a", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <div style={S.sectionTitle}>NOTA / INDICACIÓN</div>
                <input style={S.input} placeholder="ej: Rodillas alineadas con pies..." value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              <button style={{ ...S.btn, width: "100%", marginTop: 4 }} onClick={save}>
                {editItem ? "Guardar cambios" : "Agregar a mi biblioteca"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COACH PORTAL ─────────────────────────────────────────────────────────────
function CoachPortal({ user, students, setStudents, routines, setRoutines, progressData, setProgressData, payments, setPayments, classes, setClasses, myLibrary, setMyLibrary, weightLog, setWeightLog, setPreviewStudent, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("body");
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [aiPlan, setAiPlan] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [newExercise, setNewExercise] = useState({ exercise: "", sets: 3, reps: 10, weight: 0 });
  const [newProgress, setNewProgress] = useState({ exercise: "", weight: 0, reps: 0 });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: "", lastName: "", age: "", gender: "", height: "", waist: "", fatPct: "", musclePct: "", waterPct: "", username: "", password: "", phone: "", instagram: "" });
  const [addStudentStep, setAddStudentStep] = useState(0); // 0=tipo, 1=datos, 2=plan...
  const [newStudentType, setNewStudentType] = useState(null); // "alumno" | "asesorado"
  const [newStudentGoal, setNewStudentGoal] = useState(null);
  const [newStudentDays, setNewStudentDays] = useState(null);
  const [newStudentDayNames, setNewStudentDayNames] = useState([]);
  const [newStudentHealth, setNewStudentHealth] = useState({ pathologies: "", restrictedExercises: "", foodAllergies: "", avoidedFoods: "" });
  const [newStudentBilling, setNewStudentBilling] = useState({ classes: "", amount: "", months: "" });
  const [selectedExercise, setSelectedExercise] = useState("");
  const [newPayment, setNewPayment] = useState({ amount: "", classesCount: "", note: "" });
  const [billingEdit, setBillingEdit] = useState(false);
  const [billingForm, setBillingForm] = useState({ mode: "paquete", packageSize: 8, pricePerPackage: "", pricePerClass: "" });

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState("");
  const [editingEx, setEditingEx] = useState(null);
  const [coachEditSeriesExId, setCoachEditSeriesExId] = useState(null);
  const [coachEditSeriesData, setCoachEditSeriesData] = useState([]);
  const [newEx, setNewEx] = useState({ exercise: "", sets: 3, reps: 10, weight: 0, type: "fuerza", duration: 20, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, seriesData: [] });
  const [editingSeriesExId, setEditingSeriesExId] = useState(null); // which exercise the student is editing series for
  const [customName, setCustomName] = useState("");
  const [pairedEx, setPairedEx] = useState({ exercise: "", reps: 10, weight: 0, imageUrl: null, seriesData: [] });
  const [thirdEx, setThirdEx] = useState({ exercise: "", reps: 10, weight: 0, imageUrl: null, seriesData: [] });
  const [showThirdLibrary, setShowThirdLibrary] = useState(false);
  const [thirdLibraryFilter, setThirdLibraryFilter] = useState("");
  const [showPairedLibrary, setShowPairedLibrary] = useState(false);
  const [pairedLibraryFilter, setPairedLibraryFilter] = useState("");
  const [dropDetails, setDropDetails] = useState([{ weight: 0, reps: 10 }, { weight: 0, reps: 10 }]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingDays, setEditingDays] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [generatingRoutine, setGeneratingRoutine] = useState(false);
  const [savingNewStudent, setSavingNewStudent] = useState(false);
  const [previewRoutine, setPreviewRoutine] = useState(null); // null | { days: [{dayName, exercises:[]}] }
  const [showRoutinePreview, setShowRoutinePreview] = useState(false);
  const [daysForm, setDaysForm] = useState({ count: 3, names: [] });
  const [activeNutDay, setActiveNutDay] = useState(0);
  const [nutCheatOpen, setNutCheatOpen] = useState(false);

  const selectStudent = (st) => { setSelectedStudent(st); setView("student"); setActiveTab("body"); setAiPlan(""); setEditingMetrics(false); setBillingEdit(false); setShowLibrary(false); setConfirmDelete(false); setActiveNutDay(0); setNutCheatOpen(false); };

  const addExercise = () => {
    if (!newExercise.exercise) return;
    setRoutines((prev) => ({ ...prev, [selectedStudent.id]: [...(prev[selectedStudent.id] || []), { id: Date.now(), ...newExercise }] }));
    setNewExercise({ exercise: "", sets: 3, reps: 10, weight: 0 });
  };

  const removeExercise = (exId) => setRoutines((prev) => ({ ...prev, [selectedStudent.id]: prev[selectedStudent.id].filter((e) => e.id !== exId) }));

  const addProgress = () => {
    if (!newProgress.exercise || !newProgress.weight) return;
    setProgressData((prev) => ({ ...prev, [selectedStudent.id]: [...(prev[selectedStudent.id] || []), { date: new Date().toISOString().slice(0, 10), ...newProgress }] }));
    setSelectedExercise(newProgress.exercise);
    setNewProgress({ exercise: "", weight: 0, reps: 0 });
  };

  const generateRoutine = async () => {
    if (!selectedStudent) return;
    setGeneratingRoutine(true);
    setShowRoutinePreview(false);
    const st = selectedStudent;
    const days = (st.dayNames?.length > 0 && st.trainingDays)
      ? st.dayNames.slice(0, st.trainingDays)
      : st.trainingDays
        ? Array.from({ length: st.trainingDays }, (_, i) => `Día ${i + 1}`)
        : ["General"];
    const gender = st.gender || (st.metrics?.musclePct > 40 ? "hombre" : st.metrics?.musclePct > 0 ? "mujer" : "persona");
    const goal = st.goal === "perdida" ? "pérdida de grasa" : "ganancia muscular";
    const restricted = st.health?.restrictedExercises || "ninguno";

    const exerciseList = EXERCISE_LIBRARY.map(e => `${e.name} (${e.muscle})`).join(", ");

    const daysCount = days.length;
    const exPerDay = daysCount <= 2 ? 7 : daysCount <= 3 ? 6 : daysCount <= 5 ? 5 : 4;

    const dayStructureRules = daysCount === 1
      ? "1 día: Full Body (todos los grupos musculares)"
      : daysCount === 2
        ? "2 días: Día 1 = Tren superior · Día 2 = Pierna"
        : daysCount === 3
          ? "3 días: Push / Pull / Pierna"
          : daysCount === 4
            ? "4 días: Pecho y tríceps / Espalda y bíceps / Piernas y glúteos / Hombros y core"
            : daysCount === 5
              ? "5 días: Pecho / Espalda / Piernas y glúteos / Hombros / Brazos y core"
              : daysCount === 6
                ? "6 días: Push / Pull / Pierna × 2 (ejercicios diferentes en cada repetición)"
                : "7 días: Push / Pull / Pierna × 2 + Core y cardio (igual que 6 días + día extra de Core y cardio)";

    const allowedDayNames = ["Pecho", "Espalda", "Bíceps y tríceps", "Glúteo", "Pierna", "Cuádriceps", "Pecho y tríceps", "Espalda y bíceps", "Pecho y espalda", "Bíceps tríceps y hombro", "Hombro", "Core", "Cardio", "Push", "Pull", "Full body", "Tren superior", "Piernas y glúteos", "Brazos y core"];

    const prompt = `Eres un experto entrenador personal. Genera una rutina de entrenamiento semanal completa.

PERFIL DEL ALUMNO:
- Género: ${gender}
- Objetivo: ${goal}
- Días de entrenamiento: ${daysCount} días/semana
- Edad: ${st.age || "no especificada"}
- Ejercicios restringidos: ${restricted}

ESTRUCTURA DE DÍAS OBLIGATORIA (${daysCount} días):
${dayStructureRules}

NOMBRES DE DÍA PERMITIDOS (usar solo estos):
${allowedDayNames.join(", ")}

EJERCICIOS POR DÍA: ${exPerDay} ejercicios de fuerza + 1 cardio al final SIEMPRE
CARDIO FINAL OBLIGATORIO: el último ejercicio de CADA día debe ser: type="cardio", method=null, sets=1, reps=20, weight=0

REGLAS SEGÚN OBJETIVO:
Para PÉRDIDA DE GRASA:
- Reps: 12-15-20 en series
- Métodos permitidos SOLO: biserie y dropset
- En biséries, el segundo ejercicio DEBE ser: "Jumping jacks", "Mountain climbers" o "Skipping en step"
- Solo 2-3 ejercicios con método por día, el resto sin método

Para GANANCIA MUSCULAR:
- Reps: 8-10-12 en series
- Métodos permitidos: fuerzabase, biserie, dropset, restpause
- Solo 2-3 ejercicios con método por día, el resto sin método

REGLAS POR GÉNERO:
- MUJERES: un día dedicado SOLO a Cuádriceps, otro día dedicado SOLO a Glúteo y femoral. Énfasis glúteo/pierna siempre.
- HOMBRES: énfasis en pecho, espalda, hombros. Más volumen en tren superior.

EJERCICIOS DISPONIBLES: ${exerciseList}

RESTRICCIONES DE SALUD A RESPETAR: ${restricted}

Responde SOLO en JSON válido, sin texto adicional, con esta estructura exacta:
{
  "days": [
    {
      "dayName": "nombre del día (debe ser uno de los nombres permitidos)",
      "exercises": [
        {
          "exercise": "nombre exacto del ejercicio",
          "sets": 4,
          "reps": 12,
          "weight": 0,
          "type": "fuerza",
          "method": null,
          "methodNote": null,
          "pairedWith": null
        }
      ]
    }
  ]
}

Para biséries/triséries: method="biserie" en ambos ejercicios, pairedWith indica el índice del compañero (0-based).
Para dropset: method="dropset", drops=3.
Para rest&pause: method="restpause".
Para fuerza base: method="fuerzabase".
El cardio final de cada día: type="cardio", method=null, sets=1, reps=20, weight=0.`;

    try {
      const data = await fetch(`${API}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_tokens: 4000 }),
      }).then(r => r.json());
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setPreviewRoutine(parsed);
      setShowRoutinePreview(true);
    } catch (err) {
      console.error("Error generando rutina:", err);
      alert("Error al generar la rutina. Intentá de nuevo.");
    } finally {
      setGeneratingRoutine(false);
    }
  };

  const approveRoutine = () => {
    if (!previewRoutine || !selectedStudent) return;
    const days = (selectedStudent.dayNames?.length > 0 && selectedStudent.trainingDays)
      ? selectedStudent.dayNames.slice(0, selectedStudent.trainingDays)
      : selectedStudent.trainingDays
        ? Array.from({ length: selectedStudent.trainingDays }, (_, i) => `Día ${i + 1}`)
        : ["General"];

    const newExercises = [];
    previewRoutine.days.forEach((day, dayIdx) => {
      const groupMap = {};
      day.exercises.forEach((ex, exIdx) => {
        if ((ex.method === "biserie" || ex.method === "triserie") && ex.pairedWith !== null) {
          const pairKey = [dayIdx, Math.min(exIdx, ex.pairedWith), Math.max(exIdx, ex.pairedWith)].join("-");
          if (!groupMap[pairKey]) groupMap[pairKey] = `group-${Date.now()}-${pairKey}`;
        }
      });

      day.exercises.forEach((ex, exIdx) => {
        const libEx = EXERCISE_LIBRARY.find(l => l.name === ex.exercise) || {};
        let methodGroup = null;
        if ((ex.method === "biserie" || ex.method === "triserie") && ex.pairedWith !== null) {
          const pairKey = [dayIdx, Math.min(exIdx, ex.pairedWith), Math.max(exIdx, ex.pairedWith)].join("-");
          methodGroup = groupMap[pairKey];
        }
        newExercises.push({
          id: Date.now() + dayIdx * 1000 + exIdx,
          exercise: ex.exercise,
          sets: ex.sets || 3,
          reps: ex.reps || 12,
          weight: ex.weight || 0,
          type: ex.type || "fuerza",
          method: ex.method || null,
          methodGroup,
          drops: ex.drops || null,
          tempo: null,
          dayIndex: dayIdx,
          imageUrl: libEx.imageUrl || null,
          seriesData: [],
        });
      });
    });

    setRoutines(prev => ({ ...prev, [selectedStudent.id]: newExercises }));
    setShowRoutinePreview(false);
    setPreviewRoutine(null);
    setSelectedDay(0);
  };

  const addStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName) return;
    setSavingNewStudent(true);
    const id = Date.now();
    const avatar = `${newStudent.firstName[0]}${newStudent.lastName[0]}`.toUpperCase();
    const today = new Date().toISOString().slice(0, 10);
    const hasMetrics = newStudent.height;
    const weight = Number(newStudent.weight) || null;
    const height = Number(newStudent.height) || null;
    const bmi = weight && height ? parseFloat((weight / ((height / 100) ** 2)).toFixed(1)) : null;
    const initialMetrics = hasMetrics ? {
      weight: weight || 0, height, waist: Number(newStudent.waist) || null,
      bmi: bmi || 0, fatPct: Number(newStudent.fatPct) || 0,
      musclePct: Number(newStudent.musclePct) || 0, waterPct: Number(newStudent.waterPct) || 0,
    } : null;
    const today2 = new Date().toISOString().slice(0, 10);
    const effectiveMonths = Number(newStudentBilling.months) || 1;
    const billingPlan = (newStudentBilling.amount)
      ? newStudentType === "asesorado"
        ? { type: "asesorado", months: effectiveMonths, amount: Number(newStudentBilling.amount), startDate: today2 }
        : { type: "alumno", classesPerMonth: Number(newStudentBilling.classes) || 0, amount: Number(newStudentBilling.amount) }
      : null;

    const gender = newStudent.gender || "persona";
    const goal = newStudentGoal === "perdida" ? "pérdida de grasa" : "ganancia muscular";
    const numDays = newStudentDays || 3;
    const days = newStudentDayNames.filter(Boolean).length > 0
      ? newStudentDayNames.filter(Boolean).slice(0, numDays)
      : Array.from({ length: numDays }, (_, i) => `Día ${i + 1}`);
    const restricted = newStudentHealth.restrictedExercises || "ninguno";
    const exerciseList = EXERCISE_LIBRARY.map(e => `${e.name} (${e.muscle})`).join(", ");

    // ── Generar rutina con IA ──
    let generatedExercises = [];
    try {
      const isLoss = newStudentGoal === "perdida";

      // Ejercicios agrupados por músculo (compacto)
      const grouped = {};
      EXERCISE_LIBRARY.filter(e => e.type !== "cardio").forEach(e => {
        const m = e.muscle.split("/")[0].trim();
        if (!grouped[m]) grouped[m] = [];
        grouped[m].push(e.name);
      });
      const exList = Object.entries(grouped).map(([m,ns]) => m + ": " + ns.join(", ")).join("\n");
      const cardioList = ["Jumping jacks", "Mountain climbers", "Skipping en step", "Caminadora", "Bicicleta", "Elíptica"];

      const dayCount = newStudentDays || 3;
      const dayLabels = newStudentDayNames.filter(Boolean).length >= dayCount
        ? newStudentDayNames.slice(0, dayCount)
        : days;

      const systemPrompt = "Eres un entrenador personal experto. Respondes SOLO con JSON válido, sin texto adicional, sin bloques de código markdown.";

      const genderRule = gender === "mujer" ? "- Incluir ejercicio de glúteo/femoral en cada día" : "- Énfasis en pecho, espalda y hombros";
      const rulesBlock = isLoss
        ? "REGLAS PÉRDIDA DE GRASA:\n- 5-6 ejercicios por día\n- Reps: 12, 15 o 20\n- Métodos: biserie, dropset (NO fuerzabase, NO restpause)\n- En biserie: segundo ejercicio DEBE ser Jumping jacks, Mountain climbers o Skipping en step\n- Máximo 2 biséries por día\n" + genderRule
        : "REGLAS GANANCIA MUSCULAR:\n- 5-6 ejercicios por día\n- Reps: 8, 10 o 12\n- Métodos: fuerzabase, biserie, dropset, restpause\n- Máximo 3 métodos por día\n" + genderRule;

      const userPrompt = "Genera una rutina semanal. Responde SOLO con JSON, sin texto extra.\n"
        + 'Estructura: {"days":[{"dayName":"string","exercises":[{"exercise":"string","sets":3,"reps":12,"weight":0,"method":null,"pairedWith":null}]}]}\n\n'
        + "ALUMNO:\n"
        + "- Nombre: " + newStudent.firstName + "\n"
        + "- Género: " + gender + "\n"
        + "- Objetivo: " + (isLoss ? "PÉRDIDA DE GRASA" : "GANANCIA MUSCULAR") + "\n"
        + "- Días: " + dayCount + " (" + dayLabels.join(", ") + ")\n"
        + "- Restricciones: " + (newStudentHealth.restrictedExercises || "ninguna") + "\n\n"
        + rulesBlock + "\n\n"
        + "EJERCICIOS DISPONIBLES:\n" + exList + "\n\n"
        + "REGLAS JSON:\n"
        + "- method: 'biserie', 'dropset', 'restpause', 'fuerzabase', 'triserie' o null\n"
        + "- pairedWith: índice (0-based) del ejercicio compañero, o null\n"
        + "- En biserie: AMBOS ejercicios llevan method='biserie' y pairedWith apuntando al otro\n"
        + "- Usa nombres EXACTOS de la lista";

      const resp = await fetch(`${API}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, system: systemPrompt, max_tokens: 4000 }),
      });

      if (!resp.ok) throw new Error("API " + resp.status);
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || data.error);

      const raw = (data.content || []).map(c => c.text || "").join("").trim();
      // Extraer JSON aunque venga con texto alrededor
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Respuesta sin JSON: " + raw.substring(0, 200));
      const parsed = JSON.parse(raw.substring(start, end + 1));
      if (!Array.isArray(parsed.days)) throw new Error("JSON sin campo 'days'");

      parsed.days.forEach((day, dayIdx) => {
        const groupMap = {};
        (day.exercises || []).forEach((ex, i) => {
          if ((ex.method === "biserie" || ex.method === "triserie") && ex.pairedWith != null) {
            const key = dayIdx + "-" + Math.min(i, ex.pairedWith) + "-" + Math.max(i, ex.pairedWith);
            if (!groupMap[key]) groupMap[key] = "grp-" + id + "-" + key;
          }
        });
        (day.exercises || []).forEach((ex, i) => {
          const libEx = EXERCISE_LIBRARY.find(l => l.name === ex.exercise) || {};
          let mGroup = null;
          if ((ex.method === "biserie" || ex.method === "triserie") && ex.pairedWith != null) {
            const key = dayIdx + "-" + Math.min(i, ex.pairedWith) + "-" + Math.max(i, ex.pairedWith);
            mGroup = groupMap[key];
          }
          generatedExercises.push({
            id: id + dayIdx * 100 + i + 1,
            exercise: ex.exercise,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 12,
            weight: Number(ex.weight) || 0,
            type: "fuerza",
            method: ex.method || null,
            methodGroup: mGroup,
            drops: ex.drops || null,
            tempo: null,
            dayIndex: dayIdx,
            imageUrl: libEx.imageUrl || null,
            seriesData: [],
          });
        });
      });
    } catch (err) {
      console.error("Error IA rutina:", err);
      alert("No se pudo generar la rutina: " + err.message + "\n\nEl alumno fue guardado. Podés generarla desde la pestaña Rutina.");
    }

    // ── Guardar alumno con rutina generada ──
    setStudents((prev) => [...prev, { id, ...newStudent, avatar, goal: newStudentGoal, metrics: initialMetrics, billing: billingPlan, trainingDays: newStudentDays, dayNames: newStudentDayNames.length > 0 ? newStudentDayNames : null, health: newStudentHealth, studentType: newStudentType }]);
    setRoutines((prev) => ({ ...prev, [id]: generatedExercises }));
    setProgressData((prev) => ({ ...prev, [id]: [] }));
    const initialPayment = (newStudentBilling.amount)
      ? newStudentType === "asesorado"
        ? [{ id: Date.now(), date: today2, amount: Number(newStudentBilling.amount), classesCount: 0, months: effectiveMonths, note: `Asesoría ${effectiveMonths} mes${effectiveMonths > 1 ? "es" : ""}` }]
        : [{ id: Date.now(), date: today2, amount: Number(newStudentBilling.amount), classesCount: Number(newStudentBilling.classes) || 0, note: "Inscripción" }]
      : [];
    setPayments((prev) => ({ ...prev, [id]: initialPayment }));
    setClasses((prev) => ({ ...prev, [id]: [] }));
    setWeightLog((prev) => ({ ...prev, [id]: weight ? [{ date: today, weight }] : [] }));
    setNewStudent({ firstName: "", lastName: "", age: "", gender: "", height: "", waist: "", fatPct: "", musclePct: "", waterPct: "", username: "", password: "", phone: "", instagram: "" });
    setNewStudentGoal(null); setNewStudentDays(null); setNewStudentDayNames([]); setNewStudentHealth({ pathologies: "", restrictedExercises: "", foodAllergies: "", avoidedFoods: "" }); setNewStudentBilling({ classes: "", amount: "", months: "" }); setNewStudentType(null); setAddStudentStep(0);
    setSavingNewStudent(false);
    setShowAddStudent(false);
  };

  const addPayment = () => {
    if (!newPayment.amount || !newPayment.classesCount) return;
    const entry = { id: Date.now(), date: new Date().toISOString().slice(0, 10), amount: Number(newPayment.amount), classesCount: Number(newPayment.classesCount), note: newPayment.note };
    setPayments((prev) => ({ ...prev, [selectedStudent.id]: [...(prev[selectedStudent.id] || []), entry] }));
    setNewPayment({ amount: "", classesCount: "", note: "" });
  };

  const addClassSession = () => {
    const entry = { id: Date.now(), date: new Date().toISOString().slice(0, 10) };
    setClasses((prev) => ({ ...prev, [selectedStudent.id]: [...(prev[selectedStudent.id] || []), entry] }));
  };

  const removeClassSession = (cId) => {
    setClasses((prev) => ({ ...prev, [selectedStudent.id]: prev[selectedStudent.id].filter((c) => c.id !== cId) }));
  };

  const saveBilling = () => {
    const billing = {
      mode: billingForm.mode,
      packageSize: billingForm.mode === "paquete" ? Number(billingForm.packageSize) : null,
      pricePerPackage: billingForm.mode === "paquete" ? Number(billingForm.pricePerPackage) : null,
      pricePerClass: billingForm.mode === "individual" ? Number(billingForm.pricePerClass) : null,
    };
    setStudents((prev) => prev.map((s) => s.id === selectedStudent.id ? { ...s, billing } : s));
    setSelectedStudent((prev) => ({ ...prev, billing }));
    setBillingEdit(false);
  };

  const fetchAIPlan = async () => {
    if (!selectedStudent?.metrics) return;
    setAiLoading(true); setAiPlan("");
    const m = selectedStudent.metrics;
    const cat = bmiCategory(m.bmi);
    const studentRoutine = routines[selectedStudent.id] || [];
    const prompt = `Eres un experto en entrenamiento y nutrición. Como entrenador, analiza estos datos y dame un plan de acción detallado (máximo 6 puntos) para este alumno.

Alumno: ${fullName(selectedStudent)}, ${selectedStudent.age} años
Objetivo: ${GOAL_LABELS[selectedStudent.goal] || "No definido"}
Peso: ${m.weight}kg | Altura: ${m.height}cm | BMI: ${m.bmi} (${cat.label})
% Grasa: ${m.fatPct}% | % Músculo: ${m.musclePct}% | % Agua: ${m.waterPct}%
Rutina actual: ${studentRoutine.map(e => `${e.exercise} ${e.sets}x${e.reps}`).join(", ") || "sin rutina"}

Incluye recomendaciones de: ajuste de entrenamiento, nutrición (calorías y proteínas aproximadas), y métricas objetivo. Responde en español con lista numerada, sé específico.`;
    setAiPlan(await callAI(prompt));
    setAiLoading(false);
  };

  const studentRoutine = selectedStudent ? (routines[selectedStudent.id] || []) : [];
  const studentProgress = selectedStudent ? (progressData[selectedStudent.id] || []) : [];

  // Coach saving metrics for a student
  const saveMetricsForStudent = ({ goal, metrics, trainingDays, dayNames }) => {
    setStudents((prev) => prev.map((s) => s.id === selectedStudent.id ? { ...s, goal, metrics, trainingDays, dayNames } : s));
    setSelectedStudent((prev) => ({ ...prev, goal, metrics, trainingDays, dayNames }));
    setEditingMetrics(false);
  };

  if (editingMetrics && selectedStudent) {
    return <MetricsForm student={selectedStudent} isOnboarding={false} onSave={saveMetricsForStudent} onCancel={() => setEditingMetrics(false)} />;
  }

  return (
    <div style={S.app}>
      <style>{GLOBAL_STYLE}</style>
      <div style={S.header}>
        {view === "student" || view === "library"
          ? <button style={{ ...S.btnSecondary, padding: "8px 14px", fontSize: 12 }} onClick={() => setView("dashboard")}>← Volver</button>
          : <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}><div style={S.logo}>
  <span style={{ fontSize: 28, color: "#D4A017" }}>CR </span>
  <span style={{ fontSize: 32, color: "#D4A017" }}>BODY</span>
  <span style={{ fontSize: 18, color: "#D4A017", letterSpacing: 3 }}>LAB</span>
</div><div style={S.logoSub}>PANEL COACH</div></div>}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {view === "student" && selectedStudent && (
            <>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{selectedStudent?.firstName}</span>
              <button onClick={() => setPreviewStudent({ ...selectedStudent, role: "student" })}
                style={{ background: "#5BB8F522", border: "1px solid #5BB8F544", color: "#5BB8F5", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                👁️ Ver como alumno
              </button>
            </>
          )}
          {view === "library" && <span style={{ fontWeight: 700, fontSize: 13, color: "#5BB8F5" }}>📚 Mi Biblioteca</span>}
        </div>
      </div>


      <div style={S.content}>
        {/* ── LIBRARY VIEW ── */}
        {view === "library" && (
          <LibraryView myLibrary={myLibrary} setMyLibrary={setMyLibrary} />
        )}

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <>
            <div style={{ ...S.card, cursor: "default", marginBottom: 16, background: "#0B1428", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "#527BA8" }}>Bienvenido,</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5" }}>Chris R. 💪</div>
              </div>
            </div>
            <div style={{ ...S.statCard, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#5BB8F5" }}>{students.length}</div>
              <div style={{ fontSize: 12, color: "#7AA0C8", letterSpacing: 2, textTransform: "uppercase" }}>Alumnos registrados</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={S.sectionTitle}>MIS ALUMNOS</div>
              <button style={S.btn} onClick={() => setShowAddStudent(true)}>+ Alumno</button>
            </div>

            {showAddStudent && (
              <div style={{ ...S.card, cursor: "default", marginBottom: 16 }}>

                {/* Step indicator — only show from step 1+ */}
                {addStudentStep > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                    {[{ n: 1, l: "Datos" }, { n: 2, l: "Objetivo" }, { n: 3, l: "Días" }, { n: 4, l: "Salud" }, { n: 5, l: "Pago" }].map((s, i) => (
                      <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: addStudentStep >= s.n ? "#5BB8F5" : "#0A1225", color: addStudentStep >= s.n ? "#070C18" : "#527BA8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{s.n}</div>
                        <div style={{ fontSize: 9, color: addStudentStep === s.n ? "#5BB8F5" : "#527BA8", fontWeight: addStudentStep === s.n ? 700 : 400, whiteSpace: "nowrap" }}>{s.l}</div>
                        {i < 4 && <div style={{ flex: 1, height: 1, background: "#0F1C35", minWidth: 4 }} />}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── PASO 0: Tipo de persona ── */}
                {addStudentStep === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#B8D4F0", marginBottom: 4 }}>¿Qué tipo de servicio va a tomar?</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        {
                          key: "alumno",
                          emoji: "🏋️",
                          title: "Alumno",
                          desc: "Asiste a clases físicas presenciales. Paga por clase o paquete de clases.",
                          color: "#5BB8F5",
                        },
                        {
                          key: "asesorado",
                          emoji: "📋",
                          title: "Asesorado",
                          desc: "Recibe asesoría personalizada. Paga por tiempo (mensual, quincenal, etc.).",
                          color: "#A8FFD8",
                        },
                      ].map(opt => (
                        <div key={opt.key}
                          onClick={() => setNewStudentType(opt.key)}
                          style={{ background: newStudentType === opt.key ? `${opt.color}18` : "#070C18", border: `2px solid ${newStudentType === opt.key ? opt.color : "#0F1C35"}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 32 }}>{opt.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 900, fontSize: 17, color: newStudentType === opt.key ? opt.color : "#B8D4F0", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>{opt.title.toUpperCase()}</div>
                              <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 3, lineHeight: 1.4 }}>{opt.desc}</div>
                            </div>
                            {newStudentType === opt.key && <div style={{ color: opt.color, fontSize: 20, fontWeight: 900 }}>✓</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button style={S.btnSecondary} onClick={() => { setShowAddStudent(false); setAddStudentStep(0); setNewStudentType(null); }}>Cancelar</button>
                      <button style={{ ...S.btn, flex: 1, opacity: newStudentType ? 1 : 0.4 }}
                        onClick={() => newStudentType && setAddStudentStep(1)}>
                        Continuar →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── PASO 1: Datos personales ── */}
                {addStudentStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={S.sectionTitle}>NOMBRE</div>
                        <input style={S.input} placeholder="Juan" value={newStudent.firstName} onChange={(e) => setNewStudent((p) => ({ ...p, firstName: e.target.value }))} />
                      </div>
                      <div>
                        <div style={S.sectionTitle}>APELLIDO</div>
                        <input style={S.input} placeholder="Pérez" value={newStudent.lastName} onChange={(e) => setNewStudent((p) => ({ ...p, lastName: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={S.sectionTitle}>EDAD</div>
                        <input style={S.input} type="number" placeholder="ej: 28" value={newStudent.age} onChange={(e) => setNewStudent((p) => ({ ...p, age: e.target.value }))} />
                      </div>
                      <div>
                        <div style={S.sectionTitle}>GÉNERO</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[{ v: "hombre", emoji: "👨", label: "Hombre" }, { v: "mujer", emoji: "👩", label: "Mujer" }].map(opt => (
                            <button key={opt.v} type="button"
                              onClick={() => setNewStudent(p => ({ ...p, gender: opt.v }))}
                              style={{ flex: 1, background: newStudent.gender === opt.v ? "#5BB8F522" : "#070C18", border: `2px solid ${newStudent.gender === opt.v ? "#5BB8F5" : "#0F1C35"}`, borderRadius: 8, padding: "8px 0", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                              <div style={{ fontSize: 18 }}>{opt.emoji}</div>
                              <div style={{ fontSize: 10, color: newStudent.gender === opt.v ? "#5BB8F5" : "#6B91BB", fontWeight: 700, marginTop: 2 }}>{opt.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 12, marginTop: 4 }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>DATOS CORPORALES</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div><div style={S.sectionTitle}>PESO (KG)</div><input style={S.input} type="number" placeholder="75" value={newStudent.weight || ""} onChange={(e) => setNewStudent((p) => ({ ...p, weight: e.target.value }))} /></div>
                        <div><div style={S.sectionTitle}>ESTATURA (CM)</div><input style={S.input} type="number" placeholder="175" value={newStudent.height} onChange={(e) => setNewStudent((p) => ({ ...p, height: e.target.value }))} /></div>
                        <div><div style={S.sectionTitle}>CINTURA (CM)</div><input style={S.input} type="number" placeholder="80" value={newStudent.waist} onChange={(e) => setNewStudent((p) => ({ ...p, waist: e.target.value }))} /></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <div><div style={{ fontSize: 10, color: "#FF9E80", letterSpacing: 1, marginBottom: 6 }}>🔥 GRASA %</div><input style={S.input} type="number" placeholder="20" value={newStudent.fatPct} onChange={(e) => setNewStudent((p) => ({ ...p, fatPct: e.target.value }))} /></div>
                        <div><div style={{ fontSize: 10, color: "#A8FFD8", letterSpacing: 1, marginBottom: 6 }}>💪 MÚSCULO %</div><input style={S.input} type="number" placeholder="40" value={newStudent.musclePct} onChange={(e) => setNewStudent((p) => ({ ...p, musclePct: e.target.value }))} /></div>
                        <div><div style={{ fontSize: 10, color: "#BAD8FF", letterSpacing: 1, marginBottom: 6 }}>💧 AGUA %</div><input style={S.input} type="number" placeholder="55" value={newStudent.waterPct} onChange={(e) => setNewStudent((p) => ({ ...p, waterPct: e.target.value }))} /></div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 12 }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 8 }}>CONTACTO (OPCIONAL)</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                          <div style={S.sectionTitle}>📱 CELULAR</div>
                          <input style={S.input} type="tel" placeholder="+57 300 000 0000" value={newStudent.phone} onChange={(e) => setNewStudent((p) => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                          <div style={S.sectionTitle}>📸 INSTAGRAM</div>
                          <input style={S.input} placeholder="@usuario" value={newStudent.instagram} onChange={(e) => setNewStudent((p) => ({ ...p, instagram: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 12 }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 8 }}>ACCESO DEL ALUMNO (OPCIONAL)</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div><div style={S.sectionTitle}>USUARIO</div><input style={S.input} placeholder="juan" value={newStudent.username} onChange={(e) => setNewStudent((p) => ({ ...p, username: e.target.value }))} /></div>
                        <div><div style={S.sectionTitle}>CONTRASEÑA</div><input style={S.input} placeholder="••••••" value={newStudent.password} onChange={(e) => setNewStudent((p) => ({ ...p, password: e.target.value }))} /></div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button style={{ ...S.btn, flex: 1, opacity: (newStudent.firstName && newStudent.lastName && newStudent.gender) ? 1 : 0.4 }}
                        onClick={() => { if (newStudent.firstName && newStudent.lastName && newStudent.gender) setAddStudentStep(2); }}>
                        Siguiente →
                      </button>
                      <button style={S.btnSecondary} onClick={() => { setShowAddStudent(false); setAddStudentStep(1); }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {/* ── PASO 2: Objetivo ── */}
                {addStudentStep === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0", marginBottom: 4 }}>¿Cuál es el objetivo de {newStudent.firstName}?</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { key: "perdida", emoji: "🔥", title: "Pérdida de grasa", desc: "Reducir grasa corporal y mejorar composición" },
                        { key: "musculo", emoji: "💪", title: "Ganancia muscular", desc: "Aumentar masa muscular y fuerza" },
                      ].map(opt => (
                        <div key={opt.key} onClick={() => setNewStudentGoal(opt.key)}
                          style={{ background: newStudentGoal === opt.key ? "#5BB8F522" : "#070C18", border: `2px solid ${newStudentGoal === opt.key ? "#5BB8F5" : "#0A1225"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 14, color: newStudentGoal === opt.key ? "#5BB8F5" : "#B8D4F0" }}>{opt.title}</div>
                              <div style={{ fontSize: 11, color: "#527BA8", marginTop: 2 }}>{opt.desc}</div>
                            </div>
                            {newStudentGoal === opt.key && <div style={{ marginLeft: "auto", color: "#5BB8F5", fontWeight: 800, fontSize: 16 }}>✓</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btnSecondary} onClick={() => setAddStudentStep(1)}>← Volver</button>
                      <button style={{ ...S.btn, flex: 1, opacity: newStudentGoal ? 1 : 0.4 }} onClick={() => newStudentGoal && setAddStudentStep(3)}>
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── PASO 3: Días por semana ── */}
                {addStudentStep === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0", marginBottom: 4 }}>¿Cuántos días por semana va a entrenar?</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {[1,2,3,4,5,6,7].map(n => (
                        <div key={n} onClick={() => setNewStudentDays(n)}
                          style={{ background: newStudentDays === n ? "#5BB8F5" : "#070C18", border: `2px solid ${newStudentDays === n ? "#5BB8F5" : "#0A1225"}`, borderRadius: 10, padding: "12px 0", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: newStudentDays === n ? "#070C18" : "#B8D4F0" }}>{n}</div>
                          <div style={{ fontSize: 8, color: newStudentDays === n ? "#070C18" : "#527BA8", marginTop: 2 }}>{n === 1 ? "día" : "días"}</div>
                        </div>
                      ))}
                    </div>
                    {newStudentDays && newStudentGoal && newStudent.gender && (
                      <button style={{ ...S.btn, width: "100%", background: "linear-gradient(135deg, #A8FFD8 0%, #5BB8F5 100%)", color: "#070C18", fontWeight: 900 }}
                        onClick={addStudent} disabled={savingNewStudent}>
                        {savingNewStudent ? "⏳ Generando rutina con IA..." : "⚡ Generar rutina con IA"}
                      </button>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btnSecondary} onClick={() => setAddStudentStep(2)}>← Volver</button>
                      <button style={{ ...S.btn, flex: 1, opacity: newStudentDays ? 1 : 0.4 }} onClick={() => newStudentDays && setAddStudentStep(4)}>
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── PASO 4: Salud y alimentación ── */}
                {addStudentStep === 4 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0" }}>Información de salud <span style={{ fontSize: 11, color: "#6B91BB", fontWeight: 400 }}>(opcional)</span></div>

                    {/* Patologías */}
                    <div>
                      <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>🏥 PATOLOGÍAS O ENFERMEDADES</div>
                      <textarea
                        style={{ ...S.input, minHeight: 70, resize: "none", lineHeight: 1.5 }}
                        placeholder="Ej: Hipertensión, diabetes tipo 2, escoliosis..."
                        value={newStudentHealth.pathologies}
                        onChange={e => setNewStudentHealth(p => ({ ...p, pathologies: e.target.value }))}
                      />
                    </div>

                    {/* Ejercicios restringidos */}
                    <div>
                      <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>🚫 EJERCICIOS QUE NO PUEDE REALIZAR</div>
                      <textarea
                        style={{ ...S.input, minHeight: 70, resize: "none", lineHeight: 1.5 }}
                        placeholder="Ej: Sentadilla profunda, press militar, saltos..."
                        value={newStudentHealth.restrictedExercises}
                        onChange={e => setNewStudentHealth(p => ({ ...p, restrictedExercises: e.target.value }))}
                      />
                    </div>

                    {/* Alergias */}
                    <div>
                      <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>⚠️ ALERGIAS ALIMENTARIAS</div>
                      <textarea
                        style={{ ...S.input, minHeight: 60, resize: "none", lineHeight: 1.5 }}
                        placeholder="Ej: Maní, mariscos, gluten, lácteos..."
                        value={newStudentHealth.foodAllergies}
                        onChange={e => setNewStudentHealth(p => ({ ...p, foodAllergies: e.target.value }))}
                      />
                    </div>

                    {/* Alimentos que no come */}
                    <div>
                      <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>🥗 ALIMENTOS QUE NO CONSUME</div>
                      <textarea
                        style={{ ...S.input, minHeight: 60, resize: "none", lineHeight: 1.5 }}
                        placeholder="Ej: Carne roja, cerdo, huevo, azúcar refinada..."
                        value={newStudentHealth.avoidedFoods}
                        onChange={e => setNewStudentHealth(p => ({ ...p, avoidedFoods: e.target.value }))}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btnSecondary} onClick={() => setAddStudentStep(3)}>← Volver</button>
                      <button style={{ ...S.btn, flex: 1 }} onClick={() => setAddStudentStep(5)}>Siguiente →</button>
                    </div>
                  </div>
                )}

                {/* ── PASO 5: Pago y plan ── */}
                {addStudentStep === 5 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#B8D4F0" }}>
                      {newStudentType === "asesorado" ? "Plan de asesoría" : "Plan de clases"}
                      <span style={{ fontSize: 11, color: "#6B91BB", fontWeight: 400 }}> (opcional)</span>
                    </div>

                    {newStudentType === "alumno" ? (
                      /* ── ALUMNO: clases por mes + valor ── */
                      <div style={{ background: "#070C18", borderRadius: 12, padding: 16, border: "1px solid #0F1C35" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>🗓️ CLASES AL MES</div>
                            <input style={S.input} type="number" placeholder="ej: 12"
                              value={newStudentBilling.classes}
                              onChange={e => setNewStudentBilling(p => ({ ...p, classes: e.target.value }))} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>💳 VALOR DEL MES</div>
                            <input style={S.input} type="number" placeholder="ej: 150000"
                              value={newStudentBilling.amount}
                              onChange={e => setNewStudentBilling(p => ({ ...p, amount: e.target.value }))} />
                          </div>
                        </div>
                        {newStudentBilling.classes && newStudentBilling.amount && (
                          <div style={{ marginTop: 12, background: "#5BB8F511", borderRadius: 8, padding: "10px 14px", border: "1px solid #5BB8F533" }}>
                            <div style={{ fontSize: 11, color: "#8AAFD4" }}>Plan registrado</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#5BB8F5", marginTop: 2 }}>
                              {newStudentBilling.classes} clases/mes · ${Number(newStudentBilling.amount).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ── ASESORADO: meses + valor ── */
                      <div style={{ background: "#070C18", borderRadius: 12, padding: 16, border: "1px solid #0F1C35" }}>
                        <div style={{ fontSize: 11, color: "#8AAFD4", marginBottom: 12 }}>¿Por cuánto tiempo va a asesorar?</div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                          {[1, 2, 3].map(m => (
                            <button key={m} type="button" onClick={() => setNewStudentBilling(p => ({ ...p, months: String(m) }))}
                              style={{ flex: 1, background: newStudentBilling.months === String(m) ? "#A8FFD822" : "#0A1225", border: `2px solid ${newStudentBilling.months === String(m) ? "#A8FFD8" : "#0F1C35"}`, borderRadius: 10, padding: "14px 0", textAlign: "center", cursor: "pointer", fontFamily: "inherit" }}>
                              <div style={{ fontSize: 24, fontWeight: 900, color: newStudentBilling.months === String(m) ? "#A8FFD8" : "#B8D4F0" }}>{m}</div>
                              <div style={{ fontSize: 10, color: newStudentBilling.months === String(m) ? "#A8FFD8" : "#6B91BB" }}>mes{m > 1 ? "es" : ""}</div>
                            </button>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>💳 VALOR DE LA ASESORÍA</div>
                          <input style={S.input} type="number" placeholder="ej: 200000"
                            value={newStudentBilling.amount}
                            onChange={e => setNewStudentBilling(p => ({ ...p, amount: e.target.value }))} />
                        </div>
                        {newStudentBilling.months && newStudentBilling.amount && (
                          <div style={{ marginTop: 12, background: "#A8FFD811", borderRadius: 8, padding: "10px 14px", border: "1px solid #A8FFD833" }}>
                            <div style={{ fontSize: 11, color: "#8AAFD4" }}>Asesoría registrada</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#A8FFD8", marginTop: 2 }}>
                              {newStudentBilling.months} mes{Number(newStudentBilling.months) > 1 ? "es" : ""} · ${Number(newStudentBilling.amount).toLocaleString()}
                            </div>
                            <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 4 }}>
                              📅 Vence: {new Date(Date.now() + Number(newStudentBilling.months) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...S.btnSecondary, opacity: savingNewStudent ? 0.4 : 1 }} onClick={() => !savingNewStudent && setAddStudentStep(4)}>← Volver</button>
                      <button style={{ ...S.btn, flex: 1, opacity: savingNewStudent ? 0.7 : 1, background: savingNewStudent ? undefined : "linear-gradient(135deg, #A8FFD8 0%, #5BB8F5 100%)", color: savingNewStudent ? undefined : "#070C18" }} onClick={addStudent} disabled={savingNewStudent}>
                        {savingNewStudent ? "⏳ Generando rutina con IA..." : "⚡ Guardar y generar rutina con IA"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {students.map((st, idx) => {
              const stPayments = payments[st.id] || [];
              const stClasses = classes[st.id] || [];
              const stBill = st.billing ? getBillingStatus(stPayments, stClasses) : null;
              return (
              <div key={st.id} style={{ ...S.card, cursor: "pointer", border: stBill?.status === "deuda" ? "1px solid #ff555533" : stBill?.status === "por_vencer" ? "1px solid #fbbf2433" : "1px solid #252525" }}
                onClick={() => selectStudent(st)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#5BB8F544")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = stBill?.status === "deuda" ? "#ff555533" : stBill?.status === "por_vencer" ? "#fbbf2433" : "#0A1225")}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <div style={S.avatar(42)}>{st.avatar}</div>
                    <div style={{ position: "absolute", top: -6, left: -6, background: "#5BB8F5", color: "#000", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900 }}>{idx + 1}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: 17, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: 0.5 }}>{fullName(st)}</div>
                    <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 2 }}>{st.gender === "hombre" ? "👨" : st.gender === "mujer" ? "👩" : ""}{st.gender ? " " : ""}{st.age} años · @{st.username}</div>
                    {st.goal
                      ? <span style={{ ...S.goalBadge(st.goal), display: "inline-block", marginTop: 5 }}>{st.goal === "perdida" ? "🔥" : "💪"} {GOAL_LABELS[st.goal]}</span>
                      : <span style={{ ...S.badge, display: "inline-block", marginTop: 5 }}>Sin objetivo aún</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    {stBill && <span style={{ background: `${stBill.color}22`, color: stBill.color, fontSize: 10, padding: "3px 7px", borderRadius: 4, fontWeight: 700 }}>{stBill.label}</span>}
                    {st.metrics && <span style={S.accentBadge}>BMI {st.metrics.bmi}</span>}
                    <span style={S.badge}>{(routines[st.id] || []).length} ejerc.</span>
                    <button onClick={e => { e.stopPropagation(); setPreviewStudent({ ...st, role: "student" }); }}
                      style={{ background: "none", border: "1px solid #2a2a2a", color: "#7AA0C8", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit", marginTop: 2 }}>
                      👁️ Ver
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </>
        )}

        {/* ── STUDENT DETAIL ── */}
        {view === "student" && selectedStudent && (
          <>
            <div style={{ ...S.card, cursor: "default", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={S.avatar(50)}>{selectedStudent.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif", letterSpacing: 0.5 }}>{fullName(selectedStudent)}</div>
                <div style={{ fontSize: 11, color: "#6B91BB" }}>{selectedStudent.age} años · @{selectedStudent.username}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                  {selectedStudent.goal
                    ? <span style={{ ...S.goalBadge(selectedStudent.goal), display: "inline-block" }}>{selectedStudent.goal === "perdida" ? "🔥" : "💪"} {GOAL_LABELS[selectedStudent.goal]}</span>
                    : <span style={{ ...S.badge, display: "inline-block" }}>Sin objetivo</span>}
                  <button onClick={() => setStudents(prev => prev.map(s => s.id === selectedStudent.id
                      ? { ...s, goal: s.goal === "perdida" ? "musculo" : "perdida" }
                      : s
                    )) || setSelectedStudent(prev => ({ ...prev, goal: prev.goal === "perdida" ? "musculo" : "perdida" }))}
                    style={{ background: "#5BB8F511", border: "1px solid #5BB8F533", color: "#5BB8F5", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                    ✏️ Cambiar meta
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 5, background: "#0B1428", padding: 5, borderRadius: 10, marginBottom: 16, border: "1px solid #252525" }}>
              {[["body", "Cuerpo 📊"], ["routine", "Rutina"], ["nutrition", "🥗 Nutrición"], ["billing", "Clases 💳"], ["ai", "IA 🤖"]].map(([t, l]) => (
                <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{l}</button>
              ))}
            </div>

            {/* BODY */}
            {activeTab === "body" && (
              <>
                {/* Goal editor */}
                <div style={{ ...S.card, cursor: "default" }}>
                  <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>META DEL ALUMNO</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ key: "perdida", emoji: "🔥", label: "Pérdida de peso", color: "#FF9E80" }, { key: "musculo", emoji: "💪", label: "Ganancia muscular", color: "#A8FFD8" }].map(opt => (
                      <button key={opt.key} type="button" onClick={() => {
                          setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, goal: opt.key } : s));
                          setSelectedStudent(prev => ({ ...prev, goal: opt.key }));
                        }}
                        style={{ flex: 1, background: selectedStudent.goal === opt.key ? `${opt.color}22` : "#070C18", border: `2px solid ${selectedStudent.goal === opt.key ? opt.color : "#0F1C35"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                        <div style={{ fontSize: 20 }}>{opt.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: selectedStudent.goal === opt.key ? opt.color : "#6B91BB", marginTop: 4 }}>{opt.label}</div>
                        {selectedStudent.goal === opt.key && <div style={{ fontSize: 9, color: opt.color, marginTop: 2 }}>✓ Activo</div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight card with chart */}
                <WeightCard
                  studentId={selectedStudent.id}
                  metrics={selectedStudent.metrics}
                  weightLog={weightLog}
                  setWeightLog={setWeightLog}
                  setStudents={setStudents}
                  canEdit={true}
                />

                {/* Body composition bars */}
                {selectedStudent.metrics && (() => {
                  const bars = [
                    { label: "Grasa", value: selectedStudent.metrics.fatPct, color: "#FF9E80", icon: "🔥" },
                    { label: "Músculo", value: selectedStudent.metrics.musclePct, color: "#A8FFD8", icon: "💪" },
                    { label: "Agua", value: selectedStudent.metrics.waterPct, color: "#BAD8FF", icon: "💧" },
                  ];
                  return (
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 12 }}>COMPOSICIÓN CORPORAL</div>
                      {bars.map(b => (
                        <div key={b.label} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "#777" }}>{b.icon} {b.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}%</span>
                          </div>
                          <div style={{ height: 6, background: "#0A1225", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min(b.value, 100)}%`, background: b.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, fontSize: 12, color: "#6B91BB" }}>Altura: {selectedStudent.metrics.height} cm</div>
                    </div>
                  );
                })()}

                {!selectedStudent.metrics && (
                  <div style={{ ...S.card, cursor: "default", textAlign: "center", color: "#6B91BB", padding: 32 }}>Sin datos corporales aún.</div>
                )}

                {/* Plan semanal editable */}
                {(() => {
                  const DAY_OPTIONS = ["Pecho","Espalda","Bíceps y tríceps","Glúteo","Pierna","Cuádriceps","Pecho y tríceps","Espalda y bíceps","Pecho y espalda","Bíceps tríceps y hombro","Hombro","Core","Cardio","Push","Pull","Full body"];

                  const saveDays = () => {
                    const newNames = Array.from({ length: daysForm.count }, (_, i) => daysForm.names[i] || `Día ${i + 1}`);
                    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, trainingDays: daysForm.count, dayNames: newNames } : s));
                    setSelectedStudent(prev => ({ ...prev, trainingDays: daysForm.count, dayNames: newNames }));
                    if (selectedDay >= daysForm.count) setSelectedDay(0);
                    setEditingDays(false);
                  };

                  if (editingDays) return (
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#5BB8F5" }}>✏️ Plan semanal</div>
                        <button onClick={() => setEditingDays(false)} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 20 }}>✕</button>
                      </div>

                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>¿CUÁNTOS DÍAS ENTRENA POR SEMANA?</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                        {[1,2,3,4,5,6,7].map(n => (
                          <button key={n}
                            onClick={() => setDaysForm(p => ({ count: n, names: Array.from({ length: n }, (_, i) => p.names[i] || "") }))}
                            style={{ flex: 1, padding: "12px 0", background: daysForm.count === n ? "#5BB8F5" : "#5BB8F5", color: daysForm.count === n ? "#000" : "#6B91BB", border: `1px solid ${daysForm.count === n ? "#5BB8F5" : "#222"}`, borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
                            {n}
                          </button>
                        ))}
                      </div>

                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>NOMBRE DE CADA DÍA</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {Array.from({ length: daysForm.count }).map((_, i) => (
                          <div key={i} style={{ background: "#070C18", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 8 }}>DÍA {i + 1}</div>
                            <input
                              style={{ ...S.input, marginBottom: 8, fontSize: 13 }}
                              placeholder="Escribí el nombre..."
                              value={daysForm.names[i] || ""}
                              onChange={e => setDaysForm(p => ({ ...p, names: p.names.map((d, j) => j === i ? e.target.value : d) }))} />
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {DAY_OPTIONS.map(opt => (
                                <button key={opt}
                                  onClick={() => setDaysForm(p => ({ ...p, names: p.names.map((d, j) => j === i ? opt : d) }))}
                                  style={{ background: daysForm.names[i] === opt ? "#5BB8F522" : "transparent", border: `1px solid ${daysForm.names[i] === opt ? "#5BB8F5" : "#0F1C35"}`, color: daysForm.names[i] === opt ? "#5BB8F5" : "#6B91BB", padding: "4px 9px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button style={{ ...S.btn, width: "100%", marginTop: 14 }} onClick={saveDays}>Guardar plan</button>
                    </div>
                  );

                  return selectedStudent.trainingDays ? (
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>PLAN SEMANAL</div>
                        <button onClick={() => { setDaysForm({ count: selectedStudent.trainingDays, names: [...(selectedStudent.dayNames || [])] }); setEditingDays(true); }}
                          style={{ background: "none", border: "none", color: "#5BB8F5", cursor: "pointer", fontSize: 12, fontFamily: "inherit", letterSpacing: 0.5 }}>✏️ Editar días</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <div style={{ fontSize: 30, fontWeight: 800, color: "#5BB8F5" }}>{selectedStudent.trainingDays}</div>
                        <div style={{ fontSize: 12, color: "#6B91BB" }}>días por semana</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(selectedStudent.dayNames || []).map((name, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#070C18", borderRadius: 8 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 5, background: "#5BB8F522", color: "#5BB8F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ fontSize: 13, color: "#ddd" }}>{name || `Día ${i + 1}`}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ ...S.card, cursor: "default", textAlign: "center", padding: 28 }}>
                      <div style={{ color: "#527BA8", fontSize: 13, marginBottom: 14 }}>Sin plan semanal configurado.</div>
                      <button style={S.btn} onClick={() => { setDaysForm({ count: 3, names: ["","",""] }); setEditingDays(true); }}>+ Configurar días</button>
                    </div>
                  );
                })()}

                <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center", marginTop: 4 }} onClick={() => setEditingMetrics(true)}>
                  ✏️ {selectedStudent.metrics ? "Editar datos corporales" : "Agregar datos corporales"}
                </button>
              </>
            )}

            {/* ROUTINE */}
            {activeTab === "routine" && (() => {
              const days = (selectedStudent.dayNames?.length > 0 && selectedStudent.trainingDays)
                ? selectedStudent.dayNames.slice(0, selectedStudent.trainingDays)
                : selectedStudent.trainingDays
                  ? Array.from({ length: selectedStudent.trainingDays }, (_, i) => `Día ${i + 1}`)
                  : ["General"];
              const dayRoutine = studentRoutine.filter(ex => (ex.dayIndex ?? 0) === selectedDay);
              const hasRoutine = studentRoutine.length > 0;

              const renderExList = (exList) => {
                const grouped = [];
                const seen = new Set();
                exList.forEach(ex => {
                  if (ex.methodGroup && (ex.method === "biserie" || ex.method === "triserie" )) {
                    if (!seen.has(ex.methodGroup)) {
                      seen.add(ex.methodGroup);
                      grouped.push({ type: "group", key: ex.methodGroup, items: exList.filter(e => e.methodGroup && e.methodGroup === ex.methodGroup), method: ex.method });
                    }
                  } else {
                    grouped.push({ type: "single", key: String(ex.id), items: [ex] });
                  }
                });
                return grouped.map(group => {
                  const method = group.method ? METHODS[group.method] : null;
                  return (
                    <div key={group.key} style={{ marginBottom: 10 }}>
                      {group.type === "group" && method && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingLeft: 4 }}>
                          <span style={{ fontSize: 14 }}>{method.emoji}</span>
                          <span style={{ fontSize: 10, color: method.color, letterSpacing: 2, fontWeight: 700 }}>{method.label.toUpperCase()} {group.key}</span>
                        </div>
                      )}
                      <div style={{ border: group.type === "group" ? `1px solid ${method?.color}33` : "1px solid #252525", borderRadius: 10, overflow: "hidden" }}>
                        {group.items.map((ex, idx) => (
                          <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#0B1428", borderBottom: idx < group.items.length - 1 ? "1px solid #222" : "none" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: "#0A1225", overflow: "hidden", flexShrink: 0 }}>
                              {(ex.imageCustom || ex.imageUrl)
                                ? <img src={ex.imageCustom || ex.imageUrl} alt={ex.exercise} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏋️</div>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.exercise}</div>
                              <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 2 }}>
                                {ex.type === "cardio"
                                  ? <>{ex.duration} min 🕐{ex.description ? <span style={{ color: "#6B91BB", marginLeft: 6 }}>· {ex.description}</span> : null}</>
                                  : coachEditSeriesExId === ex.id ? (
                                    <div style={{ marginTop: 4 }}>
                                      <div style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 5, marginBottom: 4 }}>
                                        <div />
                                        <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 1, textAlign: "center" }}>{ex.method === "restpause" ? "REPS 1 / REPS 2" : "REPS"}</div>
                                        <div style={{ fontSize: 9, color: "#6B91BB", letterSpacing: 1, textAlign: "center" }}>KG</div>
                                      </div>
                                      {coachEditSeriesData.map((s, i) => (
                                        <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 1fr", gap: 5, alignItems: "center", marginBottom: 4 }}>
                                          <div style={{ background: "#5BB8F522", color: "#5BB8F5", borderRadius: 4, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{i+1}</div>
                                          <input style={{ ...S.input, textAlign: "center", padding: "4px 4px", fontSize: 12 }} type="number" value={s.reps}
                                            onChange={e => setCoachEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, reps: Number(e.target.value) } : sd))} />
                                          <input style={{ ...S.input, textAlign: "center", padding: "4px 4px", fontSize: 12 }} type="number" value={s.weight}
                                            onChange={e => setCoachEditSeriesData(prev => prev.map((sd, j) => j === i ? { ...sd, weight: Number(e.target.value) } : sd))} />
                                        </div>
                                      ))}
                                      {/* Add/remove series */}
                                      <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                                        <button onClick={() => setCoachEditSeriesData(p => [...p, { reps: 10, weight: 0 }])}
                                          style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#B8D4F0", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>+ Serie</button>
                                        {coachEditSeriesData.length > 1 && (
                                          <button onClick={() => setCoachEditSeriesData(p => p.slice(0, -1))}
                                            style={{ background: "none", border: "1px solid #2a2a2a", color: "#6B91BB", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>− Serie</button>
                                        )}
                                      </div>
                                      <div style={{ display: "flex", gap: 5 }}>
                                        <button style={{ ...S.btn, flex: 1, padding: "6px 0", fontSize: 11 }} onClick={() => {
                                          setRoutines(prev => ({ ...prev, [selectedStudent.id]: prev[selectedStudent.id].map(e => e.id === ex.id ? { ...e, sets: coachEditSeriesData.length, seriesData: coachEditSeriesData } : e) }));
                                          setCoachEditSeriesExId(null);
                                        }}>Guardar</button>
                                        <button style={{ ...S.btnSecondary, flex: 1, padding: "6px 0", fontSize: 11 }} onClick={() => setCoachEditSeriesExId(null)}>Cancelar</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {ex.seriesData?.length > 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
                                          {ex.seriesData.map((s, i) => (
                                            <span key={i} style={{ fontSize: 10, color: "#777" }}>
                                              Serie {i+1}: <span style={{ color: "#5BB8F5", fontWeight: 700 }}>{s.reps} reps</span> · <span style={{ color: "#B8D4F0" }}>{s.weight > 0 ? `${s.weight}kg` : "PC"}</span>
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <>{ex.sets}×{ex.reps} · {ex.weight > 0 ? `${ex.weight}kg` : "PC"}</>
                                      )}
                                    </>
                                  )
                                }
                                {ex.type !== "cardio" && coachEditSeriesExId !== ex.id && (
                                  <button onClick={() => {
                                    const current = ex.seriesData?.length ? ex.seriesData : Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0 }));
                                    setCoachEditSeriesExId(ex.id);
                                    setCoachEditSeriesData([...current]);
                                  }}
                                    style={{ background: "none", border: "1px solid #2a2a2a", color: "#7AA0C8", borderRadius: 5, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit", marginTop: 5, display: "block" }}>
                                    ✏️ Editar series
                                  </button>
                                )}
                                
                                
                              </div>
                              {ex.method === "dropset" && ex.dropDetails?.length > 0 && (
                                <div style={{ marginTop: 4 }}>
                                  {ex.dropDetails.map((d, di) => (
                                    <div key={di} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                      <span style={{ background: "#fb923c22", color: "#fb923c", fontSize: 9, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>Drop {di + 1}</span>
                                      <span style={{ fontSize: 10, color: "#B8D4F0" }}>{d.reps} reps · {d.weight > 0 ? `${d.weight}kg` : "PC"}</span>
                                    </div>
                                  ))}
                                  {(ex.sets || 1) > 1 && <div style={{ fontSize: 10, color: "#fb923c", marginTop: 2 }}>🔁 ×{ex.sets}</div>}
                                </div>
                              )}
                              {ex.method && METHODS[ex.method] && (
                                <span style={{ background: `${METHODS[ex.method].color}22`, color: METHODS[ex.method].color, fontSize: 10, padding: "2px 6px", borderRadius: 4, marginTop: 4, display: "inline-block" }}>
                                  {METHODS[ex.method].emoji} {METHODS[ex.method].label}
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => setEditingEx({ ...ex })} style={{ background: "#0A1225", border: "none", color: "#B8D4F0", cursor: "pointer", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>✏️</button>
                              <button onClick={() => removeExercise(ex.id)} style={{ background: "none", border: "none", color: "#456E9E", cursor: "pointer", fontSize: 16 }}>✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              };

              return (
                <>
                  {/* Generate Routine Button */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
                    <button onClick={generateRoutine} disabled={generatingRoutine}
                      style={{ flex: 1, background: generatingRoutine ? "#0B1428" : "linear-gradient(135deg, #5BB8F5 0%, #3a9fd4 100%)", border: "none", color: generatingRoutine ? "#6B91BB" : "#070C18", borderRadius: 10, padding: "12px 16px", fontWeight: 900, fontSize: 13, cursor: generatingRoutine ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {generatingRoutine ? <><span style={{ fontSize: 16 }}>⏳</span> Generando con IA...</> : <><span style={{ fontSize: 16 }}>⚡</span> {hasRoutine ? "Regenerar rutina con IA" : "Generar rutina con IA"}</>}
                    </button>
                    {hasRoutine && <div style={{ fontSize: 10, color: "#6B91BB", textAlign: "center", lineHeight: 1.4 }}>{studentRoutine.length} ejerc.<br/>asignados</div>}
                  </div>

                  {/* Preview Modal */}
                  {showRoutinePreview && previewRoutine && (
                    <div style={{ background: "#070C18", border: "2px solid #5BB8F544", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 2 }}>RUTINA GENERADA POR IA — VISTA PREVIA</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#B8D4F0" }}>
                            {selectedStudent.firstName} · {selectedStudent.goal === "perdida" ? "🔥 Pérdida de grasa" : "💪 Ganancia muscular"} · {previewRoutine.days.length} días
                          </div>
                        </div>
                        <button onClick={() => setShowRoutinePreview(false)} style={{ background: "none", border: "none", color: "#6B91BB", fontSize: 20, cursor: "pointer" }}>✕</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto", marginBottom: 14 }}>
                        {previewRoutine.days.map((day, di) => (
                          <div key={di} style={{ background: "#0B1428", borderRadius: 10, padding: 12, border: "1px solid #0F1C35" }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#5BB8F5", letterSpacing: 1, marginBottom: 8 }}>
                              DÍA {di + 1} — {day.dayName?.toUpperCase()}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {(day.exercises || []).map((ex, ei) => {
                                const m = ex.method ? METHODS[ex.method] : null;
                                return (
                                  <div key={ei} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0A1225", color: "#5BB8F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>{ei + 1}</div>
                                    <div style={{ flex: 1 }}>
                                      <span style={{ fontSize: 12, fontWeight: 700, color: "#B8D4F0" }}>{ex.exercise}</span>
                                      <span style={{ fontSize: 11, color: "#6B91BB", marginLeft: 6 }}>{ex.sets}×{ex.reps}</span>
                                    </div>
                                    {m && <span style={{ background: `${m.color}22`, color: m.color, fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700, flexShrink: 0 }}>{m.emoji} {m.label}</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setShowRoutinePreview(false); generateRoutine(); }} style={{ ...S.btnSecondary, flex: 1 }}>🔄 Regenerar</button>
                        <button onClick={approveRoutine}
                          style={{ flex: 2, background: "linear-gradient(135deg, #A8FFD8 0%, #5BB8F5 100%)", border: "none", color: "#070C18", borderRadius: 10, padding: "12px 0", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                          ✓ Aprobar y asignar rutina
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Day tabs + edit button */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, paddingBottom: 2 }}>
                      {days.map((name, i) => (
                        <button key={i} onClick={() => setSelectedDay(i)}
                          style={{ background: selectedDay === i ? "#5BB8F5" : "#0B1428", color: selectedDay === i ? "#000" : "#7AA0C8", border: `1px solid ${selectedDay === i ? "#5BB8F5" : "#0A1225"}`, padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: selectedDay === i ? 700 : 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, opacity: 0.6, marginRight: 3 }}>D{i + 1}</span>
                          {name || `Día ${i + 1}`}
                          <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.5 }}>({studentRoutine.filter(e => (e.dayIndex ?? 0) === i).length})</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { setDaysForm({ count: selectedStudent.trainingDays || days.length, names: [...(selectedStudent.dayNames || days)] }); setEditingDays(true); setActiveTab("body"); }}
                      style={{ background: "#0B1428", border: "1px solid #2a2a2a", color: "#5BB8F5", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                      ✏️
                    </button>
                  </div>

                  {/* Active day header */}
                  <div style={{ background: "#0B1428", border: "1px solid #252525", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2 }}>DÍA {selectedDay + 1}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#5BB8F5", marginTop: 2 }}>{days[selectedDay] || `Día ${selectedDay + 1}`}</div>
                    </div>
                    <span style={S.accentBadge}>{dayRoutine.length} ejercicio{dayRoutine.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Exercise list for selected day */}
                  {dayRoutine.length === 0 && (
                    <p style={{ color: "#527BA8", textAlign: "center", padding: "20px 0", fontSize: 13 }}>Sin ejercicios en este día. ¡Agregá el primero!</p>
                  )}
                  {renderExList(dayRoutine)}

                  {/* Edit modal */}
                  {editingEx && (
                    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ background: "#0B1428", border: "1px solid #2a2a2a", borderRadius: "16px 16px 0 0", padding: 20, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#5BB8F5" }}>Editar: {editingEx.exercise}</div>
                          <button onClick={() => setEditingEx(null)} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 20 }}>✕</button>
                        </div>
                        <ExerciseConfigForm ex={editingEx} setEx={setEditingEx} studentRoutine={studentRoutine} />
                        <button style={{ ...S.btn, width: "100%", marginTop: 14 }} onClick={() => {
                          setRoutines(prev => ({ ...prev, [selectedStudent.id]: prev[selectedStudent.id].map(e => e.id === editingEx.id ? editingEx : e) }));
                          setEditingEx(null);
                        }}>Guardar cambios</button>
                      </div>
                    </div>
                  )}

                  {/* Add exercise section */}
                  <div style={S.sectionTitle}>AGREGAR EJERCICIO AL DÍA {selectedDay + 1}</div>
                  <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center", marginBottom: 8 }} onClick={() => setShowLibrary(!showLibrary)}>
                    {showLibrary ? "✕ Cerrar biblioteca" : "📚 Elegir de la biblioteca"}
                  </button>

                  {showLibrary && (
                    <div style={{ ...S.card, cursor: "default", marginBottom: 8 }}>
                      {selectedStudent?.dayNames?.[selectedDay] && (() => {
                        const muscles = getMusclesForDay(selectedStudent.dayNames[selectedDay]);
                        return muscles ? (
                          <div style={{ background: "#5BB8F511", border: "1px solid #5BB8F533", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>🎯</span>
                            <div>
                              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 1 }}>FILTRANDO POR DÍA</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#5BB8F5" }}>{selectedStudent.dayNames[selectedDay]}</div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input style={{ ...S.input, flex: 1, marginBottom: 0 }} placeholder="Buscar ejercicio o músculo..." value={libraryFilter} onChange={e => setLibraryFilter(e.target.value)} />
                        {selectedStudent?.dayNames?.[selectedDay] && getMusclesForDay(selectedStudent.dayNames[selectedDay]) && (
                          <button onClick={() => setLibraryFilter(libraryFilter === "__ALL__" ? "" : "__ALL__")}
                            style={{ background: libraryFilter === "__ALL__" ? "#5BB8F5" : "#0A1225", border: "1px solid #5BB8F533", color: libraryFilter === "__ALL__" ? "#070C18" : "#6B91BB", borderRadius: 8, padding: "0 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                            {libraryFilter === "__ALL__" ? "🎯 Filtrado" : "👁️ Ver todo"}
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 240, overflowY: "auto" }}>
                        {(libraryFilter === "__ALL__" ? EXERCISE_LIBRARY : filterExercisesForDay(EXERCISE_LIBRARY, selectedStudent?.dayNames?.[selectedDay]))
                          .filter(e => libraryFilter === "__ALL__" || e.name.toLowerCase().includes(libraryFilter.toLowerCase()) || e.muscle.toLowerCase().includes(libraryFilter.toLowerCase())).map(libEx => (
                          <div key={libEx.name} onClick={() => { setNewEx(p => ({ ...p, exercise: libEx.name, imageUrl: libEx.imageUrl, type: libEx.type || "fuerza" })); setCustomName(""); setShowLibrary(false); }}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1e1e1e", cursor: "pointer" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#0A1225" }}>
                              <img src={libEx.imageUrl} alt={libEx.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{libEx.name}</div>
                              <div style={{ fontSize: 10, color: "#6B91BB" }}>{libEx.muscle}</div>
                            </div>
                            <span style={{ color: "#5BB8F5", fontSize: 18 }}>+</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {newEx.exercise ? (
                      <div style={{ background: "#0B1428", border: "1px solid #5BB8F544", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#5BB8F5" }}>✓ {newEx.exercise}</span>
                        <button onClick={() => setNewEx(p => ({ ...p, exercise: "", imageUrl: null }))} style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer" }}>✕</button>
                      </div>
                    ) : (
                      <input style={S.input} placeholder="O escribí un nombre personalizado" value={customName} onChange={e => setCustomName(e.target.value)} />
                    )}
                    {/* Cardio toggle if exercise is cardio type */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {[["fuerza", "💪 Fuerza"], ["cardio", "🏃 Cardio"]].map(([t, l]) => (
                        <button key={t} onClick={() => setNewEx(p => ({ ...p, type: t }))}
                          style={{ flex: 1, padding: "8px 0", background: newEx.type === t ? "#5BB8F5" : "#0B1428", color: newEx.type === t ? "#000" : "#6B91BB", border: `1px solid ${newEx.type === t ? "#5BB8F5" : "#0F1C35"}`, borderRadius: 8, fontSize: 12, fontWeight: newEx.type === t ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
                          {l}
                        </button>
                      ))}
                    </div>

                    {newEx.type === "cardio" ? (
                      <>
                        <div>
                          <div style={S.sectionTitle}>DURACIÓN (MIN)</div>
                          <input style={S.input} type="number" placeholder="20" value={newEx.duration} onChange={e => setNewEx(p => ({ ...p, duration: Number(e.target.value) }))} />
                        </div>
                        <div>
                          <div style={S.sectionTitle}>DESCRIPCIÓN (OPCIONAL)</div>
                          <input style={S.input} placeholder="ej: Ritmo moderado, inclinación 5%" value={newEx.description || ""} onChange={e => setNewEx(p => ({ ...p, description: e.target.value }))} />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Number of sets selector */}
                        <div>
                          <div style={S.sectionTitle}>NÚMERO DE SERIES</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[1,2,3,4,5,6].map(n => (
                              <button key={n} onClick={() => {
                                setNewEx(p => ({
                                  ...p, sets: n,
                                  seriesData: Array.from({ length: n }, (_, i) => p.seriesData[i] || { reps: p.reps || 10, weight: p.weight || 0 })
                                }));
                              }}
                                style={{ flex: 1, padding: "9px 0", background: newEx.sets === n ? "#5BB8F5" : "#0B1428", color: newEx.sets === n ? "#000" : "#6B91BB", border: `1px solid ${newEx.sets === n ? "#5BB8F5" : "#0F1C35"}`, borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Per-series detail rows */}
                        {newEx.sets > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "grid", gridTemplateColumns: newEx.method === "restpause" ? "36px 1fr 14px 1fr 1fr" : "36px 1fr 1fr", gap: 8, paddingBottom: 4 }}>
                              <div />
                              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>{newEx.method === "restpause" ? "REPS 1" : "REPS"}</div>
                              {newEx.method === "restpause" && <div style={{ fontSize: 10, color: "#e879f9", textAlign: "center" }}>+</div>}
                              {newEx.method === "restpause" && <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>REPS 2</div>}
                              <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>KG</div>
                            </div>
                            {Array.from({ length: newEx.sets }).map((_, i) => {
                              const sd = newEx.seriesData[i] || { reps: newEx.reps || 10, weight: newEx.weight || 0 };
                              return (
                                <div key={i} style={{ display: "grid", gridTemplateColumns: newEx.method === "restpause" ? "36px 1fr 14px 1fr 1fr" : "36px 1fr 1fr", gap: 8, alignItems: "center" }}>
                                  <div style={{ background: "#5BB8F522", color: "#5BB8F5", borderRadius: 6, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                                  <input style={{ ...S.input, textAlign: "center" }} type="number" value={sd.reps}
                                    onChange={e => setNewEx(p => ({ ...p, seriesData: p.seriesData.map((s, j) => j === i ? { ...s, reps: Number(e.target.value) } : s) }))} />
                                  {newEx.method === "restpause" && <div style={{ color: "#e879f9", textAlign: "center", fontWeight: 700, fontSize: 16 }}>+</div>}
                                  {newEx.method === "restpause" && (
                                    <input style={{ ...S.input, textAlign: "center" }} type="number" value={sd.reps2 ?? 2}
                                      onChange={e => setNewEx(p => ({ ...p, seriesData: p.seriesData.map((s, j) => j === i ? { ...s, reps2: Number(e.target.value) } : s) }))} />
                                  )}
                                  <input style={{ ...S.input, textAlign: "center" }} type="number" value={sd.weight}
                                    onChange={e => setNewEx(p => ({ ...p, seriesData: p.seriesData.map((s, j) => j === i ? { ...s, weight: Number(e.target.value) } : s) }))} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                    {newEx.type !== "cardio" && (
                    <><div style={S.sectionTitle}>MÉTODO (OPCIONAL)</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(METHODS).map(([key, m]) => (
                        <button key={key} onClick={() => setNewEx(p => ({ ...p, method: p.method === key ? null : key, methodGroup: null, tempo: null, drops: null }))}
                          style={{ background: newEx.method === key ? `${m.color}33` : "#0B1428", border: `1px solid ${newEx.method === key ? m.color : "#0F1C35"}`, color: newEx.method === key ? m.color : "#7AA0C8", padding: "6px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                          {m.emoji} {m.label}
                        </button>
                      ))}
                    </div>
                    {newEx.method && (
                      <div style={{ background: "#070C18", border: `1px solid ${METHODS[newEx.method].color}33`, borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: METHODS[newEx.method].color, marginBottom: 10 }}>{METHODS[newEx.method].desc}</div>
                        {(newEx.method === "biserie" || newEx.method === "triserie" ) && (
                          <>
                            <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 12 }}>
                              <div style={{ fontSize: 11, color: METHODS[newEx.method].color, fontWeight: 700, marginBottom: 10 }}>
                                {newEx.method === "biserie" ? "2️⃣ Segundo ejercicio" : newEx.method === "triserie" ? "3️⃣ Segundo ejercicio" : "⚡ Ejercicio B"}
                              </div>

                              {/* Selected exercise display or picker */}
                              {pairedEx.exercise ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0d0d0d", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                                  {pairedEx.imageUrl && (
                                    <div style={{ width: 32, height: 32, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                                      <img src={pairedEx.imageUrl} alt={pairedEx.exercise} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                    </div>
                                  )}
                                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#5BB8F5" }}>✓ {pairedEx.exercise}</span>
                                  <button onClick={() => { setPairedEx({ exercise: "", reps: 10, weight: 0, imageUrl: null }); setShowPairedLibrary(false); }}
                                    style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 16 }}>✕</button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => setShowPairedLibrary(!showPairedLibrary)}
                                    style={{ ...S.btnSecondary, width: "100%", textAlign: "center", marginBottom: 8, fontSize: 12 }}>
                                    {showPairedLibrary ? "✕ Cerrar" : "📚 Elegir de la biblioteca"}
                                  </button>
                                  {showPairedLibrary && (
                                    <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                                      <input style={{ ...S.input, marginBottom: 8, fontSize: 12 }} placeholder="Buscar ejercicio..." value={pairedLibraryFilter}
                                        onChange={e => setPairedLibraryFilter(e.target.value)} />
                                      <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                                        {filterExercisesForDay(EXERCISE_LIBRARY, selectedStudent?.dayNames?.[selectedDay])
                                          .filter(e =>
                                          e.name.toLowerCase().includes(pairedLibraryFilter.toLowerCase()) ||
                                          e.muscle.toLowerCase().includes(pairedLibraryFilter.toLowerCase())
                                        ).map(libEx => (
                                          <div key={libEx.name} onClick={() => { setPairedEx(p => ({ ...p, exercise: libEx.name, imageUrl: libEx.imageUrl })); setShowPairedLibrary(false); setPairedLibraryFilter(""); }}
                                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", borderBottom: "1px solid #1a1a1a", cursor: "pointer" }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 5, overflow: "hidden", flexShrink: 0, background: "#0A1225" }}>
                                              <img src={libEx.imageUrl} alt={libEx.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontSize: 12, fontWeight: 600 }}>{libEx.name}</div>
                                              <div style={{ fontSize: 10, color: "#6B91BB" }}>{libEx.muscle}</div>
                                            </div>
                                            <span style={{ color: "#5BB8F5", fontSize: 16 }}>+</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <input style={{ ...S.input, fontSize: 12 }} placeholder="O escribí el nombre manualmente" value={pairedEx.exercise}
                                    onChange={e => setPairedEx(p => ({ ...p, exercise: e.target.value }))} />
                                </>
                              )}

                              {/* Series detalladas del segundo ejercicio — usa el mismo número de series que el primero */}
                              <div style={{ marginTop: 10 }}>
                                <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 8 }}>SERIES · REPS · KG</div>
                                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr", gap: 6, marginBottom: 4 }}>
                                  <div />
                                  <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>REPS</div>
                                  <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>KG</div>
                                </div>
                                {Array.from({ length: newEx.sets || 3 }).map((_, i) => {
                                  const sd = (pairedEx.seriesData || [])[i] || { reps: pairedEx.reps || 10, weight: pairedEx.weight || 0 };
                                  return (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 6 }}>
                                      <div style={{ background: "#5BB8F522", color: "#5BB8F5", borderRadius: 5, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{i + 1}</div>
                                      <input style={{ ...S.input, textAlign: "center", padding: "7px 6px" }} type="number" value={sd.reps}
                                        onChange={e => setPairedEx(p => {
                                          const arr = Array.from({ length: newEx.sets || 3 }, (_, j) => (p.seriesData || [])[j] || { reps: p.reps || 10, weight: p.weight || 0 });
                                          arr[i] = { ...arr[i], reps: Number(e.target.value) };
                                          return { ...p, seriesData: arr };
                                        })} />
                                      <input style={{ ...S.input, textAlign: "center", padding: "7px 6px" }} type="number" value={sd.weight}
                                        onChange={e => setPairedEx(p => {
                                          const arr = Array.from({ length: newEx.sets || 3 }, (_, j) => (p.seriesData || [])[j] || { reps: p.reps || 10, weight: p.weight || 0 });
                                          arr[i] = { ...arr[i], weight: Number(e.target.value) };
                                          return { ...p, seriesData: arr };
                                        })} />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* TERCER EJERCICIO — solo para triserie */}
                            {newEx.method === "triserie" && (
                              <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 12, marginTop: 4 }}>
                                <div style={{ fontSize: 11, color: METHODS["triserie"].color, fontWeight: 700, marginBottom: 10 }}>3️⃣ Tercer ejercicio</div>

                                {thirdEx.exercise ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0d0d0d", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                                    {thirdEx.imageUrl && (
                                      <div style={{ width: 32, height: 32, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                                        <img src={thirdEx.imageUrl} alt={thirdEx.exercise} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                      </div>
                                    )}
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#5BB8F5" }}>✓ {thirdEx.exercise}</span>
                                    <button onClick={() => { setThirdEx({ exercise: "", reps: 10, weight: 0, imageUrl: null, seriesData: [] }); setShowThirdLibrary(false); }}
                                      style={{ background: "none", border: "none", color: "#6B91BB", cursor: "pointer", fontSize: 16 }}>✕</button>
                                  </div>
                                ) : (
                                  <>
                                    <button onClick={() => setShowThirdLibrary(!showThirdLibrary)}
                                      style={{ ...S.btnSecondary, width: "100%", textAlign: "center", marginBottom: 8, fontSize: 12 }}>
                                      {showThirdLibrary ? "✕ Cerrar" : "📚 Elegir de la biblioteca"}
                                    </button>
                                    {showThirdLibrary && (
                                      <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                                        <input style={{ ...S.input, marginBottom: 8, fontSize: 12 }} placeholder="Buscar ejercicio..." value={thirdLibraryFilter}
                                          onChange={e => setThirdLibraryFilter(e.target.value)} />
                                        <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                                          {filterExercisesForDay(EXERCISE_LIBRARY, selectedStudent?.dayNames?.[selectedDay])
                                            .filter(e =>
                                            e.name.toLowerCase().includes(thirdLibraryFilter.toLowerCase()) ||
                                            e.muscle.toLowerCase().includes(thirdLibraryFilter.toLowerCase())
                                          ).map(libEx => (
                                            <div key={libEx.name} onClick={() => { setThirdEx(p => ({ ...p, exercise: libEx.name, imageUrl: libEx.imageUrl })); setShowThirdLibrary(false); setThirdLibraryFilter(""); }}
                                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", borderBottom: "1px solid #1a1a1a", cursor: "pointer" }}>
                                              <div style={{ width: 28, height: 28, borderRadius: 5, overflow: "hidden", flexShrink: 0, background: "#0A1225" }}>
                                                <img src={libEx.imageUrl} alt={libEx.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                                              </div>
                                              <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600 }}>{libEx.name}</div>
                                                <div style={{ fontSize: 10, color: "#6B91BB" }}>{libEx.muscle}</div>
                                              </div>
                                              <span style={{ color: "#5BB8F5", fontSize: 16 }}>+</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <input style={{ ...S.input, fontSize: 12 }} placeholder="O escribí el nombre manualmente" value={thirdEx.exercise}
                                      onChange={e => setThirdEx(p => ({ ...p, exercise: e.target.value }))} />
                                  </>
                                )}

                                {/* Series del tercer ejercicio */}
                                <div style={{ marginTop: 10 }}>
                                  <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 8 }}>SERIES · REPS · KG</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr", gap: 6, marginBottom: 4 }}>
                                    <div />
                                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>REPS</div>
                                    <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, textAlign: "center" }}>KG</div>
                                  </div>
                                  {Array.from({ length: newEx.sets || 3 }).map((_, i) => {
                                    const sd = (thirdEx.seriesData || [])[i] || { reps: 10, weight: 0 };
                                    return (
                                      <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr", gap: 6, alignItems: "center", marginBottom: 6 }}>
                                        <div style={{ background: "#5BB8F522", color: "#5BB8F5", borderRadius: 5, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{i + 1}</div>
                                        <input style={{ ...S.input, textAlign: "center", padding: "7px 6px" }} type="number" value={sd.reps}
                                          onChange={e => setThirdEx(p => {
                                            const arr = Array.from({ length: newEx.sets || 3 }, (_, j) => (p.seriesData || [])[j] || { reps: 10, weight: 0 });
                                            arr[i] = { ...arr[i], reps: Number(e.target.value) };
                                            return { ...p, seriesData: arr };
                                          })} />
                                        <input style={{ ...S.input, textAlign: "center", padding: "7px 6px" }} type="number" value={sd.weight}
                                          onChange={e => setThirdEx(p => {
                                            const arr = Array.from({ length: newEx.sets || 3 }, (_, j) => (p.seriesData || [])[j] || { reps: 10, weight: 0 });
                                            arr[i] = { ...arr[i], weight: Number(e.target.value) };
                                            return { ...p, seriesData: arr };
                                          })} />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {newEx.method === "dropset" && (
                          <div>
                            <div style={S.sectionTitle}>¿CUÁNTAS VECES SE REPITE?</div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                              {[1,2,3,4].map(n => (
                                <button key={n} onClick={() => setNewEx(p => ({ ...p, sets: n }))}
                                  style={{ flex: 1, padding: "8px 0", background: newEx.sets === n ? "#5BB8F5" : "#0B1428", color: newEx.sets === n ? "#000" : "#B8D4F0", border: `1px solid ${newEx.sets === n ? "#5BB8F5" : "#0F1C35"}`, borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                              ))}
                            </div>
                            <div style={S.sectionTitle}>CANTIDAD DE DROPS</div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                              {[2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => { setNewEx(p => ({ ...p, drops: n })); setDropDetails(Array.from({ length: n }, (_, i) => dropDetails[i] || { weight: 0, reps: 10 })); }}
                                  style={{ flex: 1, padding: "8px 0", background: newEx.drops === n ? "#fb923c" : "#0B1428", color: newEx.drops === n ? "#000" : "#B8D4F0", border: `1px solid ${newEx.drops === n ? "#fb923c" : "#0F1C35"}`, borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                              ))}
                            </div>
                            {newEx.drops > 0 && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {dropDetails.slice(0, newEx.drops).map((drop, i) => (
                                  <div key={i} style={{ background: "#0d0d0d", border: "1px solid #fb923c22", borderRadius: 8, padding: 10 }}>
                                    <div style={{ fontSize: 11, color: "#fb923c", marginBottom: 6, fontWeight: 700 }}>📉 Drop {i + 1}</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                      <div><div style={S.sectionTitle}>KG</div><input style={S.input} type="number" value={drop.weight} onChange={e => setDropDetails(prev => prev.map((d, j) => j === i ? { ...d, weight: Number(e.target.value) } : d))} /></div>
                                      <div><div style={S.sectionTitle}>REPS</div><input style={S.input} type="number" value={drop.reps} onChange={e => setDropDetails(prev => prev.map((d, j) => j === i ? { ...d, reps: Number(e.target.value) } : d))} /></div>
                                    </div>
                                  </div>
                                ))}
                                {(newEx.sets || 1) > 1 && (
                                  <div style={{ background: "#fb923c11", border: "1px solid #fb923c22", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#fb923c" }}>
                                    🔁 Se repite <strong>{newEx.sets} veces</strong>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    </>)}
                    <button style={S.btn} onClick={() => {
                      const name = newEx.exercise || customName;
                      if (!name) return;
                      const groupKey = newEx.methodGroup || (
                        (newEx.method === "biserie" || newEx.method === "triserie" )
                          ? `grp_${Date.now()}` : null
                      );
                      const toAdd = [{ id: Date.now(), ...newEx, exercise: name, dayIndex: selectedDay, methodGroup: groupKey, dropDetails: newEx.method === "dropset" ? dropDetails.slice(0, newEx.drops || 0) : null }];
                      if ((newEx.method === "biserie" || newEx.method === "triserie" ) && pairedEx.exercise) {
                        toAdd.push({ id: Date.now() + 1, exercise: pairedEx.exercise, sets: newEx.sets, reps: pairedEx.reps, weight: pairedEx.weight, seriesData: pairedEx.seriesData?.length ? pairedEx.seriesData : [], type: "fuerza", duration: null, method: newEx.method, methodGroup: groupKey, tempo: null, drops: null, imageUrl: pairedEx.imageUrl, imageCustom: null, dropDetails: null, dayIndex: selectedDay });
                      }
                      if (newEx.method === "triserie" && thirdEx.exercise) {
                        toAdd.push({ id: Date.now() + 2, exercise: thirdEx.exercise, sets: newEx.sets, reps: thirdEx.reps, weight: thirdEx.weight, seriesData: thirdEx.seriesData?.length ? thirdEx.seriesData : [], type: "fuerza", duration: null, method: "triserie", methodGroup: groupKey, tempo: null, drops: null, imageUrl: thirdEx.imageUrl, imageCustom: null, dropDetails: null, dayIndex: selectedDay });
                      }
                      setRoutines(prev => ({ ...prev, [selectedStudent.id]: [...(prev[selectedStudent.id] || []), ...toAdd] }));
                      setNewEx({ exercise: "", sets: 3, reps: 10, weight: 0, type: "fuerza", duration: 20, method: null, methodGroup: null, tempo: null, drops: null, imageUrl: null, imageCustom: null, seriesData: [] });
                      setCustomName("");
                      setPairedEx({ exercise: "", reps: 10, weight: 0, imageUrl: null, seriesData: [] });
                      setThirdEx({ exercise: "", reps: 10, weight: 0, imageUrl: null, seriesData: [] });
                      setShowThirdLibrary(false); setThirdLibraryFilter("");
                      setShowPairedLibrary(false);
                      setPairedLibraryFilter("");
                      setDropDetails([{ weight: 0, reps: 10 }, { weight: 0, reps: 10 }]);
                    }}>+ Agregar a {days[selectedDay] || `Día ${selectedDay + 1}`}</button>
                  </div>
                </>
              );
            })()}

            {/* PROGRESS */}
            {activeTab === "progress" && (
              <>
                {studentRoutine.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>EVOLUCIÓN</div>
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        {studentRoutine.map((ex) => <button key={ex.id} onClick={() => setSelectedExercise(ex.exercise)} style={selectedExercise === ex.exercise ? S.btn : S.btnSecondary}>{ex.exercise}</button>)}
                      </div>
                      {selectedExercise && <MiniChart data={studentProgress} exercise={selectedExercise} />}
                    </div>
                  </>
                )}
                <div style={S.sectionTitle}>REGISTRAR SESIÓN</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <select style={S.input} value={newProgress.exercise} onChange={(e) => setNewProgress((p) => ({ ...p, exercise: e.target.value }))}>
                    <option value="">Seleccionar ejercicio</option>
                    {studentRoutine.map((ex) => <option key={ex.id} value={ex.exercise}>{ex.exercise}</option>)}
                  </select>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><div style={S.sectionTitle}>PESO (KG)</div><input style={S.input} type="number" value={newProgress.weight} onChange={(e) => setNewProgress((p) => ({ ...p, weight: Number(e.target.value) }))} /></div>
                    <div><div style={S.sectionTitle}>REPS</div><input style={S.input} type="number" value={newProgress.reps} onChange={(e) => setNewProgress((p) => ({ ...p, reps: Number(e.target.value) }))} /></div>
                  </div>
                  <button style={S.btn} onClick={addProgress}>💾 Guardar</button>
                </div>
                {studentProgress.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>HISTORIAL</div>
                    {[...studentProgress].reverse().slice(0, 8).map((p, i) => (
                      <div key={i} style={S.exRow}>
                        <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.exercise}</div><div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date}</div></div>
                        <div style={{ display: "flex", gap: 6 }}><span style={S.accentBadge}>{p.weight}kg</span><span style={S.badge}>{p.reps} reps</span></div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* NUTRITION - COACH VIEW */}
            {activeTab === "nutrition" && (() => {
              const st = selectedStudent;
              const m = st.metrics || { weight: 70, height: 170 };
              const gender = st.gender || "hombre";
              const goal = st.goal;
              const age = st.age || 25;
              const bmr = gender === "mujer"
                ? 10 * (m.weight||70) + 6.25 * (m.height||170) - 5 * age - 161
                : 10 * (m.weight||70) + 6.25 * (m.height||170) - 5 * age + 5;
              const tdee = Math.round(bmr * 1.375);
              const calories = goal === "perdida" ? tdee - 400 : tdee + 300;
              const protein = Math.round((m.weight||70) * 2);
              const fat = Math.round((calories * 0.25) / 9);
              const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
              const water = (((m.weight||70) * 35) / 1000).toFixed(1);
              const waterTraining = (((m.weight||70) * 35 + 500) / 1000).toFixed(1);

              const nutPlans = {
                "hombre_perdida": [
                  { D: "Desayuno", food: "4 claras + 1 huevo entero revueltos + arepa integral" }, { D: "Media mañana", food: "Manzana + puñado de almendras" }, { D: "Almuerzo", food: "Pechuga grillada 200g + arroz integral ½ taza + ensalada" }, { D: "Merienda", food: "Atún en agua + tostadas integrales" }, { D: "Cena", food: "Salmón 150g + verduras al vapor" },
                  { D: "Desayuno", food: "Avena con proteína en polvo + frutos rojos" }, { D: "Media mañana", food: "Yogur griego sin azúcar + nueces" }, { D: "Almuerzo", food: "Carne molida magra 200g + papa cocida + ensalada" }, { D: "Merienda", food: "Huevo duro × 2 + pepino" }, { D: "Cena", food: "Pollo al horno 200g + brócoli + batata" },
                  { D: "Desayuno", food: "Tostadas integrales + aguacate + huevo pochado" }, { D: "Media mañana", food: "Proteína en polvo + agua" }, { D: "Almuerzo", food: "Tilapia 200g + quinoa + vegetales" }, { D: "Merienda", food: "Queso cottage + zanahoria" }, { D: "Cena", food: "Carne de res magra 150g + espárragos + ensalada" },
                ],
                "mujer_perdida": [
                  { D: "Desayuno", food: "2 claras + 1 huevo + fruta fresca" }, { D: "Media mañana", food: "Yogur griego + frutos rojos" }, { D: "Almuerzo", food: "Pechuga 150g + ensalada grande + limón" }, { D: "Merienda", food: "Puñado de almendras + manzana" }, { D: "Cena", food: "Pescado blanco 150g + verduras salteadas" },
                  { D: "Desayuno", food: "Avena con leche descremada + canela" }, { D: "Media mañana", food: "Atún + tostada integral" }, { D: "Almuerzo", food: "Pollo grillado 150g + arroz integral ½ taza + ensalada" }, { D: "Merienda", food: "Huevo duro + pepino + zanahoria" }, { D: "Cena", food: "Salmón 120g + brócoli + ½ batata" },
                  { D: "Desayuno", food: "Proteína en polvo + leche + banana" }, { D: "Media mañana", food: "Queso cottage + kiwi" }, { D: "Almuerzo", food: "Carne magra 150g + quinoa + vegetales" }, { D: "Merienda", food: "Nueces + pera" }, { D: "Cena", food: "Pollo al horno 150g + espárragos + ensalada" },
                ],
                "hombre_musculo": [
                  { D: "Desayuno", food: "4 huevos revueltos + 2 tostadas integrales + jugo natural" }, { D: "Media mañana", food: "Batido proteico + banana + mantequilla de maní" }, { D: "Almuerzo", food: "Pechuga 250g + arroz 1 taza + ensalada + aguacate" }, { D: "Merienda", food: "Yogur griego + granola + frutos secos" }, { D: "Cena", food: "Carne magra 200g + papa + vegetales" },
                  { D: "Desayuno", food: "Avena 100g + proteína en polvo + frutas + miel" }, { D: "Media mañana", food: "Pan integral + atún + queso" }, { D: "Almuerzo", food: "Salmón 200g + arroz integral + brócoli" }, { D: "Merienda", food: "Huevos duros ×3 + aguacate" }, { D: "Cena", food: "Pollo 250g + batata + ensalada" },
                  { D: "Desayuno", food: "Tostadas + aguacate + 3 huevos + jugo" }, { D: "Media mañana", food: "Proteína + leche + banana" }, { D: "Almuerzo", food: "Res 250g + pasta integral + salsa de tomate" }, { D: "Merienda", food: "Queso + crackers integrales + nueces" }, { D: "Cena", food: "Pollo grillado 200g + arroz + vegetales" },
                ],
                "mujer_musculo": [
                  { D: "Desayuno", food: "3 claras + 1 huevo + tostada integral + fruta" }, { D: "Media mañana", food: "Yogur griego + granola + miel" }, { D: "Almuerzo", food: "Pollo 180g + arroz integral ¾ taza + ensalada" }, { D: "Merienda", food: "Batido proteico + banana" }, { D: "Cena", food: "Salmón 150g + batata + brócoli" },
                  { D: "Desayuno", food: "Avena + proteína en polvo + frutas" }, { D: "Media mañana", food: "Queso cottage + frutos rojos + nueces" }, { D: "Almuerzo", food: "Carne magra 180g + arroz + ensalada" }, { D: "Merienda", food: "Huevo duro ×2 + fruta" }, { D: "Cena", food: "Pollo al horno 180g + quinoa + vegetales" },
                  { D: "Desayuno", food: "Tostadas integrales + aguacate + 2 huevos" }, { D: "Media mañana", food: "Proteína + leche descremada" }, { D: "Almuerzo", food: "Tilapia 180g + pasta integral + vegetales" }, { D: "Merienda", food: "Yogur griego + almendras" }, { D: "Cena", food: "Res magra 150g + papa cocida + ensalada" },
                ],
              };

              const planKey = `${gender === "mujer" ? "mujer" : "hombre"}_${goal === "perdida" ? "perdida" : "musculo"}`;
              const planRows = nutPlans[planKey] || nutPlans["hombre_perdida"];
              const dayMeals = planRows.slice(activeNutDay * 5, activeNutDay * 5 + 5);
              const foodAllergies = st.health?.foodAllergies;
              const avoidedFoods = st.health?.avoidedFoods;

              return (
                <>
                  {(foodAllergies || avoidedFoods) && (
                    <div style={{ background: "#D4A01722", border: "1px solid #D4A01766", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#D4A017" }}>
                      ⚠️ Recordá que este plan no incluye restricciones: {[foodAllergies, avoidedFoods].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  <div style={{ ...S.card, cursor: "default" }}>
                    <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Resumen Calórico</div>
                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 40, fontWeight: 900, color: "#B8D4F0", fontFamily: "'Barlow Condensed', sans-serif" }}>{calories.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "#6B91BB" }}>kcal/día</div>
                      <div style={{ fontSize: 11, color: goal === "perdida" ? "#FF8C6B" : "#A8FFD8", marginTop: 4 }}>
                        {goal === "perdida" ? "Déficit -400 kcal" : "Superávit +300 kcal"}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#A8FFD8" }}>{protein}g</div>
                        <div style={{ fontSize: 10, color: "#6B91BB" }}>Proteína</div>
                      </div>
                      <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#5BB8F5" }}>{carbs}g</div>
                        <div style={{ fontSize: 10, color: "#6B91BB" }}>Carbos</div>
                      </div>
                      <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 0", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#FF9E80" }}>{fat}g</div>
                        <div style={{ fontSize: 10, color: "#6B91BB" }}>Grasas</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#5BB8F5", textAlign: "center" }}>💧 {water}L mínimo · {waterTraining}L en días de entreno</div>
                  </div>
                  {goal === "perdida" && (
                    <div style={{ background: "#ff444411", border: "1px solid #ff444433", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#ff6666", fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>❌ EVITAR</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {["Gaseosas", "Jugos de caja", "Agua de panela", "Bebidas azucaradas", "Avena en caja", "Yogures con azúcar", "Bebidas energéticas", "Alcohol"].map(item => (
                          <span key={item} style={{ background: "#ff444422", color: "#ff8888", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ ...S.card, cursor: "default" }}>
                    <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10 }}>PLAN ALIMENTARIO</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                      {[0, 1, 2].map(d => (
                        <button key={d} onClick={() => setActiveNutDay(d)}
                          style={{ flex: 1, background: activeNutDay === d ? "#5BB8F5" : "#0A1225", color: activeNutDay === d ? "#070C18" : "#7AA0C8", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: activeNutDay === d ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                          Día {d + 1}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {dayMeals.map((meal, i) => (
                        <div key={i} style={{ background: "#0A1225", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "#5BB8F5", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{meal.D.toUpperCase()}</div>
                          <div style={{ fontSize: 13, color: "#B8D4F0", lineHeight: 1.4 }}>{meal.food}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {goal === "perdida" && (
                    <div style={{ border: `1px solid ${nutCheatOpen ? "#D4A017" : "#D4A01744"}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
                      <button onClick={() => setNutCheatOpen(p => !p)}
                        style={{ width: "100%", background: nutCheatOpen ? "#D4A01711" : "#0B1428", border: "none", color: "#D4A017", padding: "12px 16px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        🍕 Comida trampa
                        <span>{nutCheatOpen ? "▲" : "▼"}</span>
                      </button>
                      {nutCheatOpen && (
                        <div style={{ padding: "14px 16px", background: "#0B1428", display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ fontSize: 13, color: "#B8D4F0" }}>• 1 vez por semana máximo</div>
                          <div style={{ fontSize: 13, color: "#B8D4F0" }}>• Reemplaza UNA sola comida del día</div>
                          <div style={{ fontSize: 12, color: "#D4A017", fontWeight: 700, lineHeight: 1.5 }}>CONDICIÓN: ese día debés hacer entrenamiento de PIERNA completo, o mínimo 1 hora de cardio continuo</div>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ ...S.card, cursor: "default" }}>
                    <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 8 }}>HIDRATACIÓN</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#5BB8F5" }}>{water}L</div>
                        <div style={{ fontSize: 10, color: "#6B91BB" }}>Mínimo diario</div>
                      </div>
                      <div style={{ background: "#0A1225", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#A8FFD8" }}>{waterTraining}L</div>
                        <div style={{ fontSize: 10, color: "#6B91BB" }}>Días de entreno</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#6B91BB", textAlign: "center", lineHeight: 1.6 }}>
                      Tomá un vaso al despertar · uno antes de cada comida · uno antes de dormir
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#456E9E", textAlign: "center", padding: "8px 0 4px", lineHeight: 1.5 }}>
                    Este plan es una guía general orientativa. Consultá con un nutricionista certificado.
                  </div>
                </>
              );
            })()}

            {/* BILLING - COACH VIEW */}
            {activeTab === "billing" && (() => {
              const stPayments = payments[selectedStudent.id] || [];
              const stClasses = classes[selectedStudent.id] || [];
              const billStatus = selectedStudent.billing ? getBillingStatus(stPayments, stClasses) : null;
              const billing = selectedStudent.billing;
              return (
                <>
                  {/* Estado */}
                  {billStatus ? (
                    <div style={{ ...S.card, cursor: "default", border: `1px solid ${billStatus.color}44` }}>
                      <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>ESTADO DE CUENTA</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: billStatus.color }}>{billStatus.label}</div>
                          <div style={{ fontSize: 11, color: "#6B91BB", marginTop: 4 }}>{billStatus.totalDone} clases tomadas · {billStatus.totalPaid} pagas</div>
                        </div>
                        <div style={{ fontSize: 32 }}>{billStatus.status === "al_dia" ? "✅" : billStatus.status === "por_vencer" ? "⚠️" : "🔴"}</div>
                      </div>
                      <div style={{ height: 7, background: "#0A1225", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((billStatus.totalDone / Math.max(billStatus.totalPaid, 1)) * 100, 100)}%`, background: billStatus.color, borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#527BA8", marginTop: 5 }}>{billStatus.totalDone} / {billStatus.totalPaid} clases usadas</div>
                    </div>
                  ) : (
                    <div style={{ ...S.card, cursor: "default", textAlign: "center", color: "#6B91BB", padding: 24 }}>Sin plan de pago configurado aún.</div>
                  )}

                  {/* Config plan */}
                  {!billingEdit ? (
                    <>
                      {billing && (
                        <div style={{ ...S.card, cursor: "default" }}>
                          <div style={{ fontSize: 10, color: "#6B91BB", letterSpacing: 2, marginBottom: 10 }}>PLAN CONFIGURADO</div>
                          {billing.mode === "paquete"
                            ? <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 12, color: "#7AA0C8" }}>Paquete</div><div style={{ fontWeight: 700 }}>{billing.packageSize} clases</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#7AA0C8" }}>Precio</div><div style={{ fontWeight: 700, color: "#5BB8F5" }}>${billing.pricePerPackage?.toLocaleString()}</div></div></div>
                            : <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 12, color: "#7AA0C8" }}>Por clase</div><div style={{ fontWeight: 700 }}>Individual</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#7AA0C8" }}>Precio/clase</div><div style={{ fontWeight: 700, color: "#5BB8F5" }}>${billing.pricePerClass?.toLocaleString()}</div></div></div>}
                        </div>
                      )}
                      <button style={{ ...S.btnSecondary, width: "100%", textAlign: "center" }}
                        onClick={() => { setBillingForm(billing ? { mode: billing.mode, packageSize: billing.packageSize || 8, pricePerPackage: billing.pricePerPackage || "", pricePerClass: billing.pricePerClass || "" } : { mode: "paquete", packageSize: 8, pricePerPackage: "", pricePerClass: "" }); setBillingEdit(true); }}>
                        ⚙️ {billing ? "Editar plan" : "Configurar plan de pago"}
                      </button>
                    </>
                  ) : (
                    <div style={{ ...S.card, cursor: "default" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#5BB8F5", marginBottom: 12 }}>Configurar plan</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {[["paquete", "Por paquete"], ["individual", "Por clase"]].map(([v, l]) => (
                          <button key={v} onClick={() => setBillingForm((p) => ({ ...p, mode: v }))} style={{ ...billingForm.mode === v ? S.btn : S.btnSecondary, flex: 1, fontSize: 12, padding: "9px 0" }}>{l}</button>
                        ))}
                      </div>
                      {billingForm.mode === "paquete" ? (
                        <>
                          <div style={S.sectionTitle}>CLASES POR PAQUETE</div>
                          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                            {[4, 8, 12, 16].map((n) => (
                              <button key={n} onClick={() => setBillingForm((p) => ({ ...p, packageSize: n }))} style={{ ...billingForm.packageSize === n ? S.btn : S.btnSecondary, padding: "8px 14px", fontSize: 13 }}>{n}</button>
                            ))}
                          </div>
                          <div style={S.sectionTitle}>PRECIO DEL PAQUETE ($)</div>
                          <input style={{ ...S.input, marginBottom: 12 }} type="number" placeholder="ej: 4000" value={billingForm.pricePerPackage} onChange={(e) => setBillingForm((p) => ({ ...p, pricePerPackage: e.target.value }))} />
                        </>
                      ) : (
                        <>
                          <div style={S.sectionTitle}>PRECIO POR CLASE ($)</div>
                          <input style={{ ...S.input, marginBottom: 12 }} type="number" placeholder="ej: 600" value={billingForm.pricePerClass} onChange={(e) => setBillingForm((p) => ({ ...p, pricePerClass: e.target.value }))} />
                        </>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={S.btn} onClick={saveBilling}>Guardar</button>
                        <button style={S.btnSecondary} onClick={() => setBillingEdit(false)}>Cancelar</button>
                      </div>
                    </div>
                  )}

                  {/* Registrar clase */}
                  <div style={S.sectionTitle}>CLASES TOMADAS</div>
                  <div style={{ ...S.card, cursor: "default" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 13, color: "#B8D4F0" }}>{stClasses.length} clase{stClasses.length !== 1 ? "s" : ""} registrada{stClasses.length !== 1 ? "s" : ""}</div>
                      <button style={{ ...S.btn, padding: "8px 14px", fontSize: 12 }} onClick={addClassSession}>+ Clase de hoy</button>
                    </div>
                    {[...stClasses].reverse().slice(0, 8).map((c) => (
                      <div key={c.id} style={S.exRow}>
                        <div style={{ fontSize: 13, color: "#ccc" }}>📅 {c.date}</div>
                        <button onClick={() => removeClassSession(c.id)} style={{ background: "none", border: "none", color: "#456E9E", cursor: "pointer", fontSize: 16 }}>✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Registrar pago */}
                  <div style={S.sectionTitle}>REGISTRAR PAGO</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div><div style={S.sectionTitle}>MONTO ($)</div><input style={S.input} type="number" placeholder="ej: 4000" value={newPayment.amount} onChange={(e) => setNewPayment((p) => ({ ...p, amount: e.target.value }))} /></div>
                      <div><div style={S.sectionTitle}>CLASES</div><input style={S.input} type="number" placeholder="ej: 8" value={newPayment.classesCount} onChange={(e) => setNewPayment((p) => ({ ...p, classesCount: e.target.value }))} /></div>
                    </div>
                    <input style={S.input} placeholder="Nota (opcional, ej: Abril)" value={newPayment.note} onChange={(e) => setNewPayment((p) => ({ ...p, note: e.target.value }))} />
                    <button style={S.btn} onClick={addPayment}>💰 Registrar pago</button>
                  </div>

                  {/* Historial pagos */}
                  {stPayments.length > 0 && (
                    <>
                      <div style={S.sectionTitle}>HISTORIAL DE PAGOS</div>
                      {[...stPayments].reverse().map((p) => (
                        <div key={p.id} style={S.exRow}>
                          <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.note || "Pago"}</div><div style={{ fontSize: 11, color: "#6B91BB" }}>{p.date} · {p.classesCount} clases</div></div>
                          <span style={S.accentBadge}>${p.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              );
            })()}

            {/* AI */}
            {activeTab === "ai" && (
              <>
                <div style={{ ...S.card, cursor: "default", textAlign: "center" }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Plan con IA para {selectedStudent.firstName}</div>
                  <div style={{ fontSize: 12, color: "#7AA0C8", marginBottom: 16 }}>
                    {selectedStudent.metrics ? "Genero un plan basado en su BMI, composición corporal y objetivo." : "⚠️ Primero agrega los datos corporales del alumno."}
                  </div>
                  <button style={{ ...S.btn, opacity: selectedStudent.metrics ? 1 : 0.4 }} onClick={fetchAIPlan} disabled={aiLoading || !selectedStudent.metrics}>
                    {aiLoading ? "Generando..." : "Generar plan"}
                  </button>
                </div>
                {(aiLoading || aiPlan) && (
                  <div style={S.aiBox}>
                    <div style={{ fontSize: 10, color: "#5BB8F5", letterSpacing: 2, marginBottom: 10 }}>PLAN GENERADO POR IA</div>
                    {aiLoading ? <div style={{ color: "#6B91BB", fontSize: 13 }}>⏳ Analizando datos...</div>
                      : <div style={{ fontSize: 13, lineHeight: 1.8, color: "#ddd", whiteSpace: "pre-wrap" }}>{aiPlan}</div>}
                  </div>
                )}
              </>
            )}

            {/* ELIMINAR ALUMNO */}
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #1e1e1e" }}>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  style={{ width: "100%", background: "transparent", border: "1px solid #ff444433", color: "#ff5555", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  🗑️ Eliminar alumno
                </button>
              ) : (
                <div style={{ background: "#ff444411", border: "1px solid #ff444444", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13, color: "#ff6666", fontWeight: 700, marginBottom: 6 }}>¿Eliminar a {fullName(selectedStudent)}?</div>
                  <div style={{ fontSize: 11, color: "#ff444488", marginBottom: 14 }}>Se borrarán todos sus datos, rutinas y pagos. No se puede deshacer.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => {
                      setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
                      setRoutines(prev => { const n = { ...prev }; delete n[selectedStudent.id]; return n; });
                      setProgressData(prev => { const n = { ...prev }; delete n[selectedStudent.id]; return n; });
                      setPayments(prev => { const n = { ...prev }; delete n[selectedStudent.id]; return n; });
                      setClasses(prev => { const n = { ...prev }; delete n[selectedStudent.id]; return n; });
                      setWeightLog(prev => { const n = { ...prev }; delete n[selectedStudent.id]; return n; });
                      setConfirmDelete(false);
                      setView("dashboard");
                    }}
                      style={{ flex: 1, background: "#ff4444", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Sí, eliminar
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      style={{ flex: 1, background: "#0B1428", color: "#B8D4F0", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 0", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 32px" }}>
        <button style={{ ...S.btnDanger, fontSize: 13, padding: "10px 40px" }} onClick={onLogout}>Salir</button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [previewStudent, setPreviewStudent] = useState(null);

  // localStorage session helpers
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("crBodylabUser", JSON.stringify(user));
  };
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("crBodylabUser");
  };
  const [students, setStudents] = useState([]);
  const [routines, setRoutines] = useState({});
  const [progressData, setProgressData] = useState({});
  const [payments, setPayments] = useState({});
  const [classes, setClasses] = useState({});
  const [myLibrary, setMyLibrary] = useState([]);
  const [weightLog, setWeightLog] = useState({});
  const [dbLoaded, setDbLoaded] = useState(false);

  const loaded = useRef(false);
  const prevStudentIds = useRef(new Set());

  // ── Load session from localStorage on mount ───────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crBodylabUser");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) setCurrentUser(parsed);
      }
    } catch (e) {}
  }, []);

  // ── Load all data from backend on mount ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [studentsData, libData] = await Promise.all([
          fetch(`${API}/students`).then(r => r.json()),
          fetch(`${API}/library`).then(r => r.json()),
        ]);
        if (!Array.isArray(studentsData)) return;

        const perStudent = await Promise.all(
          studentsData.map(s => Promise.all([
            fetch(`${API}/routines/${s.id}`).then(r => r.json()),
            fetch(`${API}/payments/${s.id}`).then(r => r.json()),
            fetch(`${API}/classes/${s.id}`).then(r => r.json()),
            fetch(`${API}/weight-log/${s.id}`).then(r => r.json()),
          ]))
        );

        const rMap = {}, pMap = {}, cMap = {}, wMap = {};
        studentsData.forEach((s, i) => {
          const [r, p, c, w] = perStudent[i];
          rMap[s.id] = r; pMap[s.id] = p; cMap[s.id] = c; wMap[s.id] = w;
        });

        setStudents(studentsData);
        setMyLibrary(Array.isArray(libData) ? libData : []);
        setRoutines(rMap);
        setPayments(pMap);
        setClasses(cMap);
        setWeightLog(wMap);
        prevStudentIds.current = new Set(studentsData.map(s => s.id));
        loaded.current = true;
        setDbLoaded(true);
      } catch (e) {
        console.error("Error cargando datos:", e);
        // Fallback a datos iniciales si el backend no responde
        setStudents(INITIAL_STUDENTS);
        setRoutines(INITIAL_ROUTINES);
        setPayments(INITIAL_PAYMENTS);
        setClasses(INITIAL_CLASSES);
        setMyLibrary(INITIAL_MY_LIBRARY);
        setWeightLog(INITIAL_WEIGHT_LOG);
        loaded.current = true;
        setDbLoaded(true);
      }
    })();
  }, []);

  // ── Auto-sync students (handles add, update, delete) ─────────────────────
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(async () => {
      const currentIds = new Set(students.map(s => s.id));
      for (const id of prevStudentIds.current) {
        if (!currentIds.has(id)) {
          await fetch(`${API}/students/${id}`, { method: "DELETE" }).catch(() => {});
        }
      }
      await Promise.all(students.map(s =>
        fetch(`${API}/students/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        }).catch(() => {})
      ));
      prevStudentIds.current = currentIds;
    }, 400);
    return () => clearTimeout(t);
  }, [students]);

  // ── Auto-sync routines ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      Object.entries(routines).forEach(([id, data]) =>
        fetch(`${API}/routines/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {})
      );
    }, 400);
    return () => clearTimeout(t);
  }, [routines]);

  // ── Auto-sync payments ────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      Object.entries(payments).forEach(([id, data]) =>
        fetch(`${API}/payments/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {})
      );
    }, 400);
    return () => clearTimeout(t);
  }, [payments]);

  // ── Auto-sync classes ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      Object.entries(classes).forEach(([id, data]) =>
        fetch(`${API}/classes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {})
      );
    }, 400);
    return () => clearTimeout(t);
  }, [classes]);

  // ── Auto-sync weight log ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      Object.entries(weightLog).forEach(([id, data]) =>
        fetch(`${API}/weight-log/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {})
      );
    }, 400);
    return () => clearTimeout(t);
  }, [weightLog]);

  // ── Auto-sync library ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      fetch(`${API}/library`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(myLibrary),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [myLibrary]);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (!dbLoaded) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0D1B2A 0%, #1B3A5C 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow', sans-serif", color: "#B8D4F0" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>💪</div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>CR BODYLAB</div>
      <div style={{ fontSize: 12, color: "#6B91BB", marginTop: 8 }}>Cargando datos...</div>
    </div>
  );

  if (!currentUser) return <LoginScreen onLogin={handleLogin} students={students} />;

  // Preview mode: coach sees app as a student
  if (previewStudent) return (
    <StudentPortal user={previewStudent} students={students} setStudents={setStudents} routines={routines} setRoutines={setRoutines} progressData={progressData} setProgressData={setProgressData} payments={payments} classes={classes} weightLog={weightLog} setWeightLog={setWeightLog}
      onLogout={() => setPreviewStudent(null)}
      isPreview={true}
    />
  );

  if (currentUser.role === "coach") return <CoachPortal user={currentUser} students={students} setStudents={setStudents} routines={routines} setRoutines={setRoutines} progressData={progressData} setProgressData={setProgressData} payments={payments} setPayments={setPayments} classes={classes} setClasses={setClasses} myLibrary={myLibrary} setMyLibrary={setMyLibrary} weightLog={weightLog} setWeightLog={setWeightLog} setPreviewStudent={setPreviewStudent} onLogout={handleLogout} />;
  return <StudentPortal user={currentUser} students={students} setStudents={setStudents} routines={routines} setRoutines={setRoutines} progressData={progressData} setProgressData={setProgressData} payments={payments} classes={classes} weightLog={weightLog} setWeightLog={setWeightLog} onLogout={handleLogout} />;
}
