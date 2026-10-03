const SERIAL_LENGTH = 16;
const LETTER_COUNT = 5;
const DIGITS = "0123456789";
const LETTERS = "ABCDEF";

/** Unbiased random integer in [0, max) using Web Crypto. */
function randomInt(max: number) {
  const range = 0x100000000;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

/** A new stamp serial such as "PB-LHR-280D10DB8969D1F4" (5 random letters + 11 random digits, shuffled). */
export function generateSerial() {
  // Pick which 5 of the 16 positions will be letters (partial Fisher-Yates shuffle).
  const positions = Array.from({ length: SERIAL_LENGTH }, (_, i) => i);
  for (let i = 0; i < LETTER_COUNT; i++) {
    const j = i + randomInt(SERIAL_LENGTH - i);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const letterPositions = new Set(positions.slice(0, LETTER_COUNT));

  let random = "";
  for (let i = 0; i < SERIAL_LENGTH; i++) {
    const set = letterPositions.has(i) ? LETTERS : DIGITS;
    random += set[randomInt(set.length)];
  }
  return `PB-LHR-${random}`;
}

/** `count` distinct new serials, none of which are in `exclude`. */
export function generateSerials(count: number, exclude: Iterable<string> = []) {
  const skip = new Set(exclude);
  const out = new Set<string>();
  while (out.size < count) {
    const s = generateSerial();
    if (!skip.has(s)) out.add(s);
  }
  return [...out];
}