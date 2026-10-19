export function buildFileUrl(key: string): string {
  return `${process.env.FILES_PUBLIC_BASE_URL}/${key}`;
}
