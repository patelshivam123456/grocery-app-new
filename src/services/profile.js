export function profileInitials(name) {
  return String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => [...part][0]).join("").toUpperCase();
}

export function formatBirthdayInput(value) {
  return value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
}

export function birthdayError(value, today = new Date()) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return "Enter your birthday as DD/MM/YYYY.";
  const [, day, month, year] = match.map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (year < 1 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "Enter a valid calendar date.";
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return date > currentDay ? "Your birthday cannot be in the future." : "";
}
