var Controller = (function () {
    function Controller() {
        this.service = new Service(this);
        this.start();
        this.listenForDevCode();
    }
    Controller.prototype.start = function () {
        this.service.start();
        this.showEnemySprite();
        this.initHeroStatusBar();
        this.showEnemyStatusBar();
        this.showZone();
    };
    Controller.prototype.showZone = function () {
        document.getElementById("background").style.backgroundImage = "url(" + this.service.getZoneImg() + ")";
    };
    Controller.prototype.showEnemySprite = function () {
        var currentEnemy = this.service.getCurrentEnemy();
        document.getElementById("enemy1Img").setAttribute("src", currentEnemy.image);
    };
    Controller.prototype.initHeroStatusBar = function () {
        var hero = this.service.getHero();
        var attacks = document.getElementById("attack-buttons").children;
        for (var i = 0; i < attacks.length; i++) {
            attacks[i].innerHTML = hero.attacks[i].name;
        }
        this.showHeroExp();
        this.showHeroStats();
        this.showPotionQuantities();
    };
    Controller.prototype.showHeroStats = function () {
        this.showHeroHp();
        this.showHeroAtk();
        this.showHeroSpd();
    };
    Controller.prototype.showPotionQuantities = function () {
        var hero = this.service.getHero();
        var i = 0;
        for (var potion in hero.potions) {
            var pot = hero.potions[potion];
            document.getElementById("potion" + i + "Qty").innerHTML = pot.quantity + "x ";
            i++;
        }
    };
    Controller.prototype.showHeroHp = function () {
        var hero = this.service.getHero();
        document.getElementById("heroHp").innerHTML = hero.stats.currentHp + "/" + hero.stats.maxHp;
    };
    Controller.prototype.showHeroExp = function () {
        var hero = this.service.getHero();
        document.getElementById("heroLv").innerHTML = "Lv: " + hero.level + " | Exp: " + hero.currentExp + "/" + hero.expToLevel;
    };
    Controller.prototype.showHeroAtk = function () {
        document.getElementById("heroAtk").innerHTML = this.service.getHeroAtk().toString();
    };
    Controller.prototype.showHeroSpd = function () {
        document.getElementById("heroSpd").innerHTML = (this.service.getHeroSpd() * 100).toFixed(0);
    };
    Controller.prototype.showEnemyStatusBar = function () {
        var currentEnemy = this.service.getCurrentEnemy();
        document.getElementById("enemy-name").innerHTML = "Name: " + currentEnemy.name;
        document.getElementById("enemy-atk").innerHTML = "ATK: " + currentEnemy.stats.atk;
        document.getElementById("enemy-spd").innerHTML = "SPD: " + (currentEnemy.stats.spd * 100).toFixed(0);
        this.showEnemyHp();
    };
    Controller.prototype.hardReset = function () {
        // TODO: Change this to an in-game popup, rather than confirm
        if (confirm("Are you sure you want to start all over?")) {
            this.start();
            this.showPotionActiveTimes();
            this.showAttackCooldowns();
            this.toggleInputButtons(true);
        }
    };
    Controller.prototype.selectHeroAttack = function (atkNum) {
        this.service.selectHeroAttack(atkNum);
    };
    Controller.prototype.heroAttacks = function () {
        var _this = this;
        this.showEnemyHp();
        var currentEnemy = this.service.getCurrentEnemy();
        if (currentEnemy.stats.currentHp <= 0) {
            $("#enemy1Img").addClass("fadeOut").one("animationend", function () {
                _this.showEnemyStatusBar();
                _this.showEnemySprite();
                _this.showHeroExp();
                _this.showHeroHp();
                _this.showZone();
                $("#enemy1Img").removeClass("fadeOut");
            });
        }
    };
    Controller.prototype.showEnemy = function () {
        this.showEnemyStatusBar();
        this.showEnemySprite();
        this.showZone();
    };
    Controller.prototype.fadeOutEnemy = function (callback) {
        var _this = this;
        document.getElementById("enemy-defeated-overlay").style.display = "block";
        $("#enemy-defeated-overlay").addClass("fadeOut").one("animationend", function () {
            $("#enemy-defeated-overlay").removeClass("fadeOut");
        });
        $("#enemy1Img").addClass("fadeOut").one("animationend", function () {
            _this.showHeroExp();
            $("#enemy1Img").removeClass("fadeOut");
            document.getElementById("enemy-defeated-overlay").style.display = "none";
            callback();
        });
    };
    Controller.prototype.fadeInEnemy = function (callback) {
        this.showEnemySprite();
        this.showEnemyStatusBar();
        this.showZone();
        $("#enemy1Img").addClass("fadeIn").one("animationend", function () {
            $("#enemy1Img").removeClass("fadeIn");
            callback();
        });
    };
    Controller.prototype.showEnemyHp = function () {
        var currentEnemy = this.service.getCurrentEnemy();
        document.getElementById("enemy-hp").innerText = "HP: " + currentEnemy.stats.currentHp + "/" + currentEnemy.stats.maxHp;
    };
    Controller.prototype.usePotion = function (potionNum) {
        if (this.service.tryUsePotion(potionNum)) {
            this.showPotionQuantities();
        }
    };
    Controller.prototype.toggleInputButtons = function (toggleOn) {
        var atkBtns = document.getElementById("attack-buttons").children;
        var potBtns = document.getElementById("potion-buttons").children;
        for (var i = 0; i < atkBtns.length; i++) {
            var atk = atkBtns[i];
            var pot = potBtns[i];
            if (toggleOn) {
                atk.classList.remove("waiting");
                pot.classList.remove("waiting");
            }
            else {
                atk.classList.add("waiting");
                pot.classList.add("waiting");
            }
            this.showAttacksAndPotions();
        }
        if (toggleOn)
            document.getElementById("heroAttackName").innerText = "Choose an attack or potion to use";
    };
    Controller.prototype.showHeroAttackName = function (name) {
        document.getElementById("heroAttackName").innerText = name;
    };
    Controller.prototype.showHeroDefeatedOverlay = function (display) {
        document.getElementById("hero-defeated-overlay").style.display = display ? "block" : "none";
        document.getElementById("revive-hero-btn").style.display = display ? "block" : "none";
        document.getElementById("heroAttackName").style.display = !display ? "block" : "none";
    };
    Controller.prototype.reviveHero = function () {
        this.showHeroDefeatedOverlay(false);
        this.service.reviveHero();
        this.showHeroHp();
        this.showEnemyHp();
        this.toggleInputButtons(true);
    };
    Controller.prototype.showEnemyAttackName = function (name) {
        document.getElementById("enemyAttackName").innerText = name;
    };
    // TODO: Have this accept an attack num for efficiency
    Controller.prototype.showAttackCooldowns = function () {
        var attacks = this.service.getHero().attacks;
        for (var i = 0; i < attacks.length; i++) {
            var attack = attacks[i];
            var atkElem = document.getElementById("heroAtk" + i);
            if (attack.cooldownRemaining > 0) {
                atkElem.innerHTML = Math.ceil(attack.cooldownRemaining) + "s";
                atkElem.classList.add("onCooldown");
            }
            else {
                atkElem.innerHTML = attack.name;
                atkElem.classList.remove("onCooldown");
            }
        }
    };
    Controller.prototype.showPotionActiveTimes = function () {
        var potions = this.service.getHero().potions;
        for (var i = 0; i < potions.length; i++) {
            var potion = potions[i];
            var potElem = document.getElementById("potion" + i);
            if (potion.boostTimeRemaining > 0) {
                potElem.children[0].innerHTML = Math.ceil(potion.boostTimeRemaining) + "s";
                // potElem.children[1].style.display = "none"
                potElem.classList.add("onCooldown");
            }
            else {
                potElem.children[0].innerHTML = potion.quantity + "x ";
                // potElem.children[1].style.display = "initial";
                potElem.classList.remove("onCooldown");
            }
        }
    };
    Controller.prototype.showAttacksAndPotions = function () {
        var hero = this.service.getHero();
        var attacks = hero.attacks;
        var potions = hero.potions;
        for (var i = 0; i < attacks.length; i++) {
            var atkElem = document.getElementById("heroAtk" + i);
            var disabled = (atkElem.classList.contains("onCooldown") || atkElem.classList.contains("waiting"));
            if (disabled)
                atkElem.setAttribute("disabled", "disabled");
            else
                atkElem.removeAttribute("disabled");
            atkElem.style.opacity = disabled ? '0.5' : '1';
        }
        for (var i = 0; i < potions.length; i++) {
            var potElem = document.getElementById("potion" + i);
            var disabled = (potElem.classList.contains("onCooldown") || potElem.classList.contains("waiting") || potions[i].quantity == 0);
            if (disabled)
                potElem.setAttribute("disabled", "disabled");
            else
                potElem.removeAttribute("disabled");
            potElem.style.opacity = disabled ? '0.5' : '1';
        }
    };
    Controller.prototype.scaleAttackGauges = function () {
        document.getElementById("heroAttackGauge").style.width = this.service.getHeroAttackScale() + "%";
        document.getElementById("enemyAttackGauge").style.width = this.service.getEnemyAttackScale() + "%";
    };
    Controller.prototype.listenForDevCode = function () {
        var _this = this;
        var code = "sif";
        var seq = "";
        var firstKeyTime;
        $(document).keydown(function (e) {
            var milliseconds = new Date().getUTCMilliseconds();
            if (milliseconds - 1000 > firstKeyTime)
                seq = "";
            if (!seq)
                firstKeyTime = milliseconds;
            seq += (e.key);
            if (seq == code) {
                _this.enableDevTools();
                $(document).unbind('keydown');
            }
        });
    };
    Controller.prototype.enableDevTools = function () {
        $('#dev-tools').show();
    };
    Controller.prototype.levelUpHero = function () {
        this.service.levelUpHero();
        this.showHeroStats();
    };
    Controller.prototype.nextEnemy = function () {
        this.service.nextEnemy();
        this.showEnemy();
    };
    return Controller;
}());
