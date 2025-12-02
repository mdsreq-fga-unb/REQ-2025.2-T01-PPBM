import { Request, Response } from 'express';
import { EndpointController, RequestType } from '../interfaces/index';
import { SupabaseWrapper } from '../utils/supabase_wrapper';
import { Pair } from '../utils/utils';
import {
    Aluno,
    Responsavel,
    CadastroAlunoRequest,
    CadastroAlunoResponse
} from '../interfaces/aluno';
import {
    isValidCPF,
    normalizeCPF,
    isValidDate,
    isValidEmail,
    isValidPhone
} from '../utils/validation';
import { createControllerLogger } from '../logger';

const log = createControllerLogger('alunos');

export class AlunosController implements EndpointController {
    name = 'alunos';

    routes = {
        '': [new Pair(RequestType.POST, this.cadastrarAluno.bind(this))]
    };

    /**
     * Cadastra um novo aluno com seu responsável
     * POST /alunos
     */
    async cadastrarAluno(req: Request, res: Response): Promise<Response> {
        try {
            log.info('cadastrarAluno', 'Iniciando cadastro de aluno');
            log.info('cadastrarAluno', 'Request body recebido:', JSON.stringify(req.body, null, 2));

            const requestData: CadastroAlunoRequest = req.body;

            // Validar dados de entrada
            const validationResult = this.validateCadastroRequest(requestData);
            if (!validationResult.isValid) {
                log.warn('cadastrarAluno', 'Dados inválidos:', validationResult.errors);
                log.warn('cadastrarAluno', 'Request data keys:', Object.keys(requestData || {}));
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    error: validationResult.errors.join(', ')
                } as CadastroAlunoResponse);
            }

            const supabase = SupabaseWrapper.get();

            // Normalizar CPFs
            const cpfAlunoNormalizado = normalizeCPF(requestData.aluno.cpf_aluno);
            const cpfResponsavelNormalizado = requestData.responsavel.cpf_responsavel
                ? normalizeCPF(requestData.responsavel.cpf_responsavel)
                : null;

            // Verificar se já existe aluno com o mesmo CPF
            const { data: alunoExistente, error: errorBuscaAluno } = await supabase
                .from('alunos')
                .select('id_aluno, nome_aluno')
                .eq('cpf_aluno', cpfAlunoNormalizado)
                .maybeSingle();

            if (errorBuscaAluno) {
                log.error('cadastrarAluno', 'Erro ao buscar aluno existente:', errorBuscaAluno);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor',
                    error: 'Erro ao verificar duplicidade de CPF'
                } as CadastroAlunoResponse);
            }

            if (alunoExistente) {
                log.warn('cadastrarAluno', 'CPF já cadastrado:', cpfAlunoNormalizado);
                return res.status(409).json({
                    success: false,
                    message: 'CPF já cadastrado',
                    error: `Já existe um aluno cadastrado com o CPF ${requestData.aluno.cpf_aluno}`
                } as CadastroAlunoResponse);
            }

            // Buscar ou criar responsável
            let responsavel: Responsavel;

            // Check if an existing responsável ID was provided
            if (requestData.responsavel.id_responsavel) {
                // Use the existing responsável by ID
                const { data: responsavelExistente, error: errorBuscaResponsavel } = await supabase
                    .from('responsaveis')
                    .select('*')
                    .eq('id_responsavel', requestData.responsavel.id_responsavel)
                    .maybeSingle();

                if (errorBuscaResponsavel) {
                    log.error('cadastrarAluno', 'Erro ao buscar responsável por ID:', errorBuscaResponsavel);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro interno do servidor',
                        error: 'Erro ao buscar responsável'
                    } as CadastroAlunoResponse);
                }

                if (responsavelExistente) {
                    responsavel = responsavelExistente;
                    log.info('cadastrarAluno', 'Responsável encontrado por ID:', responsavel.id_responsavel);
                } else {
                    log.warn('cadastrarAluno', 'Responsável não encontrado pelo ID fornecido:', requestData.responsavel.id_responsavel);
                    return res.status(400).json({
                        success: false,
                        message: 'Responsável não encontrado',
                        error: 'O responsável selecionado não foi encontrado'
                    } as CadastroAlunoResponse);
                }
            } else if (cpfResponsavelNormalizado) {
                // Buscar responsável existente pelo CPF
                const { data: responsavelExistente, error: errorBuscaResponsavel } = await supabase
                    .from('responsaveis')
                    .select('*')
                    .eq('cpf_responsavel', cpfResponsavelNormalizado)
                    .maybeSingle();

                if (errorBuscaResponsavel) {
                    log.error('cadastrarAluno', 'Erro ao buscar responsável:', errorBuscaResponsavel);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro interno do servidor',
                        error: 'Erro ao buscar responsável'
                    } as CadastroAlunoResponse);
                }

                if (responsavelExistente) {
                    responsavel = responsavelExistente;
                    log.info('cadastrarAluno', 'Responsável encontrado:', responsavel.id_responsavel);
                } else {
                    // Criar novo responsável
                    responsavel = await this.criarResponsavel(requestData.responsavel, cpfResponsavelNormalizado);
                }
            } else {
                // Criar responsável sem CPF
                responsavel = await this.criarResponsavel(requestData.responsavel, null);
            }

            // Criar aluno
            const novoAluno: Partial<Aluno> = {
                nome_aluno: requestData.aluno.nome_aluno,
                data_nascimento_aluno: requestData.aluno.data_nascimento_aluno,
                cpf_aluno: cpfAlunoNormalizado,
                tipo_sanguineo: requestData.aluno.tipo_sanguineo,
                nome_guerra: requestData.aluno.nome_guerra,
                graduacao: requestData.aluno.graduacao,
                escola_unidade: requestData.aluno.escola_unidade,
                cidade: requestData.aluno.cidade,
                neurodivergente: requestData.aluno.neurodivergente || false,
                updated_at: new Date().toISOString()
            };

            const { data: alunoInserido, error: errorInsercaoAluno } = await supabase
                .from('alunos')
                .insert(novoAluno)
                .select()
                .single();

            if (errorInsercaoAluno) {
                log.error('cadastrarAluno', 'Erro ao inserir aluno:', errorInsercaoAluno);
                return res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor',
                    error: 'Erro ao cadastrar aluno'
                } as CadastroAlunoResponse);
            }

            // Criar vínculo entre aluno e responsável (check if it already exists first)
            const { data: existingLink, error: linkCheckError } = await supabase
                .from('responsaveis_por_alunos')
                .select('id_responsaveis_por_alunos')
                .eq('id_aluno', alunoInserido.id_aluno)
                .eq('id_responsavel', responsavel.id_responsavel)
                .maybeSingle();

            if (linkCheckError) {
                log.error('cadastrarAluno', 'Erro ao verificar vínculo existente:', linkCheckError);
            }

            // Only create link if it doesn't already exist
            if (!existingLink) {
                const { error: errorVinculo } = await supabase
                    .from('responsaveis_por_alunos')
                    .insert({
                        id_aluno: alunoInserido.id_aluno,
                        id_responsavel: responsavel.id_responsavel,
                        parentesco: requestData.responsavel.parentesco || null
                    });

                if (errorVinculo) {
                    log.error('cadastrarAluno', 'Erro ao criar vínculo:', errorVinculo);
                    // Tentar remover o aluno criado para manter consistência
                    await supabase.from('alunos').delete().eq('id_aluno', alunoInserido.id_aluno);

                    return res.status(500).json({
                        success: false,
                        message: 'Erro interno do servidor',
                        error: 'Erro ao vincular aluno ao responsável'
                    } as CadastroAlunoResponse);
                }
                log.info('cadastrarAluno', 'Vínculo criado com parentesco:', requestData.responsavel.parentesco);
            } else {
                log.info('cadastrarAluno', 'Vínculo aluno-responsável já existe, pulando criação');
            }

            // Criar vínculo entre aluno e turma (se turma_id foi informado)
            if (requestData.aluno.turma_id) {
                const { error: errorVinculoTurma } = await supabase
                    .from('alunos_por_turma')
                    .insert({
                        id_aluno: alunoInserido.id_aluno,
                        id_turma: Number(requestData.aluno.turma_id)
                    });

                if (errorVinculoTurma) {
                    log.warn('cadastrarAluno', 'Erro ao vincular aluno à turma:', errorVinculoTurma);
                    // Não falha o cadastro, apenas loga o warning
                } else {
                    log.info('cadastrarAluno', 'Aluno vinculado à turma:', requestData.aluno.turma_id);
                }
            }

            // Criar vínculos para responsáveis adicionais (se houver)
            if (requestData.responsaveisAdicionais && requestData.responsaveisAdicionais.length > 0) {
                log.info('cadastrarAluno', 'Processando responsáveis adicionais:', requestData.responsaveisAdicionais.length);

                for (const respAdicional of requestData.responsaveisAdicionais) {
                    // Skip if no valid identifier
                    if (!respAdicional.id_responsavel && !respAdicional.nome_responsavel) {
                        log.warn('cadastrarAluno', 'Responsável adicional sem identificação, ignorando');
                        continue;
                    }

                    let responsavelAdicional: Responsavel | null = null;

                    // If ID was provided, use it directly
                    if (respAdicional.id_responsavel) {
                        const { data: respExistente, error: respError } = await supabase
                            .from('responsaveis')
                            .select('*')
                            .eq('id_responsavel', respAdicional.id_responsavel)
                            .maybeSingle();

                        if (respError) {
                            log.error('cadastrarAluno', 'Erro ao buscar responsável adicional:', respError);
                            continue;
                        }

                        if (respExistente) {
                            responsavelAdicional = respExistente;
                        } else {
                            log.warn('cadastrarAluno', 'Responsável adicional não encontrado:', respAdicional.id_responsavel);
                            continue;
                        }
                    } else if (respAdicional.cpf_responsavel) {
                        // Try to find by CPF
                        const cpfNormalizado = normalizeCPF(respAdicional.cpf_responsavel);
                        const { data: respExistente, error: respError } = await supabase
                            .from('responsaveis')
                            .select('*')
                            .eq('cpf_responsavel', cpfNormalizado)
                            .maybeSingle();

                        if (respError) {
                            log.error('cadastrarAluno', 'Erro ao buscar responsável adicional por CPF:', respError);
                            continue;
                        }

                        if (respExistente) {
                            responsavelAdicional = respExistente;
                        } else {
                            // Create new responsavel
                            responsavelAdicional = await this.criarResponsavel(respAdicional, cpfNormalizado);
                        }
                    } else {
                        // Create new responsavel without CPF
                        responsavelAdicional = await this.criarResponsavel(respAdicional, null);
                    }

                    if (!responsavelAdicional) {
                        log.warn('cadastrarAluno', 'Não foi possível obter/criar responsável adicional');
                        continue;
                    }

                    // Check if link already exists
                    const { data: linkExistente, error: linkCheckError } = await supabase
                        .from('responsaveis_por_alunos')
                        .select('id_responsaveis_por_alunos')
                        .eq('id_aluno', alunoInserido.id_aluno)
                        .eq('id_responsavel', responsavelAdicional.id_responsavel)
                        .maybeSingle();

                    if (linkCheckError) {
                        log.error('cadastrarAluno', 'Erro ao verificar vínculo adicional:', linkCheckError);
                        continue;
                    }

                    if (!linkExistente) {
                        const { error: errorVinculoAdicional } = await supabase
                            .from('responsaveis_por_alunos')
                            .insert({
                                id_aluno: alunoInserido.id_aluno,
                                id_responsavel: responsavelAdicional.id_responsavel,
                                parentesco: respAdicional.parentesco || null
                            });

                        if (errorVinculoAdicional) {
                            log.error('cadastrarAluno', 'Erro ao criar vínculo adicional:', errorVinculoAdicional);
                        } else {
                            log.info('cadastrarAluno', 'Responsável adicional vinculado:', {
                                responsavelId: responsavelAdicional.id_responsavel,
                                parentesco: respAdicional.parentesco
                            });
                        }
                    } else {
                        log.info('cadastrarAluno', 'Vínculo adicional já existe, pulando');
                    }
                }
            }

            log.info('cadastrarAluno', 'Aluno cadastrado com sucesso:', alunoInserido.id_aluno);

            return res.status(201).json({
                success: true,
                message: 'Aluno cadastrado com sucesso',
                data: {
                    aluno: alunoInserido,
                    responsavel: responsavel
                }
            } as CadastroAlunoResponse);

        } catch (error) {
            log.error('cadastrarAluno', 'Erro inesperado:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: 'Erro inesperado ao cadastrar aluno'
            } as CadastroAlunoResponse);
        }
    }

    /**
     * Cria um novo responsável
     */
    private async criarResponsavel(dadosResponsavel: any, cpfNormalizado: string | null): Promise<Responsavel> {
        const supabase = SupabaseWrapper.get();

        const novoResponsavel: Partial<Responsavel> = {
            nome_responsavel: dadosResponsavel.nome_responsavel,
            telefone_responsavel: dadosResponsavel.telefone_responsavel,
            email_responsavel: dadosResponsavel.email_responsavel,
            cpf_responsavel: cpfNormalizado ?? undefined,
            update_at: new Date().toISOString()
        };

        const { data: responsavelInserido, error: errorInsercaoResponsavel } = await supabase
            .from('responsaveis')
            .insert(novoResponsavel)
            .select()
            .single();

        if (errorInsercaoResponsavel) {
            log.error('criarResponsavel', 'Erro ao inserir responsável:', errorInsercaoResponsavel);
            throw new Error('Erro ao cadastrar responsável');
        }

        log.info('criarResponsavel', 'Responsável criado:', responsavelInserido.id_responsavel);
        return responsavelInserido;
    }

    /**
     * Valida os dados da requisição de cadastro
     */
    private validateCadastroRequest(data: CadastroAlunoRequest): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validar dados do aluno
        if (!data.aluno) {
            errors.push('Dados do aluno são obrigatórios');
            return { isValid: false, errors };
        }

        if (!data.aluno.nome_aluno || data.aluno.nome_aluno.trim().length === 0) {
            errors.push('Nome do aluno é obrigatório');
        }

        if (!data.aluno.cpf_aluno || !isValidCPF(data.aluno.cpf_aluno)) {
            errors.push('CPF do aluno é obrigatório e deve ser válido');
        }

        if (!data.aluno.data_nascimento_aluno || !isValidDate(data.aluno.data_nascimento_aluno)) {
            errors.push('Data de nascimento do aluno é obrigatória e deve ser válida');
        }

        // Validar dados do responsável
        if (!data.responsavel) {
            errors.push('Dados do responsável são obrigatórios');
            return { isValid: false, errors };
        }

        if (!data.responsavel.nome_responsavel || data.responsavel.nome_responsavel.trim().length === 0) {
            errors.push('Nome do responsável é obrigatório');
        }

        if (data.responsavel.cpf_responsavel && !isValidCPF(data.responsavel.cpf_responsavel)) {
            errors.push('CPF do responsável deve ser válido quando informado');
        }

        if (data.responsavel.email_responsavel && !isValidEmail(data.responsavel.email_responsavel)) {
            errors.push('Email do responsável deve ser válido quando informado');
        }

        if (data.responsavel.telefone_responsavel && !isValidPhone(data.responsavel.telefone_responsavel)) {
            errors.push('Telefone do responsável deve ser válido quando informado');
        }

        return { isValid: errors.length === 0, errors };
    }
}