import type { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

export type DocumentWithVersions = DocumentEntity & { versions: DocumentVersionEntity[] };
