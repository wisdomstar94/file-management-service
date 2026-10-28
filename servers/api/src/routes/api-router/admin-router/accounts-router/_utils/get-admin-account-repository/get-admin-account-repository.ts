import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

export const getAdminAccountRepository = () => appDataSource.getRepository(AdminAccountEntity);
