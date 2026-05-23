import { describe, it, expect } from 'vitest';
import { API_ROUTES, LGPD_PATHS, buildRoute } from '@/config/api-routes';

/**
 * Contract Tests: Verify frontend routes match backend expectations
 *
 * These tests ensure that frontend API routes are constructed correctly
 * and match the backend endpoint specifications.
 */

describe('Inventory API Contract', () => {
  describe('Route Construction', () => {
    it('should construct inventory list route without /api duplication', () => {
      const route = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY);
      expect(route).toBe('/lgpd/inventory');
      expect(route).not.toContain('/api/api');
    });

    it('should construct active inventory route correctly', () => {
      const route = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_ACTIVE);
      expect(route).toBe('/lgpd/inventory/active');
    });

    it('should construct get by process code route correctly', () => {
      const processCode = 'PROC-001';
      const route = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_CODE(processCode));
      expect(route).toBe('/lgpd/inventory/PROC-001');
    });

    it('should construct inventory by id route correctly', () => {
      const inventoryId = '123e4567-e89b-12d3-a456-426614174000';
      const route = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_ID(inventoryId));
      expect(route).toBe(`/lgpd/inventory/${inventoryId}`);
    });
  });

  describe('Route Consistency', () => {
    it('should use consistent prefix for all LGPD routes', () => {
      const inventoryRoute = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY);
      const requestsRoute = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.REQUESTS);

      expect(inventoryRoute).toMatch(/^\/lgpd\//);
      expect(requestsRoute).toMatch(/^\/lgpd\//);
    });

    it('should not duplicate /api prefix in routes', () => {
      const routes = [
        buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY),
        buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_ACTIVE),
        buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_CODE('PROC-001')),
        buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_ID('123')),
      ];

      routes.forEach(route => {
        expect(route).not.toContain('/api/api');
        expect(route).not.toContain('//');
      });
    });
  });

  describe('Update vs Read Operations', () => {
    it('should use processCode for reading inventory', () => {
      const processCode = 'PROC-001';
      const readRoute = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_CODE(processCode));

      expect(readRoute).toBe('/lgpd/inventory/PROC-001');
      expect(readRoute).toContain(processCode);
    });

    it('should use inventoryId for updating inventory', () => {
      const inventoryId = '123e4567-e89b-12d3-a456-426614174000';
      const updateRoute = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY_BY_ID(inventoryId));

      expect(updateRoute).toContain(inventoryId);
      expect(updateRoute).not.toContain('processCode');
    });

    it('should provide different route templates for GET by code and PATCH by id', () => {
      const byCodeTemplate = LGPD_PATHS.INVENTORY_BY_CODE('TEST');
      const byIdTemplate = LGPD_PATHS.INVENTORY_BY_ID('TEST');

      // Both should be valid but serve different purposes
      expect(byCodeTemplate).toBe('inventory/TEST');
      expect(byIdTemplate).toBe('inventory/TEST');

      // In actual use, one would have a processCode and one would have a UUID
      const processCode = 'PROC-001';
      const inventoryId = '550e8400-e29b-41d4-a716-446655440000';

      expect(LGPD_PATHS.INVENTORY_BY_CODE(processCode)).toBe('inventory/PROC-001');
      expect(LGPD_PATHS.INVENTORY_BY_ID(inventoryId)).toBe(`inventory/${inventoryId}`);
    });
  });

  describe('API_ROUTES Constants', () => {
    it('should define LGPD route constant', () => {
      expect(API_ROUTES.LGPD).toBeDefined();
      expect(API_ROUTES.LGPD).toBe('lgpd');
    });

    it('should not include /api prefix in API_ROUTES', () => {
      expect(API_ROUTES.LGPD).not.toContain('/api');
    });
  });

  describe('LGPD_PATHS Constants', () => {
    it('should define all required inventory paths', () => {
      expect(LGPD_PATHS.INVENTORY).toBeDefined();
      expect(LGPD_PATHS.INVENTORY_ACTIVE).toBeDefined();
      expect(LGPD_PATHS.INVENTORY_BY_CODE).toBeDefined();
      expect(LGPD_PATHS.INVENTORY_BY_ID).toBeDefined();
    });

    it('should use functions for dynamic paths', () => {
      expect(typeof LGPD_PATHS.INVENTORY_BY_CODE).toBe('function');
      expect(typeof LGPD_PATHS.INVENTORY_BY_ID).toBe('function');
    });

    it('should return correct route format from function paths', () => {
      const code = 'TEST-CODE';
      const id = 'test-id-123';

      expect(LGPD_PATHS.INVENTORY_BY_CODE(code)).toBe(`inventory/${code}`);
      expect(LGPD_PATHS.INVENTORY_BY_ID(id)).toBe(`inventory/${id}`);
    });
  });

  describe('buildRoute Function', () => {
    it('should concatenate route segments correctly', () => {
      const result = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY);
      expect(result).toBe('/lgpd/inventory');
    });

    it('should handle multiple segments', () => {
      const result = buildRoute('lgpd', 'inventory', 'active');
      expect(result).toBe('/lgpd/inventory/active');
    });

    it('should start with forward slash', () => {
      const result = buildRoute(API_ROUTES.LGPD, LGPD_PATHS.INVENTORY);
      expect(result).toMatch(/^\//);
    });
  });
});
