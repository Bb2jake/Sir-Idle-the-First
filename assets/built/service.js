var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Service = (function () {
    function Service(cont) {
        this.isPaused = true;
        this.zones = [
            new Zone("Prairie", 1, "assets/art/prairieBG.png"),
            new Zone("Prairie", 1.5, "assets/art/forestBG.png"),
            new Zone("Prairie", 2, "assets/art/caveBG.png"),
        ];
        this.boss = new Combatant("Prairie King", new Stats(500, 40, 1), [
            new Attack("Gnaw", 1, 1, 0, ""),
            new Attack("Howl", 1, 0.5, 10, "", true),
            new Attack("Plague Breath", 3, 2, 15, "")
        ], "assets/art/prairieKing.png");
        this.controller = cont;
        console.log(cont);
    }
    Service.prototype.getIsPaused = function () {
        return this.isPaused;
    };
    Service.prototype.start = function () {
        this.initHero();
        if (this.currentEnemy)
            this.currentEnemy.stats.currentHp = this.currentEnemy.stats.maxHp;
        this.currentZone = this.zones[0];
        this.initEnemies();
        this.currentEnemy = this.enemies[0];
        this.selectEnemyAttack();
        this.tick();
    };
    Service.prototype.getHeroAtk = function () {
        var hero = this.hero;
        var potion = hero.potions[1];
        return potion.isActive ? Math.floor(hero.stats.atk + hero.stats.atk * potion.boostPercent / 100) : hero.stats.atk;
    };
    Service.prototype.getHeroSpd = function () {
        var hero = this.hero;
        var potion = hero.potions[2];
        return potion.isActive ? +(hero.stats.spd + hero.stats.spd * potion.boostPercent / 100).toFixed(2) : hero.stats.spd;
    };
    Service.prototype.checkHeroLevel = function () {
        var hero = this.hero;
        while (hero.currentExp > hero.expToLevel) {
            hero.level++;
            hero.stats.maxHp = Math.floor(hero.stats.maxHp * 1.1);
            hero.stats.currentHp = hero.stats.maxHp;
            hero.stats.atk = Math.floor(hero.stats.atk * 1.1);
            hero.stats.spd = +((hero.stats.spd * 1.1).toFixed(2));
            hero.currentExp -= hero.expToLevel;
            hero.expToLevel = hero.level * 10;
        }
        this.controller.showHeroStats();
    };
    Service.prototype.getHero = function () {
        return JSON.parse(JSON.stringify(this.hero));
    };
    Service.prototype.getHeroAttackScale = function () {
        var hero = this.hero;
        if (hero.chosenAttack)
            return Math.min(hero.attackTimer / hero.castTime() * 100);
        else if (hero.chosenPotion)
            return Math.min(hero.attackTimer / hero.chosenPotion.castTime * 100);
        return 0;
    };
    Service.prototype.getEnemyAttackScale = function () {
        var currentEnemy = this.currentEnemy;
        return currentEnemy.chosenAttack ? Math.min(100, currentEnemy.attackTimer / currentEnemy.castTime() * 100) : 0;
    };
    Service.prototype.getCurrentEnemy = function () {
        return JSON.parse(JSON.stringify(this.currentEnemy));
    };
    // Fighters //
    Service.prototype.initHero = function () {
        this.hero = new Hero("Kai", new Stats(100, 10, 0.5), [
            new Attack("Slash", 1, 1, 0, "Slash with your sword."),
            new Attack("Leg Sweep", 1, 0.5, 10, "Sweep the leg! Resets opponents attack and stuns for 2 seconds.", true),
            new Attack("Fireball", 3, 2, 15, "Throw a fireball at your opponent.")
        ], "assets/art/hero.png", [
            new Potion("Healing Potion", "currentHp", 20, 0, 0.5, 3, "assets/art/healthPotion.png", "Heal 20% of your max HP"),
            new Potion("Attack Potion", "atk", 20, 20, 1, 3, "assets/art/attackPotion.png", "Increases attack by 20% for 20 seconds"),
            new Potion("Speed Potion", "spd", 20, 20, 1, 3, "assets/art/speedPotion.png", "Increases speed by 20% for 20 seconds")
        ]);
    };
    Service.prototype.initEnemies = function () {
        var zoneNum = this.zones.indexOf(this.currentZone) + 1;
        if (zoneNum == 0)
            return;
        this.enemies = [
            new Combatant("Lion Mouse", new Stats(50 * zoneNum, 7 * zoneNum, 0.75), [
                new Attack("Bite", 1, 1, 0, ""),
                new Attack("Tail Swipe", 1, 0.5, 10, "", true),
                new Attack("Body Slam", 3, 2, 15, "")
            ], "assets/art/lionMouse.png"),
            new Combatant("Harpy", new Stats(75 * zoneNum, 10 * zoneNum, 0.6), [
                new Attack("Claw", 1, 1, 0, ""),
                new Attack("Scream", 1, 0.5, 10, "", true),
                new Attack("Dive Bomb", 3, 2, 15, "")
            ], "assets/art/harpy.png"),
            new Combatant("Baby Hydra", new Stats(150 * zoneNum, 10 * zoneNum, 0.5), [
                new Attack("Bite", 1, 1, 0, ""),
                new Attack("Tail Swipe", 1, 0.5, 10, "", true),
                new Attack("Fire Breath", 3, 2, 15, "")
            ], "assets/art/hydra.png")
        ];
    };
    Service.prototype.tryUsePotion = function (potionNum) {
        var hero = this.hero;
        var potion = hero.potions[potionNum];
        hero.attackTimer = 0;
        if (potion.quantity > 0 && !potion.isActive) {
            if (potionNum == 0) {
                if (hero.stats.currentHp < hero.stats.maxHp) {
                    potion.quantity--;
                    hero.chosenPotion = potion;
                    this.isPaused = false;
                    this.controller.toggleInputButtons(false);
                    this.controller.showHeroAttackName("Using " + hero.chosenPotion.name);
                    return true;
                }
                return false;
            }
            else {
                potion.quantity--;
                hero.chosenPotion = potion;
                this.isPaused = false;
                this.controller.toggleInputButtons(false);
                this.controller.showHeroAttackName("Using " + hero.chosenPotion.name);
                return true;
            }
        }
        return false;
    };
    Service.prototype.usePotion = function () {
        var hero = this.hero;
        var potionNum = hero.potions.indexOf(hero.chosenPotion);
        if (potionNum == 0) {
            hero.stats.currentHp = Math.min(hero.stats.currentHp + Math.floor(hero.stats.maxHp * hero.chosenPotion.boostPercent / 100), hero.stats.maxHp);
        }
        else {
            hero.chosenPotion.isActive = true;
            hero.chosenPotion.boostTimeRemaining = hero.chosenPotion.boostTime;
            // TODO: Have the active potion get a highlight effect or something, with a countdown showing how much time remaining
        }
        this.controller.showHeroStats();
        hero.chosenPotion = null;
    };
    Service.prototype.selectHeroAttack = function (atkNum) {
        var hero = this.hero;
        hero.chosenAttack = hero.attacks[atkNum];
        hero.attackTimer = 0;
        if (hero.chosenAttack) {
            this.isPaused = false;
            this.controller.toggleInputButtons(false);
            this.controller.showHeroAttackName(hero.chosenAttack.name);
        }
    };
    // AI chooses attack - for now, it's always the strongest that's off cooldown.
    Service.prototype.selectEnemyAttack = function () {
        var currentEnemy = this.currentEnemy;
        var attacks = currentEnemy.attacks.filter(function (attack) {
            return attack.cooldownRemaining <= 0;
        });
        currentEnemy.attackTimer = 0;
        currentEnemy.chosenAttack = attacks[attacks.length - 1];
        this.controller.showEnemyAttackName(currentEnemy.chosenAttack.name);
        this.controller.scaleAttackGauges();
    };
    Service.prototype.heroAttack = function () {
        var hero = this.hero;
        var currentEnemy = this.currentEnemy;
        currentEnemy.stats.currentHp -= hero.chosenAttack.potency * this.getHeroAtk();
        hero.chosenAttack.cooldownRemaining = hero.chosenAttack.cooldown;
        this.controller.showAttackCooldowns();
        hero.chosenAttack = null;
        if (currentEnemy.stats.currentHp <= 0) {
            currentEnemy.stats.currentHp = 0;
            this.enemyDied();
        }
        this.controller.showEnemyHp();
    };
    Service.prototype.enemyAttack = function () {
        var hero = this.hero;
        var currentEnemy = this.currentEnemy;
        hero.stats.currentHp -= currentEnemy.chosenAttack.potency * currentEnemy.stats.atk;
        currentEnemy.chosenAttack.cooldownRemaining = currentEnemy.chosenAttack.cooldown;
        if (hero.stats.currentHp <= 0) {
            hero.stats.currentHp = 0;
            this.heroDied();
        }
        this.controller.showHeroHp();
        this.selectEnemyAttack();
    };
    Service.prototype.heroDied = function () {
        this.isPaused = true;
        this.hero.attacks.forEach(function (attack) {
            attack.cooldownRemaining = 0;
        }, this);
        this.controller.toggleInputButtons(false);
        this.controller.showHeroDefeatedOverlay(true);
    };
    Service.prototype.enemyDied = function () {
        var currentEnemy = this.currentEnemy;
        this.isPaused = true;
        this.controller.toggleInputButtons(false);
        this.hero.currentExp += Math.floor(currentEnemy.stats.maxHp * currentEnemy.stats.atk * currentEnemy.stats.spd / 20);
        this.checkHeroLevel();
        currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;
        this.controller.fadeOutEnemy(this.selectNextEnemy);
    };
    Service.prototype.selectNextEnemy = function () {
        var currentEnemy = this.currentEnemy;
        if (currentEnemy == this.boss) {
            // TODO: Game ends here;
            alert("You beat the game!");
            return;
        }
        var enemyNum = this.enemies.indexOf(currentEnemy);
        if (enemyNum >= this.enemies.length - 1) {
            var zoneNum = this.zones.indexOf(this.currentZone);
            // Switch to new zone, or fight boss if last zone
            if (zoneNum >= this.zones.length - 1) {
                currentEnemy = this.boss;
            }
            else {
                this.currentZone = this.zones[zoneNum + 1];
                this.initEnemies();
                currentEnemy = this.enemies[0];
            }
        }
        else {
            currentEnemy = this.enemies[enemyNum + 1];
        }
        this.controller.fadeInEnemy(this.newEnemySpawned);
    };
    Service.prototype.selectPrevEnemy = function () {
        var currentEnemy = this.currentEnemy;
        var enemies = this.enemies;
        if (currentEnemy == this.boss) {
            currentEnemy = enemies[enemies.length - 1];
        }
        else {
            var enemyNum = enemies.indexOf(currentEnemy);
            if (enemyNum > 0) {
                currentEnemy = enemies[enemyNum - 1];
            }
            else {
                var zoneNum = this.zones.indexOf(this.currentZone);
                if (zoneNum > 0) {
                    this.currentZone = this.zones[zoneNum - 1];
                    currentEnemy = enemies[enemies.length - 1];
                }
            }
        }
        this.controller.showEnemy();
        this.selectEnemyAttack();
    };
    Service.prototype.newEnemySpawned = function () {
        this.selectEnemyAttack();
        this.controller.toggleInputButtons(true);
    };
    Service.prototype.reviveHero = function () {
        this.hero.stats.currentHp = this.hero.stats.maxHp;
        this.currentEnemy.stats.currentHp = this.currentEnemy.stats.maxHp;
        this.selectPrevEnemy();
    };
    Service.prototype.getZoneImg = function () {
        return this.currentZone.image;
    };
    Service.prototype.scaleAttackGauges = function () {
        var hero = this.hero;
        var currentEnemy = this.currentEnemy;
        hero.attackTimer += 1 / 30; // 30 FPS
        currentEnemy.attackTimer += 1 / 30;
        if (hero.chosenAttack) {
            if (hero.attackTimer >= hero.castTime())
                this.heroAttack();
        }
        else if (hero.chosenPotion) {
            if (hero.attackTimer >= hero.chosenPotion.castTime)
                this.usePotion();
        }
        if (currentEnemy.stats.currentHp > 0 && currentEnemy.attackTimer >= currentEnemy.castTime()) {
            this.enemyAttack();
        }
        this.controller.scaleAttackGauges();
    };
    Service.prototype.updatePotions = function () {
        this.hero.potions.forEach(function (potion) {
            if (potion.isActive) {
                potion.boostTimeRemaining -= 1 / 30;
                // TODO: Show seconds left on screen
                if (potion.boostTimeRemaining <= 0) {
                    potion.boostTimeRemaining = 0;
                    this.deactivatePotion(potion);
                }
            }
        }, this);
        this.controller.showPotionActiveTimes();
    };
    Service.prototype.updateAttacks = function () {
        this.hero.attacks.forEach(function (attack) {
            this.updateAttack(attack);
        }, this);
        this.currentEnemy.attacks.forEach(function (attack) {
            this.updateAttack(attack);
        }, this);
        this.controller.showAttackCooldowns();
    };
    Service.prototype.updateAttack = function (attack) {
        if (attack.cooldownRemaining > 0) {
            attack.cooldownRemaining -= 1 / 30;
            if (attack.cooldownRemaining <= 0) {
                attack.cooldownRemaining = 0;
            }
        }
    };
    Service.prototype.deactivatePotion = function (potion) {
        potion.isActive = false;
        // TODO: Deactivate on screen
        this.controller.showHeroStats();
        this.controller.showPotionActiveTimes();
    };
    Service.prototype.tick = function () {
        if (!this.isPaused) {
            if (!this.hero.chosenAttack && !this.hero.chosenPotion) {
                this.isPaused = true;
                this.controller.toggleInputButtons(true);
            }
            else {
                this.scaleAttackGauges();
            }
            this.updateAttacks();
            this.updatePotions();
        }
        setTimeout(this.tick, 1000 / 30); // 30 FPS
    };
    return Service;
}());
var Stats = (function () {
    function Stats(maxHp, atk, spd) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.atk = atk;
        this.spd = spd;
    }
    return Stats;
}());
var Combatant = (function () {
    function Combatant(name, stats, attacks, image) {
        this.attackTimer = 0;
        this.name = name;
        this.stats = stats;
        this.attacks = attacks;
        this.image = image;
    }
    Combatant.prototype.castTime = function () {
        return this.chosenAttack.castTime / this.stats.spd;
    };
    return Combatant;
}());
var Attack = (function () {
    function Attack(name, potency, castTime, cooldown, description, stun) {
        if (stun === void 0) { stun = false; }
        this.cooldownRemaining = 0;
        this.name = name;
        this.potency = potency;
        this.castTime = castTime;
        this.cooldown = cooldown;
        this.description = description;
        this.stun = stun;
    }
    return Attack;
}());
var Hero = (function (_super) {
    __extends(Hero, _super);
    function Hero(name, stats, attacks, image, potions) {
        var _this = _super.call(this, name, stats, attacks, image) || this;
        _this.level = 1;
        _this.currentExp = 0;
        _this.expToLevel = 10;
        _this.potions = potions;
        return _this;
    }
    return Hero;
}(Combatant));
var Potion = (function () {
    function Potion(name, boostStat, boostPercent, boostTime, castTime, quantity, image, description) {
        this.isActive = false;
        this.name = name;
        this.boostStat = boostStat;
        this.boostPercent = boostPercent;
        this.boostTime = boostTime;
        this.castTime = castTime;
        this.quantity = quantity;
        this.image = image;
        this.description = description;
    }
    return Potion;
}());
var Zone = (function () {
    function Zone(name, enemyMult, image) {
        this.name = name;
        this.enemyMult = enemyMult;
        this.image = image;
    }
    return Zone;
}());