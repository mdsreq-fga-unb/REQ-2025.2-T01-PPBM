import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';

const log = createControllerLogger('usuarios');


export default class UsuarioController {
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
