import { PermissionEntity } from "@fms/database-entities/entities/permission-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

export const getPermissionRepository = () => appDataSource.getRepository(PermissionEntity);
