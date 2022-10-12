
  /**
 * get ticker from name
 */
export function getTicker(name: string) {
    if (name.includes('-')) {
      const parts = name.split('-');
      if (parts.length >= 3) {
        return `${parts[0][0]}${parts[1][0]}${parts[2][0]}`;
      } else {
        return `${parts[0][0]}${parts[1][0]}${parts[1][1]}`;
      }
    } else {
      if (name.length >= 3) {
        return `${name[0]}${name[1]}${name[2]}`;
      }
      return name;
    }
  }