export function CheckNewComers(created_at: Date, limit: number) {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - limit);
  return created_at.getTime() < limitDate.getTime();
}
