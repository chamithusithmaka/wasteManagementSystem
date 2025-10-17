import { CONTAINER_CONSTANTS, PROVINCES } from '../../../constants/container';

describe('Container Constants', () => {
  describe('CONTAINER_CONSTANTS', () => {
    test('has all required container types', () => {
      const expectedTypes = [
        'organic', 'polythene', 'plastic', 'glass', 'metal', 
        'paper', 'cardboard', 'mixed', 'recyclable', 'hazardous', 'general'
      ];
      
      const actualTypes = Object.values(CONTAINER_CONSTANTS.TYPES);
      
      expectedTypes.forEach(type => {
        expect(actualTypes).toContain(type);
      });
    });

    test('has all required statuses', () => {
      expect(CONTAINER_CONSTANTS.STATUS.AVAILABLE).toBe('Available');
      expect(CONTAINER_CONSTANTS.STATUS.NEAR_FULL).toBe('Near Full');
      expect(CONTAINER_CONSTANTS.STATUS.FULL).toBe('Full');
      expect(CONTAINER_CONSTANTS.STATUS.NEEDS_MAINTENANCE).toBe('Needs Maintenance');
      expect(CONTAINER_CONSTANTS.STATUS.OUT_OF_SERVICE).toBe('Out of Service');
    });

    test('has correct thresholds', () => {
      expect(CONTAINER_CONSTANTS.THRESHOLDS.NEAR_FULL).toBe(80);
      expect(CONTAINER_CONSTANTS.THRESHOLDS.FULL).toBe(95);
      expect(CONTAINER_CONSTANTS.THRESHOLDS.HIGH_PRIORITY).toBe(90);
    });

    test('thresholds are in logical order', () => {
      const { THRESHOLDS } = CONTAINER_CONSTANTS;
      expect(THRESHOLDS.NEAR_FULL).toBeLessThan(THRESHOLDS.HIGH_PRIORITY);
      expect(THRESHOLDS.HIGH_PRIORITY).toBeLessThan(THRESHOLDS.FULL);
    });

    test('has pagination constants', () => {
      expect(CONTAINER_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE).toBe(10);
      expect(CONTAINER_CONSTANTS.PAGINATION.MAX_PAGE_SIZE).toBe(50);
      expect(CONTAINER_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(
        CONTAINER_CONSTANTS.PAGINATION.MAX_PAGE_SIZE
      );
    });

    test('has default values', () => {
      expect(CONTAINER_CONSTANTS.DEFAULTS.COLLECTION_THRESHOLD).toBe(80);
      expect(CONTAINER_CONSTANTS.DEFAULTS.MIN_CAPACITY).toBe(1);
      expect(CONTAINER_CONSTANTS.DEFAULTS.DEFAULT_CAPACITY).toBe(100);
      expect(CONTAINER_CONSTANTS.DEFAULTS.MIN_CAPACITY).toBeLessThan(
        CONTAINER_CONSTANTS.DEFAULTS.DEFAULT_CAPACITY
      );
    });
  });

  describe('PROVINCES', () => {
    test('contains all 9 Sri Lankan provinces', () => {
      expect(PROVINCES).toHaveLength(9);
      
      const expectedProvinces = [
        'Western Province',
        'Central Province',
        'Southern Province',
        'Northern Province',
        'Eastern Province',
        'North Western Province',
        'North Central Province',
        'Uva Province',
        'Sabaragamuwa Province'
      ];

      expectedProvinces.forEach(province => {
        expect(PROVINCES).toContain(province);
      });
    });

    test('province names are properly formatted', () => {
      PROVINCES.forEach(province => {
        expect(province).toMatch(/^[A-Z][a-z]+ Province$/);
        expect(province).not.toContain('  '); // No double spaces
        expect(province.trim()).toBe(province); // No leading/trailing spaces
      });
    });

    test('has no duplicate provinces', () => {
      const uniqueProvinces = [...new Set(PROVINCES)];
      expect(uniqueProvinces).toHaveLength(PROVINCES.length);
    });
  });

  describe('Constants Integration', () => {
    test('default collection threshold matches near full threshold', () => {
      expect(CONTAINER_CONSTANTS.DEFAULTS.COLLECTION_THRESHOLD).toBe(
        CONTAINER_CONSTANTS.THRESHOLDS.NEAR_FULL
      );
    });

    test('all constants are properly exported', () => {
      expect(CONTAINER_CONSTANTS).toBeDefined();
      expect(PROVINCES).toBeDefined();
      
      // Test that the default export works
      const defaultExport = require('../../../constants/container').default;
      expect(defaultExport).toBe(CONTAINER_CONSTANTS);
    });

    test('constants are frozen/immutable', () => {
      expect(() => {
        CONTAINER_CONSTANTS.STATUS.AVAILABLE = 'Modified';
      }).toThrow();
      
      expect(() => {
        PROVINCES.push('New Province');
      }).toThrow();
    });
  });
});