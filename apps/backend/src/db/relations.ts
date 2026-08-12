import { defineRelations } from 'drizzle-orm';
import * as schema from './schema/index.ts';

export const relations = defineRelations(schema, (r) => ({
  users: {
    facilities: r.many.facilities({ from: r.users.id, to: r.facilities.ownerId }),
  },
  facilities: {
    users: r.one.users({ from: r.facilities.ownerId, to: r.users.id }),
    services: r.many.services({ from: r.facilities.id, to: r.services.facilityId }),
  },
  services: {
    facilities: r.one.services({ from: r.services.facilityId, to: r.facilities.id }),
  },
}));
