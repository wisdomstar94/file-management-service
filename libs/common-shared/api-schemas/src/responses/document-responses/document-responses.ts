export type DocumentVersionResponse = {
  id: string;
  seq: number;
  versionName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isLatest: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DocumentVersionSummary = { id: string; versionName: string };

export type DocumentSummaryResponse = {
  id: string;
  name: string;
  versionCount: number;
  latestVersion: DocumentVersionSummary;
  /** 목록의 파일 형식 아이콘을 고르는 데 쓴다. */
  latestVersionFileName: string;
  /** `null` 이면 최신 버전을 따른다. */
  fixedDefaultVersion: DocumentVersionSummary | null;
  createdAt: string;
  latestVersionCreatedAt: string;
};

export type DocumentDetailResponse = {
  id: string;
  name: string;
  /** `null` 이면 최신 버전을 따른다. */
  defaultVersionId: string | null;
  latestVersion: DocumentVersionResponse;
  versions: DocumentVersionResponse[];
  createdAt: string;
  updatedAt: string;
};
