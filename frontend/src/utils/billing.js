export function getBillingStatus(payments, classes) {
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
