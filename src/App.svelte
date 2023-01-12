<script>
    import AutoWrite from "./AutoWrite.svelte";
    import Scraping from "./Scraping.svelte";

	let type = '';
</script>

<main>
	<div class='board'>
		{#if type == 'AUTOWRITE'}
			<AutoWrite />
		{:else if type == 'SCRAPING'}
			<Scraping />
		{:else}
					<h1><center>목록</center></h1>
					<!--
					<input type="button" style="width: 100%; cursor: pointer;" value="네이버 자동글쓰기(사용불가, 미완)" on:click={() => {
						type = 'AUTOWRITE';
					}} /><br><br>
					-->
					<input type="button" style="width: 100%; cursor: pointer;" value="스크랩핑" on:click={() => {
						type = 'SCRAPING';
					}} />
		{/if}

		{#if type != ''}
			<input type="button" style="width: 100%; cursor: pointer;" value="처음으로" on:click={() => {
				location.reload();
			}} />
		{/if}
		<br><br><br>
	</div>
</main>

<style>
	main {
		font-family: monospace;
	}
	.board {
		max-width: 36em;
		margin: 0 auto;
	}

	.board input { margin: 0 }
</style>