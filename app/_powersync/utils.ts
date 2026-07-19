export function parseJsonColumn<T = any>(value: unknown): T | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function toBool(value: unknown): boolean {
  return value === 1 || value === true;
}
