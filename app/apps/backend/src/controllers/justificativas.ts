import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, validateRequiredFields } from '../utils/validation';
import { registrarLog } from './logs';

const log = createControllerLogger('justificativas');

type JustificativasListQuery = {
    page?: string;
    pageSize?: string;
    alunoId?: string;
    docenteId?: string;
    aprovado?: string;
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

async function ensureEntityExists(table: string, idColumn: string, idValue: number): Promise<boolean> {
    const { data, error } = await SupabaseWrapper.get()
        .from(table)
        .select(idColumn)
        .eq(idColumn, idValue)
        .maybeSingle();

    if (error) {
        log.error('ensureEntityExists', `Erro ao verificar entidade ${table}`, error);
        throw error;
    }

    return Boolean(data);
}

export default class JustificativaController {
    static async getJustificativas(req: Request<unknown, unknown, unknown, JustificativasListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { alunoId, docenteId, aprovado } = req.query;

            log.info('getJustificativas', 'Listando justificativas', {
                page,
                pageSize,
                alunoId,
                docenteId,
                aprovado
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('justificativa')
                .select(`
                    id_justificativa,
                    created_at,
                    id_aluno,
                    id_docente,
                    motivo_justificativa,
                    anexo_url,
                    aprovado_por_docente_justificativa,
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (alunoId && isPositiveInteger(alunoId)) {
                query = query.eq('id_aluno', Number(alunoId));
            }

            if (docenteId && isPositiveInteger(docenteId)) {
                query = query.eq('id_docente', Number(docenteId));
            }

            if (aprovado !== undefined) {
                const isAprovado = aprovado === 'true';
                query = query.eq('aprovado_por_docente_justificativa', isAprovado);
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getJustificativas', 'Erro ao buscar justificativas', error);
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
            log.error('getJustificativas', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getJustificativaById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('justificativa')
                .select(`
                    id_justificativa,
                    created_at,
                    id_aluno,
                    id_docente,
                    motivo_justificativa,
                    anexo_url,
                    aprovado_por_docente_justificativa,
                    alunos ( id_aluno, nome_aluno ),
                    docentes ( id_docente, nome_docente )
                `)
                .eq('id_justificativa', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getJustificativaById', 'Erro ao buscar justificativa', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Justificativa não encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getJustificativaById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createJustificativa(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['id_aluno', 'motivo_justificativa']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            if (!isPositiveInteger(payload.id_aluno)) {
                return res.status(400).json({
                    error: 'ID de aluno deve ser um inteiro positivo'
                });
            }

            if (payload.id_docente !== undefined && !isPositiveInteger(payload.id_docente)) {
                return res.status(400).json({
                    error: 'ID de docente inválido'
                });
            }

            // Verify aluno exists
            const alunoExists = await ensureEntityExists('alunos', 'id_aluno', Number(payload.id_aluno));
            if (!alunoExists) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Verify docente exists if provided
            if (payload.id_docente !== undefined) {
                const docenteExists = await ensureEntityExists('docentes', 'id_docente', Number(payload.id_docente));
                if (!docenteExists) {
                    return res.status(404).json({
                        error: 'Docente não encontrado'
                    });
                }
            }

            const insertPayload = {
                id_aluno: Number(payload.id_aluno),
                id_docente: payload.id_docente ? Number(payload.id_docente) : null,
                motivo_justificativa: payload.motivo_justificativa,
                anexo_url: payload.anexo_url || null,
                aprovado_por_docente_justificativa: payload.aprovado_por_docente_justificativa ?? null
            };

            const { data, error } = await SupabaseWrapper.get()
                .from('justificativa')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                log.error('createJustificativa', 'Erro ao criar justificativa', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade
            await registrarLog({
                acao: 'justificativa_criada',
                descricao: `Justificativa enviada para aluno #${data.id_aluno}`,
                entidade_tipo: 'justificativa',
                entidade_id: data.id_justificativa,
                dados_adicionais: { 
                    id_aluno: data.id_aluno,
                    motivo: data.motivo_justificativa
                }
            });

            return res.status(201).json({
                success: true,
                data,
                message: 'Justificativa criada com sucesso'
            });
        } catch (error) {
            log.error('createJustificativa', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateJustificativa(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            const { data: existingJustificativa, error: fetchError } = await SupabaseWrapper.get()
                .from('justificativa')
                .select('id_justificativa')
                .eq('id_justificativa', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updateJustificativa', 'Erro ao buscar justificativa', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingJustificativa) {
                return res.status(404).json({
                    error: 'Justificativa não encontrada'
                });
            }

            const updates: Record<string, unknown> = {};

            if (payload.id_aluno !== undefined) {
                if (!isPositiveInteger(payload.id_aluno)) {
                    return res.status(400).json({
                        error: 'ID de aluno inválido'
                    });
                }

                const exists = await ensureEntityExists('alunos', 'id_aluno', Number(payload.id_aluno));
                if (!exists) {
                    return res.status(404).json({
                        error: 'Aluno não encontrado'
                    });
                }

                updates.id_aluno = Number(payload.id_aluno);
            }

            if (payload.id_docente !== undefined) {
                if (payload.id_docente !== null && !isPositiveInteger(payload.id_docente)) {
                    return res.status(400).json({
                        error: 'ID de docente inválido'
                    });
                }

                if (payload.id_docente !== null) {
                    const exists = await ensureEntityExists('docentes', 'id_docente', Number(payload.id_docente));
                    if (!exists) {
                        return res.status(404).json({
                            error: 'Docente não encontrado'
                        });
                    }
                    updates.id_docente = Number(payload.id_docente);
                } else {
                    updates.id_docente = null;
                }
            }

            if (payload.motivo_justificativa !== undefined) {
                if (typeof payload.motivo_justificativa !== 'string' || !payload.motivo_justificativa.trim()) {
                    return res.status(400).json({
                        error: 'Motivo da justificativa inválido'
                    });
                }
                updates.motivo_justificativa = payload.motivo_justificativa.trim();
            }

            if (payload.anexo_url !== undefined) {
                updates.anexo_url = payload.anexo_url;
            }

            if (payload.aprovado_por_docente_justificativa !== undefined) {
                updates.aprovado_por_docente_justificativa = payload.aprovado_por_docente_justificativa;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('justificativa')
                .update(updates)
                .eq('id_justificativa', Number(id))
                .select()
                .single();

            if (error) {
                log.error('updateJustificativa', 'Erro ao atualizar justificativa', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade se aprovação foi alterada
            if (payload.aprovado_por_docente_justificativa !== undefined) {
                const acao = data.aprovado_por_docente_justificativa ? 'justificativa_aprovada' : 'justificativa_rejeitada';
                const descricao = data.aprovado_por_docente_justificativa 
                    ? `Justificativa #${data.id_justificativa} foi aprovada`
                    : `Justificativa #${data.id_justificativa} foi rejeitada`;
                
                await registrarLog({
                    acao,
                    descricao,
                    entidade_tipo: 'justificativa',
                    entidade_id: data.id_justificativa,
                    dados_adicionais: { 
                        id_aluno: data.id_aluno,
                        aprovado: data.aprovado_por_docente_justificativa
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Justificativa atualizada com sucesso'
            });
        } catch (error) {
            log.error('updateJustificativa', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deleteJustificativa(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data: existingJustificativa, error: fetchError } = await SupabaseWrapper.get()
                .from('justificativa')
                .select('id_justificativa')
                .eq('id_justificativa', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteJustificativa', 'Erro ao buscar justificativa', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingJustificativa) {
                return res.status(404).json({
                    error: 'Justificativa não encontrada'
                });
            }

            // Check if justificativa is linked to any presenca
            const { data: linkedPresencas, error: presencaError } = await SupabaseWrapper.get()
                .from('presencas')
                .select('id_presenca')
                .eq('id_justificativa', Number(id))
                .limit(1);

            if (presencaError) {
                log.error('deleteJustificativa', 'Erro ao verificar presenças vinculadas', presencaError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: presencaError.message
                });
            }

            if (linkedPresencas && linkedPresencas.length > 0) {
                return res.status(400).json({
                    error: 'Não é possível excluir justificativa vinculada a uma presença'
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('justificativa')
                .delete()
                .eq('id_justificativa', Number(id));

            if (error) {
                log.error('deleteJustificativa', 'Erro ao remover justificativa', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Justificativa removida com sucesso'
            });
        } catch (error) {
            log.error('deleteJustificativa', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const justificativaController: EndpointController = {
    name: 'justificativas',
    routes: {
        'listar': [
            { key: RequestType.GET, value: JustificativaController.getJustificativas }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: JustificativaController.getJustificativaById }
        ],
        'criar': [
            { key: RequestType.POST, value: JustificativaController.createJustificativa }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: JustificativaController.updateJustificativa }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: JustificativaController.deleteJustificativa }
        ]
    }
};

export { justificativaController };
