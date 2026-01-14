/**
 * Tenancy Enforcer (Runtime Guard)
 *
 * Goal:
 * - Prevent accidental cross-school data access even when code uses base44.entities.* directly.
 * - Auto-inject school_id for SCHOOL_SCOPED_ENTITIES whenever possible.
 * - Provide explicit opt-in escape hatches for legitimate cross-school global admin views.
 *
 * Safety principles:
 * - Never throw for reads (filter/list) in production paths; return [] instead.
 * - For writes (create), throw if we cannot determine school scope.
 * - Do not break Session bootstrapping: SchoolMembership/UserSchoolPreference lookups are allowed
 *   when they are scoped to the current user.
 */

import { SCHOOL_SCOPED_ENTITIES, requiresSchoolScope } from './scopedEntities';
import { recordTenancyWarning } from './tenancyWarnings';
import { normalizeLimit } from './contracts';

let _installed = false;

// { [entityName]: { filter, list, create, update, delete } }
const RAW = new Map();

export function getRawEntity(base44, entityName) {
  const entity = base44?.entities?.[entityName];
  if (!entity) return null;
  const raw = RAW.get(entityName);
  if (!raw) return entity; // not patched
  // Return a shallow facade with raw methods
  return {
    ...entity,
    filter: raw.filter || entity.filter,
    list: raw.list || entity.list,
    create: raw.create || entity.create,
    update: raw.update || entity.update,
    delete: raw.delete || entity.delete,
  };
}

function isSelfScopedUserFilter(entityName, filters, userEmail, activeSchoolId) {
  if (!filters || typeof filters !== 'object') return false;

  // Allow cross-school membership/preference queries when scoped to a user.
  // NOTE: During bootstrap, tenancyRuntime may not yet know userEmail.
  // To avoid breaking SessionProvider, we allow these queries when a user_email filter is present.
  // Once userEmail is known, we enforce that it matches.
  if (entityName === 'SchoolMembership' || entityName === 'UserSchoolPreference') {
    if (!filters.user_email) return false;
    if (!userEmail) return true; // bootstrap-safe
    return String(filters.user_email).toLowerCase() === String(userEmail).toLowerCase();
  }
  return false;
}

function safeClone(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return Array.isArray(obj) ? [...obj] : { ...obj };
}

function injectSchoolId({ entityName, filters, activeSchoolId, userEmail, isGlobalAdminEmail }) {
  const scoped = requiresSchoolScope(entityName);
  if (!scoped) return filters;

  // Session bootstrap exceptions:
  if (isSelfScopedUserFilter(entityName, filters, userEmail, activeSchoolId)) {
    return filters;
  }

  const cloned = safeClone(filters) || {};
  const hasSchool = Object.prototype.hasOwnProperty.call(cloned, 'school_id');

  // If caller already provided school_id, honor it for global admins.
  // For non-global users, force it to activeSchoolId to avoid cross-school leaks.
  if (hasSchool) {
    if (!activeSchoolId) return cloned; // guest storefront: allow explicit school_id
    const provided = cloned.school_id;
    if (String(provided) === String(activeSchoolId)) return cloned;

    const isGlobal = typeof isGlobalAdminEmail === 'function' ? isGlobalAdminEmail(userEmail) : false;
    if (isGlobal) return cloned;

    // Force to active school for non-global users
    return { ...cloned, school_id: activeSchoolId };
  }

  // No school_id provided: try to inject from activeSchoolId.
  if (activeSchoolId) {
    return { ...cloned, school_id: activeSchoolId };
  }

  // No activeSchoolId and no explicit school_id => unsafe.
  return null;
}

function makeGuardedFilter(base44, entityName, raw, ctx) {
  return async (filters = {}, sort, limit) => {
    try {
      const activeSchoolId = ctx.getActiveSchoolId?.();
      const userEmail = ctx.getUserEmail?.();
      const injected = injectSchoolId({
        entityName,
        filters,
        activeSchoolId,
        userEmail,
        isGlobalAdminEmail: ctx.isGlobalAdmin,
      });

      if (requiresSchoolScope(entityName) && !injected) {
        console.warn(`⚠️ TenancyEnforcer blocked unscoped ${entityName}.filter()`, { entityName, filters });
        recordTenancyWarning({
          type: 'BLOCK_READ_UNSCOPED_FILTER',
          entity: entityName,
          detail: { filters },
          school_id: activeSchoolId || null,
          user_email: userEmail || null,
        });
        return [];
      }

      // If we coerced school_id to activeSchoolId, record it for diagnostics.
      if (requiresSchoolScope(entityName) && injected && filters && typeof filters === 'object' && 'school_id' in filters) {
        try {
          const provided = filters.school_id;
          if (activeSchoolId && String(provided) !== String(activeSchoolId) && String(injected.school_id) === String(activeSchoolId)) {
            recordTenancyWarning({
              type: 'COERCE_SCHOOL_ID',
              entity: entityName,
              detail: { provided, coerced: activeSchoolId },
              school_id: activeSchoolId || null,
              user_email: userEmail || null,
            });
          }
        } catch {
          // ignore
        }
      }

      return raw.filter(injected || filters, sort, normalizeLimit(limit));
    } catch (e) {
      console.warn(`TenancyEnforcer: ${entityName}.filter failed`, e);
      return [];
    }
  };
}

function makeGuardedList(base44, entityName, raw, ctx) {
  return async (sort, limit) => {
    try {
      if (!requiresSchoolScope(entityName)) {
        return raw.list(sort, normalizeLimit(limit));
      }

      const activeSchoolId = ctx.getActiveSchoolId?.();
      const userEmail = ctx.getUserEmail?.();

      // Session bootstrap exception does not apply to list(), because list() is inherently unscoped.
      // For global admins, expose a dedicated listGlobal method instead.
      if (!activeSchoolId) {
        console.warn(`⚠️ TenancyEnforcer blocked unscoped ${entityName}.list() (no activeSchoolId)`);
        recordTenancyWarning({
          type: 'BLOCK_READ_UNSCOPED_LIST',
          entity: entityName,
          detail: { sort, limit },
          school_id: null,
          user_email: userEmail || null,
        });
        return [];
      }

      // Translate list() into a scoped filter().
      return raw.filter({ school_id: activeSchoolId }, sort, normalizeLimit(limit));
    } catch (e) {
      console.warn(`TenancyEnforcer: ${entityName}.list failed`, e);
      return [];
    }
  };
}

function makeGuardedCreate(entityName, raw, ctx) {
  return async (payload = {}) => {
    const activeSchoolId = ctx.getActiveSchoolId?.();
    const userEmail = ctx.getUserEmail?.();
    const injected = injectSchoolId({
      entityName,
      filters: payload,
      activeSchoolId,
      userEmail,
      isGlobalAdminEmail: ctx.isGlobalAdmin,
    });

    if (requiresSchoolScope(entityName) && !injected) {
      recordTenancyWarning({
        type: 'BLOCK_WRITE_UNSCOPED_CREATE',
        entity: entityName,
        detail: { payload_keys: Object.keys(payload || {}) },
        school_id: null,
        user_email: userEmail || null,
      });
      throw new Error(`TenancyEnforcer: cannot create ${entityName} without school_id or activeSchoolId`);
    }

    return raw.create(injected || payload);
  };
}



function makeGuardedUpdate(entityName, raw, ctx) {
  return async (id, payload = {}) => {
    const activeSchoolId = ctx.getActiveSchoolId?.();
    const userEmail = ctx.getUserEmail?.();
    const isGlobalAdminEmail = ctx.isGlobalAdmin?.(userEmail);

    const scoped = requiresSchoolScope(entityName);
    if (!scoped) return raw.update(id, payload);

    if (!activeSchoolId && !isGlobalAdminEmail) {
      recordTenancyWarning(entityName, 'update', { id, payload, reason: 'missing_active_school' });
      throw new Error(`TenancyEnforcer: cannot update ${entityName} without an active school`);
    }

    // Disallow moving records between schools for non-global-admins.
    if (!isGlobalAdminEmail && Object.prototype.hasOwnProperty.call(payload || {}, 'school_id')) {
      if (payload.school_id !== activeSchoolId) {
        recordTenancyWarning(entityName, 'update', { id, payload, reason: 'cross_school_school_id_change' });
        throw new Error(`TenancyEnforcer: cannot change school scope for ${entityName}`);
      }
    }

    const checkSchoolId = (payload && payload.school_id) ? payload.school_id : activeSchoolId;

    if (checkSchoolId && raw?.filter) {
      const found = await raw.filter({ id, school_id: checkSchoolId });
      if (!found || found.length === 0) {
        recordTenancyWarning(entityName, 'update', { id, payload, reason: 'record_not_in_active_school' });
        throw new Error(`TenancyEnforcer: ${entityName} ${id} not found in active school`);
      }
    }

    return raw.update(id, payload);
  };
}

function makeGuardedDelete(entityName, raw, ctx) {
  return async (id) => {
    const activeSchoolId = ctx.getActiveSchoolId?.();
    const userEmail = ctx.getUserEmail?.();
    const isGlobalAdminEmail = ctx.isGlobalAdmin?.(userEmail);

    const scoped = requiresSchoolScope(entityName);
    if (!scoped) return raw.delete(id);

    if (!activeSchoolId && !isGlobalAdminEmail) {
      recordTenancyWarning(entityName, 'delete', { id, reason: 'missing_active_school' });
      throw new Error(`TenancyEnforcer: cannot delete ${entityName} without an active school`);
    }

    if (activeSchoolId && raw?.filter) {
      const found = await raw.filter({ id, school_id: activeSchoolId });
      if (!found || found.length === 0) {
        recordTenancyWarning(entityName, 'delete', { id, reason: 'record_not_in_active_school' });
        throw new Error(`TenancyEnforcer: ${entityName} ${id} not found in active school`);
      }
    }

    return raw.delete(id);
  };
}
function attachGlobalEscapeHatches(entityName, entity, raw, ctx) {
  // Global admin-only explicit escape hatches for cross-school queries.
  if (!requiresSchoolScope(entityName)) return;

  if (!entity.filterGlobal) {
    entity.filterGlobal = async (filters = {}, sort, limit) => {
      const email = ctx.getUserEmail?.();
      const isGlobal = typeof ctx.isGlobalAdmin === 'function' ? ctx.isGlobalAdmin(email) : false;
      if (!isGlobal) {
        console.warn(`⚠️ ${entityName}.filterGlobal blocked (not global admin)`);
        recordTenancyWarning({
          type: 'BLOCK_GLOBAL_ESCAPE',
          entity: entityName,
          detail: { method: 'filterGlobal' },
          school_id: ctx.getActiveSchoolId?.() || null,
          user_email: email || null,
        });
        return [];
      }
      return raw.filter(filters, sort, normalizeLimit(limit));
    };
  }

  if (!entity.listGlobal) {
    entity.listGlobal = async (sort, limit) => {
      const email = ctx.getUserEmail?.();
      const isGlobal = typeof ctx.isGlobalAdmin === 'function' ? ctx.isGlobalAdmin(email) : false;
      if (!isGlobal) {
        console.warn(`⚠️ ${entityName}.listGlobal blocked (not global admin)`);
        recordTenancyWarning({
          type: 'BLOCK_GLOBAL_ESCAPE',
          entity: entityName,
          detail: { method: 'listGlobal' },
          school_id: ctx.getActiveSchoolId?.() || null,
          user_email: email || null,
        });
        return [];
      }
      return raw.list(sort, normalizeLimit(limit));
    };
  }
}

/**
 * Install the tenancy enforcer on a base44 client.
 * @param {any} base44
 * @param {{ getActiveSchoolId: ()=>string|null, getUserEmail: ()=>string|null, isGlobalAdmin?: (email:string)=>boolean }} ctx
 */
export function installTenancyEnforcer(base44, ctx) {
  if (_installed) return;
  if (!base44?.entities) return;

  // Patch only known entities that exist.
  for (const entityName of SCHOOL_SCOPED_ENTITIES) {
    const entity = base44.entities[entityName];
    if (!entity) continue;

    // Store raw methods once.
    if (!RAW.has(entityName)) {
      RAW.set(entityName, {
        filter: entity.filter ? entity.filter.bind(entity) : null,
        list: entity.list ? entity.list.bind(entity) : null,
        create: entity.create ? entity.create.bind(entity) : null,
        update: entity.update ? entity.update.bind(entity) : null,
        delete: entity.delete ? entity.delete.bind(entity) : null,
      });
    }

    const raw = RAW.get(entityName);
    if (raw?.filter) entity.filter = makeGuardedFilter(base44, entityName, raw, ctx);
    // list() wrapper depends on filter() to translate list -> scoped filter.
    if (raw?.list && raw?.filter) entity.list = makeGuardedList(base44, entityName, raw, ctx);
    if (raw?.create) entity.create = makeGuardedCreate(entityName, raw, ctx);
    if (raw?.update) entity.update = makeGuardedUpdate(entityName, raw, ctx);
    if (raw?.delete) entity.delete = makeGuardedDelete(entityName, raw, ctx);

    attachGlobalEscapeHatches(entityName, entity, raw, ctx);
  }

  _installed = true;
}
