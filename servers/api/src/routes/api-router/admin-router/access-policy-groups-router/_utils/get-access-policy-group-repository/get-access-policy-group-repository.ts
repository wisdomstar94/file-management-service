import { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

export const getAccessPolicyGroupRepository = () => appDataSource.getRepository(AccessPolicyGroupEntity);
