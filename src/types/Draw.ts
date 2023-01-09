export type DrawStatus = 'draw' | 'erase';

export interface IDraw {
	x: number;
	y: number;
	color: string;
	size: number;
	status: DrawStatus;
}
