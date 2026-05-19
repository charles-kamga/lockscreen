/**
 * Calcule le nombre de secousses requis en fonction du jour de la semaine.
 * Formule : (jour² mod 5)
 * Vendredi (jour 5) : retourne null (accès libre)
 * @param date Optionnel, par défaut la date actuelle
 * @returns Le nombre de secousses requis, ou null si accès libre
 */
export const calculateRequiredShakes = (date: Date = new Date()): number | null => {
  const day = date.getDay();
  const adjustedDay = day === 0 ? 7 : day;

  if (adjustedDay === 5) {
    return null;
  }

  return Math.pow(adjustedDay, 2) % 5;
};
