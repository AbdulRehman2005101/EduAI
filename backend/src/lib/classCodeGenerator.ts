export function generateClassCode(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let code = "";

  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }

  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)];
  }

  code += letters[Math.floor(Math.random() * letters.length)];

  return code;
}

export function generateSecureClassCode(): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(7);
    window.crypto.getRandomValues(array);
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(array, (byte) => chars[byte % chars.length]).join("");
  } else {
    return generateClassCode();
  }
}

export function isValidClassCode(code: string): boolean {
  return /^[a-z0-9]{7}$/.test(code);
}