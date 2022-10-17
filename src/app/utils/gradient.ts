function toHex(str: string) {
  let result = '';
  for (let i = 0; i < str?.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

export function useAccountGradient(text: string): string[] {
  const pubKeyLikeString = toHex(text);

  const bg = stringToHslColor(text, 50, 60);
  let bg2 = stringToHslColor(pubKeyLikeString, 50, 60);
  const bg3 = stringToHslColor(pubKeyLikeString + '__' + text, 50, 60);

  return [bg3, bg2, bg];
}

/**
 * stringToHslColor
 *
 * @param str - The string to hash
 * @param saturation - saturation of result color (0 - 100)
 * @param lightness - lightness of result color (0 - 100)
 */
export function stringToHslColor(str: string, saturation: number, lightness: number): string {
  let hash = generateHash(str!);
  const hue = hash % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * generateHash
 * @param str - The string to hash
 */

export function generateHash(str: string): number {
  let hash = 0;

  for (let i = 0; i < str?.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return hash;
}
