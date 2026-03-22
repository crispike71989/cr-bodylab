const BASE = "/api";

const json = (r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

const headers = { "Content-Type": "application/json" };

// Students
export const getStudents = () => fetch(`${BASE}/students`).then(json);
export const addStudent = (data) => fetch(`${BASE}/students`, { method: "POST", headers, body: JSON.stringify(data) }).then(json);
export const updateStudent = (id, data) => fetch(`${BASE}/students/${id}`, { method: "PUT", headers, body: JSON.stringify(data) }).then(json);
export const deleteStudent = (id) => fetch(`${BASE}/students/${id}`, { method: "DELETE" }).then(json);

// Routines
export const getRoutines = (studentId) => fetch(`${BASE}/routines/${studentId}`).then(json);
export const updateRoutines = (studentId, data) => fetch(`${BASE}/routines/${studentId}`, { method: "PUT", headers, body: JSON.stringify(data) }).then(json);

// Payments
export const getPayments = (studentId) => fetch(`${BASE}/payments/${studentId}`).then(json);
export const addPayment = (studentId, data) => fetch(`${BASE}/payments/${studentId}`, { method: "POST", headers, body: JSON.stringify(data) }).then(json);
export const deletePayment = (studentId, paymentId) => fetch(`${BASE}/payments/${studentId}/${paymentId}`, { method: "DELETE" }).then(json);

// Classes
export const getClasses = (studentId) => fetch(`${BASE}/classes/${studentId}`).then(json);
export const addClass = (studentId, data) => fetch(`${BASE}/classes/${studentId}`, { method: "POST", headers, body: JSON.stringify(data) }).then(json);
export const deleteClass = (studentId, classId) => fetch(`${BASE}/classes/${studentId}/${classId}`, { method: "DELETE" }).then(json);

// Weight Log
export const getWeightLog = (studentId) => fetch(`${BASE}/weight-log/${studentId}`).then(json);
export const addWeightEntry = (studentId, data) => fetch(`${BASE}/weight-log/${studentId}`, { method: "POST", headers, body: JSON.stringify(data) }).then(json);
export const updateWeightLog = (studentId, data) => fetch(`${BASE}/weight-log/${studentId}`, { method: "PUT", headers, body: JSON.stringify(data) }).then(json);
export const deleteWeightEntry = (studentId, entryIndex) => fetch(`${BASE}/weight-log/${studentId}/${entryIndex}`, { method: "DELETE" }).then(json);

// Library
export const getLibrary = () => fetch(`${BASE}/library`).then(json);
export const updateLibrary = (data) => fetch(`${BASE}/library`, { method: "PUT", headers, body: JSON.stringify(data) }).then(json);
