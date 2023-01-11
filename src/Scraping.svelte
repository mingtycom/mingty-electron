<script>
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
    import { onMount } from 'svelte';

	let consoleDiv;
	let option = { headless: false };// 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.
	let _data = {type:'', value: ''};
	let result;
	
	let fn_ln;
	let scraping = async () => {
		let res = await window.bridge.c_scraping({option, todos, result});
		let buffer = toArrayBuffer(res);
		const a = document.createElement('a')
		a.href = URL.createObjectURL(new Blob(
			[ buffer ],
			{ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
		))
		//a.download = `${Utils.now()}_excel.xlsx`;
		a.click()
	}

	function toArrayBuffer(buf) {
		const ab = new ArrayBuffer(buf.length);
		const view = new Uint8Array(ab);
		for (let i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
		}
		return ab;
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

	let todosTypes = [
		{ id: 1, text: 'URL', value: 'URL'},
		{ id: 2, text: '페이지 파리미터명', value: 'PAGENM'},
		{ id: 3, text: '페이지 최대사이즈', value: 'PAGESIZE'},
		{ id: 4, text: '컨텐츠', value: 'CONTENT'},
		{ id: 5, text: '수집', value: 'COLLECT'},
	];

	let todos = [
		{ id: 1, done: true, type:'URL', description: 'https://www.onsotong.go.kr/front/epilogue/epilogueBbsListPage.do' },
		{ id: 2, done: true, type:'PAGENM', description: 'miv_pageNo' },
		{ id: 3, done: true, type:'PAGESIZE', description: '54' }, //54
		{ id: 4, done: true, type:'CONTENT', description: 'li.survey_box' },
		{ id: 5, done: true, type:'COLLECT', description: 'div.h3_tit h3' },
		{ id: 6, done: true, type:'COLLECT', description: '#content_quick > div.survey_view_wrap > ul:nth-child(4) > li:nth-child(1) > a > span' },
		{ id: 7, done: true, type:'COLLECT', description: '#content_quick > div.survey_view_wrap > ul:nth-child(4) > li:nth-child(2) > a' },
	];

	let uid = todos.length + 1;

	function add(input) {
		if(input.type == undefined || input.type == '') {
			alert('타입을 선택하지 않았습니다.');
			return false;
		}
		if(input.value == undefined || input.value == '') {
			alert('데이터 값을 입력해주세요.');
			return false;
		}

		const todo = {
			id: uid++,
			done: false,
			type: input.type,
			description: input.value
		};
		todos = [todo, ...todos];
	}
	
	function remove(todo) {
		todos = todos.filter(t => t !== todo);
	}

	import io from 'socket.io-client'
    import Switch from './components/Switch.svelte';

	const socket = io("http://localhost:18092")
	socket.on('log', (data) => {
		//messages = [...messages, data]
		consoleDiv.value += `${(new Date()).toLocaleString("ko-KR")} >> `
		consoleDiv.value += data
		consoleDiv.value += "\n"
		fn_ln();
	})

	onMount(async () => {
		consoleDiv = document.getElementById("console")

		fn_ln = () => {
			document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
		}

		const consoleToHtml = function() {
			consoleDiv.value += `${(new Date()).toLocaleString("ko-KR")} >> `
			Array.from(arguments).forEach(el => {
				consoleDiv.value += " "
				const insertValue = typeof el === "object" ? JSON.stringify(el) : el
				consoleDiv.value += insertValue
			})
			consoleDiv.value += "\n"
			fn_ln();
		}
		window.console.log = consoleToHtml
	})
</script>
<main>
	<div class='board'>
		<h1><center>스크랩핑</center></h1>
		<Switch bind:value={option.headless} label="웹페이지 열고 실행" fontSize={15} design="slider" /><br>
		<input type="button" style="width: 100%; cursor: pointer;" value="실행" on:click={() => {
			scraping();
		}} />
		<br><br>
		<select bind:value={_data.type} style="width: 100%;">
			<option value="">타입을 선택하세요.</option>
			{#each todosTypes as todosType}
				<option value={todosType.value} selected>
					{todosType.text}
				</option>
			{/each}
		</select>
		<input
			style="margin: 0;"
			class="new-todo"
			placeholder="데이터를 입력해주세요."
			bind:value={_data.value}
			on:keydown="{event => event.key === 'Enter' && add(_data)}"
		>
		<br><br>

		<div class='left'>
			<h2>대기 설정</h2>
			{#each todos.filter(t => !t.done) as todo (todo.id)}
				<label
					in:receive="{{key: todo.id}}"
					out:send="{{key: todo.id}}"
					animate:flip
				>
					<input type=checkbox bind:checked={todo.done}>
					<button on:click="{() => remove(todo)}">x</button>
					<br><br>
					<div style="overflow-x: auto;">
						타입: {todo.type}<br>
						[{todo.description}]
					</div>
				</label>
			{/each}
		</div>

		<div class='right'>
			<h2>실행 설정</h2>
			{#each todos.filter(t => t.done) as todo (todo.id)}
				<label
					style="overflow-x: auto;"
					in:receive="{{key: todo.id}}"
					out:send="{{key: todo.id}}"
					animate:flip
				>
					<input type=checkbox bind:checked={todo.done}>
					<button on:click="{() => remove(todo)}">x</button>
					<br><br>
					<div style="overflow: auto;">
						타입: {todo.type}<br>
						[{todo.description}]
					</div>
				</label>
			{/each}
		</div>
		<textarea id="console" readonly></textarea>
	</div>
</main>

<style>
	.board textarea {
		width: 100%;
		margin: 2em 0 1em 0;
		height: 300px;
		font-size: 12px;
		resize: none;
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
		background-color: lavender;
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