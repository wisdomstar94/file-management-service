import { api } from "../api-client";
import { uniqueName } from "../create-test-account";

/** 최초 관리자 토큰으로 첫 버전 파일과 함께 자료를 만든다. */
export async function createTestDocument(adminToken: string, props: { fileName?: string; content?: string } = {}) {
  const res = await api({ token: adminToken })
    .post("/api/admin/documents")
    .field("name", uniqueName("doc"))
    .field("versionName", "v1")
    .attach("file", Buffer.from(props.content ?? "version-1"), props.fileName ?? "first.txt")
    .expect(201);
  return res.body.data as { id: string; versions: { id: string; versionName: string }[] };
}

export async function addTestVersion(adminToken: string, documentId: string, versionName: string, content: string) {
  const res = await api({ token: adminToken })
    .post(`/api/admin/documents/${documentId}/versions`)
    .field("versionName", versionName)
    .attach("file", Buffer.from(content), `${versionName}.txt`)
    .expect(201);
  return res.body.data as { versions: { id: string; versionName: string; isLatest: boolean; isDefault: boolean }[] };
}
