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

// Fighters //
var hero = new Combatant(
    "Kai",
    new Stats(100, 10, 1),
    [
        new Attack("Slash", 1, 1, 0, "Slash with your sword."),
        new Attack("Leg Sweep", 1, 0.5, 10, "Sweep the leg! Resets opponents attack and stuns for 2 seconds.", true),
        new Attack("Fireball", 3, 2, 15, "Throw a fireball at your opponent.")
    ],
    "assets/art/hero.png"
);

var lionMouse = new Combatant(
    "Lion Mouse",
    new Stats(50, 7, 2),
    [
        new Attack("Bite", 1, 1, 0),
        new Attack("Tail Swipe", 1, 0.5, 10),
        new Attack("Body Slam", 3, 2, 15)
    ],
    "assets/art/lionMouse.png"
)

var currentEnemy = lionMouse;

function update() {
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
    drawHeroStatusBar();
    drawEnemyStatusBar();
}

function drawHeroStatusBar() {
    let template = `
        <div id="heroName">
            <h3>Name: ${hero.name}</h3>
        </div>
        <div id="heroHpText">
            <h3>HP: ${hero.stats.currentHp}/${hero.stats.maxHp}</h3>
        </div>
        <div id="attack-buttons">
            <button class="" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(0)">${hero.attacks[0].name}</button>
            <button class="" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(1)">${hero.attacks[1].name}</button>
            <button class="" type="button" onpointerenter="" onpointerleave="" onclick="heroAttack(2)">${hero.attacks[2].name}</button>
        </div>
    `

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