import { AppShell } from '../../../components/layout/AppShell';
//AppShell is the shared layout wrapper used across the whole app
//AppShell renders stuff like sidebar, topbar and then the main content area
import { CustomersPanel } from '../components/CustomersPanel';
// This where the content of the page is based..

export default function CustomersPage() {
  return (
    <AppShell title="Customers">
      <CustomersPanel />
    </AppShell>
  );
}
