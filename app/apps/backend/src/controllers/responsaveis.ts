import { Request, Response } from 'express';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { createControllerLogger } from '../logger';
import { EndpointController, RequestType } from '../interfaces/index';
import {
    isPositiveInteger
} from '../utils/validation';

const log = createControllerLogger('responsaveis');

type AlunosListQuery = {
    page?: string;
    pageSize?: string;
};

type PresencasQuery = {
    from?: string;
    to?: string;
    pageSize?: string;
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

function isValidDateString(value: unknown): value is string {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }
    const parsed = Date.parse(value);
    return !Number.isNaN(parsed);
}

export default class ResponsavelController {
    /**
     * GET /responsaveis/por-email/:email
     * Get responsável by email (for logged-in user to find their responsável ID)
     */
    static async getResponsavelByEmail(req: Request, res: Response): Promise<Response | void> {
        try {
            const { email } = req.params;

            if (!email || !email.includes('@')) {
                return res.status(400).json({
                    error: 'Email inválido'
                });
            }

            log.info('getResponsavelByEmail', 'Buscando responsável por email', { email });

            const { data, error } = await SupabaseWrapper.get()
                .from('responsaveis')
                .select('id_responsavel, nome_responsavel, email_responsavel, telefone_responsavel')
                .eq('email_responsavel', email.toLowerCase().trim())
                .maybeSingle();

            if (error) {
                log.error('getResponsavelByEmail', 'Erro ao buscar responsável', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    error: 'Responsável não encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            log.error('getResponsavelByEmail', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /responsaveis/meus-filhos/:responsavelId
     * Get all children (alunos) linked to a specific responsável
     */
    static async getAlunosByResponsavel(req: Request, res: Response): Promise<Response | void> {
        try {
            const { responsavelId } = req.params;

            if (!isPositiveInteger(responsavelId)) {
                return res.status(400).json({
                    error: 'ID do responsável inválido'
                });
            }

            log.info('getAlunosByResponsavel', 'Buscando filhos do responsável', { responsavelId });

            // First check if responsável exists
            const { data: responsavel, error: respError } = await SupabaseWrapper.get()
                .from('responsaveis')
                .select('id_responsavel, nome_responsavel')
                .eq('id_responsavel', Number(responsavelId))
                .maybeSingle();

            if (respError) {
                log.error('getAlunosByResponsavel', 'Erro ao verificar responsável', respError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: respError.message
                });
            }

            if (!responsavel) {
                return res.status(404).json({
                    error: 'Responsável não encontrado'
                });
            }

            // Get linked alunos through responsaveis_por_alunos
            const { data, error } = await SupabaseWrapper.get()
                .from('responsaveis_por_alunos')
                .select(`
                    id_responsaveis_por_alunos,
                    alunos (
                        id_aluno,
                        nome_aluno,
                        data_nascimento_aluno,
                        cpf_aluno,
                        tipo_sanguineo,
                        nome_guerra,
                        serie,
                        escola_unidade,
                        cidade,
                        neurodivergente,
                        sexo,
                        alergias,
                        condicoes_medicas,
                        observacoes_neuro,
                        alunos_por_turma (
                            id_turma,
                            turmas (
                                id_turma,
                                nome_turma,
                                unidade_turma
                            )
                        )
                    )
                `)
                .eq('id_responsavel', Number(responsavelId));

            if (error) {
                log.error('getAlunosByResponsavel', 'Erro ao buscar filhos', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Flatten the response and calculate age
            const alunos = (data || [])
                .map(item => {
                    const aluno = item.alunos as any;
                    if (!aluno) return null;

                    // Calculate age
                    let idade = null;
                    if (aluno.data_nascimento_aluno) {
                        const hoje = new Date();
                        const nascimento = new Date(aluno.data_nascimento_aluno);
                        idade = hoje.getFullYear() - nascimento.getFullYear();
                        const mes = hoje.getMonth() - nascimento.getMonth();
                        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                            idade--;
                        }
                    }

                    // Get turma info
                    let turma = null;
                    if (aluno.alunos_por_turma && aluno.alunos_por_turma.length > 0) {
                        const turmaData = aluno.alunos_por_turma[0].turmas;
                        if (turmaData) {
                            turma = {
                                id_turma: turmaData.id_turma,
                                nome_turma: turmaData.nome_turma,
                                unidade_turma: turmaData.unidade_turma
                            };
                        }
                    }

                    return {
                        id_aluno: aluno.id_aluno,
                        nome_aluno: aluno.nome_aluno,
                        data_nascimento_aluno: aluno.data_nascimento_aluno,
                        idade,
                        cpf_aluno: aluno.cpf_aluno,
                        tipo_sanguineo: aluno.tipo_sanguineo,
                        nome_guerra: aluno.nome_guerra,
                        serie: aluno.serie,
                        escola_unidade: aluno.escola_unidade,
                        cidade: aluno.cidade,
                        neurodivergente: aluno.neurodivergente,
                        sexo: aluno.sexo,
                        alergias: aluno.alergias,
                        condicoes_medicas: aluno.condicoes_medicas,
                        observacoes_neuro: aluno.observacoes_neuro,
                        turma
                    };
                })
                .filter(Boolean);

            return res.status(200).json({
                success: true,
                responsavel: {
                    id_responsavel: responsavel.id_responsavel,
                    nome_responsavel: responsavel.nome_responsavel
                },
                data: alunos,
                total: alunos.length
            });
        } catch (error) {
            log.error('getAlunosByResponsavel', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /responsaveis/presencas-filho/:alunoId
     * Get attendance records for a specific child
     */
    static async getPresencasFilho(req: Request, res: Response): Promise<Response | void> {
        try {
            const { alunoId } = req.params;
            const { from, to, pageSize } = req.query;

            if (!isPositiveInteger(alunoId)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            log.info('getPresencasFilho', 'Buscando presenças do filho', { alunoId, from, to });

            // Check if aluno exists and get basic info
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select(`
                    id_aluno,
                    nome_aluno,
                    alunos_por_turma (
                        turmas (
                            id_turma,
                            nome_turma
                        )
                    )
                `)
                .eq('id_aluno', Number(alunoId))
                .maybeSingle();

            if (alunoError) {
                log.error('getPresencasFilho', 'Erro ao buscar aluno', alunoError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: alunoError.message
                });
            }

            if (!aluno) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Build presencas query
            let query = SupabaseWrapper.get()
                .from('presencas')
                .select(`
                    id_presenca,
                    created_at,
                    data_time_presenca,
                    status_presenca,
                    id_justificativa,
                    justificativa (
                        id_justificativa,
                        motivo_justificativa,
                        aprovado_por_docente_justificativa
                    )
                `)
                .eq('id_aluno', Number(alunoId))
                .order('data_time_presenca', { ascending: false });

            // Apply date filters
            if (from && isValidDateString(from)) {
                query = query.gte('data_time_presenca', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('data_time_presenca', new Date(to).toISOString());
            }

            // Limit results
            const limit = pageSize ? Math.min(Number(pageSize), MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            query = query.limit(limit);

            const { data: presencas, error: presencasError } = await query;

            if (presencasError) {
                log.error('getPresencasFilho', 'Erro ao buscar presenças', presencasError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: presencasError.message
                });
            }

            // Calculate statistics
            const registros = presencas || [];
            const totalDias = registros.length;
            const presentes = registros.filter(p => p.status_presenca === 'presente').length;
            const atrasos = registros.filter(p => p.status_presenca === 'atraso').length;
            const faltas = registros.filter(p => p.status_presenca === 'falta' || p.status_presenca === 'ausente').length;
            const taxaFrequencia = totalDias > 0 ? Math.round((presentes / totalDias) * 100) : 0;

            // Get turma name
            let turmaNome = 'Sem turma';
            const alunoData = aluno as any;
            if (alunoData.alunos_por_turma && alunoData.alunos_por_turma.length > 0) {
                const turma = alunoData.alunos_por_turma[0].turmas;
                if (turma) {
                    turmaNome = turma.nome_turma;
                }
            }

            return res.status(200).json({
                success: true,
                aluno: {
                    id_aluno: aluno.id_aluno,
                    nome_aluno: aluno.nome_aluno,
                    turma: turmaNome
                },
                estatisticas: {
                    totalDias,
                    presentes,
                    atrasos,
                    faltas,
                    taxaFrequencia
                },
                registros: registros.map(r => ({
                    id: r.id_presenca,
                    data: r.data_time_presenca,
                    status: r.status_presenca,
                    justificativa: r.justificativa ? {
                        id: (r.justificativa as any).id_justificativa,
                        motivo: (r.justificativa as any).motivo_justificativa,
                        aprovada: (r.justificativa as any).aprovado_por_docente_justificativa
                    } : null
                }))
            });
        } catch (error) {
            log.error('getPresencasFilho', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /responsaveis/avisos
     * Get general notices/announcements
     */
    static async getAvisos(req: Request, res: Response): Promise<Response | void> {
        try {
            log.info('getAvisos', 'Buscando avisos gerais');

            // For now, use notificacoes with tipo 'comunicado' or 'geral' as notices
            // In the future, you might want a separate 'avisos' table
            const { data, error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .select(`
                    id_notificacoes,
                    created_at,
                    tipo_notifi,
                    mensagem_notifi,
                    data_envio,
                    docentes (
                        nome_docente
                    )
                `)
                .in('tipo_notifi', ['comunicado', 'geral'])
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                log.error('getAvisos', 'Erro ao buscar avisos', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Transform to avisos format
            const avisos = (data || []).map(n => {
                // Determine type based on content or default to informativo
                let tipo = 'informativo';
                const msg = n.mensagem_notifi?.toLowerCase() || '';
                if (msg.includes('urgente') || msg.includes('importante')) {
                    tipo = 'importante';
                } else if (msg.includes('evento') || msg.includes('formatura') || msg.includes('visita')) {
                    tipo = 'evento';
                }

                return {
                    id: n.id_notificacoes,
                    tipo,
                    titulo: n.mensagem_notifi?.split('.')[0] || 'Aviso',
                    conteudo: n.mensagem_notifi,
                    timestamp: n.data_envio || n.created_at,
                    ativo: true
                };
            });

            return res.status(200).json({
                success: true,
                data: avisos
            });
        } catch (error) {
            log.error('getAvisos', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /responsaveis/mensagens/:responsavelId
     * Get messages for a specific responsável
     */
    static async getMensagens(req: Request, res: Response): Promise<Response | void> {
        try {
            const { responsavelId } = req.params;

            if (!isPositiveInteger(responsavelId)) {
                return res.status(400).json({
                    error: 'ID do responsável inválido'
                });
            }

            log.info('getMensagens', 'Buscando mensagens do responsável', { responsavelId });

            const { data, error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .select(`
                    id_notificacoes,
                    created_at,
                    tipo_notifi,
                    canal_notifi,
                    mensagem_notifi,
                    entregue_notif,
                    data_envio,
                    docentes (
                        nome_docente
                    ),
                    alunos (
                        nome_aluno
                    )
                `)
                .eq('id_responsavel', Number(responsavelId))
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                log.error('getMensagens', 'Erro ao buscar mensagens', error);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error.message
                });
            }

            // Transform to messages format
            const mensagens = (data || []).map(n => {
                const docenteData = n.docentes as any;
                return {
                    id: n.id_notificacoes,
                    tipo: 'recebida',
                    remetente: docenteData?.nome_docente || 'Sistema',
                    assunto: `${n.tipo_notifi?.charAt(0).toUpperCase()}${n.tipo_notifi?.slice(1) || 'Notificação'}`,
                    conteudo: n.mensagem_notifi,
                    timestamp: n.data_envio || n.created_at,
                    urgente: n.tipo_notifi === 'advertencia' || n.tipo_notifi === 'falta'
                };
            });

            return res.status(200).json({
                success: true,
                data: mensagens
            });
        } catch (error) {
            log.error('getMensagens', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * POST /responsaveis/enviar-mensagem
     * Send a message from responsável to school
     */
    static async enviarMensagem(req: Request, res: Response): Promise<Response | void> {
        try {
            const { id_responsavel, destinatario, assunto, conteudo, id_aluno } = req.body;

            if (!id_responsavel || !destinatario || !assunto || !conteudo) {
                return res.status(400).json({
                    error: 'Campos obrigatórios: id_responsavel, destinatario, assunto, conteudo'
                });
            }

            log.info('enviarMensagem', 'Enviando mensagem', { id_responsavel, destinatario, assunto });

            // Create notification record (message from responsável)
            const notificacaoData = {
                id_responsavel: Number(id_responsavel),
                id_aluno: id_aluno ? Number(id_aluno) : null,
                tipo_notifi: 'comunicado',
                canal_notifi: 'sistema',
                mensagem_notifi: `[${destinatario.toUpperCase()}] ${assunto}: ${conteudo}`,
                entregue_notif: true,
                data_envio: new Date().toISOString()
            };

            const { data, error } = await SupabaseWrapper.get()
                .from('notificacoes')
                .insert(notificacaoData)
                .select()
                .single();

            if (error) {
                log.error('enviarMensagem', 'Erro ao enviar mensagem', error);
                return res.status(500).json({
                    error: 'Erro ao enviar mensagem',
                    details: error.message
                });
            }

            return res.status(201).json({
                success: true,
                data,
                message: 'Mensagem enviada com sucesso'
            });
        } catch (error) {
            log.error('enviarMensagem', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * GET /responsaveis/relatorio/:alunoId
     * Get frequency report data for a child
     */
    static async getRelatorioFrequencia(req: Request, res: Response): Promise<Response | void> {
        try {
            const { alunoId } = req.params;
            const { from, to } = req.query;

            if (!isPositiveInteger(alunoId)) {
                return res.status(400).json({
                    error: 'ID do aluno inválido'
                });
            }

            log.info('getRelatorioFrequencia', 'Gerando relatório de frequência', { alunoId, from, to });

            // Get full aluno info
            const { data: aluno, error: alunoError } = await SupabaseWrapper.get()
                .from('alunos')
                .select(`
                    id_aluno,
                    nome_aluno,
                    data_nascimento_aluno,
                    serie,
                    escola_unidade,
                    cidade,
                    neurodivergente,
                    alergias,
                    condicoes_medicas,
                    alunos_por_turma (
                        turmas (
                            id_turma,
                            nome_turma,
                            unidade_turma
                        )
                    )
                `)
                .eq('id_aluno', Number(alunoId))
                .maybeSingle();

            if (alunoError) {
                log.error('getRelatorioFrequencia', 'Erro ao buscar aluno', alunoError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: alunoError.message
                });
            }

            if (!aluno) {
                return res.status(404).json({
                    error: 'Aluno não encontrado'
                });
            }

            // Build presencas query
            let query = SupabaseWrapper.get()
                .from('presencas')
                .select(`
                    id_presenca,
                    data_time_presenca,
                    status_presenca,
                    id_justificativa
                `)
                .eq('id_aluno', Number(alunoId))
                .order('data_time_presenca', { ascending: false });

            // Apply date filters
            if (from && isValidDateString(from)) {
                query = query.gte('data_time_presenca', new Date(from).toISOString());
            }

            if (to && isValidDateString(to)) {
                query = query.lte('data_time_presenca', new Date(to).toISOString());
            }

            const { data: presencas, error: presencasError } = await query;

            if (presencasError) {
                log.error('getRelatorioFrequencia', 'Erro ao buscar presenças', presencasError);
                return res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: presencasError.message
                });
            }

            // Calculate statistics
            const registros = presencas || [];
            const totalDias = registros.length;
            const presentes = registros.filter(p => p.status_presenca === 'presente').length;
            const atrasos = registros.filter(p => p.status_presenca === 'atraso').length;
            const faltas = registros.filter(p => p.status_presenca === 'falta' || p.status_presenca === 'ausente').length;
            const faltasJustificadas = registros.filter(p =>
                (p.status_presenca === 'falta' || p.status_presenca === 'ausente') && p.id_justificativa
            ).length;
            const faltasNaoJustificadas = faltas - faltasJustificadas;
            const taxaFrequencia = totalDias > 0 ? Math.round((presentes / totalDias) * 100) : 0;

            // Calculate age
            let idade = null;
            const alunoData = aluno as any;
            if (alunoData.data_nascimento_aluno) {
                const hoje = new Date();
                const nascimento = new Date(alunoData.data_nascimento_aluno);
                idade = hoje.getFullYear() - nascimento.getFullYear();
                const mes = hoje.getMonth() - nascimento.getMonth();
                if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                    idade--;
                }
            }

            // Get turma
            let turma = 'Sem turma';
            if (alunoData.alunos_por_turma && alunoData.alunos_por_turma.length > 0) {
                const turmaData = alunoData.alunos_por_turma[0].turmas;
                if (turmaData) {
                    turma = turmaData.nome_turma;
                }
            }

            // Build historico with weekday names
            const historico = registros.map(r => {
                const data = new Date(r.data_time_presenca);
                return {
                    id: r.id_presenca,
                    data: r.data_time_presenca,
                    diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'long' }),
                    status: r.status_presenca,
                    justificada: !!r.id_justificativa
                };
            });

            return res.status(200).json({
                success: true,
                aluno: {
                    id_aluno: aluno.id_aluno,
                    nome: alunoData.nome_aluno,
                    idade,
                    turma,
                    escola: alunoData.escola_unidade || 'Não informado',
                    condicaoMedica: alunoData.condicoes_medicas || alunoData.alergias || null
                },
                estatisticas: {
                    totalDias,
                    presentes,
                    atrasos,
                    faltas,
                    faltasJustificadas,
                    faltasNaoJustificadas,
                    taxaFrequencia
                },
                historico,
                periodo: {
                    from: from || null,
                    to: to || null
                }
            });
        } catch (error) {
            log.error('getRelatorioFrequencia', 'Erro inesperado', error as Error);
            return res.status(500).json({
                error: 'Erro interno do servidor'
            });
        }
    }
}

// Controller export for the router registration
export const responsavelController: EndpointController = {
    name: 'responsaveis',
    routes: {
        'por-email/:email': [{ key: RequestType.GET, value: ResponsavelController.getResponsavelByEmail }],
        'meus-filhos/:responsavelId': [{ key: RequestType.GET, value: ResponsavelController.getAlunosByResponsavel }],
        'presencas-filho/:alunoId': [{ key: RequestType.GET, value: ResponsavelController.getPresencasFilho }],
        'avisos': [{ key: RequestType.GET, value: ResponsavelController.getAvisos }],
        'mensagens/:responsavelId': [{ key: RequestType.GET, value: ResponsavelController.getMensagens }],
        'enviar-mensagem': [{ key: RequestType.POST, value: ResponsavelController.enviarMensagem }],
        'relatorio/:alunoId': [{ key: RequestType.GET, value: ResponsavelController.getRelatorioFrequencia }]
    }
};
