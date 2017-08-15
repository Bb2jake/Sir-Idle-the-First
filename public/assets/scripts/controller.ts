class Controller {
	private service = new Service(this);

	constructor() {
		this.start();
		this.listenForDevCode();
	}

	private start() {
		this.service.start();
		this.showEnemySprite();
		this.initHeroStatusBar();
		this.showEnemyStatusBar();
		this.showZone();
	}

	private showZone() {
		document.getElementById("background").style.backgroundImage = `url(${this.service.getZoneImg()})`;
	}

	private showEnemySprite() {
		let currentEnemy = this.service.getCurrentEnemy();
		document.getElementById("enemy1-img").setAttribute("src", currentEnemy.image);
	}

	private initHeroStatusBar() {
		let hero = this.service.getHero();
		let attacks = document.getElementById("attack-buttons").children;
		for (let i = 0; i < attacks.length; i++) {
			attacks[i].innerHTML = hero.attacks[i].name;
		}
		this.showHeroExp();
		this.showHeroStats();
		this.showPotionQuantities();
	}

	public showHeroStats() {
		this.showHeroHp();
		this.showHeroAtk();
		this.showHeroSpd();
	}

	private showPotionQuantities() {
		let hero = this.service.getHero();
		let i = 0;
		for (let potion in hero.potions) {
			let pot = hero.potions[potion];
			document.getElementById(`potion${i}-qty`).innerHTML = `${pot.quantity}x `;
			i++;
		}
	}

	public showHeroHp() {
		let hero = this.service.getHero();
		document.getElementById("hero-hp").innerHTML = `${hero.stats.currentHp}/${hero.stats.maxHp}`;
	}

	private showHeroExp() {
		let hero = this.service.getHero();
		document.getElementById("hero-lv").innerHTML = `Lv: ${hero.level} | Exp: ${hero.currentExp}/${hero.expToLevel}`;
	}

	private showHeroAtk() {
		document.getElementById("hero-atk").innerHTML = this.service.getHeroAtk().toString();
	}

	private showHeroSpd() {
		document.getElementById("hero-spd").innerHTML = (this.service.getHeroSpd() * 100).toFixed(0);
	}

	private showEnemyStatusBar() {
		let currentEnemy = this.service.getCurrentEnemy();

		document.getElementById("enemy-name").innerHTML = `Name: ${currentEnemy.name}`;
		document.getElementById("enemy-atk").innerHTML = `ATK: ${currentEnemy.stats.atk}`;
		document.getElementById("enemy-spd").innerHTML = `SPD: ${(currentEnemy.stats.spd * 100).toFixed(0)}`;
		this.showEnemyHp();
	}

	public hardReset() {
		// TODO: Change this to an in-game popup, rather than confirm
		if (confirm("Are you sure you want to start all over?")) {
			this.start();
			this.showPotionActiveTimes();
			this.showAttackCooldowns();
			this.toggleInputButtons(true);
		}
	}

	public selectHeroAttack(atkNum: number) {
		this.service.selectHeroAttack(atkNum);
	}

	private heroAttacks() {
		this.showEnemyHp();

		let currentEnemy = this.service.getCurrentEnemy();

		if (currentEnemy.stats.currentHp <= 0) {
			$("#enemy1-img").addClass("fadeOut").one("animationend", () => {
				this.showEnemyStatusBar();
				this.showEnemySprite();
				this.showHeroExp();
				this.showHeroHp();
				this.showZone();
				$("#enemy1-img").removeClass("fadeOut");
			})
		}
	}

	public showEnemy() {
		this.showEnemyStatusBar();
		this.showEnemySprite();
		this.showZone();
	}

	public fadeOutEnemy(callback: Function) {
		document.getElementById("enemy-defeated-overlay").style.display = "block";
		$("#enemy-defeated-overlay").addClass("fadeOut").one("animationend", () => {
			$("#enemy-defeated-overlay").removeClass("fadeOut");
		})

		$("#enemy1-img").addClass("fadeOut").one("animationend", () => {
			this.showHeroExp();
			$("#enemy1-img").removeClass("fadeOut");
			document.getElementById("enemy-defeated-overlay").style.display = "none";
			callback();
		})
	}

	public fadeInEnemy(callback: Function) {
		this.showEnemySprite();
		this.showEnemyStatusBar();
		this.showZone();

		$("#enemy1-img").addClass("fadeIn").one("animationend", function () {
			$("#enemy1-img").removeClass("fadeIn");
			callback();
		})
	}

	public showEnemyHp() {
		let currentEnemy = this.service.getCurrentEnemy();
		document.getElementById("enemy-hp").innerText = `HP: ${currentEnemy.stats.currentHp}/${currentEnemy.stats.maxHp}`;
	}

	public usePotion(potionNum: number) {
		if (this.service.tryUsePotion(potionNum)) {
			this.showPotionQuantities();
		}
	}

	public toggleInputButtons(toggleOn: boolean) {
		let atkBtns = document.getElementById("attack-buttons").children;
		let potBtns = document.getElementById("potion-buttons").children;

		for (let i = 0; i < atkBtns.length; i++) {
			let atk = atkBtns[i];
			let pot = potBtns[i];

			if (toggleOn) {
				atk.classList.remove("waiting");
				pot.classList.remove("waiting");
			} else {
				atk.classList.add("waiting");
				pot.classList.add("waiting");
			}

			this.showAttacksAndPotions();
		}

		if (toggleOn)
			document.getElementById("hero-attack-name").innerText = "Choose an attack or potion to use";
	}

	public showHeroAttackName(name: string) {
		document.getElementById("hero-attack-name").innerText = name;
	}

	public showHeroDefeatedOverlay(display: boolean) {
		document.getElementById("hero-defeated-overlay").style.display = display ? "block" : "none";
		document.getElementById("revive-hero-btn").style.display = display ? "block" : "none";
		document.getElementById("hero-attack-name").style.display = !display ? "block" : "none";
	}

	public reviveHero() {
		this.showHeroDefeatedOverlay(false);
		this.service.reviveHero();
		this.showHeroHp();
		this.showEnemyHp();
		this.toggleInputButtons(true);
	}

	public showEnemyAttackName(name: string) {
		document.getElementById("enemy-attack-name").innerText = name;
	}

	// TODO: Have this accept an attack num for efficiency
	public showAttackCooldowns() {
		let attacks = this.service.getHero().attacks
		for (let i = 0; i < attacks.length; i++) {
			let attack = attacks[i];
			let atkElem = document.getElementById(`hero-atk${i}`);
			if (attack.cooldownRemaining > 0) {
				atkElem.innerHTML = Math.ceil(attack.cooldownRemaining) + "s";
				atkElem.classList.add("on-cooldown");
			} else {
				atkElem.innerHTML = attack.name;
				atkElem.classList.remove("on-cooldown");
			}
		}
	}

	public showPotionActiveTimes() {
		let potions = this.service.getHero().potions;
		for (let i = 0; i < potions.length; i++) {
			let potion = potions[i];
			let potElem = document.getElementById(`potion${i}`);
			if (potion.boostTimeRemaining > 0) {
				potElem.children[0].innerHTML = Math.ceil(potion.boostTimeRemaining) + "s";
				// potElem.children[1].style.display = "none"
				potElem.classList.add("on-cooldown");
			} else {
				potElem.children[0].innerHTML = potion.quantity + "x ";
				// potElem.children[1].style.display = "initial";
				potElem.classList.remove("on-cooldown");
			}
		}
	}

	private showAttacksAndPotions() {
		let hero = this.service.getHero();
		let attacks = hero.attacks;
		let potions = hero.potions;

		for (var i = 0; i < attacks.length; i++) {
			let atkElem = document.getElementById(`hero-atk${i}`);

			let disabled = (atkElem.classList.contains("on-cooldown") || atkElem.classList.contains("waiting"));
			if (disabled)
				atkElem.setAttribute("disabled", "disabled");
			else
				atkElem.removeAttribute("disabled");
			atkElem.style.opacity = disabled ? '0.5' : '1';
		}

		for (var i = 0; i < potions.length; i++) {
			let potElem = document.getElementById(`potion${i}`);

			let disabled = (potElem.classList.contains("on-cooldown") || potElem.classList.contains("waiting") || potions[i].quantity == 0);
			if (disabled)
				potElem.setAttribute("disabled", "disabled");
			else
				potElem.removeAttribute("disabled");

			potElem.style.opacity = disabled ? '0.5' : '1';
		}
	}

	public scaleAttackGauges() {
		document.getElementById("hero-attack-gauge").style.width = this.service.getHeroAttackScale() + "%";
		document.getElementById("enemy-attack-gauge").style.width = this.service.getEnemyAttackScale() + "%";
	}

	private listenForDevCode() {
		let code = "sif";
		let seq = "";
		let firstKeyTime;

		$(document).keydown(e => {
			let milliseconds = new Date().getUTCMilliseconds();
			if (milliseconds - 1000 > firstKeyTime)
				seq = "";
			if (!seq)
				firstKeyTime = milliseconds;
			seq += (e.key);
			if (seq == code) {
				this.enableDevTools();
				$(document).unbind('keydown');
			}
		})
	}

	private enableDevTools() {
		$('#dev-tools').show();
	}

	public levelUpHero() {
		this.service.levelUpHero();
		this.showHeroStats();
	}

	public nextEnemy() {
		this.service.nextEnemy();
		this.showEnemy();
	}
}