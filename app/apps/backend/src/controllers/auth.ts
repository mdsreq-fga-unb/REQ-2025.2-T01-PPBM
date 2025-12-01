import { Request, Response } from 'express';
import { EndpointController, RequestType } from '../interfaces/index';
import { RegisterRequest } from '../interfaces/auth';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { getUserByEmail } from '../middleware/auth';
import { Pair } from '../utils/utils';
import { createControllerLogger } from '../logger';

const log = createControllerLogger('auth');

export const authController: EndpointController = {
    name: 'auth',
    routes: {
        // Note: Login is now handled directly on the frontend via Supabase client
        // The backend only verifies tokens and returns user data

        'user-by-email': [
            new Pair(RequestType.POST, async (req: Request, res: Response) => {
                try {
                    const { email } = req.body;

                    if (!email) {
                        return res.status(400).json({
                            success: false,
                            error: 'Email é obrigatório'
                        });
                    }

                    // Verify that the request has a valid token
                    const authHeader = req.headers.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return res.status(401).json({
                            success: false,
                            error: 'Token não fornecido'
                        });
                    }

                    const token = authHeader.substring(7);
                    const supabase = SupabaseWrapper.get();

                    // Verify token and get authenticated user (uses service role to validate JWT)
                    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

                    if (authError || !authUser) {
                        log.warn('user-by-email', 'Invalid token', { email });
                        return res.status(401).json({
                            success: false,
                            error: 'Token inválido'
                        });
                    }

                    // Ensure the requested email matches the authenticated user
                    if (authUser.email !== email) {
                        log.warn('user-by-email', 'Email mismatch', { requestedEmail: email, authEmail: authUser.email });
                        return res.status(403).json({
                            success: false,
                            error: 'Não autorizado'
                        });
                    }

                    // Get user details from database
                    const user = await getUserByEmail(email);

                    if (!user) {
                        log.warn('user-by-email', 'User not found in database', { email });
                        return res.status(404).json({
                            success: false,
                            error: 'Usuário não cadastrado no sistema. Entre em contato com o administrador.'
                        });
                    }

                    log.info('user-by-email', 'User found', { email, userType: user.userType });

                    return res.status(200).json({
                        success: true,
                        data: { user }
                    });
                } catch (error) {
                    log.error('user-by-email', 'Error fetching user', { error });
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
                        log.error('register', 'Failed to create auth user', { email, error: authError?.message });
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
                        log.error('register', 'Failed to create responsavel entry', { email, error: dbError?.message });
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao cadastrar usuário no sistema'
                        });
                    }

                    log.info('register', 'New responsavel registered', { email, id: responsavel.id_responsavel });

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
                    log.error('register', 'Registration error', { error });
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
                    log.error('me', 'Get user error', { error });
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno do servidor'
                    });
                }
            })
        ]
    }
};
