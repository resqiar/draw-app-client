<script lang="ts">
	import type { Socket } from 'socket.io-client';
	import type { DrawStatus, IDraw } from '../types/Draw';

	import { onMount } from 'svelte';

	/**
	 * Socket instance coming from the parent page,
	 * this instance is used to make a realtime request
	 * and send the coordinate data to the server.
	 */
	export let socket: Socket;

	/**
	 * These exported functions provide callbacks for handling drawing and mouse events.
	 * onDrawCB is called when a draw event occurs.
	 * onMouseUp is called when the mouse is released.
	 */
	export let onDrawCB: (data: IDraw) => void;
	export let onMouseUpCB: (e: MouseEvent) => void;

	export let status: DrawStatus;

	let canvasRef: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let canvasWidth: number | null;

	onMount(() => {
		/**
		 * Bind the context when while the component onMount, this will exclude the canvas in SSR
		 * process since the canvas context can only be found
		 * inside the browser.
		 **/
		ctx = canvasRef.getContext('2d');
		canvasWidth = window.innerWidth;
	});

	/**
	 * This is the position of X and Y axis of the current user drawing event.
	 * The position of the element on the x-axis is stored in the 'x' variable
	 * The position of the element on the y-axis is stored in the 'y' variable
	 */
	let pos = { x: 0, y: 0 };

	/**
	 * the 'color' exported variable stores the
	 * user defined hexadecimal value of the drawing color.
	 * the value came from the parent and have a default value of #fff (white)
	 */
	export let color = '#FFF';

	/**
	 * This function sets the defined position based on Mouse position.
	 * The 'offsetLeft' and 'offsetTop' properties of the 'canvasRef' -
	 * are used to offset the mouse position so that -
	 * it is correctly aligned with the canvas.
	 */
	function setPosition(e: MouseEvent): void {
		pos.x = e.clientX - canvasRef.offsetLeft;
		pos.y = e.clientY - canvasRef.offsetTop;
	}

	/**
	 * This is a function that handles drawing on a canvas element.
	 * It takes in a MouseEvent object and a callback function as arguments.
	 *
	 * The function then moves the current position to the x and y position of the mouse,
	 * updates the position based on the MouseEvent, and draws a line to the new position.
	 * Finally, it strokes the path on the canvas.
	 */
	function drawCanvas(e: MouseEvent, cb: (data: IDraw) => void) {
		if (!ctx) return;

		// If the user is not holding left mouse then stop
		if (e.buttons !== 1) return;

		// Set Eraser to ON
		if (status === 'erase') ctx.globalCompositeOperation = 'destination-out';

		// Begin a new path on the canvas context.
		ctx.beginPath();

		/**
		 * Set the line width, line cap, and stroke style for the canvas context.
		 * All of these value below are user defined and coming from parent input.
		 **/
		ctx.lineWidth = 20;
		ctx.lineCap = 'round';
		ctx.strokeStyle = color;

		// Calling callback event to the parent indicating that
		// someone is drawing the canvas.
		cb({
			x: pos.x,
			y: pos.y,
			color: color,
			status: status
		});

		// Start the line
		ctx.moveTo(pos.x, pos.y);

		// Update the line
		setPosition(e);

		// End the line
		ctx.lineTo(pos.x, pos.y);

		// Draw
		ctx.stroke();

		// Set Eraser to OFF if enabled
		if (status === 'erase') ctx.globalCompositeOperation = 'source-over';
	}

	/**
	 * Forced Coordinate contains an object with x and y properties.
	 * These values indicate another person is drawing via websocket connection which -
	 * handled by the parent. This obj responsibility is to keep track of those values
	 * and draw the canvas based on this coords.
	 **/
	let forcedCoord: { x: number | null; y: number | null } = { x: null, y: null };

	export const forceDraw = function (data: IDraw) {
		if (!ctx) return;
		if (!forcedCoord.x || !forcedCoord.y) {
			forcedCoord.x = data.x;
			forcedCoord.y = data.y;
			return;
		}

		// set eraser if enabled
		if (data.status === 'erase') ctx.globalCompositeOperation = 'destination-out';

		ctx.beginPath();

		ctx.lineWidth = 20;
		ctx.lineCap = 'round';
		ctx.strokeStyle = data.color;

		ctx.moveTo(forcedCoord.x, forcedCoord.y);

		forcedCoord.x = data.x;
		forcedCoord.y = data.y;

		ctx.lineTo(forcedCoord.x, forcedCoord.y);

		ctx.stroke();

		// reset eraser if enabled
		if (data.status === 'erase') ctx.globalCompositeOperation = 'source-over';
	};

	/**
	 * Set the x and y properties of the forcedCoord object to null
	 * when the finish-drawing event is received over the websocket.
	 **/
	socket.on('finish-drawing', () => {
		forcedCoord.x = null;
		forcedCoord.y = null;
	});
</script>

<canvas
	class="bg-[#fff]"
	width={canvasWidth}
	height="500"
	bind:this={canvasRef}
	on:mousedown={setPosition}
	on:mousemove={(e) => drawCanvas(e, onDrawCB)}
	on:mouseup={onMouseUpCB}
/>
