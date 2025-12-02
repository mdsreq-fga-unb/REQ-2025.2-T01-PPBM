import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import { isPositiveInteger, isWithinCapacity, validateRequiredFields } from '../utils/validation';
import { registrarLog } from './logs';

const log = createControllerLogger('turmas');

type TurmasListQuery = {
    page?: string;
    pageSize?: string;
    unidade?: string;
    nome?: string;
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

async function countAlunosInTurma(turmaId: number): Promise<number | null> {
    const { count, error } = await SupabaseWrapper.get()
        .from('alunos_por_turma')
        .select('id_aluno', { count: 'exact', head: true })
        .eq('id_turma', turmaId);

    if (error) {
        log.error('countAlunos', 'Erro ao contar alunos na turma', { turmaId, error });
        return null;
    }

    return count ?? 0;
}

async function countDocentesInTurma(turmaId: number): Promise<number | null> {
    const { count, error } = await SupabaseWrapper.get()
        .from('docentes_por_turma')
        .select('id_docente', { count: 'exact', head: true })
        .eq('id_turma', turmaId);

    if (error) {
        log.error('countDocentes', 'Erro ao contar docentes na turma', { turmaId, error });
        return null;
    }

    return count ?? 0;
}

export default class TurmaController {
    static async getTurmas(req: Request<unknown, unknown, unknown, TurmasListQuery>, res: Response): Promise<Response | void> {
        try {
            const { page, pageSize } = parsePagination(req.query.page, req.query.pageSize);
            const { unidade, nome } = req.query;

            log.info('getTurmas', 'Listando turmas', {
                page,
                pageSize,
                unidade,
                nome
            });

            const start = (page - 1) * pageSize;
            const end = start + pageSize - 1;

            let query = SupabaseWrapper.get()
                .from('turmas')
                .select(`
                    id_turma,
                    created_at,
                    nome_turma,
                    limite_alunos_turma,
                    unidade_turma
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(start, end);

            if (unidade) {
                query = query.ilike('unidade_turma', `%${unidade.trim()}%`);
            }

            if (nome) {
                query = query.ilike('nome_turma', `%${nome.trim()}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                log.error('getTurmas', 'Erro ao buscar turmas', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Add alunos_count and docentes_count for each turma
            const turmasWithCount = await Promise.all(
                (data || []).map(async (turma) => {
                    const [alunosCount, docentesCount] = await Promise.all([
                        countAlunosInTurma(turma.id_turma),
                        countDocentesInTurma(turma.id_turma)
                    ]);
                    return {
                        ...turma,
                        alunos_count: alunosCount ?? 0,
                        docentes_count: docentesCount ?? 0
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: turmasWithCount,
                total: count ?? data?.length ?? 0,
                page,
                pageSize
            });
        } catch (error) {
            log.error('getTurmas', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async getTurmaById(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            log.info('getTurmaById', 'Buscando turma', { id });

            const { data, error } = await SupabaseWrapper.get()
                .from('turmas')
                .select(`
                    id_turma,
                    created_at,
                    nome_turma,
                    limite_alunos_turma,
                    unidade_turma
                `)
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (error) {
                log.error('getTurmaById', 'Erro ao buscar turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            // Fetch associated docentes
            const { data: docentesData, error: docentesError } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .select(`
                    id_docente,
                    docentes (
                        id_docente,
                        nome_docente,
                        email_docente
                    )
                `)
                .eq('id_turma', Number(id));

            if (docentesError) {
                log.error('getTurmaById', 'Erro ao buscar docentes da turma', docentesError);
                // Don't fail the request, just log the error and return turma without docentes
            }

            // Flatten docentes data
            const docentes = (docentesData || []).map((item: any) => ({
                id_docente: item.id_docente,
                nome_docente: item.docentes?.nome_docente,
                email_docente: item.docentes?.email_docente
            }));

            return res.status(200).json({
                success: true,
                data: {
                    ...data,
                    docentes
                }
            });
        } catch (error) {
            log.error('getTurmaById', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async createTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const payload = req.body ?? {};

            const missingFields = validateRequiredFields(payload, ['nome_turma', 'limite_alunos_turma', 'unidade_turma']);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios ausentes',
                    missingFields
                });
            }

            if (!isPositiveInteger(payload.limite_alunos_turma)) {
                return res.status(400).json({
                    error: 'Limite de alunos deve ser um número inteiro positivo'
                });
            }

            const insertPayload = {
                nome_turma: payload.nome_turma,
                limite_alunos_turma: Number(payload.limite_alunos_turma),
                unidade_turma: payload.unidade_turma
            };

            log.info('createTurma', 'Criando turma', { nome: insertPayload.nome_turma });

            const { data, error } = await SupabaseWrapper.get()
                .from('turmas')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                log.error('createTurma', 'Erro ao criar turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Registrar log de atividade
            await registrarLog({
                acao: 'turma_criada',
                descricao: `Turma "${data.nome_turma}" foi criada`,
                entidade_tipo: 'turma',
                entidade_id: data.id_turma,
                dados_adicionais: { nome_turma: data.nome_turma }
            });

            return res.status(201).json({
                success: true,
                data,
                message: 'Turma criada com sucesso'
            });
        } catch (error) {
            log.error('createTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const payload = req.body ?? {};

            const { data: existingTurma, error: fetchError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma, limite_alunos_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('updateTurma', 'Erro ao buscar turma', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingTurma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            const updates: Record<string, unknown> = {};

            if (payload.nome_turma !== undefined) {
                updates.nome_turma = payload.nome_turma;
            }

            if (payload.unidade_turma !== undefined) {
                updates.unidade_turma = payload.unidade_turma;
            }

            if (payload.limite_alunos_turma !== undefined) {
                if (!isPositiveInteger(payload.limite_alunos_turma)) {
                    return res.status(400).json({
                        error: 'Limite de alunos deve ser um número inteiro positivo'
                    });
                }

                const newCapacity = Number(payload.limite_alunos_turma);
                const currentCount = await countAlunosInTurma(Number(id));

                if (currentCount === null) {
                    return res.status(500).json({
                        error: 'Não foi possível validar a capacidade atual da turma'
                    });
                }

                if (!isWithinCapacity(currentCount, newCapacity)) {
                    return res.status(409).json({
                        error: 'Limite de alunos inferior à quantidade atual de alunos matriculados',
                        currentCount,
                        limiteAtual: existingTurma.limite_alunos_turma,
                        novoLimite: newCapacity
                    });
                }

                updates.limite_alunos_turma = newCapacity;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo para atualizar'
                });
            }

            const { data, error } = await SupabaseWrapper.get()
                .from('turmas')
                .update(updates)
                .eq('id_turma', Number(id))
                .select()
                .single();

            if (error) {
                log.error('updateTurma', 'Erro ao atualizar turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                data,
                message: 'Turma atualizada com sucesso'
            });
        } catch (error) {
            log.error('updateTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async deleteTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID inválido'
                });
            }

            const { data: existingTurma, error: fetchError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (fetchError) {
                log.error('deleteTurma', 'Erro ao buscar turma', fetchError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: fetchError.message
                });
            }

            if (!existingTurma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            const currentCount = await countAlunosInTurma(Number(id));

            if (currentCount === null) {
                return res.status(500).json({
                    error: 'Não foi possível verificar matrículas associadas'
                });
            }

            if (currentCount > 0) {
                return res.status(409).json({
                    error: 'Não é possível remover uma turma com alunos matriculados',
                    currentCount
                });
            }

            const { error } = await SupabaseWrapper.get()
                .from('turmas')
                .delete()
                .eq('id_turma', Number(id));

            if (error) {
                log.error('deleteTurma', 'Erro ao remover turma', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Turma removida com sucesso'
            });
        } catch (error) {
            log.error('deleteTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // ============ DOCENTES POR TURMA ============

    static async getDocentesByTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID da turma inválido'
                });
            }

            log.info('getDocentesByTurma', 'Buscando docentes da turma', { turmaId: id });

            // First check if turma exists
            const { data: turma, error: turmaError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (turmaError) {
                log.error('getDocentesByTurma', 'Erro ao verificar turma', turmaError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: turmaError.message
                });
            }

            if (!turma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            // Get docentes for this turma
            const { data, error } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .select(`
                    id_docentes_por_turma,
                    id_docente,
                    id_turma,
                    created_at,
                    docentes (
                        id_docente,
                        nome_docente,
                        email_docente,
                        cpf_docente,
                        unidade_docente,
                        cidade_docente
                    )
                `)
                .eq('id_turma', Number(id));

            if (error) {
                log.error('getDocentesByTurma', 'Erro ao buscar docentes', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Flatten the response to return docente data directly
            const docentes = (data || []).map((item: any) => ({
                id_docentes_por_turma: item.id_docentes_por_turma,
                id_docente: item.id_docente,
                id_turma: item.id_turma,
                ...item.docentes
            }));

            return res.status(200).json({
                success: true,
                data: docentes
            });
        } catch (error) {
            log.error('getDocentesByTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async addDocenteToTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { id_docente } = req.body ?? {};

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID da turma inválido'
                });
            }

            if (!id_docente || !isPositiveInteger(id_docente)) {
                return res.status(400).json({
                    error: 'ID do docente inválido ou ausente'
                });
            }

            log.info('addDocenteToTurma', 'Adicionando docente à turma', { turmaId: id, docenteId: id_docente });

            // Check if turma exists
            const { data: turma, error: turmaError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (turmaError || !turma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            // Check if docente exists
            const { data: docente, error: docenteError } = await SupabaseWrapper.get()
                .from('docentes')
                .select('id_docente')
                .eq('id_docente', Number(id_docente))
                .maybeSingle();

            if (docenteError || !docente) {
                return res.status(404).json({
                    error: 'Docente não encontrado'
                });
            }

            // Check if association already exists
            const { data: existing } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .select('id_docentes_por_turma')
                .eq('id_turma', Number(id))
                .eq('id_docente', Number(id_docente))
                .maybeSingle();

            if (existing) {
                return res.status(409).json({
                    error: 'Docente já está associado a esta turma'
                });
            }

            // Add docente to turma
            const { data, error } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .insert([{
                    id_turma: Number(id),
                    id_docente: Number(id_docente)
                }])
                .select()
                .single();

            if (error) {
                log.error('addDocenteToTurma', 'Erro ao adicionar docente', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Docente adicionado à turma com sucesso'
            });
        } catch (error) {
            log.error('addDocenteToTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async removeDocenteFromTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id, docenteId } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID da turma inválido'
                });
            }

            if (!isPositiveInteger(docenteId)) {
                return res.status(400).json({
                    error: 'ID do docente inválido'
                });
            }

            log.info('removeDocenteFromTurma', 'Removendo docente da turma', { turmaId: id, docenteId });

            // Check if association exists
            const { data: existing } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .select('id_docentes_por_turma')
                .eq('id_turma', Number(id))
                .eq('id_docente', Number(docenteId))
                .maybeSingle();

            if (!existing) {
                return res.status(404).json({
                    error: 'Docente não está associado a esta turma'
                });
            }

            // Remove association
            const { error } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .delete()
                .eq('id_turma', Number(id))
                .eq('id_docente', Number(docenteId));

            if (error) {
                log.error('removeDocenteFromTurma', 'Erro ao remover docente', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Docente removido da turma com sucesso'
            });
        } catch (error) {
            log.error('removeDocenteFromTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    static async updateDocentesForTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { docente_ids } = req.body ?? {};

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID da turma inválido'
                });
            }

            if (!Array.isArray(docente_ids)) {
                return res.status(400).json({
                    error: 'docente_ids deve ser um array de IDs'
                });
            }

            // Validate all IDs are positive integers
            const validIds = docente_ids.every((dId: any) => isPositiveInteger(dId) || (typeof dId === 'number' && dId > 0));
            if (!validIds) {
                return res.status(400).json({
                    error: 'Todos os IDs de docentes devem ser números inteiros positivos'
                });
            }

            log.info('updateDocentesForTurma', 'Atualizando docentes da turma', { turmaId: id, docenteIds: docente_ids });

            // Check if turma exists
            const { data: turma, error: turmaError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (turmaError || !turma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            // Verify all docentes exist
            if (docente_ids.length > 0) {
                const { data: existingDocentes, error: docentesError } = await SupabaseWrapper.get()
                    .from('docentes')
                    .select('id_docente')
                    .in('id_docente', docente_ids.map(Number));

                if (docentesError) {
                    log.error('updateDocentesForTurma', 'Erro ao verificar docentes', docentesError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor'
                    });
                }

                const foundIds = (existingDocentes || []).map((d: any) => d.id_docente);
                const missingIds = docente_ids.filter((dId: any) => !foundIds.includes(Number(dId)));

                if (missingIds.length > 0) {
                    return res.status(404).json({
                        error: 'Alguns docentes não foram encontrados',
                        missingIds
                    });
                }
            }

            // Delete all current associations
            const { error: deleteError } = await SupabaseWrapper.get()
                .from('docentes_por_turma')
                .delete()
                .eq('id_turma', Number(id));

            if (deleteError) {
                log.error('updateDocentesForTurma', 'Erro ao remover associações existentes', deleteError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: deleteError.message
                });
            }

            // Insert new associations if any
            if (docente_ids.length > 0) {
                const insertData = docente_ids.map((dId: any) => ({
                    id_turma: Number(id),
                    id_docente: Number(dId)
                }));

                const { error: insertError } = await SupabaseWrapper.get()
                    .from('docentes_por_turma')
                    .insert(insertData);

                if (insertError) {
                    log.error('updateDocentesForTurma', 'Erro ao inserir novas associações', insertError);
                    return res.status(500).json({
                        error: 'Erro interno do servidor',
                        details: insertError.message
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Docentes da turma atualizados com sucesso',
                docenteCount: docente_ids.length
            });
        } catch (error) {
            log.error('updateDocentesForTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    // ============ ALUNOS POR TURMA ============

    static async getAlunosByTurma(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id } = req.params;

            if (!isPositiveInteger(id)) {
                return res.status(400).json({
                    error: 'ID de turma inválido'
                });
            }

            log.info('getAlunosByTurma', 'Buscando alunos da turma', { turmaId: id });

            // Verify turma exists
            const { data: turma, error: turmaError } = await SupabaseWrapper.get()
                .from('turmas')
                .select('id_turma, nome_turma')
                .eq('id_turma', Number(id))
                .maybeSingle();

            if (turmaError) {
                log.error('getAlunosByTurma', 'Erro ao verificar turma', turmaError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: turmaError.message
                });
            }

            if (!turma) {
                return res.status(404).json({
                    error: 'Turma não encontrada'
                });
            }

            // Get alunos for this turma
            const { data, error } = await SupabaseWrapper.get()
                .from('alunos_por_turma')
                .select(`
                    id_aluno_por_turma,
                    id_aluno,
                    alunos (
                        id_aluno,
                        nome_aluno,
                        cpf_aluno,
                        data_nascimento_aluno,
                        escola_unidade,
                        cidade,
                        neurodivergente
                    )
                `)
                .eq('id_turma', Number(id));

            if (error) {
                log.error('getAlunosByTurma', 'Erro ao buscar alunos', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Flatten the response
            const alunos = (data || []).map((item: any) => ({
                id_aluno_por_turma: item.id_aluno_por_turma,
                id_aluno: item.id_aluno,
                ...item.alunos
            }));

            return res.status(200).json({
                success: true,
                turma: turma,
                alunos: alunos,
                total: alunos.length
            });
        } catch (error) {
            log.error('getAlunosByTurma', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

const turmaController: EndpointController = {
    name: 'turmas',
    routes: {
        'listar': [
            { key: RequestType.GET, value: TurmaController.getTurmas }
        ],
        'detalhe/:id': [
            { key: RequestType.GET, value: TurmaController.getTurmaById }
        ],
        'criar': [
            { key: RequestType.POST, value: TurmaController.createTurma }
        ],
        'atualizar/:id': [
            { key: RequestType.PUT, value: TurmaController.updateTurma }
        ],
        'deletar/:id': [
            { key: RequestType.DELETE, value: TurmaController.deleteTurma }
        ],
        ':id/docentes': [
            { key: RequestType.GET, value: TurmaController.getDocentesByTurma },
            { key: RequestType.POST, value: TurmaController.addDocenteToTurma },
            { key: RequestType.PUT, value: TurmaController.updateDocentesForTurma }
        ],
        ':id/docentes/:docenteId': [
            { key: RequestType.DELETE, value: TurmaController.removeDocenteFromTurma }
        ],
        ':id/alunos': [
            { key: RequestType.GET, value: TurmaController.getAlunosByTurma }
        ]
    }
};

export { turmaController };


