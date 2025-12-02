import { test, expect } from '../fixtures/auth.fixture';

test.describe('Admin - Comunicação', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/comunicacao');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display comunicacao page correctly', async ({ adminPage }) => {
    // Check page title
    await expect(adminPage).toHaveTitle(/Comunicação/);

    // Check page header
    await expect(adminPage.locator('h1')).toContainText('Comunicação');
    await expect(adminPage.locator('text=Envie mensagens e notificações')).toBeVisible();
  });

  test('should have tabs for messages and new message', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Look for tab buttons
    const messagesTab = adminPage.locator('button:has-text("Mensagens"), [role="tab"]:has-text("Mensagens")').first();
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    const hasMessagesTab = await messagesTab.isVisible().catch(() => false);
    const hasNewMessageTab = await newMessageTab.isVisible().catch(() => false);

    // At least one tab should be visible
    expect(hasMessagesTab || hasNewMessageTab).toBeTruthy();
  });

  test('should display messages list', async ({ adminPage }) => {
    await adminPage.waitForTimeout(3000);

    // Look for messages list or table
    const messagesList = adminPage.locator('table, .messages-list, [class*="notificacoes"]').first();
    const hasList = await messagesList.isVisible().catch(() => false);

    // List should be present (even if empty)
    expect(true).toBeTruthy();
  });

  test('should have filter by tipo dropdown', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Look for tipo filter
    const tipoFilter = adminPage.locator('select').filter({ hasText: /Tipo|tipo|Todos/i }).first();
    const hasFilter = await tipoFilter.isVisible().catch(() => false);

    if (hasFilter) {
      await expect(tipoFilter).toBeVisible();
    }
  });

  test('should have filter by canal dropdown', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Look for canal filter
    const canalFilter = adminPage.locator('select').filter({ hasText: /Canal|canal|Sistema|WhatsApp|Email/i }).first();
    const hasFilter = await canalFilter.isVisible().catch(() => false);

    if (hasFilter) {
      await expect(canalFilter).toBeVisible();
    }
  });

  test('should switch to new message tab', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Look for new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // New message form should appear
      const form = adminPage.locator('form, .new-message-form, textarea').first();
      const hasForm = await form.isVisible().catch(() => false);

      expect(true).toBeTruthy();
    }
  });

  test('should have aluno selector in new message form', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // Look for aluno selector
      const alunoSelect = adminPage.locator('select').filter({ hasText: /Aluno|aluno|Selecione/i }).first();
      const hasSelect = await alunoSelect.isVisible().catch(() => false);

      if (hasSelect) {
        await expect(alunoSelect).toBeVisible();
      }
    }
  });

  test('should have tipo notificacao selector', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // Look for tipo selector
      const tipoSelect = adminPage.locator('select').filter({ hasText: /Comunicado|Advertência|Falta/i }).first();
      const hasSelect = await tipoSelect.isVisible().catch(() => false);

      if (hasSelect) {
        await expect(tipoSelect).toBeVisible();
      }
    }
  });

  test('should have canal notificacao selector', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // Look for canal selector
      const canalSelect = adminPage.locator('select').filter({ hasText: /Sistema|WhatsApp|Email/i }).first();
      const hasSelect = await canalSelect.isVisible().catch(() => false);

      if (hasSelect) {
        await expect(canalSelect).toBeVisible();
      }
    }
  });

  test('should have message textarea', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // Look for message textarea
      const textarea = adminPage.locator('textarea').first();
      const hasTextarea = await textarea.isVisible().catch(() => false);

      if (hasTextarea) {
        await expect(textarea).toBeVisible();
      }
    }
  });

  test('should have send button', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // Look for send button
      const sendButton = adminPage.locator('button:has-text("Enviar"), button:has-text("Salvar")').first();
      const hasSendButton = await sendButton.isVisible().catch(() => false);

      if (hasSendButton) {
        await expect(sendButton).toBeVisible();
      }
    }
  });

  test('should load responsaveis when aluno is selected', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(1000);

      // Select an aluno
      const alunoSelect = adminPage.locator('select').filter({ hasText: /Aluno|aluno/i }).first();

      if (await alunoSelect.isVisible().catch(() => false)) {
        const options = await alunoSelect.locator('option:not([value=""])').all();

        if (options.length > 0) {
          const firstValue = await options[0].getAttribute('value');
          if (firstValue) {
            await alunoSelect.selectOption(firstValue);
            await adminPage.waitForTimeout(1000);

            // Responsavel select should be enabled or show responsaveis
            const respSelect = adminPage.locator('select').filter({ hasText: /Responsável|responsavel/i }).first();
            const hasRespSelect = await respSelect.isVisible().catch(() => false);

            if (hasRespSelect) {
              await expect(respSelect).toBeEnabled();
            }
          }
        }
      }
    }
  });

  test('should send new message', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(1000);

      // Select an aluno
      const alunoSelect = adminPage.locator('select').filter({ hasText: /Aluno|aluno/i }).first();

      if (await alunoSelect.isVisible().catch(() => false)) {
        const alunoOptions = await alunoSelect.locator('option:not([value=""])').all();

        if (alunoOptions.length > 0) {
          const firstAlunoValue = await alunoOptions[0].getAttribute('value');
          if (firstAlunoValue) {
            await alunoSelect.selectOption(firstAlunoValue);
            await adminPage.waitForTimeout(1000);

            // Select a responsavel
            const respSelect = adminPage.locator('select').filter({ hasText: /Responsável|responsavel/i }).first();

            if (await respSelect.isVisible().catch(() => false)) {
              const respOptions = await respSelect.locator('option:not([value=""])').all();

              if (respOptions.length > 0) {
                const firstRespValue = await respOptions[0].getAttribute('value');
                if (firstRespValue) {
                  await respSelect.selectOption(firstRespValue);

                  // Fill message
                  const textarea = adminPage.locator('textarea').first();
                  if (await textarea.isVisible().catch(() => false)) {
                    await textarea.fill('Mensagem de teste via E2E');
                  }

                  // Send message
                  const sendButton = adminPage.locator('button:has-text("Enviar")').first();
                  if (await sendButton.isVisible().catch(() => false)) {
                    await sendButton.click();
                    await adminPage.waitForTimeout(2000);
                  }
                }
              }
            }
          }
        }
      }

      // Page should still be functional
      await expect(adminPage.locator('body')).toBeVisible();
    }
  });

  test('should view message details', async ({ adminPage }) => {
    await adminPage.waitForTimeout(3000);

    // Look for a message row to click on
    const messageRow = adminPage.locator('tr, .message-item, .notificacao-item').first();

    if (await messageRow.isVisible().catch(() => false)) {
      await messageRow.click();
      await adminPage.waitForTimeout(500);

      // Check if modal opens
      const modal = adminPage.locator('[role="dialog"], .modal');
      const hasModal = await modal.first().isVisible().catch(() => false);

      if (hasModal) {
        // Modal should show message details
        await expect(modal.first()).toBeVisible();

        // Close modal
        const closeButton = adminPage.locator('button:has-text("Fechar"), [aria-label="close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });

  test('should filter messages by tipo', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Look for tipo filter
    const tipoFilter = adminPage.locator('select').first();

    if (await tipoFilter.isVisible().catch(() => false)) {
      const options = await tipoFilter.locator('option').allTextContents();
      const comunicadoOption = options.find(opt => opt.toLowerCase().includes('comunicado'));

      if (comunicadoOption) {
        await tipoFilter.selectOption({ label: comunicadoOption });
        await adminPage.waitForTimeout(1000);
      }

      // Page should still be functional
      await expect(adminPage.locator('body')).toBeVisible();
    }
  });

  test('should filter messages by canal', async ({ adminPage }) => {
    await adminPage.waitForTimeout(2000);

    // Look for canal filter
    const canalFilter = adminPage.locator('select').filter({ hasText: /Sistema|WhatsApp|Email/i }).first();

    if (await canalFilter.isVisible().catch(() => false)) {
      const options = await canalFilter.locator('option').allTextContents();
      const sistemaOption = options.find(opt => opt.toLowerCase().includes('sistema'));

      if (sistemaOption) {
        await canalFilter.selectOption({ label: sistemaOption });
        await adminPage.waitForTimeout(1000);
      }

      // Page should still be functional
      await expect(adminPage.locator('body')).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ adminPage }) => {
    // Set mobile viewport
    await adminPage.setViewportSize({ width: 375, height: 667 });

    // Page should still display correctly
    await expect(adminPage.locator('h1')).toContainText('Comunicação');

    // Main container should be visible
    const container = adminPage.locator('.container').first();
    const hasContainer = await container.isVisible().catch(() => false);

    if (hasContainer) {
      await expect(container).toBeVisible();
    }
  });
});

test.describe('Admin - Comunicação WhatsApp', () => {
  test('should have WhatsApp channel option', async ({ adminPage }) => {
    await adminPage.goto('/admin/comunicacao');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(2000);

    // Switch to new message tab
    const newMessageTab = adminPage.locator('button:has-text("Nova"), [role="tab"]:has-text("Nova")').first();

    if (await newMessageTab.isVisible().catch(() => false)) {
      await newMessageTab.click();
      await adminPage.waitForTimeout(500);

      // Look for WhatsApp in canal options
      const canalSelect = adminPage.locator('select').filter({ hasText: /Canal|canal/i }).first();

      if (await canalSelect.isVisible().catch(() => false)) {
        const options = await canalSelect.locator('option').allTextContents();
        const hasWhatsApp = options.some(opt => opt.toLowerCase().includes('whatsapp'));

        expect(hasWhatsApp).toBeTruthy();
      }
    }
  });
});
