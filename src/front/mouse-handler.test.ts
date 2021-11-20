import "jasmine";
import { MouseHandler } from './mouse-handler';
import { Engine } from './engine';
import { Config } from '../common/config';

describe('MouseHandler', () => {
	const makeTestHandler = (canvasWidth: number, canvasHeight: number) => {
		const canvas = <HTMLCanvasElement>jasmine.createSpyObj('canvas', [
			'addEventListener',
		]);
		const engine = <Engine>{};
		const config = <Config>{
			canvas: {
				width: canvasWidth,
				height: canvasHeight,
			},
		};

		return new MouseHandler(config, canvas, engine);
	};
	const makeTestEvent = (offsetX: number, offsetY: number) => {
		return <MouseEvent>{ offsetX, offsetY };
	};

	describe('mouseEventToPosition', () => {
		const handler = makeTestHandler(100, 100);
		it('top left', () => {
			expect(handler.mouseEventToPosition(
				makeTestEvent(20, 40),
			)).toEqual({ positionX: -30, positionY: 10 });
		});
		it('top right', () => {
			expect(handler.mouseEventToPosition(
				makeTestEvent(70, 10),
			)).toEqual({ positionX: 20, positionY: 40 });
		});
		it('bottom right', () => {
			expect(handler.mouseEventToPosition(
				makeTestEvent(85, 55),
			)).toEqual({ positionX: 35, positionY: -5 });
		});
		it('bottom left', () => {
			expect(handler.mouseEventToPosition(
				makeTestEvent(0, 100),
			)).toEqual({ positionX: -50, positionY: -50 });
		});
	});
});
