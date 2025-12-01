export type UserType = 'admin' | 'docente' | 'responsavel';

export interface AuthUser {
    id: number;
    email: string;
    userType: UserType;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data?: {
        token: string;
        refreshToken: string;
        user: AuthUser;
    };
    error?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    nome: string;
    telefone: string;
    cpf: string;
}

export interface RegisterResponse {
    success: boolean;
    data?: {
        user: AuthUser;
    };
    error?: string;
}

export interface VerifyResponse {
    success: boolean;
    data?: {
        user: AuthUser;
    };
    error?: string;
}

export interface AuthenticatedRequest {
    user?: AuthUser;
}
