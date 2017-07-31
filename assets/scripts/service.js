function Service() {
    var currentZone;
    var hero;
    var currentEnemy;
    var enemies;

    this.start = function () {
        initHero();
        if (currentEnemy)
            currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;
        currentZone = zones[0];
        initEnemies();
        currentEnemy = enemies[0];
    }

    function Attack(name, potency, castTime, cooldown, description, stun = false) {
        this.name = name;
        this.potency = potency;
        this.castTime = castTime;
        this.cooldown = cooldown;
        this.description = description;
        this.stun = stun;
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
    }

    function Hero(name, stats, attacks, image, potions) {
        Combatant.call(this, name, stats, attacks, image);
        this.potions = potions;
        this.level = 1;
        this.currentExp = 0;
        this.expToLevel = 10;
    }

    this.getHeroAtk = function () {
        let potion = hero.potions[1];
        return potion.isActive ? Math.floor(hero.stats.atk + hero.stats.atk * potion.boostPercent / 100) : hero.stats.atk;
    }

    this.getHeroSpd = function () {
        let potion = hero.potions[2];
        return potion.isActive ? Math.floor(hero.stats.spd + hero.stats.spd * potion.boostPercent / 100) : hero.stats.spd;
    }

    function checkHeroLevel() {
        while (hero.currentExp > hero.expToLevel) {
            hero.level++;
            hero.stats.maxHp = Math.floor(hero.stats.maxHp * 1.1);
            hero.stats.currentHp = hero.stats.maxHp;
            hero.stats.atk = Math.floor(hero.stats.atk * 1.1);
            hero.stats.spd = Math.floor(hero.stats.spd * 1.1);

            hero.currentExp -= hero.expToLevel;
            hero.expToLevel = hero.level * 10;
        }
    }

    this.getHero = function () {
        return JSON.parse(JSON.stringify(hero));
    }

    this.getCurrentEnemy = function () {
        return JSON.parse(JSON.stringify(currentEnemy));
    }

    function Potion(name, boostStat, boostPercent, boostTime, quantity, image, description) {
        this.name = name;
        this.boostStat = boostStat;
        this.boostPercent = boostPercent;
        this.boostTime = boostTime;
        this.quantity = quantity;
        this.image = image;
        this.description = description;
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
            new Stats(100, 10, 50),
            [
                new Attack("Slash", 1, 1, 0, "Slash with your sword."),
                new Attack("Leg Sweep", 1, 0.5, 10, "Sweep the leg! Resets opponents attack and stuns for 2 seconds.", true),
                new Attack("Fireball", 3, 2, 15, "Throw a fireball at your opponent.")
            ],
            "assets/art/hero.png",
            [
                new Potion("Healing Potion", "currentHp", 20, 0, 3, "assets/art/healthPotion.png", "Heal 20% of your max HP"),
                new Potion("Attack Potion", "atk", 20, 20, 3, "assets/art/attackPotion.png", "Increases attack by 20% for 20 seconds"),
                new Potion("Speed Potion", "spd", 20, 20, 3, "assets/art/speedPotion.png", "Increases speed by 20% for 20 seconds")
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
                new Stats(50 * zoneNum, 7 * zoneNum, 75),
                [
                    new Attack("Bite", 1, 1, 0),
                    new Attack("Tail Swipe", 1, 0.5, 10, "", true),
                    new Attack("Body Slam", 3, 2, 15)
                ],
                "assets/art/lionMouse.png"),
            new Combatant(
                "Harpy",
                new Stats(100 * zoneNum, 15 * zoneNum, 60),
                [
                    new Attack("Claw", 1, 1, 0),
                    new Attack("Scream", 1, 0.5, 10, "", true),
                    new Attack("Dive Bomb", 3, 2, 15)
                ],
                "assets/art/harpy.png"),
            new Combatant(
                "Baby Hydra",
                new Stats(300 * zoneNum, 10 * zoneNum, 50),
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
        new Stats(500, 20, 100),
        [
            new Attack("Gnaw", 1, 1, 0),
            new Attack("Howl", 1, 0.5, 10, "", true),
            new Attack("Plague Breath", 3, 2, 15)
        ],
        "assets/art/prairieKing.png"
    );


    this.tryUsePotion = function (potionNum) {
        let potion = hero.potions[potionNum];
        if (potion.quantity > 0 && !potion.isActive) {
            if (potionNum == 0) {
                if (hero.stats.currentHp < hero.stats.maxHp) {
                    potion.quantity--;
                    hero.stats.currentHp = Math.min(hero.stats.currentHp + Math.floor(hero.stats.maxHp * potion.boostPercent / 100), hero.stats.maxHp);
                    return true;
                }

                return false;
            } else {
                potion.quantity--;
                potion.isActive = true;
                return true;
            }
        }

        return false;
    }

    this.heroAttack = function heroAttack(attackNum) {
        // TODO: verify attack num exists and not on cooldown here
        if (hero.stats.currentHp > 0 && currentEnemy && currentEnemy.stats.currentHp > 0) {
            attack(hero, attackNum, this.getHeroAtk(), currentEnemy);
        }
    }

    this.enemyAttack = function () {
        let rnd = Math.floor(Math.random() * currentEnemy.attacks.length);
        attack(currentEnemy, rnd, currentEnemy.stats.atk, hero);
    }

    function attack(attacker, attackNum, atkPower, target) {
        target.stats.currentHp -= attacker.attacks[attackNum].potency * atkPower;
        if (target.stats.currentHp < 0) {
            target.stats.currentHp = 0;
        }
    }

    this.enemyDefeated = function () {
        if (currentEnemy == boss) {
            // TODO: Game ends here;
            return;
        }

        let enemyNum = enemies.indexOf(currentEnemy);
        hero.currentExp += Math.floor(currentEnemy.stats.maxHp * currentEnemy.stats.atk * currentEnemy.stats.spd / 4000);
        checkHeroLevel();

        currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;

        if (enemyNum >= enemies.length - 1) {
            let zoneNum = zones.indexOf(currentZone);
            // Switch to new zone, or fight boss if last zone
            if (currentZone >= zones.length - 1) {
                currentEnemy = boss;
            } else {
                currentZone = zones[zoneNum + 1];
                initEnemies();
                currentEnemy = enemies[0];
            }
        } else {
            // TODO: Have these be dynamically created enemies instead.
            currentEnemy = enemies[enemyNum + 1];
        }
    }

    function reviveHero() {

    }

    this.getZoneImg = function () {
        return currentZone.image;
    }
}