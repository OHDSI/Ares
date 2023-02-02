export function padTo2Digits(num: number): string {
  return num.toString().padStart(2, "0");
}

export function getPaddedDate(date: Date, divider: string): string {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join(divider);
}
