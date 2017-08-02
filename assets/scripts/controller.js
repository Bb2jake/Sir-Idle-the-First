function Controller() {
    var service = new Service(this);

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
        showHeroHp();
        showHeroExp();
        showHeroAtk();
        showHeroSpd();
        showPotionQuantities();
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
        showHeroHp();
    }

    function showHeroHp() {
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
        document.getElementById("heroSpd").innerHTML = service.getHeroSpd() * 100;
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
                showHeroHp();
                showZone();
                $("#enemy1Img").removeClass("fadeOut");
            })
        } else {
            enemyAttack();
        }
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
            showHeroHp();
            showHeroAtk();
            showHeroSpd();
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
                atk.removeAttribute("disabled");
                pot.removeAttribute("disabled");
            } else {
                atk.setAttribute("disabled", "disabled");
                pot.setAttribute("disabled", "disabled");
            }

            atk.style.opacity = toggleOn ? 1 : 0.5;
            pot.style.opacity = toggleOn ? 1 : 0.5;
        }

        if (toggleOn)
            document.getElementById("heroAttackName").innerText = "Choose an attack";
    }

    this.showHeroAttackName = function (name) {
        document.getElementById("heroAttackName").innerText = name;
    }

    this.showHeroDefeatedOverlay = function (display) {
        document.getElementById("hero-attack-overlay").style.display = display;
    }

    this.showEnemyAttackName = function (name) {
        document.getElementById("enemyAttackName").innerText = name;
    }

    this.scaleAttackGauges = function () {
        document.getElementById("heroAttackGauge").style.width = service.getHeroAttackScale() + "%";
        document.getElementById("enemyAttackGauge").style.width = service.getEnemyAttackScale() + "%";
    }

    start();
}
