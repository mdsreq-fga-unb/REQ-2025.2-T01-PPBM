const CPF_LENGTH = 11;

function removeNonDigits(value: string): string {
    return value.replace(/\D/g, '');
}

export function sanitizeCPF(cpf: string): string {
    return removeNonDigits(cpf);
}

export function isValidCPF(rawCpf: string): boolean {
    const cpf = sanitizeCPF(rawCpf);

    if (!cpf || cpf.length !== CPF_LENGTH) {
        return false;
    }

    const invalidSequences = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ];

    if (invalidSequences.includes(cpf)) {
        return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += Number(cpf.substring(i - 1, i)) * (CPF_LENGTH - i);
    }

    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }

    if (remainder !== Number(cpf.substring(9, 10))) {
        return false;
    }

    sum = 0;

    for (let i = 1; i <= 10; i++) {
        sum += Number(cpf.substring(i - 1, i)) * (CPF_LENGTH + 1 - i);
    }

    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }

    return remainder === Number(cpf.substring(10, 11));
}

export function isValidEmail(email?: string | null): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const normalized = email.trim();
    if (!normalized) {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(normalized);
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


