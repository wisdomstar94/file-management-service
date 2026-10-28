export function createVersionStorageKey(documentId: string, versionId: string): string {
  return `documents/${documentId}/${versionId}`;
}
