export function formatProjectSize(sizeMB: number): string {
  return sizeMB > 1000 ? `${(sizeMB / 1024).toFixed(1)} GB` : `${sizeMB} MB`;
}
