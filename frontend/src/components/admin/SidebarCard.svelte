<script lang="ts">
	export let isActive = false;
	export let icon: string;
	export let label: string;
	export let sectionId: string;
	export let onClick: () => void;
</script>

<li>
	<button
		data-section={sectionId}
		on:click={onClick}
		class="nav-btn w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-2 {isActive
			? 'bg-primary text-white'
			: 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}"
	>
		<span class="text-lg">{icon}</span>
		<span>{label}</span>
	</button>
</li>

