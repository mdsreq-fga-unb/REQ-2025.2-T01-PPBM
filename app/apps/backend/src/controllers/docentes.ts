import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import logger from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, isValidCPF, isValidEmail, sanitizeCPF, validateRequiredFields } from '../utils/validation';

type DocentesListQuery = {
    page?: string;
    pageSize?: string;
    unidade?: string;
    cidade?: string;
    nome?: string;
    email?: string;
    cpf?: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePagination(page?: string, pageSize?: string): { page: number; pageSize: number } {
    let parsedPage = Number(page ?? DEFAULT_PAGE);
    let parsedPageSize = Number(pageSize ?? DEFAULT_PAGE_SIZE);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        parsedPage = DEFAULT_PAGE;
    }

    if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
        parsedPageSize = DEFAULT_PAGE_SIZE;
    }

    if (parsedPageSize > MAX_PAGE_SIZE) {
        parsedPageSize = MAX_PAGE_SIZE;
    }

    return { page: parsedPage, pageSize: parsedPageSize };
}

export default class DocenteController {
    static async getDocentes(req: Request<unknown, unknown, unknown, DocentesListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { unidade, cidade, nome, email, cpf } = req.query;

            logger.info('[docentes][getDocentes] Listando docentes', {
                page,
                pageSize,
                unidade,
                cidade,
                nome,
                email,
                cpf
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('docentes')
                .select(`
                    id_docente,
                    created_at,
                    cpf_docente,
                    unidade_docente,
                    cidade_docente,
                    nome_docente,
                    email_docente
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (unidade) {
                query = query.ilike('unidade_docente', `%${unidade.trim()}%`);
            }

            if (cidade) {
                query = query.ilike('cidade_docente', `%${cidade.trim()}%`);
            }

            if (nome) {
                query = query.ilike('nome_docente', `%${nome.trim()}%`);
            }

            if (email) {
                query = query.ilike('email_docente', `%${email.trim()}%`);
            }

            if (cpf) {
                const sanitizedCPF = sanitizeCPF(cpf);
                if (sanitizedCPF) {
                    query = query.eq('cpf_docente', sanitizedCPF);
                }
            }

            const { data, error, count } = await query;

            if (error) {
                logger.error('[docentes][getDocentes] Erro ao buscar docentes', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data: data || [],
                total: count ?? data?.length ?? 0,
                page,
                pageSize
            });
        } catch (error) {
            logger.error('[docentes][getDocentes] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getDocenteById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            logger.info('[docentes][getDocenteById] Buscando docente', { id });

            const { data, error } = await SupabaseWrapper.get()
                .from('docentes')
                .select(`
                    id_docente,
                    created_at,
                    cpf_docente,
                    unidade_docente,
                    cidade_docente,
                    nome_docente,
                    email_docente
                `)
                .eq('id_docente', Number(id))
                .maybeSingle();

            if (error) {
                logger.error('[docentes][getDocenteById] Erro ao buscar docente', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                logger.warn('[docentes][getDocenteById] Docente não encontrado', { id });
                return res.status(404).json({
                    error: 'Docente não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            logger.error('[docentes][getDocenteById] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createDocente(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['nome_docente', 'cpf_docente', 'email_docente']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            const sanitizedCPF = sanitizeCPF(payload.cpf_docente);

            if (!isValidCPF(sanitizedCPF)) {
                return res.status(400).json({
                    error: 'CPF inválido'
                });
            }

            if (!isValidEmail(payload.email_docente)) {
                return res.status(400).json({
                    error: 'Email inválido'
                });
            }

            const normalizedEmail = payload.email_docente.trim().toLowerCase();

            logger.info('[docentes][createDocente] Verificando duplicidades', {
                cpf: sanitizedCPF,
                email: normalizedEmail
            });

            const [{ data: existingCpf, error: cpfError }, { data: existingEmail, error: emailError }] = await Promise.all([
                SupabaseWrapper.get()
                    .from('docentes')
                    .select('id_docente')
                    .eq('cpf_docente', sanitizedCPF)
                    .maybeSingle(),
                SupabaseWrapper.get()
                    .from('docentes')
                    .select('id_docente')
                    .eq('email_docente', normalizedEmail)
                    .maybeSingle()
            ]);

            if ((cpfError && cpfError.code !== 'PGRST116') || (emailError && emailError.code !== 'PGRST116')) {
                logger.error('[docentes][createDocente] Erro ao verificar duplicidades', { cpfError, emailError });
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: cpfError?.message ?? emailError?.message
                });
            }

            if (existingCpf) {
                return res.status(409).json({
                    error: 'Já existe um docente com este CPF'
                });
            }

            if (existingEmail) {
                return res.status(409).json({
                    error: 'Já existe um docente com este email'
                });
            }

            const insertPayload = {
                nome_docente: payload.nome_docente,
                cpf_docente: sanitizedCPF,
                email_docente: normalizedEmail,
                unidade_docente: payload.unidade_docente ?? null,
                cidade_docente: payload.cidade_docente ?? null
            };

            logger.info('[docentes][createDocente] Criando docente', { nome: insertPayload.nome_docente });

            const { data, error } = await SupabaseWrapper.get()
                .from('docentes')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                logger.error('[docentes][createDocente] Erro ao criar docente', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Docente criado com sucesso'
            });
        } catch (error) {
            logger.error('[docentes][createDocente] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateDocente(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            const { data: existingDocente, error: fetchError } = await SupabaseWrapper.get()
                .from('docentes')
                .select('id_docente')
                .eq('id_docente', Number(id))
                .maybeSingle();

            if (fetchError) {
                logger.error('[docentes][updateDocente] Erro ao buscar docente', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingDocente) {
                return res.status(404).json({
                    error: 'Docente não encontrado'
                });
            }

            const updates: Record<string, unknown> = {};

            if (payload.nome_docente !== undefined) {
                updates.nome_docente = payload.nome_docente;
            }

            if (payload.unidade_docente !== undefined) {
                updates.unidade_docente = payload.unidade_docente;
            }

            if (payload.cidade_docente !== undefined) {
                updates.cidade_docente = payload.cidade_docente;
            }

            if (payload.cpf_docente !== undefined) {
                const sanitizedCPF = sanitizeCPF(payload.cpf_docente);

                if (!isValidCPF(sanitizedCPF)) {
                    return res.status(400).json({
                        error: 'CPF inválido'
                    });
                }

                const { data: duplicateCpf, error: cpfError } = await SupabaseWrapper.get()
                    .from('docentes')
                    .select('id_docente')
                    .eq('cpf_docente', sanitizedCPF)
                    .neq('id_docente', Number(id))
                    .maybeSingle();

                if (cpfError && cpfError.code !== 'PGRST116') {
                    logger.error('[docentes][updateDocente] Erro ao verificar CPF', cpfError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: cpfError.message
                    });
                }

                if (duplicateCpf) {
                    return res.status(409).json({
                        error: 'Já existe um docente com este CPF'
                    });
                }

                updates.cpf_docente = sanitizedCPF;
            }

            if (payload.email_docente !== undefined) {
                if (!isValidEmail(payload.email_docente)) {
                    return res.status(400).json({
                        error: 'Email inválido'
                    });
                }

                const normalizedEmail = payload.email_docente.trim().toLowerCase();

                const { data: duplicateEmail, error: emailError } = await SupabaseWrapper.get()
                    .from('docentes')
                    .select('id_docente')
                    .eq('email_docente', normalizedEmail)
                    .neq('id_docente', Number(id))
                    .maybeSingle();

                if (emailError && emailError.code !== 'PGRST116') {
                    logger.error('[docentes][updateDocente] Erro ao verificar email', emailError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: emailError.message
                    });
                }

                if (duplicateEmail) {
                    return res.status(409).json({
                        error: 'Já existe um docente com este email'
                    });
                }

                updates.email_docente = normalizedEmail;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('docentes')
                .update(updates)
                .eq('id_docente', Number(id))
                .select()
                .single();

            if (error) {
                logger.error('[docentes][updateDocente] Erro ao atualizar docente', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Docente atualizado com sucesso'
            });
        } catch (error) {
            logger.error('[docentes][updateDocente] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deleteDocente(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data: existingDocente, error: fetchError } = await SupabaseWrapper.get()
                .from('docentes')
                .select('id_docente')
                .eq('id_docente', Number(id))
                .maybeSingle();

            if (fetchError) {
                logger.error('[docentes][deleteDocente] Erro ao buscar docente', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingDocente) {
                return res.status(404).json({
                    error: 'Docente não encontrado'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('docentes')
                .delete()
                .eq('id_docente', Number(id));

            if (error) {
                logger.error('[docentes][deleteDocente] Erro ao remover docente', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Docente removido com sucesso'
            });
        } catch (error) {
            logger.error('[docentes][deleteDocente] Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const docenteController: EndpointController = {
    name: 'docentes',
    routes: {
        'listar': [
            { key: RequestType.GET, value: DocenteController.getDocentes }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: DocenteController.getDocenteById }
        ],
        'criar': [
            { key: RequestType.POST, value: DocenteController.createDocente }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: DocenteController.updateDocente }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: DocenteController.deleteDocente }
        ]
    }
};

export { docenteController };


