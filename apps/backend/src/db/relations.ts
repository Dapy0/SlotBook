import { defineRelations } from 'drizzle-orm';
import * as schema from './schema/index.ts';

export const relations = defineRelations(schema, (r) => ({
  users: {
    facilities: r.many.facilities({ from: r.users.id, to: r.facilities.ownerId }),
    staffMembers: r.one.staffMembers({ from: r.users.id, to: r.staffMembers.userId }),
  },
  facilities: {
    users: r.one.users({ from: r.facilities.ownerId, to: r.users.id }),
    services: r.many.services({ from: r.facilities.id, to: r.services.facilityId }),
    staffMembers: r.many.staffMembers({
      from: r.facilities.id,
      to: r.staffMembers.facilityId,
    }),
  },
  services: {
    facilities: r.one.facilities({ from: r.services.facilityId, to: r.facilities.id }),
    staffServices: r.many.staffServices({from: r.services.id, to: r.staffServices.serviceId})
  },
  staffMembers: {
    users: r.one.users({ from: r.staffMembers.userId, to: r.users.id }),
    facilities: r.one.facilities({ from: r.staffMembers.facilityId, to: r.facilities.id }),
    staffServices: r.many.staffServices({
      from: r.staffMembers.id,
      to: r.staffServices.staffMemberId,
    }),
  },
  staffServices: {
    staffMembers: r.one.staffMembers({
      from: r.staffServices.staffMemberId,
      to: r.staffMembers.id,
    }),
    serviceId: r.one.services({
      from: r.staffServices.serviceId,
      to: r.services.id,
    }),
  },
}));
