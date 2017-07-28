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

var lionMouse = new Combatant (
    "Lion Mouse",
    new Stats (50, 7, 2),
    [
        new Attack("Bite", 1, 1, 0),
        new Attack("Tail Swipe", 1, 0.5, 10),
        new Attack("Body Slam", 3, 2, 15)
    ],
    "assets/art/lionMouse.png"
)

function drawCombatants () {
    let template = '';
    
    template += `
        <div id="hero" class="hero text-center">
            <div id="attack-buttons">
                <button class="btn" onclick="">${hero.attacks[0].name}</button>
                <button class="btn" onclick="">${hero.attacks[1].name}</button>
                <button class="btn" onclick="">${hero.attacks[2].name}</button>
            </div>
            <img src=${hero.image} alt="hero image">
        </div>
        <div id="enemy1" class="enemy">
            <img src=${lionMouse.image} alt="enemy image">
        </div>
    `

    document.getElementById('combatants').innerHTML = template;
}

drawCombatants();