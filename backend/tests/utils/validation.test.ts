import {
  isPositiveInteger,
  isValidCPF,
  isValidEmail,
  isWithinCapacity,
  sanitizeCPF,
  validateRequiredFields,
} from '../../src/utils/validation';

describe('validation utils', () => {
  describe('sanitizeCPF', () => {
    it('removes non-digit characters', () => {
      expect(sanitizeCPF('123.456.789-09')).toBe('12345678909');
    });
  });

  describe('isValidCPF', () => {
    it('returns true for a valid CPF', () => {
      expect(isValidCPF('529.982.247-25')).toBe(true);
    });

    it('returns false for an invalid CPF sequence', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
    });

    it('returns false for malformed CPF', () => {
      expect(isValidCPF('123')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('validates email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('rejects invalid email format', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('accepts positive integers', () => {
      expect(isPositiveInteger(5)).toBe(true);
      expect(isPositiveInteger('10')).toBe(true);
    });

    it('rejects non-positive or non-integers', () => {
      expect(isPositiveInteger(0)).toBe(false);
      expect(isPositiveInteger(-3)).toBe(false);
      expect(isPositiveInteger('abc')).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    it('returns missing field names', () => {
      const payload = { name: 'Alice', email: '' };
      expect(validateRequiredFields(payload, ['name', 'email', 'cpf'] as any)).toEqual(['email', 'cpf']);
    });

    it('returns empty array when all fields present', () => {
      const payload = { name: 'Alice', email: 'alice@example.com' };
      expect(validateRequiredFields(payload, ['name', 'email'] as any)).toEqual([]);
    });
  });

  describe('isWithinCapacity', () => {
    it('returns true when capacity not set', () => {
      expect(isWithinCapacity(10, undefined)).toBe(true);
    });

    it('returns true when within limit', () => {
      expect(isWithinCapacity(9, 10)).toBe(true);
    });

    it('returns false when limit exceeded', () => {
      expect(isWithinCapacity(11, 10)).toBe(false);
    });

    it('returns false for invalid capacity value', () => {
      expect(isWithinCapacity(5, -1 as any)).toBe(false);
    });
  });
});



