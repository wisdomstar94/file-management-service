import { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

export const getPermissionGroupRepository = () => appDataSource.getRepository(PermissionGroupEntity);
