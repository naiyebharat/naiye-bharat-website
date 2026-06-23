export function getSpecialistName(id: string) {
  if (!id) return "Naiye Bharat Specialist";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % 10) + 1;
  return `Naiye Bharat Specialist ${index}`;
}
