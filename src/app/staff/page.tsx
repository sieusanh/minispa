import { findAllStaff } from '@/lib/data/staff';
import { Staff } from './components';

export default async function StaffPage() {
  //   return <pre>{JSON.stringify(staff, null, 2)}</pre>;
  const staffPromise = findAllStaff();
  return <Staff staffPromise={staffPromise} />;
}

// export default async function Instruments() {
//   return (
//     <Suspense fallback={<div>Loading instruments...</div>}>
//       <InstrumentsData />
//     </Suspense>
//   );
// }
