import { Particle } from './particle';

// Required to have the root context used by golang
import engine from './engine/main';

const go = new Go();
WebAssembly.instantiateStreaming(fetch("./dist/engine.wasm"), go.importObject).then((result) => {
	go.run(result.instance);

	// TODO share memory space instead of serializing it like this
	console.log((<any>engine).getParticles())
});

const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 400;
document.body.appendChild(canvas);

const context = canvas.getContext('2d')!;
if (!context) {
	throw new Error('Got a null context from the canvas.');
}

// TODO don't commit the watcher for go

// TODO partition the space to optimize performance
const particles = Array<Particle>(2000);
for (let i = 0; i < particles.length; i++) {
	particles[i] = new Particle(
		canvas.width * Math.random(),
		canvas.height * Math.random(),
	);
}

// TODO use a worker and not an interval
let lastTick = +new Date();
setInterval(() => {
	const thisTick = +new Date();
	const elapsedSeconds = (thisTick - lastTick) / 1000;
	for (let i = 0; i < particles.length; i++) {
		particles[i].tick(particles, elapsedSeconds);
	}
	lastTick = thisTick;
}, 1000 / 30);

function draw () {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < particles.length; i++) {
		context.fillStyle = particles[i].style;
		context.beginPath();
		context.arc(
			particles[i].x,
			particles[i].y,
			Particle.displayRadius,
			0,
			2 * Math.PI,
		);
		context.fill();
	}

	window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);
