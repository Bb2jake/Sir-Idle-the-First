function Controller() {
    var service = new Service(this);
    var self = this;

    function start() {
        service.start();
        showEnemySprite();
        initHeroStatusBar();
        showEnemyStatusBar();
        showZone();
    }

    function showZone() {
        document.getElementById("background").style.backgroundImage = `url(${service.getZoneImg()})`;
    }

    function showEnemySprite() {
        let currentEnemy = service.getCurrentEnemy();
        document.getElementById("enemy1Img").setAttribute("src", currentEnemy.image);
    }

    function initHeroStatusBar() {
        let hero = service.getHero();
        let attacks = document.getElementById("attack-buttons").children;
        for (let i = 0; i < attacks.length; i++) {
            attacks[i].innerText = hero.attacks[i].name;
        }
        showHeroExp();
        self.showHeroStats();
        showPotionQuantities();
    }

    this.showHeroStats = function () {
        self.showHeroHp();
        showHeroAtk();
        showHeroSpd();
    }

    function showPotionQuantities() {
        let hero = service.getHero();
        let i = 0;
        for (let potion in hero.potions) {
            let pot = hero.potions[potion];
            document.getElementById(`potion${i}Qty`).innerHTML = `${pot.quantity}x `;
            i++;
        }
    }

    this.showHeroHp = function () {
        let hero = service.getHero();
        document.getElementById("heroHp").innerHTML = `${hero.stats.currentHp}/${hero.stats.maxHp}`;
    }

    function showHeroExp() {
        let hero = service.getHero();
        document.getElementById("heroLv").innerHTML = `Lv: ${hero.level} | Exp: ${hero.currentExp}/${hero.expToLevel}`;
    }

    function showHeroAtk() {
        document.getElementById("heroAtk").innerHTML = service.getHeroAtk();
    }

    function showHeroSpd() {
        document.getElementById("heroSpd").innerHTML = (service.getHeroSpd() * 100).toFixed(0);
    }

    function showEnemyStatusBar() {
        let currentEnemy = service.getCurrentEnemy();

        document.getElementById("enemy-name").innerHTML = `Name: ${currentEnemy.name}`;
        document.getElementById("enemy-atk").innerHTML = `ATK: ${currentEnemy.stats.atk}`;
        document.getElementById("enemy-spd").innerHTML = `SPD: ${currentEnemy.stats.spd}`;
        showEnemyHp();
    }

    this.hardReset = function () {
        if (confirm("Are you sure you want to start all over?"))
            start();
    }

    this.selectHeroAttack = function (atkNum) {
        service.selectHeroAttack(atkNum, heroAttacks);
    }

    function heroAttacks() {
        showEnemyHp();

        let currentEnemy = service.getCurrentEnemy();

        if (currentEnemy.stats.currentHp <= 0) {
            $("#enemy1Img").addClass("fadeOut").one("animationend", function () {
                showEnemyStatusBar();
                showEnemySprite();
                showHeroExp();
                self.showHeroHp();
                showZone();
                $("#enemy1Img").removeClass("fadeOut");
            })
        } else {
            enemyAttack();
        }
    }

    this.showEnemy = function () {
        showEnemyStatusBar();
        showEnemySprite();
        showZone();
    }

    this.fadeOutEnemy = function (callback) {
        document.getElementById("enemy-defeated-overlay").style.display = "block";
        $("#enemy-defeated-overlay").addClass("fadeOut").one("animationend", () => {
            $("#enemy-defeated-overlay").removeClass("fadeOut");
        })

        $("#enemy1Img").addClass("fadeOut").one("animationend", () => {
            showHeroExp();
            $("#enemy1Img").removeClass("fadeOut");
            document.getElementById("enemy-defeated-overlay").style.display = "none";
            callback();
        })
    }

    this.fadeInEnemy = function (callback) {
        showEnemySprite();
        showEnemyStatusBar();
        showZone();

        $("#enemy1Img").addClass("fadeIn").one("animationend", function () {
            $("#enemy1Img").removeClass("fadeIn");
            callback();
        })
    }

    this.showEnemyHp = function () {
        showEnemyHp();
    }

    function showEnemyHp() {
        let currentEnemy = service.getCurrentEnemy();
        document.getElementById("enemy-hp").innerText = `HP: ${currentEnemy.stats.currentHp}/${currentEnemy.stats.maxHp}`;
    }

    this.usePotion = function (potionNum) {
        if (service.tryUsePotion(potionNum)) {
            showPotionQuantities();
        }
    }

    this.toggleInputButtons = function (toggleOn) {
        toggleInputButtons(toggleOn);
    }

    function toggleInputButtons(toggleOn) {
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

            showAttacksAndPotions();
        }

        if (toggleOn)
            document.getElementById("heroAttackName").innerText = "Choose an attack or potion to use";
    }

    this.showHeroAttackName = function (name) {
        document.getElementById("heroAttackName").innerText = name;
    }

    function showHeroDefeatedOverlay(display) {
        document.getElementById("hero-defeated-overlay").style.display = display ? "block" : "none";
        document.getElementById("revive-hero-btn").style.display = display ? "block" : "none";
        document.getElementById("heroAttackName").style.display = !display ? "block" : "none";
    }

    this.showHeroDefeatedOverlay = function (display) {
        showHeroDefeatedOverlay(display);
    }

    this.reviveHero = function () {
        showHeroDefeatedOverlay(false);
        service.reviveHero();
        self.showHeroHp();
        showEnemyHp();
        toggleInputButtons(true);
    }

    this.showEnemyAttackName = function (name) {
        document.getElementById("enemyAttackName").innerText = name;
    }

    // TODO: Have this accept an attack num for efficiency
    this.showAttackCooldowns = function () {
        let attacks = service.getHero().attacks
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

    this.showPotionActiveTimes = function() {
        let potions = service.getHero().potions;
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

    function showAttacksAndPotions() {
        let hero = service.getHero();
        let attacks = hero.attacks;
        let potions = hero.potions;

        for (var i = 0; i < attacks.length; i++) {
            let atkElem = document.getElementById(`heroAtk${i}`);

            let disabled = (atkElem.classList.contains("onCooldown") || atkElem.classList.contains("waiting"));
            if (disabled)
                atkElem.setAttribute("disabled", "disabled");
            else
                atkElem.removeAttribute("disabled");
            atkElem.style.opacity = disabled ? 0.5 : 1;
        }

        for (var i = 0; i < potions.length; i++) {
            let potElem = document.getElementById(`potion${i}`);

            let disabled = (potElem.classList.contains("onCooldown") || potElem.classList.contains("waiting") || potions[i].quantity == 0);
            if (disabled)
                potElem.setAttribute("disabled", "disabled");
            else
                potElem.removeAttribute("disabled");

            potElem.style.opacity = disabled ? 0.5 : 1;
        }
    }

    this.scaleAttackGauges = function () {
        document.getElementById("heroAttackGauge").style.width = service.getHeroAttackScale() + "%";
        document.getElementById("enemyAttackGauge").style.width = service.getEnemyAttackScale() + "%";
    }

    start();
}
