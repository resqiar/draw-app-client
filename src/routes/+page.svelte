<script lang="ts">
	import io from 'socket.io-client';
	import type { DrawStatus, IDraw } from '../types/Draw';
	import DrawCanvas from '../components/DrawCanvas.svelte';
	import ColorPicker from '../components/ColorPicker.svelte';
	import Drawbutton from '../components/buttons/Drawbutton.svelte';
	import EraseButton from '../components/buttons/EraseButton.svelte';
	import { checkSize } from '../lib/checkSize';

	const socket = io('http://localhost:3333');

	let forceDraw: (data: IDraw) => void;

	/**
	 * the 'color' exported variable stores the
	 * user defined hexadecimal value of the drawing color.
	 * The color is picked by the user via ColorPicker component.
	 */
	let drawColor: string = '#fff';
	/**
	 * The drawing status whether user want to Draw or Erase
	 * The behavior of the code and canvas differ based on the draw status.
	 * All possible status defined in DrawStatus
	 */
	let drawStatus: DrawStatus = 'draw';
	/**
	 * the 'size' exported variable stores the
	 * user defined value of the size of the drawing.
	 * The number is then used by canvas to determine the shape.
	 */
	let drawSize: number | string = 10;

	$: if (checkSize(drawSize as string) !== true) {
		drawSize = checkSize(drawSize as string) as number;
	}

	/**
	 * onDrawCB is a function that is called from the child.
	 * It emits a 'drawing' event over the websocket indicating the current user
	 * is drawing to the server with IDraw data.
	 */
	function onDrawCB(data: IDraw) {
		socket.emit('drawing', {
			x: data.x,
			y: data.y,
			color: data.color,
			size: data.size,
			status: data.status
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

<main>
	<div class="flex">
		<div class="max-w-[70%]">
			<div class="flex px-4 py-6 items-center shadow-xl">
				<ColorPicker bind:hex={drawColor} />

				<div class="flex items-center gap-4 mx-8">
					<!-- DRAW BUTTON -->
					<Drawbutton {drawStatus} on:click={() => (drawStatus = 'draw')} />

					<!-- ERASE BUTTON -->
					<EraseButton {drawStatus} on:click={() => (drawStatus = 'erase')} />

					<!-- SIZE RANGE  -->
					<div class="px-2 flex items-center gap-4">
						<input type="range" bind:value={drawSize} min="0" max="100" class="range w-[300px]" />

						<div class="form-control w-[70px]">
							<input type="text" min="0" bind:value={drawSize} class="input input-bordered" />
						</div>
					</div>
				</div>
			</div>

			<div class="flex my-8 items-center justify-center">
				<DrawCanvas
					{socket}
					{onDrawCB}
					size={Number(drawSize)}
					color={drawColor}
					onMouseUpCB={finishDraw}
					status={drawStatus}
					bind:forceDraw
				/>
			</div>
		</div>

		<div class="shadow-[0px_-5px_10px_2px_rgba(0,0,0,0.2)] h-[100px] w-[30%]">Hello</div>
	</div>
</main>
