import type { ShareLinkAvailability } from "@fms/api-schemas/responses/share-link-responses";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";

export function readShareLinkAvailability(link: ShareLinkEntity, now = new Date()): ShareLinkAvailability {
  if (link.availableFrom && now < link.availableFrom) {
    return "SCHEDULED";
  }
  if (link.availableUntil && now > link.availableUntil) {
    return "EXPIRED";
  }
  if (link.maxDownloadCount !== null && link.downloadCount >= link.maxDownloadCount) {
    return "EXHAUSTED";
  }
  return "ACTIVE";
}
