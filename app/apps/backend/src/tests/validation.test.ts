import { 
    isValidCPF, 
    isValidCPFFormat, 
    normalizeCPF, 
    isValidDate, 
    isValidEmail, 
    isValidPhone 
} from '../utils/validation';

describe('Validation Utils', () => {
    describe('CPF Validation', () => {
        describe('isValidCPFFormat', () => {
            it('should return true for valid CPF formats', () => {
                expect(isValidCPFFormat('123.456.789-09')).toBe(true);
                expect(isValidCPFFormat('12345678909')).toBe(true);
                expect(isValidCPFFormat('123 456 789 09')).toBe(true);
            });

            it('should return false for invalid CPF formats', () => {
                expect(isValidCPFFormat('')).toBe(false);
                expect(isValidCPFFormat('123')).toBe(false);
                expect(isValidCPFFormat('123456789012')).toBe(false);
                expect(isValidCPFFormat('11111111111')).toBe(false);
                expect(isValidCPFFormat('00000000000')).toBe(false);
            });

            it('should return false for null or undefined', () => {
                expect(isValidCPFFormat(null as any)).toBe(false);
                expect(isValidCPFFormat(undefined as any)).toBe(false);
            });
        });

        describe('isValidCPF', () => {
            it('should return true for valid CPFs', () => {
                expect(isValidCPF('11144477735')).toBe(true);
                expect(isValidCPF('111.444.777-35')).toBe(true);
                expect(isValidCPF('52998224725')).toBe(true);
                expect(isValidCPF('529.982.247-25')).toBe(true);
            });

            it('should return false for invalid CPFs', () => {
                expect(isValidCPF('11144477736')).toBe(false); // Wrong check digit
                expect(isValidCPF('111.444.777-36')).toBe(false); // Wrong check digit
                expect(isValidCPF('11111111111')).toBe(false); // All same digits
                expect(isValidCPF('00000000000')).toBe(false); // All zeros
                expect(isValidCPF('123')).toBe(false); // Too short
                expect(isValidCPF('')).toBe(false); // Empty
            });
        });

        describe('normalizeCPF', () => {
            it('should remove all non-numeric characters', () => {
                expect(normalizeCPF('123.456.789-09')).toBe('12345678909');
                expect(normalizeCPF('123 456 789 09')).toBe('12345678909');
                expect(normalizeCPF('123-456-789-09')).toBe('12345678909');
                expect(normalizeCPF('12345678909')).toBe('12345678909');
            });

            it('should handle empty strings', () => {
                expect(normalizeCPF('')).toBe('');
            });
        });
    });

    describe('Date Validation', () => {
        describe('isValidDate', () => {
            it('should return true for valid ISO date strings', () => {
                expect(isValidDate('2023-01-01')).toBe(true);
                expect(isValidDate('2023-12-31T23:59:59.999Z')).toBe(true);
                expect(isValidDate('2000-02-29')).toBe(true); // Leap year
            });

            it('should return false for invalid date strings', () => {
                expect(isValidDate('')).toBe(false);
                expect(isValidDate('invalid-date')).toBe(false);
                expect(isValidDate('2023-13-01')).toBe(false); // Invalid month
                expect(isValidDate('2023-02-30')).toBe(false); // Invalid day
                expect(isValidDate('2023/01/01')).toBe(false); // Wrong format
            });

            it('should return false for null or undefined', () => {
                expect(isValidDate(null as any)).toBe(false);
                expect(isValidDate(undefined as any)).toBe(false);
            });
        });
    });

    describe('Email Validation', () => {
        describe('isValidEmail', () => {
            it('should return true for valid email addresses', () => {
                expect(isValidEmail('test@example.com')).toBe(true);
                expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
                expect(isValidEmail('user+tag@example.org')).toBe(true);
                expect(isValidEmail('123@example.com')).toBe(true);
            });

            it('should return false for invalid email addresses', () => {
                expect(isValidEmail('')).toBe(false);
                expect(isValidEmail('invalid-email')).toBe(false);
                expect(isValidEmail('@example.com')).toBe(false);
                expect(isValidEmail('user@')).toBe(false);
                expect(isValidEmail('user@domain')).toBe(false);
                expect(isValidEmail('user name@example.com')).toBe(false);
            });

            it('should return false for null or undefined', () => {
                expect(isValidEmail(null as any)).toBe(false);
                expect(isValidEmail(undefined as any)).toBe(false);
            });
        });
    });

    describe('Phone Validation', () => {
        describe('isValidPhone', () => {
            it('should return true for valid Brazilian phone numbers', () => {
                expect(isValidPhone('11987654321')).toBe(true); // 11 digits (mobile)
                expect(isValidPhone('1134567890')).toBe(true); // 10 digits (landline)
                expect(isValidPhone('(11) 98765-4321')).toBe(true); // Formatted mobile
                expect(isValidPhone('(11) 3456-7890')).toBe(true); // Formatted landline
                expect(isValidPhone('+55 11 98765-4321')).toBe(true); // With country code
            });

            it('should return false for invalid phone numbers', () => {
                expect(isValidPhone('')).toBe(false);
                expect(isValidPhone('123')).toBe(false); // Too short
                expect(isValidPhone('123456789012')).toBe(false); // Too long
                expect(isValidPhone('abcdefghij')).toBe(false); // Non-numeric
            });

            it('should return false for null or undefined', () => {
                expect(isValidPhone(null as any)).toBe(false);
                expect(isValidPhone(undefined as any)).toBe(false);
            });
        });
    });
});