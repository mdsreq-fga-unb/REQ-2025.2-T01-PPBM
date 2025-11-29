const CPF_LENGTH = 11;

function removeNonDigits(value: string): string {
    return value.replace(/\D/g, '');
}

export function sanitizeCPF(cpf: string): string {
    return removeNonDigits(cpf);
}





export function isPositiveInteger(value: unknown): boolean {
    if (typeof value === 'number') {
        return Number.isInteger(value) && value > 0;
    }
    if (typeof value === 'string') {
        if (!value.trim()) {
            return false;
        }
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0;
    }
    return false;
}

export function validateRequiredFields<T extends Record<string, unknown>>(payload: T, requiredFields: (keyof T)[]): string[] {
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
        const value = payload[field];
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            missingFields.push(field as string);
        }
    });

    return missingFields;
}

export function isWithinCapacity(currentCount: number, capacity?: number | null): boolean {
    if (capacity === undefined || capacity === null) {
        return true;
    }

    if (!isPositiveInteger(capacity)) {
        return false;
    }

    return currentCount <= Number(capacity);
}


/**
 * Utility functions for data validation
 */

/**
 * Validates if a CPF is in the correct format (XXX.XXX.XXX-XX or XXXXXXXXXXX)
 * @param cpf - The CPF string to validate
 * @returns boolean indicating if CPF format is valid
 */
export function isValidCPFFormat(cpf: string): boolean {
    if (!cpf) return false;
    
    // Remove all non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Check if it has exactly 11 digits
    if (cleanCPF.length !== 11) return false;
    
    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    return true;
}

/**
 * Validates CPF using the official algorithm
 * @param cpf - The CPF string to validate
 * @returns boolean indicating if CPF is valid
 */
export function isValidCPF(cpf: string): boolean {
    if (!isValidCPFFormat(cpf)) return false;
    
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Calculate first verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Calculate second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    // Check if calculated digits match the provided ones
    return (
        parseInt(cleanCPF.charAt(9)) === digit1 &&
        parseInt(cleanCPF.charAt(10)) === digit2
    );
}

/**
 * Normalizes CPF by removing all non-numeric characters
 * @param cpf - The CPF string to normalize
 * @returns normalized CPF string with only numbers
 */
export function normalizeCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
}

/**
 * Validates if a date string is in ISO format and is a valid date
 * @param dateString - The date string to validate
 * @returns boolean indicating if date is valid
 */
export function isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates if an email has a valid format
 * @param email - The email string to validate
 * @returns boolean indicating if email format is valid
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates if a phone number has a valid Brazilian format
 * @param phone - The phone string to validate
 * @returns boolean indicating if phone format is valid
 */
export function isValidPhone(phone: string): boolean {
    if (!phone) return false;
    
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Brazilian phone numbers: 10 digits (landline) or 11 digits (mobile)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
}
