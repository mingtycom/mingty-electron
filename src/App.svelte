<script>
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let account_id = '';
	let account_pw = '';
	let accounts = [];

	const n_cafe_write = async () => {
		await window.bridge.n_cafe_write({todos, accounts})
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
		{ id: 1, done: false, description: 'https://cafe.naver.com/hacosa' },
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
		<form on:submit|preventDefault={() => {
			if(account_id == undefined || account_id == '') {
				alert('ID를 입력하지 않았습니다.');
				return false;
			}
			if(account_pw == undefined || account_pw == '') {
				alert('PW를 입력하지 않았습니다.');
				return false;
			}

			let object = {
					id: account_id,
					pw: account_pw
				}
				accounts = [...accounts, {...object}];
				account_id = '';
				account_pw = '';
		}}>
			<input type="text" placeholder="ID" bind:value={account_id} />
			<input type="password" placeholder="PW"bind:value={account_pw} />
			<input type="submit" value="추가" style="width: 30%;" />
		</form>
		<br><br>
		<table style="border: 1px solid #ccc; width: 100%;">
			<thead>
				<tr>
					<th>NO</th>
					<th>아이디</th>
					<th>비밀번호</th>
					<th></th>
				</tr>
			</thead>
			<tbody style="text-align: center;">
				{#each accounts as row, index}
					<tr>
						<td>{(index+1)}</td>
						<td>{row.id}</td>
						<td><input type="password" readonly disabled style="border: 0px;" value={row.pw}/></td>
						<td>
							<input type="button" style="cursor: pointer; width: 35px;" on:click="{() => {
								accounts = accounts.filter(t => t !== row);
							}}" value="X">
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
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