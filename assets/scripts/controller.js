function Controller() {
    var service = new Service(toggleInputButtons, this);

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

    function heroAttacks () {
        showEnemyHp();

        let currentEnemy = service.getCurrentEnemy();

        if (currentEnemy.stats.currentHp <= 0) {
            $("#enemy1Img").addClass("fadeOut").one("animationend", function () {
                service.enemyDefeated();
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

    this.updateEnemyHp = function() {
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

    function toggleInputButtons(value) {
        let atkBtns = document.getElementById("attack-buttons").children;
        let potBtns = document.getElementById("potion-buttons").children;

        for (let i = 0; i < atkBtns.length; i++) {
            let atk = atkBtns[i];
            let pot = potBtns[i];
            if (value) {
                atk.removeAttribute("disabled");
                pot.removeAttribute("disabled");
            } else {
                atk.setAttribute("disabled", "disabled");
                pot.setAttribute("disabled", "disabled");

            }
            atk.style.opacity = value ? 1 : 0.5;
            pot.style.opacity = value ? 1 : 0.5;
        }

        if (value)
            document.getElementById("heroAttackName").innerText = "Choose an attack";
    }

    this.scaleAttackGauges = function() {
        document.getElementById("heroAttackGauge").style.width = service.getHeroAttackScale() + "%";
        document.getElementById("enemyAttackGauge").style.width = service.getEnemyAttackScale() + "%";
    }

    start();
}
