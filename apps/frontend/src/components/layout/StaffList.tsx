import { Button } from '@/components/ui/button';
import type { StaffMemberResponseDTO } from '@slotbook/shared/staffMembers';
import { StarIcon } from 'lucide-react';

export default function StaffList({
  staff,
  query = '',
}: {
  staff: StaffMemberResponseDTO[];
  query?: string;
}) {
  const q = query.trim().toLowerCase();
  const filtered = staff.filter((s) => s.name.toLowerCase().includes(q));

  return (
    <div className="w-full rounded-sm border border-gray-200 bg-white shadow-sm">
      {filtered.length === 0 && (
        <p className="px-6 py-8 text-center text-sm text-gray-400">No staff match your search.</p>
      )}

      <div className="divide-y divide-gray-100">
        {filtered.map((member) => (
          <div key={member.name} className="flex items-center justify-between px-6 py-4">
            <div>
              <span className="text-sm font-medium text-gray-900">{member.name}</span>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <StarIcon size={12} className="fill-amber-400 text-amber-400" />
                <span className="font-medium text-gray-700">{member.score}</span>
                <span className="text-gray-400">({member.reviewsCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant={'outline'}>Book</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
