import { Request, Response, NextFunction } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { AuthUser, UserType } from '../interfaces/auth';
import logger from '../logger';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'Token não fornecido' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer '
        
        // Verify token with Supabase
        const supabase = SupabaseWrapper.get();
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.warn('Invalid token attempt', { error: error?.message });
            res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
            return;
        }

        // Get user details from database
        const authUser = await getUserByEmail(user.email!);
        
        if (!authUser) {
            res.status(401).json({ success: false, error: 'Usuário não encontrado no sistema' });
            return;
        }

        req.user = authUser;
        next();
    } catch (error) {
        logger.error('Auth middleware error', { error });
        res.status(500).json({ success: false, error: 'Erro interno de autenticação' });
    }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (...allowedRoles: UserType[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Não autenticado' });
            return;
        }

        if (!allowedRoles.includes(req.user.userType)) {
            res.status(403).json({ success: false, error: 'Acesso negado. Permissão insuficiente.' });
            return;
        }

        next();
    };
};

/**
 * Helper function to get user from database by email
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
    const supabase = SupabaseWrapper.get();

    // Check admins table
    const { data: admin } = await supabase
        .from('admins')
        .select('id_admin, email')
        .eq('email', email)
        .maybeSingle();

    if (admin) {
        return {
            id: admin.id_admin,
            email: admin.email,
            userType: 'admin',
            name: 'Administrador'
        };
    }

    // Check docentes table
    const { data: docente } = await supabase
        .from('docentes')
        .select('id_docente, email_docente, nome_docente')
        .eq('email_docente', email)
        .maybeSingle();

    if (docente) {
        return {
            id: docente.id_docente,
            email: docente.email_docente,
            userType: 'docente',
            name: docente.nome_docente
        };
    }

    // Check responsaveis table
    const { data: responsavel } = await supabase
        .from('responsaveis')
        .select('id_responsavel, email_responsavel, nome_responsavel')
        .eq('email_responsavel', email)
        .maybeSingle();

    if (responsavel) {
        return {
            id: responsavel.id_responsavel,
            email: responsavel.email_responsavel,
            userType: 'responsavel',
            name: responsavel.nome_responsavel
        };
    }

    return null;
}
