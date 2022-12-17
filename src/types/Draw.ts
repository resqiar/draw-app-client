export type DrawStatus = 'draw' | 'erase';

export interface IDraw {
	x: number;
	y: number;
	color: string;
	status: DrawStatus;
}
