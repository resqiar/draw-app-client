export function checkSize(size: string) {
  const numberFormat = Number(size);
  if(isNaN(numberFormat)) return 20;
  if (numberFormat < 0) return 0;
  if (numberFormat > 100) return 100;
  return true;
}
