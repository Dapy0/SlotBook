export function createParams<T>(paramsList: Record<string, T>): string {
  const params = new URLSearchParams();
  for (const [param, value] of Object.entries(paramsList)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(param, String(value));
  }
  return params.toString();
}
