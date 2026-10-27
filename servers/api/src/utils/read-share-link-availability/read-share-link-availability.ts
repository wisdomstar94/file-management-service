import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";

export function readShareLinkAvailability(
  link: ShareLinkEntity,
  now = new Date(),
): ResBody<typeof SHARE_LINK_LIST_API>["data"][number]["availability"] {
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
