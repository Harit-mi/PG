export function normalizeRoomNumber(raw) {
  if (!raw) return "";
  return raw.trim().replace(/\s+/g, " ").toUpperCase();
}

export function getFloorName(roomNumStr) {
  const cleanNum = String(roomNumStr || "").trim().toUpperCase();
  if (cleanNum.startsWith('G') || cleanNum.length <= 2) return "Ground Floor";
  const firstDigit = cleanNum[0];
  if (firstDigit === '1') return "1st Floor";
  if (firstDigit === '2') return "2nd Floor";
  if (firstDigit === '3') return "3rd Floor";
  if (firstDigit === '4') return "4th Floor";
  return `${firstDigit}th Floor`;
}
