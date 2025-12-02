import { test, expect } from '../fixtures/auth.fixture';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ adminPage }) => {
    // Navigate to dashboard (adminPage is already authenticated)
    await adminPage.goto('/admin/dashboard');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display dashboard page with correct title', async ({ adminPage }) => {
    await expect(adminPage).toHaveTitle(/Dashboard/);
    await expect(adminPage.locator('h1')).toContainText('Dashboard');
  });

  test('should display all KPI metric cards', async ({ adminPage }) => {
    // Check for Total de Alunos card
    const totalAlunosCard = adminPage.locator('.metric-card').filter({ hasText: 'Total de Alunos' });
    await expect(totalAlunosCard).toBeVisible();

    // Check for Taxa de Presença card
    const taxaPresencaCard = adminPage.locator('.metric-card').filter({ hasText: 'Taxa de Presença' });
    await expect(taxaPresencaCard).toBeVisible();

    // Check for Alertas Médicos card
    const alertasMedicosCard = adminPage.locator('.metric-card').filter({ hasText: 'Alertas Médicos' });
    await expect(alertasMedicosCard).toBeVisible();

    // Check for Acompanhamento Especial card
    const acompanhamentoCard = adminPage.locator('.metric-card').filter({ hasText: 'Acompanhamento Especial' });
    await expect(acompanhamentoCard).toBeVisible();
  });

  test('should display KPI values', async ({ adminPage }) => {
    // Check that KPI values are displayed (not empty)
    const totalAlunos = adminPage.locator('#total-alunos');
    await expect(totalAlunos).toBeVisible();
    const totalAlunosValue = await totalAlunos.textContent();
    expect(totalAlunosValue).toBeTruthy();

    const taxaPresenca = adminPage.locator('#taxa-presenca');
    await expect(taxaPresenca).toBeVisible();
    const taxaPresencaValue = await taxaPresenca.textContent();
    expect(taxaPresencaValue).toContain('%');

    const alertasMedicos = adminPage.locator('#alertas-medicos');
    await expect(alertasMedicos).toBeVisible();

    const acompanhamentoEspecial = adminPage.locator('#acompanhamento-especial');
    await expect(acompanhamentoEspecial).toBeVisible();
  });

  test('should have update button that refreshes data', async ({ adminPage }) => {
    const updateButton = adminPage.locator('#btn-update');
    await expect(updateButton).toBeVisible();
    await expect(updateButton).toHaveText('Atualizar');

    // Click update button
    await updateButton.click();

    // Button should show loading state
    await expect(updateButton).toHaveText('Atualizando...');
    await expect(updateButton).toBeDisabled();

    // Wait for update to complete
    await expect(updateButton).toHaveText('Atualizar', { timeout: 5000 });
    await expect(updateButton).toBeEnabled();
  });

  test('should display Resumo por Turma section', async ({ adminPage }) => {
    const resumoSection = adminPage.locator('.section-card').filter({ hasText: 'Resumo por Turma' });
    await expect(resumoSection).toBeVisible();
  });

  test('should display Últimas Atividades section', async ({ adminPage }) => {
    const atividadesSection = adminPage.locator('.section-card').filter({ hasText: 'Últimas Atividades' });
    await expect(atividadesSection).toBeVisible();
  });

  test('should have sidebar with navigation links', async ({ adminPage }) => {
    // Check sidebar is visible
    const sidebar = adminPage.locator('.sidebar, [class*="sidebar"], nav');
    await expect(sidebar.first()).toBeVisible();
  });

  test('should navigate to Presenças page from sidebar', async ({ adminPage }) => {
    const presencasLink = adminPage.locator('a[href*="presencas"]').first();
    await presencasLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/presencas/);
  });

  test('should navigate to Cadastrar Alunos page from sidebar', async ({ adminPage }) => {
    const cadastrarLink = adminPage.locator('a[href*="cadastrar-alunos"]').first();
    await cadastrarLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/cadastrar-alunos/);
  });

  test('should navigate to Gerenciar Alunos page from sidebar', async ({ adminPage }) => {
    const gerenciarLink = adminPage.locator('a[href*="gerenciar-alunos"]').first();
    await gerenciarLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/gerenciar-alunos/);
  });

  test('should navigate to Relatórios page from sidebar', async ({ adminPage }) => {
    const relatoriosLink = adminPage.locator('a[href*="relatorios"]').first();
    await relatoriosLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/relatorios/);
  });

  test('should navigate to Usuários page from sidebar', async ({ adminPage }) => {
    const usuariosLink = adminPage.locator('a[href*="usuarios"]').first();
    await usuariosLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/usuarios/);
  });

  test('should be responsive on mobile viewport', async ({ adminPage }) => {
    // Set mobile viewport
    await adminPage.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be visible
    await expect(adminPage.locator('h1')).toContainText('Dashboard');

    // Metric cards should stack
    const metricsGrid = adminPage.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible();
  });
});
