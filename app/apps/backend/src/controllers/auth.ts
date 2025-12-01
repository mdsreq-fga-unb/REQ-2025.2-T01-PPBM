import { Request, Response } from 'express';
import { EndpointController, RequestType } from '../interfaces/index';
import { LoginRequest, RegisterRequest } from '../interfaces/auth';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { getUserByEmail } from '../middleware/auth';
import { Pair } from '../utils/utils';
import logger from '../logger';

export const authController: EndpointController = {
    name: 'auth',
    routes: {
        'login': [
            new Pair(RequestType.POST, async (req: Request, res: Response) => {
                try {
                    const { email, password } = req.body as LoginRequest;

                    if (!email || !password) {
                        return res.status(400).json({
                            success: false,
                            error: 'Email e senha são obrigatórios'
                        });
                    }

                    const supabase = SupabaseWrapper.get();

                    // Authenticate with Supabase Auth
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (authError || !authData.user) {
                        logger.warn('Login failed', { email, error: authError?.message });
                        return res.status(401).json({
                            success: false,
                            error: 'Credenciais inválidas'
                        });
                    }

                    // Get user details from database
                    const user = await getUserByEmail(email);

                    if (!user) {
                        logger.warn('User authenticated but not found in database', { email });
                        return res.status(401).json({
                            success: false,
                            error: 'Usuário não cadastrado no sistema. Entre em contato com o administrador.'
                        });
                    }

                    logger.info('User logged in successfully', { email, userType: user.userType });

                    return res.status(200).json({
                        success: true,
                        data: {
                            token: authData.session?.access_token,
                            refreshToken: authData.session?.refresh_token,
                            user
                        }
                    });
                } catch (error) {
                    logger.error('Login error', { error });
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
            })
        ],

        'register': [
            new Pair(RequestType.POST, async (req: Request, res: Response) => {
                try {
                    const { email, password, nome, telefone, cpf } = req.body as RegisterRequest;

                    if (!email || !password || !nome || !telefone || !cpf) {
                        return res.status(400).json({
                            success: false,
                            error: 'Todos os campos são obrigatórios'
                        });
                    }

                    const supabase = SupabaseWrapper.get();

                    // Check if user already exists in responsaveis
                    const { data: existingUser } = await supabase
                        .from('responsaveis')
                        .select('id_responsavel')
                        .or(`email_responsavel.eq.${email},cpf_responsavel.eq.${cpf}`)
                        .maybeSingle();

                    if (existingUser) {
                        return res.status(400).json({
                            success: false,
                            error: 'Email ou CPF já cadastrado'
                        });
                    }

                    // Create Supabase Auth user
                    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                        email,
                        password,
                        email_confirm: true
                    });

                    if (authError || !authData.user) {
                        logger.error('Failed to create auth user', { email, error: authError?.message });
                        return res.status(400).json({
                            success: false,
                            error: authError?.message || 'Erro ao criar usuário'
                        });
                    }

                    // Create entry in responsaveis table
                    const { data: responsavel, error: dbError } = await supabase
                        .from('responsaveis')
                        .insert({
                            nome_responsavel: nome,
                            email_responsavel: email,
                            telefone_responsavel: telefone,
                            cpf_responsavel: cpf
                        })
                        .select()
                        .single();

                    if (dbError || !responsavel) {
                        // Rollback: delete auth user if database insert fails
                        await supabase.auth.admin.deleteUser(authData.user.id);
                        logger.error('Failed to create responsavel entry', { email, error: dbError?.message });
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao cadastrar usuário no sistema'
                        });
                    }

                    logger.info('New responsavel registered', { email, id: responsavel.id_responsavel });

                    return res.status(201).json({
                        success: true,
                        data: {
                            user: {
                                id: responsavel.id_responsavel,
                                email: responsavel.email_responsavel,
                                userType: 'responsavel' as const,
                                name: responsavel.nome_responsavel
                            }
                        }
                    });
                } catch (error) {
                    logger.error('Registration error', { error });
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
            })
        ],

        'me': [
            new Pair(RequestType.GET, async (req: Request, res: Response) => {
                try {
                    const authHeader = req.headers.authorization;
                    
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return res.status(401).json({
                            success: false,
                            error: 'Token não fornecido'
                        });
                    }

                    const token = authHeader.substring(7);
                    const supabase = SupabaseWrapper.get();

                    // Verify token
                    const { data: { user }, error } = await supabase.auth.getUser(token);

                    if (error || !user) {
                        return res.status(401).json({
                            success: false,
                            error: 'Token inválido ou expirado'
                        });
                    }

                    // Get user details from database
                    const authUser = await getUserByEmail(user.email!);

                    if (!authUser) {
                        return res.status(404).json({
                            success: false,
                            error: 'Usuário não encontrado no sistema'
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        data: { user: authUser }
                    });
                } catch (error) {
                    logger.error('Get user error', { error });
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
            })
        ],

        'refresh': [
            new Pair(RequestType.POST, async (req: Request, res: Response) => {
                try {
                    const { refreshToken } = req.body;

                    if (!refreshToken) {
                        return res.status(400).json({
                            success: false,
                            error: 'Refresh token é obrigatório'
                        });
                    }

                    const supabase = SupabaseWrapper.get();

                    const { data, error } = await supabase.auth.refreshSession({
                        refresh_token: refreshToken
                    });

                    if (error || !data.session) {
                        return res.status(401).json({
                            success: false,
                            error: 'Refresh token inválido ou expirado'
                        });
                    }

                    const user = await getUserByEmail(data.user!.email!);

                    return res.status(200).json({
                        success: true,
                        data: {
                            token: data.session.access_token,
                            refreshToken: data.session.refresh_token,
                            user
                        }
                    });
                } catch (error) {
                    logger.error('Refresh token error', { error });
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
            })
        ],

        'logout': [
            new Pair(RequestType.POST, async (req: Request, res: Response) => {
                try {
                    const authHeader = req.headers.authorization;
                    
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        const token = authHeader.substring(7);
                        const supabase = SupabaseWrapper.get();
                        
                        // Sign out from Supabase (invalidates the session)
                        await supabase.auth.admin.signOut(token);
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Logout realizado com sucesso'
                    });
                } catch (error) {
                    // Even if there's an error, we return success since client should clear tokens
                    logger.warn('Logout error (non-critical)', { error });
                    return res.status(200).json({
                        success: true,
                        message: 'Logout realizado'
                    });
                }
            })
        ]
    }
};
