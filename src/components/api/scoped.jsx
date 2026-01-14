// Multi-Tenant Scoped Query Helpers
// Ensures all data queries respect school boundaries

import { base44 } from '@/api/base44Client';
import { requiresSchoolScope } from './scopedEntities';
import { normalizeLimit } from './contracts';

/**
 * Scoped list - get all records for entity within school
 */
export const scopedList = async (entityName, schoolId, sort, limit) => {
  if (!schoolId && requiresSchoolScope(entityName)) {
    console.warn(`⚠️  Attempted to query ${entityName} without schoolId`);
    return [];
  }

  const filters = requiresSchoolScope(entityName) ? { school_id: schoolId } : {};
  return base44.entities[entityName].filter(filters, sort, normalizeLimit(limit));
};

/**
 * Scoped filter - query with additional filters within school
 */
export const scopedFilter = async (entityName, schoolId, additionalFilters = {}, sort, limit) => {
  if (!schoolId && requiresSchoolScope(entityName)) {
    console.warn(`⚠️  Attempted to query ${entityName} without schoolId`);
    return [];
  }

  const filters = requiresSchoolScope(entityName)
    ? { school_id: schoolId, ...additionalFilters }
    : additionalFilters;

  return base44.entities[entityName].filter(filters, sort, normalizeLimit(limit));
};

/**
 * Scoped get - fetch single record by id within school
 */
export const scopedGet = async (entityName, schoolId, id) => {
  const rows = await scopedFilter(entityName, schoolId, { id });
  return rows?.[0] || null;
};


/**
 * Scoped create - ensure school_id is included
 */
export const scopedCreate = async (entityName, schoolId, payload) => {
  if (requiresSchoolScope(entityName) && !schoolId) {
    throw new Error(`Cannot create ${entityName} without schoolId`);
  }

  const data = requiresSchoolScope(entityName)
    ? { school_id: schoolId, ...payload }
    : payload;

  return base44.entities[entityName].create(data);
};

/**
 * Scoped update - validate school ownership (optional strict mode)
 */
export const scopedUpdate = async (entityName, id, payload, schoolId = null, strict = false) => {
  // In strict mode, verify record belongs to school before updating
  if (strict && schoolId && requiresSchoolScope(entityName)) {
    const records = await base44.entities[entityName].filter({ id, school_id: schoolId });
    if (records.length === 0) {
      throw new Error(`${entityName} ${id} not found in school ${schoolId}`);
    }
  }

  return base44.entities[entityName].update(id, payload);
};

/**
 * Scoped delete - validate school ownership (optional strict mode)
 */
export const scopedDelete = async (entityName, id, schoolId = null, strict = false) => {
  if (strict && schoolId && requiresSchoolScope(entityName)) {
    const records = await base44.entities[entityName].filter({ id, school_id: schoolId });
    if (records.length === 0) {
      throw new Error(`${entityName} ${id} not found in school ${schoolId}`);
    }
  }

  return base44.entities[entityName].delete(id);
};

/**
 * Build React Query cache key with school scope
 */
export const buildCacheKey = (baseKey, schoolId, ...additionalKeys) => {
  return [baseKey, schoolId, ...additionalKeys].filter(Boolean);
};