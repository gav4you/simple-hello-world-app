import { base44 } from '@/api/base44Client';

/**
 * Check if a feature is enabled for a given user
 * @param {string} featureKey - The unique key of the feature flag
 * @param {object} user - The current user object
 * @returns {Promise<boolean>} - Whether the feature is enabled for this user
 */
export async function isFeatureEnabled(featureKey, user) {
  try {
    // Fetch the feature flag
    const flags = await base44.entities.FeatureFlag.filter({ key: featureKey });
    
    if (!flags || flags.length === 0) {
      // If no flag exists, default to disabled
      return false;
    }

    const flag = flags[0];

    // If the feature is globally disabled, return false
    if (!flag.enabled) {
      return false;
    }

    // Check audience requirements
    switch (flag.audience) {
      case 'ALL':
        return true;

      case 'ADMINS_ONLY':
        return user?.role === 'admin';

      case 'RABBI_ONLY':
        // Check if user has RABBI role label (custom field on User entity)
        return user?.role === 'admin' || user?.role_label === 'RABBI';

      case 'TALMID_ONLY':
        // Check if user has TALMID role label
        return user?.role_label === 'TALMID';

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return false;
  }
}

/**
 * Get all enabled features for a user
 * @param {object} user - The current user object
 * @returns {Promise<string[]>} - Array of enabled feature keys
 */
export async function getEnabledFeatures(user) {
  try {
    const allFlags = await base44.entities.FeatureFlag.filter({ enabled: true });
    const enabledKeys = [];

    for (const flag of allFlags) {
      const isEnabled = await isFeatureEnabled(flag.key, user);
      if (isEnabled) {
        enabledKeys.push(flag.key);
      }
    }

    return enabledKeys;
  } catch (error) {
    console.error('Error fetching enabled features:', error);
    return [];
  }
}