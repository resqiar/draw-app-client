<script lang="ts">
	import io from 'socket.io-client';
	import type { IDraw } from '../types/IDraw';
	import DrawCanvas from '../components/DrawCanvas.svelte';

	const socket = io('http://localhost:3333');

	let forceDraw: (data: IDraw) => void;

	/**
	 * onDrawCB is a function that is called from the child.
	 * It emits a 'drawing' event over the websocket indicating the current user
	 * is drawing to the server with IDraw data.
	 */
	function onDrawCB(data: IDraw) {
		socket.emit('drawing', {
			x: data.x,
			y: data.y,
			color: data.color
		});
	}

	/**
	 * When current user mouse is up, emit the finish-drawing
	 * event that indicate the current user is already finish drawing a line
	 * in the canvas and sent the message over the websocket connection.
	 **/
	function finishDraw() {
		socket.emit('finish-drawing');
	}

	/**
	 * Force draw the canvas based on the data that is received
	 * over the websocket connection.
	 **/
	socket.on('drawing', (data: IDraw) => {
		forceDraw(data);
	});
</script>

<h1 class="text-2xl">Welcome to Draw Together</h1>

<div class="flex mx-4 my-6" />

<div class="flex my-8 items-center justify-center bg-[#000]">
	<DrawCanvas {socket} {onDrawCB} onMouseUpCB={finishDraw} bind:forceDraw />
</div>
