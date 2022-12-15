<script>
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let account_id = '';
	let account_pw = '';
	let accounts = [{no:'', id:'', pw: ''}];
	let _data = { account: [...accounts] };

	const n_cafe_write = async () => {
		await window.bridge.n_cafe_write({todos, _data})
	}

	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			XPathEvaluator
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
		<input type="button" style="width: 100%; cursor: pointer;" value="실행" on:click={() => {
			n_cafe_write();
		}} />
		<br><br>
		<input type="text" placeholder="ID" bind:value={account_id} />
		<input type="password" placeholder="PW"bind:value={account_pw} />
		<input type="button" value="추가" style="cursor: pointer;" on:click={() => {
			let object = {
				no: accounts.length+1,
				id: account_id,
				pw: account_pw
			}
			accounts.push({...object});
			account_id = '';
			account_pw = '';
		}}/>
		<br><br>
		<table style="border: 1px solid #ccc;">
			<tbody>
				<tr>
					<td>NO</td>
					<td>아이디</td>
					<td>비밀번호</td>
				</tr>
				{#each accounts as row}
					<tr>
						<td>{row.no}</td>
						<td>{row.id}</td>
						<td>{row.pw}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<textarea bind:value={_data.log}></textarea>
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