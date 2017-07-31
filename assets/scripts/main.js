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

    this.getAtk = function () {
        let potion = this.potions['atkPotion'];
        return potion.isActive ? this.stats.atk + this.stats.atk * potion.boostPercent / 100 : this.stats.atk;
    }

    this.getSpd = function () {
        let potion = this.potions['spdPotion'];
        return potion.isActive ? this.stats.spd + this.stats.spd * potion.boostPercent / 100 : this.stats.spd;
    }

    this.checkLevel = function () {
        while (this.currentExp > this.expToLevel) {
            this.level++;
            this.stats.maxHp = Math.floor(this.stats.maxHp * 1.1);
            this.stats.currentHp = this.stats.maxHp;
            this.stats.atk = Math.floor(this.stats.atk * 1.1);
            this.stats.spd = Math.floor(this.stats.spd * 1.1);

            this.currentExp -= this.expToLevel;
            this.expToLevel = this.level * 10;
        }
    }
}

function Potion(name, boostStat, boostPercent, boostTime, quantity, image) {
    this.name = name;
    this.boostStat = boostStat;
    this.boostPercent = boostPercent;
    this.boostTime = boostTime;
    this.quantity = quantity;
    this.image = image;
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
var hero;

function createHero() {
    hero = new Hero(
        "Kai",
        new Stats(100, 10, 1),
        [
            new Attack("Slash", 1, 1, 0, "Slash with your sword."),
            new Attack("Leg Sweep", 1, 0.5, 10, "Sweep the leg! Resets opponents attack and stuns for 2 seconds.", true),
            new Attack("Fireball", 3, 2, 15, "Throw a fireball at your opponent.")
        ],
        "assets/art/hero.png",
        {
            hpPotion: new Potion("Healing Potion", "currentHp", 25, 0, 3, "assets/art/healthPotion.png"),
            atkPotion: new Potion("Attack Potion", "atk", 25, 20, 3, "assets/art/attackPotion.png"),
            spdPotion: new Potion("Speed Potion", "spd", 25, 20, 3, "assets/art/speedPotion.png")
        }
    );
}

createHero();

var enemies = [
    new Combatant(
        "Lion Mouse",
        new Stats(50, 7, 2),
        [
            new Attack("Bite", 1, 1, 0),
            new Attack("Tail Swipe", 1, 0.5, 10, "", true),
            new Attack("Body Slam", 3, 2, 15)
        ],
        "assets/art/lionMouse.png"),
    new Combatant(
        "Harpy",
        new Stats(100, 15, 1.5),
        [
            new Attack("Claw", 1, 1, 0),
            new Attack("Scream", 1, 0.5, 10, "", true),
            new Attack("Dive Bomb", 3, 2, 15)
        ],
        "assets/art/harpy.png"),
    new Combatant(
        "Baby Hydra",
        new Stats(300, 10, 1),
        [
            new Attack("Bite", 1, 1, 0),
            new Attack("Tail Swipe", 1, 0.5, 10, "", true),
            new Attack("Fire Breath", 3, 2, 15)
        ],
        "assets/art/hydra.png"
    )
];

var boss = new Combatant(
    "Prairie King",
    new Stats(500, 20, 2),
    [
        new Attack("Gnaw", 1, 1, 0),
        new Attack("Howl", 1, 0.5, 10, "", true),
        new Attack("Plague Breath", 3, 2, 15)
    ],
    "assets/art/prairieKing.png"
);

var currentEnemy = enemies[0];
var currentZone = zones[0];

function update() {
    drawSprites();
    drawHeroStatusBar();
    drawEnemyStatusBar();
    document.getElementById("background").style.backgroundImage = `url(${currentZone.image})`;
}

function drawSprites() {
    let template = '';

    template += `
        <div id="hero" class="hero text-center">
            <img src=${hero.image} alt="hero image">
        </div>
        <div id="enemy1" class="enemy">
            <img src=${currentEnemy.image} alt="enemy image">
        </div>
    `

    document.getElementById('combatants').innerHTML = template;
}

function drawHeroStatusBar() {
    let template = `
        <div id="hero-stats" class="col-xs-6 standardBG">
            <h4>Name: ${hero.name}</h4>
            <p>HP: <span class="standardBG">${hero.stats.currentHp}/${hero.stats.maxHp}</span></p>
            <p>LV: ${hero.level} | Exp: ${hero.currentExp}/${hero.expToLevel}</p>
            <p>ATK: ${hero.getAtk()}</p>
            <p>SPD: ${hero.getSpd()}</p>
        </div>
        <div id="attack-buttons" class="col-xs-3 standardBG">
            <button class="standardBG" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(0)">${hero.attacks[0].name}</button>
            <button class="standardBG" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(1)">${hero.attacks[1].name}</button>
            <button class="standardBG" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(2)">${hero.attacks[2].name}</button>
        </div>
        <div id="potion-buttons" class="col-xs-3 standardBG">
    `
    for (let pot in hero.potions) {
        let potion = hero.potions[pot];
        template += `
            <button type="button" onpointerenter="" onpointerleave="" onclick="usePotion('${pot}')"><img  src="${potion.image}" alt="${potion.name}"></button>
        `
    }

    template += `</div>`

    document.getElementById('hero-status-bar').innerHTML = template;
}

function drawEnemyStatusBar() {
    let template = `
        <div id="enemy-stats" class="standardBG">
            <h4>Name: ${currentEnemy.name}</h4>
            <p>HP: ${currentEnemy.stats.currentHp}/${currentEnemy.stats.maxHp}</p>
            <p>ATK: ${currentEnemy.stats.atk}</p>
            <p>SPD: ${currentEnemy.stats.spd}</p>
        </div>
    `

    document.getElementById('enemy-status-bar').innerHTML = template;
}

function usePotion(id) {
    hero.potions[id].isActive = true;
    update();
}

function heroAttack(attackNum) {
    if (hero.stats.currentHp > 0 && currentEnemy && currentEnemy.stats.currentHp > 0) {
        attack(hero, attackNum, currentEnemy);
        enemyAttack();
    }
}

function enemyAttack() {
    let rnd = Math.floor(Math.random() * currentEnemy.attacks.length);
    attack(currentEnemy, rnd, hero);
}

function attack(attacker, attackNum, target) {
    target.stats.currentHp -= attacker.attacks[attackNum].potency * attacker.stats.atk;
    if (target.stats.currentHp < 0) {
        target.stats.currentHp = 0;
        if (target instanceof Hero) {
            heroDied();
        } else {
            enemyDefeated();
        }
    }

    update();
}

function enemyDefeated() {
    let enemyNum = enemies.indexOf(currentEnemy);
    hero.currentExp += currentEnemy.stats.maxHp * currentEnemy.stats.atk * currentEnemy.stats.spd / 100;
    hero.checkLevel();

    // TODO: Check if you just defeated boss here
    currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;

    if (enemyNum >= enemies.length - 1) {
        let zoneNum = zones.indexOf(currentZone);
        // Switch to new zone, or fight boss if last zone
        if (currentZone >= zones.length - 1) {
            currentEnemy = boss;
        } else {
            currentEnemy = enemies[0];
            currentZone = zones[zoneNum + 1];
        }
    } else {
        // TODO: Have these be dynamically created enemies instead.
        currentEnemy = enemies[enemyNum + 1];
    }
}

function heroDied() {

}

function hardReset() {
    // TODO: Should probably have a popup confirmation for this.
    createHero();
    currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;
    currentEnemy = enemies[0];
    currentZone = zones[0];

    update();
}

update();