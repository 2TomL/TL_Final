// Plaats hier ALLEEN de game-logica uit app.js (canvas/game code, snake, controls, enz.)
console.log('[snake-game] game.js loaded');
// NIET de loader, background, of algemene site code!

// Optimalisatie: game mag maar één keer per sessie initialiseren
if (!window.__snakeGameLoaded) {
	window.__snakeGameLoaded = true;
	(function() {
		const canvasContainer = document.getElementById('canvas');
		if (!canvasContainer) return;
		// Verwijder ALLE oude canvassen (ook als er meerdere zijn)
		canvasContainer.querySelectorAll('canvas').forEach(c => c.remove());

		// --- Snake Game functionaliteit ---
		function setupSnakeGame() {
	// Swipe controls voor mobiel
	let touchStartX = null;
	let touchStartY = null;
	let touchEndX = null;
	let touchEndY = null;
	const minSwipeDist = 30;
	function handleTouchStart(e) {
		if (!e.touches || e.touches.length !== 1) return;
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}
	function handleTouchMove(e) {
		if (!e.touches || e.touches.length !== 1) return;
		touchEndX = e.touches[0].clientX;
		touchEndY = e.touches[0].clientY;
	}
	function handleTouchEnd() {
		if (touchStartX === null || touchStartY === null || touchEndX === null || touchEndY === null) return;
		const dx = touchEndX - touchStartX;
		const dy = touchEndY - touchStartY;
		if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDist) {
			// horizontale swipe
			if (dx > 0) {
				// swipe right
				KEY.ArrowRight = true; KEY.ArrowLeft = KEY.ArrowUp = KEY.ArrowDown = false;
			} else {
				// swipe left
				KEY.ArrowLeft = true; KEY.ArrowRight = KEY.ArrowUp = KEY.ArrowDown = false;
			}
		} else if (Math.abs(dy) > minSwipeDist) {
			// verticale swipe
			if (dy > 0) {
				// swipe down
				KEY.ArrowDown = true; KEY.ArrowUp = KEY.ArrowLeft = KEY.ArrowRight = false;
			} else {
				// swipe up
				KEY.ArrowUp = true; KEY.ArrowDown = KEY.ArrowLeft = KEY.ArrowRight = false;
			}
		}
		touchStartX = touchStartY = touchEndX = touchEndY = null;
	}
		// Voeg listeners toe aan het canvas na creatie
			setTimeout(() => {
				const gameCanvas = document.querySelector('#canvas canvas');
				if (gameCanvas && !gameCanvas.__listenersAdded) {
					gameCanvas.addEventListener('touchstart', function(e) { handleTouchStart(e); e.preventDefault(); }, {passive: false});
					gameCanvas.addEventListener('touchmove', function(e) { handleTouchMove(e); e.preventDefault(); }, {passive: false});
					gameCanvas.addEventListener('touchend', function(e) { handleTouchEnd(e); e.preventDefault(); }, {passive: false});
					gameCanvas.__listenersAdded = true;
				}
			}, 200);
		const gameContainer = document.getElementById('canvas');
		const scoreElem = document.getElementById('score');
		const replayBtn = document.getElementById('replay');
		if (!gameContainer || !scoreElem || !replayBtn) return;

		let dom_replay = replayBtn;
		let dom_score = scoreElem;
		let dom_canvas = document.createElement('canvas');
		gameContainer.appendChild(dom_canvas);
		let CTX = dom_canvas.getContext('2d');

		const W = (dom_canvas.width = 400);
		const H = (dom_canvas.height = 400);

		let snake,
			food,
			currentHue,
			cells = 20,
			cellSize,
			isGameOver = false,
			tails = [],
			score = 0,
			maxScore = window.localStorage.getItem('maxScore') || undefined,
			particles = [],
			splashingParticleCount = 20,
			cellsCount,
			requestID;

		let helpers = {
			Vec: class {
				constructor(x, y) {
					this.x = x;
					this.y = y;
				}
				add(v) {
					this.x += v.x;
					this.y += v.y;
					return this;
				}
				mult(v) {
					if (v instanceof helpers.Vec) {
						this.x *= v.x;
						this.y *= v.y;
						return this;
					} else {
						this.x *= v;
						this.y *= v;
						return this;
					}
				}
			},
			isCollision(v1, v2) {
				return v1.x == v2.x && v1.y == v2.y;
			},
			garbageCollector() {
				for (let i = 0; i < particles.length; i++) {
					if (particles[i].size <= 0) {
						particles.splice(i, 1);
					}
				}
			},
			drawGrid() {
				CTX.lineWidth = 1.1;
				CTX.strokeStyle = '#232332';
				CTX.shadowBlur = 0;
				for (let i = 1; i < cells; i++) {
					let f = (W / cells) * i;
					CTX.beginPath();
					CTX.moveTo(f, 0);
					CTX.lineTo(f, H);
					CTX.stroke();
					CTX.beginPath();
					CTX.moveTo(0, f);
					CTX.lineTo(W, f);
					CTX.stroke();
					CTX.closePath();
				}
			},
			randHue() {
				return ~~(Math.random() * 360);
			},
			hsl2rgb(hue, saturation, lightness) {
				if (hue == undefined) {
					return [0, 0, 0];
				}
				var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
				var huePrime = hue / 60;
				var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
				huePrime = ~~huePrime;
				var red, green, blue;
				if (huePrime === 0) {
					red = chroma;
					green = secondComponent;
					blue = 0;
				} else if (huePrime === 1) {
					red = secondComponent;
					green = chroma;
					blue = 0;
				} else if (huePrime === 2) {
					red = 0;
					green = chroma;
					blue = secondComponent;
				} else if (huePrime === 3) {
					red = 0;
					green = secondComponent;
					blue = chroma;
				} else if (huePrime === 4) {
					red = secondComponent;
					green = 0;
					blue = chroma;
				} else if (huePrime === 5) {
					red = chroma;
					green = 0;
					blue = secondComponent;
				}
				var lightnessAdjustment = lightness - chroma / 2;
				red += lightnessAdjustment;
				green += lightnessAdjustment;
				blue += lightnessAdjustment;
				return [
					Math.round(red * 255),
					Math.round(green * 255),
					Math.round(blue * 255)
				];
			},
			lerp(start, end, t) {
				return start * (1 - t) + end * t;
			}
		};

		let KEY = {
			ArrowUp: false,
			ArrowRight: false,
			ArrowDown: false,
			ArrowLeft: false,
			resetState() {
				this.ArrowUp = false;
				this.ArrowRight = false;
				this.ArrowDown = false;
				this.ArrowLeft = false;
			},
			listen() {
				addEventListener(
					'keydown',
					(e) => {
						if (e.key === 'ArrowUp' && this.ArrowDown) return;
						if (e.key === 'ArrowDown' && this.ArrowUp) return;
						if (e.key === 'ArrowLeft' && this.ArrowRight) return;
						if (e.key === 'ArrowRight' && this.ArrowLeft) return;
						if (e.key.startsWith('Arrow')) {
							e.preventDefault();
						}
						this[e.key] = true;
						Object.keys(this)
							.filter((f) => f !== e.key && f !== 'listen' && f !== 'resetState')
							.forEach((k) => {
								this[k] = false;
							});
					},
					false
				);
			}
		};

		class Snake {
			constructor(i, type) {
				this.pos = new helpers.Vec(W / 2, H / 2);
				this.dir = new helpers.Vec(0, 0);
				this.type = type;
				this.index = i;
	// SNAKE SPEED: hoe hoger, hoe trager. Standaard was 5, nu iets langzamer voor betere controle.
	this.delay = 20;
				this.size = W / cells;
				this.color = 'white';
				this.history = [];
				this.total = 1;
			}
			draw() {
				let { x, y } = this.pos;
				CTX.fillStyle = this.color;
				CTX.shadowBlur = 20;
				CTX.shadowColor = 'rgba(255,255,255,.3 )';
				CTX.fillRect(x, y, this.size, this.size);
				CTX.shadowBlur = 0;
				if (this.total >= 2) {
					for (let i = 0; i < this.history.length - 1; i++) {
						let { x, y } = this.history[i];
						CTX.lineWidth = 1;
						CTX.fillStyle = 'rgba(225,225,225,1)';
						CTX.fillRect(x, y, this.size, this.size);
					}
				}
			}
			walls() {
				let { x, y } = this.pos;
				if (x + cellSize > W) {
					this.pos.x = 0;
				}
				if (y + cellSize > W) {
					this.pos.y = 0;
				}
				if (y < 0) {
					this.pos.y = H - cellSize;
				}
				if (x < 0) {
					this.pos.x = W - cellSize;
				}
			}
			controlls() {
				let dir = this.size;
				if (KEY.ArrowUp) {
					this.dir = new helpers.Vec(0, -dir);
				}
				if (KEY.ArrowDown) {
					this.dir = new helpers.Vec(0, dir);
				}
				if (KEY.ArrowLeft) {
					this.dir = new helpers.Vec(-dir, 0);
				}
				if (KEY.ArrowRight) {
					this.dir = new helpers.Vec(dir, 0);
				}
			}
			selfCollision() {
				for (let i = 0; i < this.history.length; i++) {
					let p = this.history[i];
					if (helpers.isCollision(this.pos, p)) {
						isGameOver = true;
					}
				}
			}
			update() {
				this.walls();
				this.draw();
				this.controlls();
				if (!this.delay--) {
					if (helpers.isCollision(this.pos, food.pos)) {
						incrementScore();
						particleSplash();
						food.spawn();
						this.total++;
					}
					this.history[this.total - 1] = new helpers.Vec(this.pos.x, this.pos.y);
					for (let i = 0; i < this.total - 1; i++) {
						this.history[i] = this.history[i + 1];
					}
					this.pos.add(this.dir);
					this.delay = 20;
					this.total > 3 ? this.selfCollision() : null;
				}
			}
		}

		class Food {
			constructor() {
				this.pos = new helpers.Vec(
					~~(Math.random() * cells) * cellSize,
					~~(Math.random() * cells) * cellSize
				);
				this.color = currentHue = `hsl(${~~(Math.random() * 360)},100%,50%)`;
				this.size = cellSize;
			}
			draw() {
				let { x, y } = this.pos;
				CTX.globalCompositeOperation = 'lighter';
				CTX.shadowBlur = 20;
				CTX.shadowColor = this.color;
				CTX.fillStyle = this.color;
				CTX.fillRect(x, y, this.size, this.size);
				CTX.globalCompositeOperation = 'source-over';
				CTX.shadowBlur = 0;
			}
			spawn() {
				let randX = ~~(Math.random() * cells) * this.size;
				let randY = ~~(Math.random() * cells) * this.size;
				for (let path of snake.history) {
					if (helpers.isCollision(new helpers.Vec(randX, randY), path)) {
						return this.spawn();
					}
				}
				this.color = currentHue = `hsl(${helpers.randHue()}, 100%, 50%)`;
				this.pos = new helpers.Vec(randX, randY);
			}
		}

		class Particle {
			constructor(pos, color, size, vel) {
				this.pos = pos;
				this.color = color;
				this.size = Math.abs(size / 2);
				this.ttl = 0;
				this.gravity = -0.2;
				this.vel = vel;
			}
			draw() {
				let { x, y } = this.pos;
				let hsl = this.color
					.split('')
					.filter((l) => l.match(/[^hsl()$% ]/g))
					.join('')
					.split(',')
					.map((n) => +n);
				let [r, g, b] = helpers.hsl2rgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
				CTX.shadowColor = `rgb(${r},${g},${b},${1})`;
				CTX.shadowBlur = 0;
				CTX.globalCompositeOperation = 'lighter';
				CTX.fillStyle = `rgb(${r},${g},${b},${1})`;
				CTX.fillRect(x, y, this.size, this.size);
				CTX.globalCompositeOperation = 'source-over';
			}
			update() {
				this.draw();
				this.size -= 0.3;
				this.ttl += 1;
				this.pos.add(this.vel);
				this.vel.y -= this.gravity;
			}
		}

		function incrementScore() {
			score++;
			dom_score.innerText = score.toString().padStart(2, '0');
		}

		function particleSplash() {
			for (let i = 0; i < splashingParticleCount; i++) {
				let vel = new helpers.Vec(Math.random() * 6 - 3, Math.random() * 6 - 3);
				let position = new helpers.Vec(food.pos.x, food.pos.y);
				particles.push(new Particle(position, currentHue, food.size, vel));
			}
		}

		function clear() {
			CTX.clearRect(0, 0, W, H);
		}

		function initialize() {
			CTX.imageSmoothingEnabled = false;
			KEY.listen();
			cellsCount = cells * cells;
			cellSize = W / cells;
			snake = new Snake();
			food = new Food();
			dom_replay.addEventListener('click', reset, false);
			loop();
		}

		function loop() {
			clear();
			if (!isGameOver) {
				requestID = window.requestAnimationFrame(loop);
				helpers.drawGrid();
				snake.update();
				food.draw();
				for (let p of particles) {
					p.update();
				}
				helpers.garbageCollector();
			} else {
				clear();
				gameOver();
			}
		}

		function gameOver() {
			maxScore ? null : (maxScore = score);
			score > maxScore ? (maxScore = score) : null;
			window.localStorage.setItem('maxScore', maxScore);
			CTX.fillStyle = '#4cffd7';
			CTX.textAlign = 'center';
			CTX.font = 'bold 30px Poppins, sans-serif';
			CTX.fillText('GAME OVER', W / 2, H / 2);
			CTX.font = '15px Poppins, sans-serif';
			CTX.fillText(`SCORE   ${score}`, W / 2, H / 2 + 60);
			CTX.fillText(`MAXSCORE   ${maxScore}`, W / 2, H / 2 + 80);
		}

		function reset() {
			dom_score.innerText = '00';
			score = '00';
			snake = new Snake();
			food.spawn();
			KEY.resetState();
			isGameOver = false;
			if (requestID) {
				window.cancelAnimationFrame(requestID);
			}
			loop();
		}

		initialize();
	}

		// Start Snake game na DOM load
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', setupSnakeGame);
		} else {
			setupSnakeGame();
		}
	})();
}
// --- einde Snake Game functionaliteit ---

// ...einde game.js...
