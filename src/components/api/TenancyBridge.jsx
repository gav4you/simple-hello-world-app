import { useEffect } from 'react';
import { useSession } from '@/components/hooks/useSession';
import { setTenancyContext } from '@/components/api/tenancyRuntime';

/**
 * TenancyBridge
 *
 * Keeps the module-level tenancyRuntime in sync with the React session.
 * This enables runtime query guarding (tenancyEnforcer) without changing every page at once.
 */
export default function TenancyBridge() {
  const { activeSchoolId, user } = useSession();

  useEffect(() => {
    setTenancyContext({
      activeSchoolId: activeSchoolId || null,
      userEmail: user?.email || null,
    });
  }, [activeSchoolId, user?.email]);

  return null;
}
