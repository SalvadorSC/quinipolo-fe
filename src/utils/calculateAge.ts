export function calculateAge(input: string | Date): number {
  const birthDate = typeof input === "string" ? new Date(input) : input;
  if (isNaN(birthDate.getTime())) {
    throw new Error("Invalid date");
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}
