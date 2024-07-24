/* eslint-disable import/prefer-default-export */
function toHex(str: string) {
  let result = '';
  for (let i = 0; i < str?.length; i += 1) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

/**
 * generateHash
 * @param str - The string to hash
 */
function generateHash(str: string): number {
  let hash = 0;

  /* eslint no-bitwise: ["error", { "allow": ["<<", "&="] }] */
  for (let i = 0; i < str?.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  return hash;
}

/**
 * stringToHslColor
 *
 * @param str - The string to hash
 * @param saturation - saturation of result color (0 - 100)
 * @param lightness - lightness of result color (0 - 100)
 */
function stringToHslColor(str: string, saturation: number, lightness: number): string {
  const hash = generateHash(str!);
  const hue = hash % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getAccountGradient(text: string): string[] {
  const pubKeyLikeString = toHex(text);

  const bg = stringToHslColor(text, 50, 60);
  const bg2 = stringToHslColor(pubKeyLikeString, 50, 60);
  const bg3 = stringToHslColor(`${pubKeyLikeString}__${text}`, 50, 60);

  return [bg3, bg2, bg];
}
