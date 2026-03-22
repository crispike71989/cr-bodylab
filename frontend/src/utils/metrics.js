export function calcBMI(weight, height) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#BAD8FF" };
  if (bmi < 25) return { label: "Normal", color: "#A8FFD8" };
  if (bmi < 30) return { label: "Sobrepeso", color: "#fbbf24" };
  return { label: "Obesidad", color: "#ff6b6b" };
}

export function fullName(st) {
  return `${st.firstName} ${st.lastName}`.trim();
}

const MUSCLE_KEYWORDS = {
  pecho: ["Pecho"],
  espalda: ["Espalda", "Espalda baja"],
  "bíceps": ["Bíceps"],
  "tríceps": ["Tríceps"],
  hombro: ["Hombros"],
  pierna: ["Piernas", "Cuádriceps", "Femoral"],
  "cuádricep": ["Cuádriceps", "Piernas"],
  femoral: ["Femoral", "Glúteos"],
  "glúteo": ["Glúteos", "Femoral"],
  core: ["Core"],
  abdomen: ["Core"],
  pantorrilla: ["Pantorrilla"],
  cardio: ["Cardio"],
  push: ["Pecho", "Hombros", "Tríceps"],
  pull: ["Espalda", "Bíceps", "Espalda baja"],
  "full body": ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Piernas", "Cuádriceps", "Femoral", "Glúteos", "Core"],
};

const ALWAYS_SHOW_KEYWORDS = ["Cardio", "Core"];
const ALWAYS_SHOW_NAMES = ["Jumping jacks", "Mountain climbers", "Skipping en step"];

export function getMusclesForDay(dayName) {
  if (!dayName) return null;
  const lower = dayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const muscles = new Set();
  for (const [kw, groups] of Object.entries(MUSCLE_KEYWORDS)) {
    const kwNorm = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lower.includes(kwNorm)) groups.forEach(g => muscles.add(g));
  }
  return muscles.size > 0 ? muscles : null;
}

export function filterExercisesForDay(library, dayName) {
  const muscles = getMusclesForDay(dayName);
  if (!muscles) return library;
  return library.filter(ex => {
    if (ALWAYS_SHOW_KEYWORDS.some(k => ex.muscle?.includes(k))) return true;
    if (ALWAYS_SHOW_NAMES.some(n => ex.name === n)) return true;
    return [...muscles].some(m => ex.muscle?.toLowerCase().includes(m.toLowerCase()));
  });
}
