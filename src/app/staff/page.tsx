import { headers } from 'next/headers';
import { findAllStaff, findStaffById } from '@/lib/data/staff';
import { StaffBoard } from './components';
import { UserRole, Staff } from '@/types/staff';

export default async function StaffPage() {
  const headersList = await headers();

  // Retrieve the custom headers set by the middleware
  const userId = headersList.get('x-user-id')!;
  const userRole = headersList.get('x-user-role')!;
  const userName = decodeURIComponent(headersList.get('x-user-name')!);
  let staffPromise!: Promise<Partial<Staff>[] | Partial<Staff>>;

  //   return <pre>{JSON.stringify(staff, null, 2)}</pre>;
  if (userRole === UserRole.ADMIN) {
    staffPromise = findAllStaff();
  }
  if (userRole === UserRole.TECHNICIAN) {
    staffPromise = findStaffById(userId);
  }
  return (
    <StaffBoard
      staffPromise={staffPromise}
      userId={userId}
      userRole={userRole}
      userName={userName}
    />
  );
}

// export default async function Instruments() {
//   return (
//     <Suspense fallback={<div>Loading instruments...</div>}>
//       <InstrumentsData />
//     </Suspense>
//   );
// }
