function Service(cont) {
    var isPaused = true;
    var currentZone;
    var hero;
    var currentEnemy;
    var enemies;
    var controller = cont;

    this.getIsPaused = function () {
        return isPaused;
    }

    this.start = function () {
        initHero();
        if (currentEnemy)
            currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;
        currentZone = zones[0];
        initEnemies();
        currentEnemy = enemies[0];
        selectEnemyAttack();
        tick();
    }

    function Attack(name, potency, castTime, cooldown, description, stun = false) {
        this.name = name;
        this.potency = potency;
        this.castTime = castTime;
        this.cooldown = cooldown;
        this.description = description;
        this.stun = stun;
        this.cooldownRemaining = 0;
    }

    function Stats(maxHp, atk, spd) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.atk = atk;
        this.spd = spd;
    }

    function Combatant(name, stats, attacks, image) {
        this.name = name;
        this.stats = stats;
        this.attacks = attacks;
        this.image = image;
        this.chosenAttack;
        this.attackTimer = 0;

        this.castTime = function () {
            return this.chosenAttack.castTime / this.stats.spd;
        }
    }

    function Hero(name, stats, attacks, image, potions) {
        Combatant.call(this, name, stats, attacks, image);
        this.potions = potions;
        this.level = 1;
        this.currentExp = 0;
        this.expToLevel = 10;
        this.chosenPotion;
    }

    function getHeroAtk() {
        let potion = hero.potions[1];
        return potion.isActive ? Math.floor(hero.stats.atk + hero.stats.atk * potion.boostPercent / 100) : hero.stats.atk;
    }

    this.getHeroAtk = function () {
        return getHeroAtk();
    }

    this.getHeroSpd = function () {
        let potion = hero.potions[2];
        return potion.isActive ? +(hero.stats.spd + hero.stats.spd * potion.boostPercent / 100).toFixed(2) : hero.stats.spd;
    }

    function checkHeroLevel() {
        while (hero.currentExp > hero.expToLevel) {
            hero.level++;
            hero.stats.maxHp = Math.floor(hero.stats.maxHp * 1.1);
            hero.stats.currentHp = hero.stats.maxHp;
            hero.stats.atk = Math.floor(hero.stats.atk * 1.1);
            hero.stats.spd = +((hero.stats.spd * 1.1).toFixed(2));

            hero.currentExp -= hero.expToLevel;
            hero.expToLevel = hero.level * 10;
        }

        controller.showHeroStats();
    }

    this.getHero = function () {
        return JSON.parse(JSON.stringify(hero));
    }

    this.getHeroAttackScale = function () {
        if (hero.chosenAttack)
            return Math.min(hero.attackTimer / hero.castTime() * 100);
        else if (hero.chosenPotion)
            return Math.min(hero.attackTimer / hero.chosenPotion.castTime * 100);

        return 0;
    }

    this.getEnemyAttackScale = function () {
        return currentEnemy.chosenAttack ? Math.min(100, currentEnemy.attackTimer / currentEnemy.castTime() * 100) : 0;
    }

    this.getCurrentEnemy = function () {
        return JSON.parse(JSON.stringify(currentEnemy));
    }

    function Potion(name, boostStat, boostPercent, boostTime, castTime, quantity, image, description) {
        this.name = name;
        this.boostStat = boostStat;
        this.boostPercent = boostPercent;
        this.boostTime = boostTime;
        this.castTime = castTime;
        this.quantity = quantity;
        this.image = image;
        this.description = description;
        this.boostTimeRemaining;
        this.isActive = false;
    }

    function Zone(name, enemyMult, image) {
        this.name = name;
        this.enemyMult = enemyMult;
        this.image = image;
    }

    var zones = [
        new Zone("Prairie", 1, "assets/art/prairieBG.png"),
        new Zone("Prairie", 1.5, "assets/art/forestBG.png"),
        new Zone("Prairie", 2, "assets/art/caveBG.png"),
    ]

    // Fighters //
    function initHero() {
        hero = new Hero(
            "Kai",
            new Stats(100, 10, 0.5),
            [
                new Attack("Slash", 1, 1, 0, "Slash with your sword."),
                new Attack("Leg Sweep", 1, 0.5, 10, "Sweep the leg! Resets opponents attack and stuns for 2 seconds.", true),
                new Attack("Fireball", 3, 2, 15, "Throw a fireball at your opponent.")
            ],
            "assets/art/hero.png",
            [
                new Potion("Healing Potion", "currentHp", 20, 0, 0.5, 3, "assets/art/healthPotion.png", "Heal 20% of your max HP"),
                new Potion("Attack Potion", "atk", 20, 20, 1, 3, "assets/art/attackPotion.png", "Increases attack by 20% for 20 seconds"),
                new Potion("Speed Potion", "spd", 20, 20, 1, 3, "assets/art/speedPotion.png", "Increases speed by 20% for 20 seconds")
            ]
        );
    }

    function initEnemies() {
        let zoneNum = zones.indexOf(currentZone) + 1;
        if (zoneNum == 0)
            return;

        enemies = [
            new Combatant(
                "Lion Mouse",
                new Stats(50 * zoneNum, 7 * zoneNum, 0.75),
                [
                    new Attack("Bite", 1, 1, 0),
                    new Attack("Tail Swipe", 1, 0.5, 10, "", true),
                    new Attack("Body Slam", 3, 2, 15)
                ],
                "assets/art/lionMouse.png"),
            new Combatant(
                "Harpy",
                new Stats(75 * zoneNum, 10 * zoneNum, 0.6),
                [
                    new Attack("Claw", 1, 1, 0),
                    new Attack("Scream", 1, 0.5, 10, "", true),
                    new Attack("Dive Bomb", 3, 2, 15)
                ],
                "assets/art/harpy.png"),
            new Combatant(
                "Baby Hydra",
                new Stats(150 * zoneNum, 10 * zoneNum, 0.5),
                [
                    new Attack("Bite", 1, 1, 0),
                    new Attack("Tail Swipe", 1, 0.5, 10, "", true),
                    new Attack("Fire Breath", 3, 2, 15)
                ],
                "assets/art/hydra.png"
            )
        ];
    }

    var boss = new Combatant(
        "Prairie King",
        new Stats(500, 40, 1),
        [
            new Attack("Gnaw", 1, 1, 0),
            new Attack("Howl", 1, 0.5, 10, "", true),
            new Attack("Plague Breath", 3, 2, 15)
        ],
        "assets/art/prairieKing.png"
    );

    this.tryUsePotion = function (potionNum) {
        let potion = hero.potions[potionNum];
        hero.attackTimer = 0;

        if (potion.quantity > 0 && !potion.isActive) {
            if (potionNum == 0) {
                if (hero.stats.currentHp < hero.stats.maxHp) {
                    potion.quantity--;
                    hero.chosenPotion = potion;
                    isPaused = false;
                    controller.toggleInputButtons(false);
                    controller.showHeroAttackName("Using " + hero.chosenPotion.name);
                    return true;
                }

                return false;
            } else {
                potion.quantity--;
                hero.chosenPotion = potion;
                isPaused = false;
                controller.toggleInputButtons(false);
                controller.showHeroAttackName("Using " + hero.chosenPotion.name);
                return true;
            }
        }

        return false;
    }

    function usePotion() {
        let potionNum = hero.potions.indexOf(hero.chosenPotion);
        if (potionNum == 0) {
            hero.stats.currentHp = Math.min(hero.stats.currentHp + Math.floor(hero.stats.maxHp * hero.chosenPotion.boostPercent / 100), hero.stats.maxHp);
        } else {
            hero.chosenPotion.isActive = true;
            hero.chosenPotion.boostTimeRemaining = hero.chosenPotion.boostTime;
            // TODO: Have the active potion get a highlight effect or something, with a countdown showing how much time remaining
        }

        controller.showHeroStats();
        hero.chosenPotion = null;
    }

    this.selectHeroAttack = function (atkNum) {
        hero.chosenAttack = hero.attacks[atkNum];
        hero.attackTimer = 0;
        if (hero.chosenAttack) {
            isPaused = false;
            controller.toggleInputButtons(false);
            controller.showHeroAttackName(hero.chosenAttack.name);
        }
    }

    // AI chooses attack - for now, it's always the strongest that's off cooldown.
    function selectEnemyAttack() {
        let attacks = currentEnemy.attacks.filter((attack) => {
            return attack.cooldownRemaining <= 0;
        })

        currentEnemy.attackTimer = 0;
        currentEnemy.chosenAttack = attacks[attacks.length - 1];
        controller.showEnemyAttackName(currentEnemy.chosenAttack.name);
        controller.scaleAttackGauges();
    }

    function heroAttack() {
        currentEnemy.stats.currentHp -= hero.chosenAttack.potency * getHeroAtk();
        hero.chosenAttack.cooldownRemaining = hero.chosenAttack.cooldown;
        controller.showAttackCooldowns();
        hero.chosenAttack = null;
        if (currentEnemy.stats.currentHp <= 0) {
            currentEnemy.stats.currentHp = 0;
            enemyDied();
        }

        controller.showEnemyHp();
    }

    function enemyAttack() {
        hero.stats.currentHp -= currentEnemy.chosenAttack.potency * currentEnemy.stats.atk;
        currentEnemy.chosenAttack.cooldownRemaining = currentEnemy.chosenAttack.cooldown;

        if (hero.stats.currentHp <= 0) {
            hero.stats.currentHp = 0;
            heroDied();
        }

        controller.showHeroHp();
        selectEnemyAttack();
    }

    function heroDied() {
        // TODO: Show dead hero here
        isPaused = true;
        hero.attacks.forEach(function (attack) {
            attack.cooldownRemaining = 0;
        }, this);
        controller.toggleInputButtons(false);
        controller.showHeroDefeatedOverlay(true);
    }

    function enemyDied() {
        isPaused = true;
        controller.toggleInputButtons(false);
        hero.currentExp += Math.floor(currentEnemy.stats.maxHp * currentEnemy.stats.atk * currentEnemy.stats.spd / 20);
        checkHeroLevel();

        currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;

        controller.fadeOutEnemy(selectNextEnemy);
    }

    function selectNextEnemy() {
        if (currentEnemy == boss) {
            // TODO: Game ends here;
            return;
        }

        let enemyNum = enemies.indexOf(currentEnemy);

        if (enemyNum >= enemies.length - 1) {
            let zoneNum = zones.indexOf(currentZone);
            // Switch to new zone, or fight boss if last zone
            if (zoneNum >= zones.length - 1) {
                currentEnemy = boss;
            } else {
                currentZone = zones[zoneNum + 1];
                initEnemies();
                currentEnemy = enemies[0];
            }
        } else {
            currentEnemy = enemies[enemyNum + 1];
        }

        controller.fadeInEnemy(newEnemySpawned);
    }

    function selectPrevEnemy() {
        if (currentEnemy == boss) {
            currentEnemy = enemies[enemies.length - 1];
        } else {
            let enemyNum = enemies.indexOf(currentEnemy);
            if (enemyNum > 0) {
                currentEnemy = enemies[enemyNum - 1];
            } else {
                let zoneNum = zones.indexOf(currentZone);
                if (zoneNum > 0) {
                    currentZone = zones[zoneNum - 1];
                    currentEnemy = enemies[enemies.length - 1];
                }
            }
        }

        controller.showEnemy();
        selectEnemyAttack();
    }

    function newEnemySpawned() {
        selectEnemyAttack();
        controller.toggleInputButtons(true);
    }

    this.reviveHero = function () {
        // TODO: Revive hero, go back one enemy, and give full hp to both
        hero.stats.currentHp = hero.stats.maxHp;
        currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;
        selectPrevEnemy();
    }

    this.getZoneImg = function () {
        return currentZone.image;
    }

    function scaleAttackGauges() {
        hero.attackTimer += 1 / 30; // 30 FPS
        currentEnemy.attackTimer += 1 / 30;

        if (hero.chosenAttack) {
            if (hero.attackTimer >= hero.castTime())
                heroAttack();
        } else if (hero.chosenPotion) {
            if (hero.attackTimer >= hero.chosenPotion.castTime)
                usePotion();
        }


        if (currentEnemy.stats.currentHp > 0 && currentEnemy.attackTimer >= currentEnemy.castTime()) {
            enemyAttack();
        }

        controller.scaleAttackGauges();
    }

    function updatePotions() {
        hero.potions.forEach(function (potion) {
            if (potion.isActive) {
                potion.boostTimeRemaining -= 1 / 30;
                // TODO: Show seconds left on screen
                if (potion.boostTimeRemaining <= 0) {
                    potion.boostTimeRemaining = 0;
                    deactivatePotion(potion);
                }
            }
        }, this);

        controller.showPotionActiveTimes();
    }

    function updateAttacks() {
        hero.attacks.forEach(function (attack) {
            updateAttack(attack);
        }, this);

        currentEnemy.attacks.forEach(function (attack) {
            updateAttack(attack);
        }, this);

        controller.showAttackCooldowns();
    }

    function updateAttack(attack) {
        if (attack.cooldownRemaining > 0) {
            attack.cooldownRemaining -= 1 / 30;
            if (attack.cooldownRemaining <= 0) {
                attack.cooldownRemaining = 0;
            }
        }
    }

    function deactivatePotion(potion) {
        potion.isActive = false;
        // TODO: Deactivate on screen
        controller.showHeroStats();
        controller.showPotionActiveTimes();
    }

    function tick() {
        if (!isPaused) {
            if (!hero.chosenAttack && !hero.chosenPotion) {
                isPaused = true;
                controller.toggleInputButtons(true);
            } else {
                scaleAttackGauges();
            }

            updateAttacks();
            updatePotions();
        }

        setTimeout(tick, 1000 / 30); // 30 FPS
    }
}