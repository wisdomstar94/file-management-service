import { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

export const getShareLinkRepository = () => appDataSource.getRepository(ShareLinkEntity);
