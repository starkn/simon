var game;

class Button {
	constructor(el) {
		this.el = el;
		this.paint("invert(0%)");
	}

	paint(level) {
		this.el.children[0].style.filter = level;
	}

	async press() {
		this.on();
		await delay(300);
		this.off();
	}

	async highlight() {
		this.on()
		await delay(500);
		this.off();
	}

	async on()  {
		this.paint("invert(100%)");
	}

	async off() {
		this.paint("invert(0%)");
	}
}

class Game {
	buttons;
	allowPlayer;
	sequence;
	playerPlaybackPos;
	mistakeSound;

	constructor() {
		this.buttons = new Map();
		this.allowPlayer = false;
		this.sequence = [];
		this.playerPlaybackPos = 0;

		document.querySelectorAll('.game-button').forEach((el, i) => {
			this.buttons.set(el.id, new Button(el));
		});

		const playerNameEl = document.querySelector('#player');
		playerNameEl.textContent = this.getPlayerName();
	}

	async pressButton(button) {
		if (this.allowPlayer) {
			this.allowPlayer = false;
			await this.buttons.get(button.id).press();

			if (this.sequence[this.playerPlaybackPos].el.id === button.id) {
				this.playerPlaybackPos++;
				if (this.playerPlaybackPos === this.sequence.length) {
					this.playerPlaybackPos = 0;
					this.addButton();
					this.updateScore(this.sequence.length - 1);
					await this.playSequence();
				}
				this.allowPlayer = true;
			} else {
				this.saveScore(this.sequence.length - 1);
				await delay(100);
				this.buttons.forEach((button) => {
					button.on()
				})
				await delay(500);
				this.buttons.forEach((button) => {
					button.off()
				})
				await delay(500);
				this.buttons.forEach((button) => {
					button.on()
				})
				await delay(500);
				this.buttons.forEach((button) => {
					button.off()
				})
				await delay(500);
				await this.buttonDance(1);
			}
		}
	}

	async reset() {
		this.allowPlayer = false;
		this.playerPlaybackPos = 0;
		this.sequence = [];
		this.updateScore('--');
		await this.buttonDance(1);
		this.addButton();
		await this.playSequence();
		this.allowPlayer = true;
	}

	getPlayerName() {
		return localStorage.getItem('userName') ?? 'Mystery player';
	}

	async playSequence() {
		await delay(500);
		for (const btn of this.sequence) {
			await btn.highlight();
			await delay(100);
		}
	}

	addButton() {
		const btn = this.getRandomButton();
		this.sequence.push(btn);
	}

	updateScore(score) {
		const scoreEl = document.querySelector('#score');
		scoreEl.textContent = score;
	}

	async buttonDance(laps = 1) {
		for (let step = 0; step < laps; step++) {
			for (const btn of this.buttons.values()) {
				await btn.highlight();
			}
		}
	}

	getRandomButton() {
		let buttons = Array.from(this.buttons.values());
		return buttons[Math.floor(Math.random() * this.buttons.size)];
	}

	saveScore(score) {
		const userName = this.getPlayerName();
		let scores = [];
		const scoresText = localStorage.getItem('scores');
		if (scoresText) {
			scores = JSON.parse(scoresText);
		}
		scores = this.updateScores(userName, score, scores);

		localStorage.setItem('scores', JSON.stringify(scores));
	}

	updateScores(userName, score, scores) {
		const date = new Date().toLocaleDateString();
		const newScore = { name: userName, score: score, date: date };

		let found = false;
		for (const [i, prevScore] of scores.entries()) {
			if (score > prevScore.score) {
				scores.splice(i, 0, newScore);
				found = true;
				break;
			}
		}

		if (!found) {
			scores.push(newScore);
		}

		if (scores.length > 10) {
			scores.length = 10;
		}

		return scores;
	}
}

window.onload = (event) => {
	game = new Game();
};

function delay(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, milliseconds);
	});
}