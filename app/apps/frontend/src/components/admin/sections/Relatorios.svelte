<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Chart, registerables } from "chart.js";
	import { apiFetch } from "../../../lib/api";
	import DataTable from "../../ui/DataTable.svelte";
	import Toast from "../../ui/Toast.svelte";
	import FormSelect from "../../ui/FormSelect.svelte";
	import type { Column } from "../../../interfaces/table";

	// Register Chart.js components
	Chart.register(...registerables);

	// Toast state
	let toastMessage = "";
	let toastType: "success" | "error" | "warning" | "info" = "info";
	let showToast = false;

	function displayToast(
		message: string,
		type: "success" | "error" | "warning" | "info" = "info",
	) {
		toastMessage = message;
		toastType = type;
		showToast = true;
	}

	// Filter state
	let tipoRelatorio = "presencas-periodo";
	let dataInicio = "";
	let dataFim = "";
	let turmaId = "";
	let alunoId = "";

	// Data state
	let turmas: Array<{
		id_turma: number;
		nome_turma: string;
		unidade_turma?: string;
	}> = [];
	let alunos: Array<{ id_aluno: number; nome_aluno: string }> = [];
	let isLoading = false;
	let reportGenerated = false;

	// Report data
	let currentReportData: any = null;
	let reportTitle = "";
	let reportInfo = "";

	// Chart instances
	let activeCharts: Chart[] = [];

	// Chart colors
	const chartColors = {
		presente: { bg: "rgba(72, 187, 120, 0.8)", border: "#48BB78" },
		atraso: { bg: "rgba(237, 137, 54, 0.8)", border: "#ED8936" },
		falta: { bg: "rgba(229, 62, 62, 0.8)", border: "#E53E3E" },
		primary: { bg: "rgba(49, 130, 206, 0.8)", border: "#3182CE" },
	};

	// DataTable columns for detalhamento
	const detalhesColumns: Column[] = [
		{ key: "aluno", label: "Aluno", sortable: true },
		{
			key: "presentes",
			label: "Presenças",
			sortable: true,
			align: "center",
		},
		{ key: "faltas", label: "Faltas", sortable: true, align: "center" },
		{ key: "atrasos", label: "Atrasos", sortable: true, align: "center" },
		{
			key: "taxa",
			label: "Taxa",
			sortable: true,
			align: "center",
			render: (row) => ({
				component: "badge",
				props: {
					text: `${row.taxa}%`,
					variant:
						row.taxa >= 75
							? "success"
							: row.taxa >= 50
								? "warning"
								: "danger",
				},
			}),
		},
	];

	// Computed rows for DataTable
	$: detalhesRows = (currentReportData?.detalhes || []).map(
		(item: any, index: number) => {
			const total = item.presentes + item.faltas + item.atrasos;
			const taxa =
				item.taxaPresenca !== undefined
					? item.taxaPresenca
					: total > 0
						? Math.round(
								((item.presentes + item.atrasos) / total) * 100,
							)
						: 0;
			return {
				id: index,
				aluno: item.aluno,
				presentes: item.presentes,
				faltas: item.faltas,
				atrasos: item.atrasos,
				taxa,
			};
		},
	);

	// Show aluno filter only for individual report
	$: showAlunoFilter = tipoRelatorio === "individual";

	onMount(async () => {
		// Set default dates (last month)
		const hoje = new Date();
		const mesPassado = new Date(hoje);
		mesPassado.setMonth(mesPassado.getMonth() - 1);

		dataInicio = mesPassado.toISOString().split("T")[0];
		dataFim = hoje.toISOString().split("T")[0];

		// Load turmas and alunos
		await Promise.all([loadTurmas(), loadAlunos()]);
	});

	onDestroy(() => {
		destroyCharts();
	});

	function destroyCharts() {
		activeCharts.forEach((chart) => {
			if (chart && typeof chart.destroy === "function") {
				chart.destroy();
			}
		});
		activeCharts = [];
	}

	async function loadTurmas() {
		try {
			const response = await apiFetch<{ success: boolean; data: any }>(
				"/turmas/listar?pageSize=100",
			);
			if (response.success && response.data) {
				turmas = (response.data as any).data || response.data || [];
			}
		} catch (error) {
			console.error("Erro ao carregar turmas:", error);
		}
	}

	async function loadAlunos() {
		try {
			const response = await apiFetch<{ success: boolean; data: any }>(
				"/alunos/listar?pageSize=500",
			);
			if (response.success && response.data) {
				alunos = (response.data as any).data || response.data || [];
			}
		} catch (error) {
			console.error("Erro ao carregar alunos:", error);
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString("pt-BR");
	}

	async function handleGerarRelatorio() {
		// Validation
		if (!dataInicio || !dataFim) {
			displayToast(
				"Por favor, selecione as datas inicial e final",
				"warning",
			);
			return;
		}

		if (new Date(dataInicio) > new Date(dataFim)) {
			displayToast(
				"A data inicial não pode ser maior que a data final",
				"warning",
			);
			return;
		}

		if (tipoRelatorio === "individual" && !alunoId) {
			displayToast(
				"Por favor, selecione um aluno para o relatório individual",
				"warning",
			);
			return;
		}

		isLoading = true;
		destroyCharts();

		try {
			if (tipoRelatorio === "individual") {
				currentReportData = await gerarRelatorioIndividual();
			} else {
				currentReportData = await gerarRelatorioPresencas();
			}

			// Update title and info
			const tipoText: Record<string, string> = {
				"presencas-periodo": "Presenças por Período",
				"presencas-turma": "Presenças por Turma",
				individual: "Individual",
				"frequencia-geral": "Frequência Geral",
			};

			reportTitle = `Relatório de ${tipoText[tipoRelatorio] || "Relatório"}`;

			if (tipoRelatorio === "individual" && currentReportData.aluno) {
				reportInfo = `Aluno: ${currentReportData.aluno.nome_aluno} | Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}`;
			} else {
				const turmaText = turmaId
					? turmas.find((t) => t.id_turma === Number(turmaId))
							?.nome_turma || "Selecionada"
					: "Todas";
				reportInfo = `Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)} | Turma: ${turmaText}`;
			}

			reportGenerated = true;

			// Create charts after render
			setTimeout(() => createCharts(), 100);
		} catch (error) {
			console.error("Erro ao gerar relatório:", error);
			displayToast("Erro ao gerar relatório. Tente novamente.", "error");
		} finally {
			isLoading = false;
		}
	}

	async function gerarRelatorioIndividual() {
		const response = await apiFetch<{ success: boolean; data: any }>(
			`/alunos/estatisticas/${alunoId}?from=${dataInicio}&to=${dataFim}`,
		);
		if (response.success && response.data) {
			const serverData = (response.data as any).data || response.data;
			return {
				tipo: "individual",
				aluno: serverData.aluno,
				estatisticas: serverData.estatisticas,
				periodo: { inicio: dataInicio, fim: dataFim },
			};
		}
		throw new Error("Falha ao carregar estatísticas do aluno");
	}

	async function gerarRelatorioPresencas() {
		const params = new URLSearchParams();
		params.append("from", dataInicio);
		params.append("to", dataFim);
		if (turmaId) params.append("turmaId", turmaId);

		const response = await apiFetch<{ success: boolean; data: any }>(
			`/presencas/estatisticas?${params}`,
		);
		if (response.success && response.data) {
			const statsData = (response.data as any).data || response.data;

			const detalhes = (statsData.todosAlunos || []).map(
				(aluno: any) => ({
					aluno: aluno.nome,
					presentes: aluno.presente,
					faltas: aluno.falta,
					atrasos: aluno.atraso,
					taxaPresenca: aluno.taxaPresenca,
				}),
			);

			return {
				tipo: tipoRelatorio,
				periodo: { inicio: dataInicio, fim: dataFim },
				turmaId,
				estatisticas: {
					total_alunos: detalhes.length,
					presentes: statsData.resumo?.presente || 0,
					faltas: statsData.resumo?.falta || 0,
					atrasos: statsData.resumo?.atraso || 0,
					taxaPresenca: statsData.resumo?.taxaPresenca || 0,
				},
				detalhes,
				porTurma: statsData.porTurma || [],
				tendencia: statsData.tendencia || [],
				topAlunos: statsData.topAlunos || [],
			};
		}
		throw new Error("Falha ao carregar estatísticas de presenças");
	}

	function createCharts() {
		if (!currentReportData) return;

		if (
			currentReportData.tipo === "individual" &&
			currentReportData.estatisticas
		) {
			const stats = currentReportData.estatisticas;
			createDistributionChart("individual-distribution-chart", {
				presentes: stats.presenca?.presentes || 0,
				atrasos: stats.presenca?.atrasos || 0,
				faltas: stats.presenca?.faltas || 0,
			});
		} else if (currentReportData.estatisticas) {
			createDistributionChart("distribution-chart", {
				presentes: currentReportData.estatisticas.presentes,
				atrasos: currentReportData.estatisticas.atrasos,
				faltas: currentReportData.estatisticas.faltas,
			});

			if (
				(tipoRelatorio === "presencas-turma" ||
					tipoRelatorio === "frequencia-geral") &&
				currentReportData.porTurma?.length > 0
			) {
				createTurmaChart("turma-chart", currentReportData.porTurma);
			}

			if (currentReportData.tendencia?.length > 1) {
				createTrendChart("trend-chart", currentReportData.tendencia);
			}

			if (currentReportData.topAlunos?.length > 0) {
				createTopAlunosChart(
					"top-alunos-chart",
					currentReportData.topAlunos,
				);
			}
		}
	}

	function createDistributionChart(
		canvasId: string,
		data: { presentes: number; atrasos: number; faltas: number },
	) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas) return null;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		const chart = new Chart(ctx, {
			type: "doughnut",
			data: {
				labels: ["Presenças", "Atrasos", "Faltas"],
				datasets: [
					{
						data: [
							data.presentes || 0,
							data.atrasos || 0,
							data.faltas || 0,
						],
						backgroundColor: [
							chartColors.presente.bg,
							chartColors.atraso.bg,
							chartColors.falta.bg,
						],
						borderColor: [
							chartColors.presente.border,
							chartColors.atraso.border,
							chartColors.falta.border,
						],
						borderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: "bottom",
						labels: {
							padding: 20,
							usePointStyle: true,
							font: { size: 12, family: "Atkinson, sans-serif" },
						},
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const total = context.dataset.data.reduce(
									(a: number, b: number) => a + b,
									0,
								);
								const percentage =
									total > 0
										? Math.round(
												((context.raw as number) /
													total) *
													100,
											)
										: 0;
								return `${context.label}: ${context.raw} (${percentage}%)`;
							},
						},
					},
				},
			},
		});
		activeCharts.push(chart);
		return chart;
	}

	function createTurmaChart(canvasId: string, turmasData: any[]) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas || !turmasData?.length) return null;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		const chart = new Chart(ctx, {
			type: "bar",
			data: {
				labels: turmasData.map((t) => t.nome || "Sem nome"),
				datasets: [
					{
						label: "Presenças",
						data: turmasData.map((t) => t.presente || 0),
						backgroundColor: chartColors.presente.bg,
						borderColor: chartColors.presente.border,
						borderWidth: 1,
					},
					{
						label: "Atrasos",
						data: turmasData.map((t) => t.atraso || 0),
						backgroundColor: chartColors.atraso.bg,
						borderColor: chartColors.atraso.border,
						borderWidth: 1,
					},
					{
						label: "Faltas",
						data: turmasData.map((t) => t.falta || 0),
						backgroundColor: chartColors.falta.bg,
						borderColor: chartColors.falta.border,
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: "top",
						labels: {
							padding: 15,
							usePointStyle: true,
							font: { size: 12, family: "Atkinson, sans-serif" },
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							font: { size: 11, family: "Atkinson, sans-serif" },
						},
					},
					y: {
						beginAtZero: true,
						grid: { color: "rgba(0, 0, 0, 0.05)" },
						ticks: {
							font: { size: 11, family: "Atkinson, sans-serif" },
						},
					},
				},
			},
		});
		activeCharts.push(chart);
		return chart;
	}

	function createTrendChart(canvasId: string, tendencia: any[]) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas || !tendencia?.length) return null;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		const chart = new Chart(ctx, {
			type: "line",
			data: {
				labels: tendencia.map((t) => {
					const date = new Date(t.data);
					return date.toLocaleDateString("pt-BR", {
						day: "2-digit",
						month: "2-digit",
					});
				}),
				datasets: [
					{
						label: "Presenças",
						data: tendencia.map((t) => t.presente || 0),
						borderColor: chartColors.presente.border,
						backgroundColor: "rgba(72, 187, 120, 0.1)",
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
					{
						label: "Atrasos",
						data: tendencia.map((t) => t.atraso || 0),
						borderColor: chartColors.atraso.border,
						backgroundColor: "rgba(237, 137, 54, 0.1)",
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
					{
						label: "Faltas",
						data: tendencia.map((t) => t.falta || 0),
						borderColor: chartColors.falta.border,
						backgroundColor: "rgba(229, 62, 62, 0.1)",
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { intersect: false, mode: "index" },
				plugins: {
					legend: {
						position: "top",
						labels: {
							padding: 15,
							usePointStyle: true,
							font: { size: 12, family: "Atkinson, sans-serif" },
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							font: { size: 10, family: "Atkinson, sans-serif" },
							maxRotation: 45,
							minRotation: 0,
						},
					},
					y: {
						beginAtZero: true,
						grid: { color: "rgba(0, 0, 0, 0.05)" },
						ticks: {
							font: { size: 11, family: "Atkinson, sans-serif" },
						},
					},
				},
			},
		});
		activeCharts.push(chart);
		return chart;
	}

	function createTopAlunosChart(canvasId: string, alunosData: any[]) {
		const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		if (!canvas || !alunosData?.length) return null;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		const chart = new Chart(ctx, {
			type: "bar",
			data: {
				labels: alunosData.map((a) => a.nome || "Desconhecido"),
				datasets: [
					{
						label: "Taxa de Presença (%)",
						data: alunosData.map((a) => a.taxaPresenca || 0),
						backgroundColor: alunosData.map((a) => {
							const rate = a.taxaPresenca || 0;
							if (rate >= 75) return chartColors.presente.bg;
							if (rate >= 50) return chartColors.atraso.bg;
							return chartColors.falta.bg;
						}),
						borderColor: alunosData.map((a) => {
							const rate = a.taxaPresenca || 0;
							if (rate >= 75) return chartColors.presente.border;
							if (rate >= 50) return chartColors.atraso.border;
							return chartColors.falta.border;
						}),
						borderWidth: 1,
					},
				],
			},
			options: {
				indexAxis: "y",
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: {
					x: {
						beginAtZero: true,
						max: 100,
						grid: { color: "rgba(0, 0, 0, 0.05)" },
						ticks: {
							font: { size: 11, family: "Atkinson, sans-serif" },
							callback: (value) => `${value}%`,
						},
					},
					y: {
						grid: { display: false },
						ticks: {
							font: { size: 11, family: "Atkinson, sans-serif" },
						},
					},
				},
			},
		});
		activeCharts.push(chart);
		return chart;
	}

	function handleExportarCSV() {
		if (!currentReportData) {
			displayToast("Gere um relatório antes de exportar", "warning");
			return;
		}

		let csvContent = "";

		if (tipoRelatorio === "individual" && currentReportData.estatisticas) {
			const stats = currentReportData.estatisticas;
			csvContent = "Métrica,Valor\n";
			csvContent += `"Aluno","${currentReportData.aluno?.nome_aluno || ""}"\n`;
			csvContent += `"Taxa de Presença","${stats.presenca?.taxaPresenca || 0}%"\n`;
			csvContent += `"Total de Aulas",${stats.presenca?.totalAulas || 0}\n`;
			csvContent += `"Presenças",${stats.presenca?.presentes || 0}\n`;
			csvContent += `"Faltas",${stats.presenca?.faltas || 0}\n`;
			csvContent += `"Atrasos",${stats.presenca?.atrasos || 0}\n`;
			csvContent += `"Justificativas",${stats.justificativas?.total || 0}\n`;
			csvContent += `"Advertências",${stats.advertencias?.total || 0}\n`;
		} else if (currentReportData.detalhes) {
			csvContent = "Aluno,Presenças,Faltas,Atrasos,Taxa\n";
			currentReportData.detalhes.forEach((item: any) => {
				const total = item.presentes + item.faltas + item.atrasos;
				const taxa =
					item.taxaPresenca !== undefined
						? item.taxaPresenca
						: total > 0
							? Math.round(
									((item.presentes + item.atrasos) / total) *
										100,
								)
							: 0;
				csvContent += `"${item.aluno}",${item.presentes},${item.faltas},${item.atrasos},${taxa}%\n`;
			});
		}

		const blob = new Blob(["\ufeff" + csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`relatorio_${tipoRelatorio}_${dataInicio}_${dataFim}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		displayToast("Relatório CSV exportado com sucesso!", "success");
	}

	async function handleExportarPDF() {
		if (!currentReportData) {
			displayToast("Gere um relatório antes de exportar", "warning");
			return;
		}

		displayToast("Gerando PDF...", "info");

		try {
			// Dynamic import of jsPDF and html2canvas
			const { default: jsPDF } = await import("jspdf");
			const { default: html2canvas } = await import("html2canvas");

			const reportElement = document.getElementById("report-content");
			if (!reportElement) {
				displayToast(
					"Erro ao gerar PDF: conteúdo não encontrado",
					"error",
				);
				return;
			}

			// Create canvas from the report content
			const canvas = await html2canvas(reportElement, {
				scale: 2,
				useCORS: true,
				logging: false,
				backgroundColor: "#ffffff",
			});

			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const margin = 10;
			const contentWidth = pageWidth - 2 * margin;

			// Add title
			pdf.setFontSize(16);
			pdf.setFont("helvetica", "bold");
			pdf.text(reportTitle, margin, 15);

			pdf.setFontSize(10);
			pdf.setFont("helvetica", "normal");
			pdf.text(reportInfo, margin, 22);

			// Calculate image dimensions
			const imgWidth = contentWidth;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			let yPosition = 30;
			let remainingHeight = imgHeight;
			let sourceY = 0;

			// Add image, handling multiple pages if needed
			while (remainingHeight > 0) {
				const availableHeight = pageHeight - yPosition - margin;
				const heightToDraw = Math.min(remainingHeight, availableHeight);
				const sourceHeight = (heightToDraw / imgHeight) * canvas.height;

				// Create a temporary canvas for the slice
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = canvas.width;
				tempCanvas.height = sourceHeight;
				const tempCtx = tempCanvas.getContext("2d");
				if (tempCtx) {
					tempCtx.drawImage(
						canvas,
						0,
						sourceY,
						canvas.width,
						sourceHeight,
						0,
						0,
						canvas.width,
						sourceHeight,
					);
					const sliceData = tempCanvas.toDataURL("image/png");
					pdf.addImage(
						sliceData,
						"PNG",
						margin,
						yPosition,
						imgWidth,
						heightToDraw,
					);
				}

				remainingHeight -= heightToDraw;
				sourceY += sourceHeight;

				if (remainingHeight > 0) {
					pdf.addPage();
					yPosition = margin;
				}
			}

			// Add footer with date
			const totalPages = pdf.getNumberOfPages();
			for (let i = 1; i <= totalPages; i++) {
				pdf.setPage(i);
				pdf.setFontSize(8);
				pdf.setTextColor(128);
				pdf.text(
					`Gerado em ${new Date().toLocaleString("pt-BR")} - Página ${i} de ${totalPages}`,
					margin,
					pageHeight - 5,
				);
			}

			pdf.save(`relatorio_${tipoRelatorio}_${dataInicio}_${dataFim}.pdf`);
			displayToast("Relatório PDF exportado com sucesso!", "success");
		} catch (error) {
			console.error("Erro ao gerar PDF:", error);
			displayToast(
				"Erro ao gerar PDF. Verifique se as dependências estão instaladas.",
				"error",
			);
		}
	}
</script>

<section
	id="relatorios"
	class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200"
>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 mb-1">Relatórios</h2>
			<p class="text-slate-500">
				Gere e exporte relatórios de frequência
			</p>
		</div>
		<div class="flex gap-2">
			<button
				on:click={handleGerarRelatorio}
				disabled={isLoading}
				class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? "Gerando..." : "Gerar"}
			</button>
			<button
				on:click={handleExportarCSV}
				disabled={!reportGenerated}
				class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				CSV
			</button>
			<button
				on:click={handleExportarPDF}
				disabled={!reportGenerated}
				class="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				PDF
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters-row">
		<FormSelect
			id="tipo-relatorio"
			name="tipo-relatorio"
			label="Tipo de relatório"
			bind:value={tipoRelatorio}
			options={[
				{ value: "presencas-periodo", label: "Presenças por período" },
				{ value: "presencas-turma", label: "Presenças por turma" },
				{ value: "individual", label: "Relatório individual" },
				{ value: "frequencia-geral", label: "Frequência geral" },
			]}
		/>
		<div class="form-group">
			<label for="data-inicio" class="form-label">Data inicial</label>
			<input
				id="data-inicio"
				type="date"
				bind:value={dataInicio}
				class="form-input"
			/>
		</div>
		<div class="form-group">
			<label for="data-fim" class="form-label">Data final</label>
			<input
				id="data-fim"
				type="date"
				bind:value={dataFim}
				class="form-input"
			/>
		</div>
		<FormSelect
			id="turma"
			name="turma"
			label="Turma"
			bind:value={turmaId}
			options={[
				{ value: "", label: "Todas" },
				...turmas.map((t) => ({
					value: String(t.id_turma),
					label:
						t.nome_turma +
						(t.unidade_turma ? ` - ${t.unidade_turma}` : ""),
				})),
			]}
		/>
		{#if showAlunoFilter}
			<FormSelect
				id="aluno"
				name="aluno"
				label="Aluno"
				bind:value={alunoId}
				options={[
					{ value: "", label: "Selecione um aluno" },
					...alunos.map((a) => ({
						value: String(a.id_aluno),
						label: a.nome_aluno,
					})),
				]}
			/>
		{/if}
	</div>

	<!-- Report Content -->
	<div id="report-content">
		{#if isLoading}
			<div class="text-center py-12 text-slate-500">
				<div
					class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"
				></div>
				Carregando relatório...
			</div>
		{:else if !reportGenerated}
			<div
				class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300"
			>
				<p class="text-lg">
					📊 Selecione os filtros e clique em "Gerar" para visualizar
					o relatório
				</p>
			</div>
		{:else if currentReportData}
			<!-- Report Header -->
			<div class="mb-6 pb-4 border-b-2 border-slate-200">
				<h3 class="text-xl font-semibold text-slate-900">
					{reportTitle}
				</h3>
				<p class="text-slate-500">{reportInfo}</p>
			</div>

			{#if tipoRelatorio === "individual" && currentReportData.estatisticas}
				<!-- Individual Report -->
				{@const stats = currentReportData.estatisticas}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<!-- Chart -->
					<div class="bg-slate-50 rounded-xl p-4">
						<h4 class="text-sm font-semibold mb-4">
							Distribuição de Frequência
						</h4>
						<div class="h-64">
							<canvas id="individual-distribution-chart"></canvas>
						</div>
					</div>

					<!-- Stats Cards -->
					<div class="grid grid-cols-2 gap-4">
						<div class="bg-blue-50 rounded-xl p-4 text-center">
							<p class="text-sm text-blue-600 font-medium">
								Taxa de Presença
							</p>
							<p class="text-3xl font-bold text-blue-700">
								{stats.presenca?.taxaPresenca || 0}%
							</p>
						</div>
						<div class="bg-green-50 rounded-xl p-4 text-center">
							<p class="text-sm text-green-600 font-medium">
								Presenças
							</p>
							<p class="text-3xl font-bold text-green-700">
								{stats.presenca?.presentes || 0}
							</p>
						</div>
						<div class="bg-orange-50 rounded-xl p-4 text-center">
							<p class="text-sm text-orange-600 font-medium">
								Atrasos
							</p>
							<p class="text-3xl font-bold text-orange-700">
								{stats.presenca?.atrasos || 0}
							</p>
						</div>
						<div class="bg-red-50 rounded-xl p-4 text-center">
							<p class="text-sm text-red-600 font-medium">
								Faltas
							</p>
							<p class="text-3xl font-bold text-red-700">
								{stats.presenca?.faltas || 0}
							</p>
						</div>
					</div>
				</div>

				<!-- Additional Info -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div
						class="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500"
					>
						<h4 class="text-sm font-semibold text-purple-700 mb-1">
							📄 Justificativas
						</h4>
						<p class="text-slate-600">
							Total: {stats.justificativas?.total || 0} | Aprovadas:
							{stats.justificativas?.aprovadas || 0}
						</p>
					</div>
					<div
						class="bg-red-50 rounded-xl p-4 border-l-4 border-red-500"
					>
						<h4 class="text-sm font-semibold text-red-700 mb-1">
							⚠️ Advertências
						</h4>
						<p class="text-slate-600">
							Total: {stats.advertencias?.total || 0}
						</p>
					</div>
				</div>
			{:else if currentReportData.estatisticas}
				<!-- General Report -->
				<!-- Charts Grid -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<div class="bg-slate-50 rounded-xl p-4">
						<h4 class="text-sm font-semibold mb-4">
							Distribuição Geral
						</h4>
						<div class="h-64">
							<canvas id="distribution-chart"></canvas>
						</div>
					</div>

					{#if (tipoRelatorio === "presencas-turma" || tipoRelatorio === "frequencia-geral") && currentReportData.porTurma?.length > 0}
						<div class="bg-slate-50 rounded-xl p-4">
							<h4 class="text-sm font-semibold mb-4">
								Comparativo por Turma
							</h4>
							<div class="h-64">
								<canvas id="turma-chart"></canvas>
							</div>
						</div>
					{/if}

					{#if currentReportData.topAlunos?.length > 0}
						<div class="bg-slate-50 rounded-xl p-4">
							<h4 class="text-sm font-semibold mb-4">
								Top 10 Alunos por Frequência
							</h4>
							<div class="h-64">
								<canvas id="top-alunos-chart"></canvas>
							</div>
						</div>
					{/if}
				</div>

				{#if currentReportData.tendencia?.length > 1}
					<div class="bg-slate-50 rounded-xl p-4 mb-6">
						<h4 class="text-sm font-semibold mb-4">
							Tendência de Frequência no Período
						</h4>
						<div class="h-72">
							<canvas id="trend-chart"></canvas>
						</div>
					</div>
				{/if}

				<!-- Details Table -->
				{#if detalhesRows.length > 0}
					<div class="mt-6">
						<h4 class="text-lg font-semibold mb-4">
							Detalhamento por Aluno
						</h4>
						<DataTable
							columns={detalhesColumns}
							rows={detalhesRows}
							keyField="id"
							emptyMessage="Nenhum aluno encontrado"
						/>
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</section>

<!-- Toast notifications -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
	.soft-shadow {
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.08),
			0 6px 10px rgba(0, 0, 0, 0.06);
	}

	.filters-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 180px;
		max-width: 220px;
	}

	.form-label {
		display: block;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
		color: var(--label-color, #718096);
		font-weight: 500;
	}

	.form-input {
		padding: 0.75rem;
		border: 1px solid var(--border-color, #cbd5e0);
		border-radius: 6px;
		font-size: 1rem;
		color: var(--text-color, #2d3748);
		background-color: #fdfdfd;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		height: 46px;
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: #3182ce;
		box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
	}

	@media (max-width: 768px) {
		.filters-row {
			flex-direction: column;
		}

		.form-group {
			max-width: 100%;
		}
	}
</style>
