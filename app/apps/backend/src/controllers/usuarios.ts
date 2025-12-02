import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';

const log = createControllerLogger('usuarios');

interface UserWithRole {
    id: number;
    email: string;
    nome: string;
    role: 'admin' | 'docente' | 'responsavel';
    created_at: string;
}

export default class UsuarioController {
    /**
     * Lista todos os usuários com seus respectivos roles
     */
    static async getAllUsersWithRoles(req: Request, res: Response): Promise<Response | void> {
        try {
            log.info('getAllUsersWithRoles', 'Listando todos os usuários com roles');

            const supabase = SupabaseWrapper.get();

            // Buscar todos os responsáveis (base de usuários)
            const { data: responsaveis, error: respError } = await supabase
                .from('responsaveis')
                .select('id_responsavel, email_responsavel, nome_responsavel, created_at')
                .order('created_at', { ascending: false });

            if (respError) {
                log.error('getAllUsersWithRoles', 'Erro ao buscar responsáveis', respError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: respError.message
                });
            }

            // Buscar todos os admins
            const { data: admins, error: adminError } = await supabase
                .from('admins')
                .select('id_admin, email');

            if (adminError) {
                log.error('getAllUsersWithRoles', 'Erro ao buscar admins', adminError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: adminError.message
                });
            }

            // Buscar todos os docentes
            const { data: docentes, error: docenteError } = await supabase
                .from('docentes')
                .select('id_docente, email_docente, nome_docente');

            if (docenteError) {
                log.error('getAllUsersWithRoles', 'Erro ao buscar docentes', docenteError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: docenteError.message
                });
            }

            // Criar sets para verificação rápida
            const adminEmails = new Set(admins?.map(a => a.email) || []);
            const docenteEmails = new Set(docentes?.map(d => d.email_docente) || []);

            // Mapear usuários com seus roles
            const usersWithRoles: UserWithRole[] = (responsaveis || []).map(resp => {
                let role: 'admin' | 'docente' | 'responsavel' = 'responsavel';
                
                if (adminEmails.has(resp.email_responsavel)) {
                    role = 'admin';
                } else if (docenteEmails.has(resp.email_responsavel)) {
                    role = 'docente';
                }

                return {
                    id: resp.id_responsavel,
                    email: resp.email_responsavel,
                    nome: resp.nome_responsavel,
                    role,
                    created_at: resp.created_at
                };
            });

            log.info('getAllUsersWithRoles', `Encontrados ${usersWithRoles.length} usuários`);
            return res.status(200).json({
                success: true,
                data: usersWithRoles,
                total: usersWithRoles.length
            });
        } catch (error) {
            log.error('getAllUsersWithRoles', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza o role de um usuário (apenas para docentes e responsáveis, não admins)
     */
    static async updateUserRole(req: Request, res: Response): Promise<Response | void> {
        try {
            const { email } = req.params;
            const { newRole } = req.body;

            if (!email) {
                return res.status(400).json({
                    error: 'Email é obrigatório'
                });
            }

            if (!newRole || !['docente', 'responsavel'].includes(newRole)) {
                return res.status(400).json({
                    error: 'Role inválido. Valores permitidos: docente, responsavel'
                });
            }

            log.info('updateUserRole', `Atualizando role do usuário: ${email} para ${newRole}`);

            const supabase = SupabaseWrapper.get();

            // Verificar se o usuário existe como responsável
            const { data: responsavel, error: respError } = await supabase
                .from('responsaveis')
                .select('id_responsavel, email_responsavel, nome_responsavel')
                .eq('email_responsavel', email)
                .maybeSingle();

            if (respError || !responsavel) {
                log.warn('updateUserRole', `Usuário não encontrado: ${email}`);
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            // Verificar se o usuário é admin (não pode alterar admins)
            const { data: existingAdmin } = await supabase
                .from('admins')
                .select('id_admin')
                .eq('email', email)
                .maybeSingle();

            if (existingAdmin) {
                log.warn('updateUserRole', `Tentativa de alterar role de admin: ${email}`);
                return res.status(403).json({
                    error: 'Não é permitido alterar o role de administradores'
                });
            }

            // Verificar o role atual do usuário
            const { data: existingDocente } = await supabase
                .from('docentes')
                .select('id_docente')
                .eq('email_docente', email)
                .maybeSingle();

            const currentRole = existingDocente ? 'docente' : 'responsavel';

            if (currentRole === newRole) {
                return res.status(200).json({
                    success: true,
                    message: 'Usuário já possui este role'
                });
            }

            // Atualizar o role
            if (newRole === 'docente') {
                // Adicionar à tabela de docentes
                const { error: insertError } = await supabase
                    .from('docentes')
                    .insert({
                        email_docente: email,
                        nome_docente: responsavel.nome_responsavel
                    });

                if (insertError) {
                    log.error('updateUserRole', 'Erro ao adicionar docente', insertError);
                    return res.status(500).json({
                        error: 'Erro ao atualizar role',
                        details: insertError.message
                    });
                }
            } else if (newRole === 'responsavel' && existingDocente) {
                // Remover da tabela de docentes
                const { error: deleteError } = await supabase
                    .from('docentes')
                    .delete()
                    .eq('email_docente', email);

                if (deleteError) {
                    log.error('updateUserRole', 'Erro ao remover docente', deleteError);
                    return res.status(500).json({
                        error: 'Erro ao atualizar role',
                        details: deleteError.message
                    });
                }
            }

            log.info('updateUserRole', `Role atualizado com sucesso: ${email} -> ${newRole}`);
            return res.status(200).json({
                success: true,
                message: `Role atualizado para ${newRole}`,
                data: {
                    email,
                    newRole
                }
            });
        } catch (error) {
            log.error('updateUserRole', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Lista todos os usuários
     */
    static async getUsuarios(req: Request, res: Response): Promise<Response | void> {
        try {
            log.info('getUsuarios', 'Listando todos os usuários');

            const { data, error } = await SupabaseWrapper.get()
                .from('admins')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                log.error('getUsuarios', 'Erro ao buscar usuários', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            log.info('getUsuarios', `Encontrados ${data?.length || 0} usuários`);
            return res.status(200).json({
                success: true,
                data: data || [],
                total: data?.length || 0
            });
        } catch (error) {
            log.error('getUsuarios', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca um usuário por ID
     */
    static async getUsuarioById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getUsuarioById', `Buscando usuário com ID: ${id}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('admins')
                .select('*')
                .eq('id_admin', id)
                .maybeSingle();

            if (error) {
                log.error('getUsuarioById', 'Erro ao buscar usuário', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                log.warn('getUsuarioById', `Usuário não encontrado: ${id}`);
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            log.info('getUsuarioById', `Usuário encontrado: ${id}`);
            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getUsuarioById', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Verifica se um usuário existe pelo email
     */
    static async verificarUsuarioPorEmail(req: Request, res: Response): Promise<Response | void> {
        try {
            const { email } = req.query;

            if (!email || typeof email !== 'string') {
                return res.status(400).json({
                    error: 'Email é obrigatório'
                });
            }

            log.info('verificarUsuarioPorEmail', `Verificando usuário com email: ${email}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('admins')
                .select('id_admin, email')
                .eq('email', email)
                .maybeSingle();

            if (error) {
                log.error('verificarUsuarioPorEmail', 'Erro ao verificar usuário', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            const exists = !!data;
            log.info('verificarUsuarioPorEmail', `Usuário ${exists ? 'encontrado' : 'não encontrado'}: ${email}`);

            return res.status(200).json({
                success: true,
                exists,
                email,
                userId: data?.id_admin || null
            });
        } catch (error) {
            log.error('verificarUsuarioPorEmail', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cria um novo usuário
     */
    static async createUsuario(req: Request, res: Response): Promise<Response | void> {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    error: 'Email é obrigatório'
                });
            }

            // Verificar se já existe um usuário com este email
            log.info('createUsuario', `Verificando se usuário já existe: ${email}`);
            const { data: existingUser } = await SupabaseWrapper.get()
                .from('admins')
                .select('id_admin')
                .eq('email', email)
                .maybeSingle();

            if (existingUser) {
                log.warn('createUsuario', `Usuário já existe: ${email}`);
                return res.status(409).json({
                    error: 'Usuário já existe com este email'
                });
            }

            log.info('createUsuario', `Criando novo usuário: ${email}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('admins')
                .insert([{ email }])
                .select()
                .single();

            if (error) {
                log.error('createUsuario', 'Erro ao criar usuário', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            log.info('createUsuario', `Usuário criado com sucesso: ${data.id_admin}`);
            return res.status(201).json({
                success: true,
                data,
                message: 'Usuário criado com sucesso'
            });
        } catch (error) {
            log.error('createUsuario', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza um usuário existente
     */
    static async updateUsuario(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { email } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            if (!email) {
                return res.status(400).json({
                    error: 'Email é obrigatório'
                });
            }

            // Verificar se o usuário existe
            log.info('updateUsuario', `Verificando se usuário existe: ${id}`);
            const { data: existingUser } = await SupabaseWrapper.get()
                .from('admins')
                .select('id_admin')
                .eq('id_admin', id)
                .maybeSingle();

            if (!existingUser) {
                log.warn('updateUsuario', `Usuário não encontrado: ${id}`);
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            // Verificar se já existe outro usuário com este email
            const { data: emailExists } = await SupabaseWrapper.get()
                .from('admins')
                .select('id_admin')
                .eq('email', email)
                .neq('id_admin', id)
                .maybeSingle();

            if (emailExists) {
                log.warn('updateUsuario', `Email já em uso: ${email}`);
                return res.status(409).json({
                    error: 'Email já está sendo usado por outro usuário'
                });
            }

            log.info('updateUsuario', `Atualizando usuário: ${id}`);

            const { data, error } = await SupabaseWrapper.get()
                .from('admins')
                .update({
                    email,
                    updated_at: new Date().toISOString()
                })
                .eq('id_admin', id)
                .select()
                .single();

            if (error) {
                log.error('updateUsuario', 'Erro ao atualizar usuário', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            log.info('updateUsuario', `Usuário atualizado com sucesso: ${id}`);
            return res.status(200).json({
                success: true,
                data,
                message: 'Usuário atualizado com sucesso'
            });
        } catch (error) {
            log.error('updateUsuario', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remove um usuário
     */
    static async deleteUsuario(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            // Verificar se o usuário existe
            log.info('deleteUsuario', `Verificando se usuário existe: ${id}`);
            const { data: existingUser } = await SupabaseWrapper.get()
                .from('admins')
                .select('id_admin, email')
                .eq('id_admin', id)
                .maybeSingle();

            if (!existingUser) {
                log.warn('deleteUsuario', `Usuário não encontrado: ${id}`);
                return res.status(404).json({
                    error: 'Usuário não encontrado'
                });
            }

            log.info('deleteUsuario', `Removendo usuário: ${id}`);

            const { error } = await SupabaseWrapper.get()
                .from('admins')
                .delete()
                .eq('id_admin', id);

            if (error) {
                log.error('deleteUsuario', 'Erro ao remover usuário', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            log.info('deleteUsuario', `Usuário removido com sucesso: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Usuário removido com sucesso'
            });
        } catch (error) {
            log.error('deleteUsuario', 'Erro inesperado', error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

// Definir o controller com todas as rotas
const usuarioController: EndpointController = {
    name: "usuarios",
    routes: {
        "listar": [
            { key: RequestType.GET, value: UsuarioController.getUsuarios }
        ],
        "todos-com-roles": [
            { key: RequestType.GET, value: UsuarioController.getAllUsersWithRoles }
        ],
        "atualizar-role/:email": [
            { key: RequestType.PUT, value: UsuarioController.updateUserRole }
        ],
        "detalhe/:id": [
            { key: RequestType.GET, value: UsuarioController.getUsuarioById }
        ],
        "verificar-email": [
            { key: RequestType.GET, value: UsuarioController.verificarUsuarioPorEmail }
        ],
        "criar": [
            { key: RequestType.POST, value: UsuarioController.createUsuario }
        ],
        "atualizar/:id": [
            { key: RequestType.PUT, value: UsuarioController.updateUsuario }
        ],
        "deletar/:id": [
            { key: RequestType.DELETE, value: UsuarioController.deleteUsuario }
        ]
    }
};

export { usuarioController };
