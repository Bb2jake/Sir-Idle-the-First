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
    // this.atkPotion = getPotion("atk");
    // this.spdPotion = getPotion("spd");
    // this.hpPotion = getPotion("cu")
    this.potions = potions;

    // function getPotion(name) {

    // }

    this.getAtk = function () {
        return potions['atkPotion'].isActive ? stats.atk * potions['atkPotion'].boostPercent : stats.atk;
    }

    this.getSpd = function () {
        return potions['spdPotion'].isActive ? stats.spd * potions['spdPotion'].boostPercent : stats.spd;

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

// Fighters //
var hero = new Hero(
    "Kai",
    new Stats(100, 10, 1),
    [
        new Attack("Slash", 1, 1, 0, "Slash with your sword."),
        new Attack("Leg Sweep", 1, 0.5, 10, "Sweep the leg! Resets opponents attack and stuns for 2 seconds.", true),
        new Attack("Fireball", 3, 2, 15, "Throw a fireball at your opponent.")
    ],
    "assets/art/hero.png",
    // [
    //     new Potion("Attack Potion", "atk", 25, 20, 3),
    //     new Potion("Speed Potion", "spd", 25, 20, 3),        
    //     new Potion("Healing Potion", "currentHp", 25, 0, 3)
    // ]
    {
        atkPotion: new Potion("Attack Potion", "atk", 25, 20, 3),
        spdPotion: new Potion("Speed Potion", "spd", 25, 20, 3),        
        hpPotion: new Potion("Healing Potion", "currentHp", 25, 0, 3)
    }
);

var lionMouse = new Combatant(
    "Lion Mouse",
    new Stats(50, 7, 2),
    [
        new Attack("Bite", 1, 1, 0),
        new Attack("Tail Swipe", 1, 0.5, 10, "", true),
        new Attack("Body Slam", 3, 2, 15)
    ],
    "assets/art/lionMouse.png"
)

var currentEnemy = lionMouse;

function update() {
    drawSprites();
    drawHeroStatusBar();
    drawEnemyStatusBar();
}

function drawSprites () {
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
        <div id="heroStats" class="col-xs-6 standardBG">
            <h3>Name: ${hero.name}</h3>
            <h4>HP: ${hero.stats.currentHp}/${hero.stats.maxHp}</h4>
            <h4>ATK: ${hero.getAtk()}</h4>
            <h4>SPD: ${hero.getSpd()}</h4>
        </div>
        <div id="attack-buttons" class="col-xs-3 standardBG">
            <button class="" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(0)">${hero.attacks[0].name}</button>
            <button class="" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(1)">${hero.attacks[1].name}</button>
            <button class="" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(2)">${hero.attacks[2].name}</button>
        </div>
        <div id="potion-buttons" class="col-xs-3 standardBG">
    `
    for (let pot in hero.potions) {
        template += `
            <button type="button" onpointerenter="" onpointerleave="" onclick="usePotion('${pot}')">${hero.potions[pot].name}</button>
        `
    }

    template += `</div>`

    document.getElementById('hero-status-bar').innerHTML = template;
}

function drawEnemyStatusBar() {
    let template = `
        <div id="enemyName">
            <h3>Name: ${currentEnemy.name}</h3>
        </div>
        <div id="enemyHpText">
            <h3>HP: ${currentEnemy.stats.currentHp}/${currentEnemy.stats.maxHp}</h3>
        </div>
    `

    document.getElementById('enemy-status-bar').innerHTML = template;
}

function usePotion(id) {
    console.log(hero.potions);
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
    if (target.stats.currentHp < 0) target.stats.currentHp = 0;

    update();
}

function hardReset() {
    hero.stats.currentHp = hero.stats.maxHp;
    currentEnemy.stats.currentHp = currentEnemy.stats.maxHp;

    update();
}

update();