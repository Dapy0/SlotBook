import { defineRelations } from 'drizzle-orm';
import * as schema from './schema/index.ts';

export const relations = defineRelations(schema, (r) => ({
  users: {
    ownedFacilities: r.many.facilities({ from: r.users.id, to: r.facilities.ownerId }),
    workingProfile: r.one.staffMembers({ from: r.users.id, to: r.staffMembers.userId }),
  },
  facilities: {
    owner: r.one.users({ from: r.facilities.ownerId, to: r.users.id }),
    services: r.many.services({ from: r.facilities.id, to: r.services.facilityId }),
    staffMembers: r.many.staffMembers({ from: r.facilities.id, to: r.staffMembers.facilityId }),
  },
  services: {
    facility: r.one.facilities({ from: r.services.facilityId, to: r.facilities.id }),
    staffMembers: r.many.staffMembers({
      from: r.services.id.through(r.staffServices.serviceId),
      to: r.staffMembers.id.through(r.staffServices.staffMemberId),
    }),
  },
  staffMembers: {
    user: r.one.users({ from: r.staffMembers.userId, to: r.users.id }),
    facility: r.one.facilities({ from: r.staffMembers.facilityId, to: r.facilities.id }),
    services: r.many.services({
      from: r.staffMembers.id.through(r.staffServices.staffMemberId),
      to: r.services.id.through(r.staffServices.serviceId),
    }),
  },
}));
