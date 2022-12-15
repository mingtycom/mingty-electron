<script>
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let _log = `qwqwdqwd`;

	const n_cafe_write = async () => {
		const response = await window.bridge.n_cafe_write(todos)
	}

	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

	let todos = [
		{ id: 1, done: false, description: 'http://mingty.com' },
	];

	let uid = todos.length + 1;

	function add(input) {
		const todo = {
			id: uid++,
			done: false,
			description: input.value
		};

		todos = [todo, ...todos];
		input.value = '';
	}

	function remove(todo) {
		todos = todos.filter(t => t !== todo);
	}
</script>
<main>
	<div class='board'>
		<h1><center>네이버 자동글쓰기</center></h1>
		<input type="button" style="width: 100%;" value="실행" on:click={() => {
			n_cafe_write();
		}} />

		<textarea bind:value={_log}></textarea>

		<input
			class="new-todo"
			placeholder="네이버 카페 URL을 입력해주세요."
			on:keydown="{event => event.key === 'Enter' && add(event.target)}"
		>

		<div class='left'>
			<h2>대기 리스트</h2>
			{#each todos.filter(t => !t.done) as todo (todo.id)}
				<label
					in:receive="{{key: todo.id}}"
					out:send="{{key: todo.id}}"
					animate:flip
				>
					<input type=checkbox bind:checked={todo.done}>
					{todo.description}
					<button on:click="{() => remove(todo)}">x</button>
				</label>
			{/each}
		</div>

		<div class='right'>
			<h2>실행 리스트</h2>
			{#each todos.filter(t => t.done) as todo (todo.id)}
				<label
					in:receive="{{key: todo.id}}"
					out:send="{{key: todo.id}}"
					animate:flip
				>
					<input type=checkbox bind:checked={todo.done}>
					{todo.description}
					<button on:click="{() => remove(todo)}">x</button>
				</label>
			{/each}
		</div>
	</div>
</main>

<style>
	.board textarea {
		width: 100%;
		margin: 2em 0 1em 0;
	}
	.board .new-todo {
		font-size: 1.4em;
		width: 100%;
		margin: 2em 0 1em 0;
	}

	.board {
		max-width: 36em;
		margin: 0 auto;
	}

	.board .left, .right {
		float: left;
		width: 50%;
		padding: 0 1em 0 0;
		box-sizing: border-box;
	}

	.board h2 {
		font-size: 2em;
		font-weight: 200;
		user-select: none;
	}

	.board label {
		top: 0;
		left: 0;
		display: block;
		font-size: 1em;
		line-height: 1;
		padding: 0.5em;
		margin: 0 auto 0.5em auto;
		border-radius: 2px;
		background-color: #eee;
		user-select: none;
	}

	.board input { margin: 0 }

	.board .right label {
		background-color: rgb(180,240,100);
	}

	.board button {
		float: right;
		height: 1em;
		box-sizing: border-box;
		padding: 0 0.5em;
		line-height: 1;
		background-color: transparent;
		border: none;
		color: rgb(170,30,30);
		opacity: 0;
		transition: opacity 0.2s;
	}

	.board label:hover button {
		opacity: 1;
	}
</style>