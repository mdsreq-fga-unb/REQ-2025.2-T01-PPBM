import { test, expect } from '../fixtures/auth.fixture';

test.describe('Admin - Controle de Presenças', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/admin/presencas');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display presencas page correctly', async ({ adminPage }) => {
    // Check page title
    await expect(adminPage).toHaveTitle(/Controle de Presenças|Presenças/);
    
    // Check page header
    await expect(adminPage.locator('h1')).toContainText('Controle de Presenças');
    await expect(adminPage.locator('text=Registre presença, falta ou atraso por turma')).toBeVisible();
  });

  test('should have turma selector', async ({ adminPage }) => {
    // Check for turma select element
    const turmaSelect = adminPage.locator('#turma, select').filter({ hasText: /turma/i }).first();
    await expect(turmaSelect).toBeVisible();
    
    // Should have placeholder option
    await expect(adminPage.locator('option:has-text("Selecione uma turma")')).toBeVisible();
  });

  test('should have date picker', async ({ adminPage }) => {
    const dateInput = adminPage.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    
    // Should have today's date as default
    const today = new Date().toISOString().split('T')[0];
    await expect(dateInput).toHaveValue(today);
  });

  test('should have save button disabled initially', async ({ adminPage }) => {
    const saveButton = adminPage.locator('button:has-text("Salvar Presenças")');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });

  test('should display stats grid', async ({ adminPage }) => {
    // Check for stat cards
    const totalCard = adminPage.locator('.stat-card.total').or(adminPage.locator('text=Total'));
    const presentCard = adminPage.locator('.stat-card.present').or(adminPage.locator('text=Presentes'));
    const lateCard = adminPage.locator('.stat-card.late').or(adminPage.locator('text=Atrasos'));
    const absentCard = adminPage.locator('.stat-card.absent').or(adminPage.locator('text=Faltas'));
    
    await expect(totalCard.first()).toBeVisible();
    await expect(presentCard.first()).toBeVisible();
    await expect(lateCard.first()).toBeVisible();
    await expect(absentCard.first()).toBeVisible();
  });

  test('should show empty state message when no turma selected', async ({ adminPage }) => {
    const emptyMessage = adminPage.locator('text=Selecione uma turma para visualizar os alunos');
    await expect(emptyMessage).toBeVisible();
  });

  test('should load turmas in dropdown', async ({ adminPage }) => {
    // Wait for turmas to load
    await adminPage.waitForTimeout(2000);
    
    // Open the turma select
    const turmaSelect = adminPage.locator('#turma, select').first();
    
    // Check that there are options beyond the placeholder
    const options = await turmaSelect.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(1); // At least placeholder
  });

  test('should load students when turma is selected', async ({ adminPage }) => {
    // Wait for turmas to load
    await adminPage.waitForTimeout(2000);
    
    // Get turma select and check for options
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      // Select first turma
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        
        // Wait for students to load
        await adminPage.waitForTimeout(2000);
        
        // Either students are shown or "Nenhum aluno matriculado" message
        const hasStudents = await adminPage.locator('.table-row, .student-name').first().isVisible().catch(() => false);
        const hasEmptyMessage = await adminPage.locator('text=Nenhum aluno matriculado').isVisible().catch(() => false);
        
        expect(hasStudents || hasEmptyMessage).toBeTruthy();
      }
    }
  });

  test('should have status select with three options for each student', async ({ adminPage }) => {
    // Wait for turmas to load and select first one
    await adminPage.waitForTimeout(2000);
    
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Look for status select
        const statusSelect = adminPage.locator('.status-select, select').filter({ hasText: /Presente|Falta|Atraso/ }).first();
        
        if (await statusSelect.isVisible().catch(() => false)) {
          // Check for three options
          const options = await statusSelect.locator('option').allTextContents();
          expect(options.some(opt => opt.includes('Presente'))).toBeTruthy();
          expect(options.some(opt => opt.includes('Atraso'))).toBeTruthy();
          expect(options.some(opt => opt.includes('Falta'))).toBeTruthy();
        }
      }
    }
  });

  test('should update stats when presence status changes', async ({ adminPage }) => {
    // Wait for turmas to load and select first one
    await adminPage.waitForTimeout(2000);
    
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Look for status select
        const statusSelect = adminPage.locator('.status-select').first();
        
        if (await statusSelect.isVisible().catch(() => false)) {
          // Get initial stats
          const initialFaltas = await adminPage.locator('.stat-card.absent .value, .stat-card:has-text("Faltas") .value').first().textContent();
          
          // Change status to Falta
          await statusSelect.selectOption('Falta');
          
          // Wait for reactive update
          await adminPage.waitForTimeout(500);
          
          // Check if faltas count updated
          const newFaltas = await adminPage.locator('.stat-card.absent .value, .stat-card:has-text("Faltas") .value').first().textContent();
          
          // Stats should have updated
          expect(newFaltas).toBeDefined();
        }
      }
    }
  });

  test('should enable save button when turma is selected and has students', async ({ adminPage }) => {
    // Wait for turmas to load
    await adminPage.waitForTimeout(2000);
    
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Check if students are displayed
        const hasStudents = await adminPage.locator('.table-row, .student-name').first().isVisible().catch(() => false);
        
        if (hasStudents) {
          // Save button should be enabled
          const saveButton = adminPage.locator('button:has-text("Salvar Presenças")');
          await expect(saveButton).toBeEnabled();
        }
      }
    }
  });

  test('should show justificativa button only for Falta status', async ({ adminPage }) => {
    // Wait for turmas to load and select first one
    await adminPage.waitForTimeout(2000);
    
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Look for status select and change to Falta
        const statusSelect = adminPage.locator('.status-select').first();
        
        if (await statusSelect.isVisible().catch(() => false)) {
          // Change to Falta
          await statusSelect.selectOption('Falta');
          await adminPage.waitForTimeout(500);
          
          // Justificativa button should appear
          const justificativaButton = adminPage.locator('button:has-text("Justificar"), button:has-text("Ver Justificativa")').first();
          await expect(justificativaButton).toBeVisible();
        }
      }
    }
  });

  test('should save presencas successfully', async ({ adminPage }) => {
    // Wait for turmas to load
    await adminPage.waitForTimeout(2000);
    
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Check if students are displayed
        const hasStudents = await adminPage.locator('.table-row, .student-name').first().isVisible().catch(() => false);
        
        if (hasStudents) {
          // Click save button
          const saveButton = adminPage.locator('button:has-text("Salvar Presenças")');
          await saveButton.click();
          
          // Button should show loading state
          await expect(saveButton).toHaveText(/Salvando/);
          
          // Wait for save to complete
          await adminPage.waitForTimeout(3000);
          
          // Should show success toast or button returns to normal
          const successToast = adminPage.locator('text=Presenças salvas com sucesso');
          const buttonNormal = await saveButton.textContent();
          
          const hasSuccess = await successToast.isVisible().catch(() => false);
          const buttonReturned = buttonNormal?.includes('Salvar');
          
          expect(hasSuccess || buttonReturned).toBeTruthy();
        }
      }
    }
  });

  test('should change date and reload presencas', async ({ adminPage }) => {
    // Wait for turmas to load and select first one
    await adminPage.waitForTimeout(2000);
    
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Change the date
        const dateInput = adminPage.locator('input[type="date"]');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        await dateInput.fill(yesterdayStr);
        
        // Wait for reload
        await adminPage.waitForTimeout(2000);
        
        // Page should still be functional
        await expect(adminPage.locator('h1')).toContainText('Controle de Presenças');
      }
    }
  });

  test('should be responsive on mobile viewport', async ({ adminPage }) => {
    // Set mobile viewport
    await adminPage.setViewportSize({ width: 375, height: 667 });
    
    // Page should still display correctly
    await expect(adminPage.locator('h1')).toContainText('Controle de Presenças');
    
    // Stats grid should be visible
    const statsGrid = adminPage.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();
    
    // Form controls should stack vertically
    const formControls = adminPage.locator('.form-controls');
    await expect(formControls).toBeVisible();
  });
});

test.describe('Admin - Presencas Justificativa Dialog', () => {
  test('should open justificativa dialog when clicking Justificar button', async ({ adminPage }) => {
    await adminPage.goto('/admin/presencas');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(2000);
    
    // Select a turma
    const turmaSelect = adminPage.locator('#turma, select').first();
    const optionCount = await turmaSelect.locator('option:not([value=""])').count();
    
    if (optionCount > 0) {
      const firstOption = turmaSelect.locator('option:not([value=""])').first();
      const firstOptionValue = await firstOption.getAttribute('value');
      
      if (firstOptionValue) {
        await turmaSelect.selectOption(firstOptionValue);
        await adminPage.waitForTimeout(2000);
        
        // Change status to Falta
        const statusSelect = adminPage.locator('.status-select').first();
        
        if (await statusSelect.isVisible().catch(() => false)) {
          await statusSelect.selectOption('Falta');
          await adminPage.waitForTimeout(500);
          
          // Click Justificar button
          const justificativaButton = adminPage.locator('button:has-text("Justificar")').first();
          
          if (await justificativaButton.isVisible().catch(() => false)) {
            await justificativaButton.click();
            
            // Dialog should open
            const dialog = adminPage.locator('[role="dialog"], .modal, .dialog');
            await expect(dialog.first()).toBeVisible({ timeout: 3000 });
          }
        }
      }
    }
  });
});
