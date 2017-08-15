class Controller {
	private service = new Service(this);

	constructor() {
		this.start();
	}

	private start() {
		this.service.start();
		this.showEnemySprite();
		this.initHeroStatusBar();
		this.showEnemyStatusBar();
		this.showZone();
		this.listenForDevCode();
	}

	private showZone() {
		document.getElementById("background").style.backgroundImage = `url(${this.service.getZoneImg()})`;
	}

	private showEnemySprite() {
		let currentEnemy = this.service.getCurrentEnemy();
		document.getElementById("enemy1Img").setAttribute("src", currentEnemy.image);
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
			document.getElementById(`potion${i}Qty`).innerHTML = `${pot.quantity}x `;
			i++;
		}
	}

	public showHeroHp() {
		let hero = this.service.getHero();
		document.getElementById("heroHp").innerHTML = `${hero.stats.currentHp}/${hero.stats.maxHp}`;
	}

	private showHeroExp() {
		let hero = this.service.getHero();
		document.getElementById("heroLv").innerHTML = `Lv: ${hero.level} | Exp: ${hero.currentExp}/${hero.expToLevel}`;
	}

	private showHeroAtk() {
		document.getElementById("heroAtk").innerHTML = this.service.getHeroAtk().toString();
	}

	private showHeroSpd() {
		document.getElementById("heroSpd").innerHTML = (this.service.getHeroSpd() * 100).toFixed(0);
	}

	private showEnemyStatusBar() {
		let currentEnemy = this.service.getCurrentEnemy();

		document.getElementById("enemy-name").innerHTML = `Name: ${currentEnemy.name}`;
		document.getElementById("enemy-atk").innerHTML = `ATK: ${currentEnemy.stats.atk}`;
		document.getElementById("enemy-spd").innerHTML = `SPD: ${currentEnemy.stats.spd}`;
		this.showEnemyHp();
	}

	public hardReset() {
		// TODO: Change this to an in-game popup, rather than confirm
		if (confirm("Are you sure you want to start all over?"))
			this.start();
	}

	public selectHeroAttack(atkNum: number) {
		this.service.selectHeroAttack(atkNum);
	}

	private heroAttacks() {
		this.showEnemyHp();

		let currentEnemy = this.service.getCurrentEnemy();

		if (currentEnemy.stats.currentHp <= 0) {
			$("#enemy1Img").addClass("fadeOut").one("animationend", () => {
				this.showEnemyStatusBar();
				this.showEnemySprite();
				this.showHeroExp();
				this.showHeroHp();
				this.showZone();
				$("#enemy1Img").removeClass("fadeOut");
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

		$("#enemy1Img").addClass("fadeOut").one("animationend", () => {
			this.showHeroExp();
			$("#enemy1Img").removeClass("fadeOut");
			document.getElementById("enemy-defeated-overlay").style.display = "none";
			callback();
		})
	}

	public fadeInEnemy(callback: Function) {
		this.showEnemySprite();
		this.showEnemyStatusBar();
		this.showZone();

		$("#enemy1Img").addClass("fadeIn").one("animationend", function () {
			$("#enemy1Img").removeClass("fadeIn");
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
			document.getElementById("heroAttackName").innerText = "Choose an attack or potion to use";
	}

	public showHeroAttackName(name: string) {
		document.getElementById("heroAttackName").innerText = name;
	}

	public showHeroDefeatedOverlay(display: boolean) {
		document.getElementById("hero-defeated-overlay").style.display = display ? "block" : "none";
		document.getElementById("revive-hero-btn").style.display = display ? "block" : "none";
		document.getElementById("heroAttackName").style.display = !display ? "block" : "none";
	}

	public reviveHero() {
		this.showHeroDefeatedOverlay(false);
		this.service.reviveHero();
		this.showHeroHp();
		this.showEnemyHp();
		this.toggleInputButtons(true);
	}

	public showEnemyAttackName(name: string) {
		document.getElementById("enemyAttackName").innerText = name;
	}

	// TODO: Have this accept an attack num for efficiency
	public showAttackCooldowns() {
		let attacks = this.service.getHero().attacks
		for (let i = 0; i < attacks.length; i++) {
			let attack = attacks[i];
			let atkElem = document.getElementById(`heroAtk${i}`);
			if (attack.cooldownRemaining > 0) {
				atkElem.innerHTML = Math.ceil(attack.cooldownRemaining) + "s";
				atkElem.classList.add("onCooldown");
			} else {
				atkElem.innerHTML = attack.name;
				atkElem.classList.remove("onCooldown");
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
				potElem.classList.add("onCooldown");
			} else {
				potElem.children[0].innerHTML = potion.quantity + "x ";
				// potElem.children[1].style.display = "initial";
				potElem.classList.remove("onCooldown");
			}
		}
	}

	private showAttacksAndPotions() {
		let hero = this.service.getHero();
		let attacks = hero.attacks;
		let potions = hero.potions;

		for (var i = 0; i < attacks.length; i++) {
			let atkElem = document.getElementById(`heroAtk${i}`);

			let disabled = (atkElem.classList.contains("onCooldown") || atkElem.classList.contains("waiting"));
			if (disabled)
				atkElem.setAttribute("disabled", "disabled");
			else
				atkElem.removeAttribute("disabled");
			atkElem.style.opacity = disabled ? '0.5' : '1';
		}

		for (var i = 0; i < potions.length; i++) {
			let potElem = document.getElementById(`potion${i}`);

			let disabled = (potElem.classList.contains("onCooldown") || potElem.classList.contains("waiting") || potions[i].quantity == 0);
			if (disabled)
				potElem.setAttribute("disabled", "disabled");
			else
				potElem.removeAttribute("disabled");

			potElem.style.opacity = disabled ? '0.5' : '1';
		}
	}

	public scaleAttackGauges() {
		document.getElementById("heroAttackGauge").style.width = this.service.getHeroAttackScale() + "%";
		document.getElementById("enemyAttackGauge").style.width = this.service.getEnemyAttackScale() + "%";
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