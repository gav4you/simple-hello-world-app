import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { installTenancyEnforcer } from '@/components/api/tenancyEnforcer';
import { getActiveSchoolId, getUserEmail } from '@/components/api/tenancyRuntime';
import { isGlobalAdmin } from '@/components/auth/roles';

const { appId, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false
});

// v8.8: Runtime multi-tenant guard
// Auto-injects school_id into school-scoped entity queries whenever possible.
// Provides explicit .filterGlobal()/.listGlobal() escape hatches for global admins.
installTenancyEnforcer(base44, {
  getActiveSchoolId,
  getUserEmail,
  isGlobalAdmin,
});
