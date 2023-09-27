import { ExponentialCost, LinearCost, ConstantCost, CompositeCost, FreeCost, StepwiseCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { TextAlignment } from "./api/ui/properties/TextAlignment";
import { Thickness } from "./api/ui/properties/Thickness";
import { Color } from "./api/ui/properties/Color";
import { LayoutOptions } from "./api/ui/properties/LayoutOptions";
import { TouchType } from "./api/ui/properties/TouchType";
import { Currency } from "./api/Currency";
import { Easing } from "./api/ui/properties/Easing";
import { FontFamily } from "./api/ui/properties/FontFamily";
import { ImageSource } from "./api/ui/properties/ImageSource";
import { StackOrientation } from "./api/ui/properties/StackOrientation";


var id = "Gacha_Hell";
var name = "Gacha Hell";
var description = "A theory that exists to stave off the gacha crave many are unfortunately addicted too. Partially inspired by the Probability Theory.";
var authors = "Jacob1531";
var version = 0.1;

var stage=0;

var time=0;
var currency;
var c1, c2;
var c1Exp, c2Exp;

//progress bar variable(s)
var prgBar;
var prgGacha = BigNumber.ZERO;

var gacha = BigNumber.ZERO, gachaTotal = BigNumber.ZERO;
var stars = [0, 0, 0, 0, 0, 0];
var starTotal=BigNumber.ZERO;

var achievement1, achievement2;
var chapter1, chapter2;

quaternaryEntries = [];

var getInternalState = () => `${stars} ${gacha} ${gachaTotal}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) stars = parseBigNumber(values[0]);
    if (values.length > 1) gacha = parseBigNumber(values[1]);
    if (values.length > 2) gachaTotal = parseBigNumber(values[2]);
}

var postPublish = () => {
    stars=[0,0,0,0,0,0];
    var gacha = BigNumber.ZERO;
}

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    //t
    {
        let getDesc = () => Localization.getUpgradeIncCustomDesc("\\text{time}", "\\text{0.1s}");
        let getInfo = () => Localization.getUpgradeIncCustomInfo("\\text{time}", "\\text{0.1s}");
        clicker = theory.createUpgrade(5, currency, new FreeCost());
        clicker.getDescription = (_) =>getDesc();
        clicker.getInfo = (amount) => getInfo();
        clicker.bought = (amount) => { prgGacha += .1 };
    }

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(15, Math.log2(2))));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }

    // c2
    {
        let getDesc = (level) => "c_2=2^{" + level + "}";
        let getInfo = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createUpgrade(1, currency, new ExponentialCost(5, Math.log2(10)));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getInfo(c2.level), getInfo(c2.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        c1Exp = theory.createMilestoneUpgrade(0, 3);
        c1Exp.description = Localization.getUpgradeIncCustomExpDesc("c_1", "0.05");
        c1Exp.info = Localization.getUpgradeIncCustomExpInfo("c_1", "0.05");
        c1Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        c2Exp = theory.createMilestoneUpgrade(1, 3);
        c2Exp.description = Localization.getUpgradeIncCustomExpDesc("c_2", "0.05");
        c2Exp.info = Localization.getUpgradeIncCustomExpInfo("c_2", "0.05");
        c2Exp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
    
    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => c1.level > 1);
    achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of c2?", () => c2.level > 1);

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "My First Chapter", "This is line 1,\nand this is line 2.\n\nNice.", () => c1.level > 0);
    chapter2 = theory.createStoryChapter(1, "My Second Chapter", "This is line 1 again,\nand this is line 2... again.\n\nNice again.", () => c2.level > 0);

    updateAvailability();
}

var updateAvailability = () => {
    c2Exp.isAvailable = c1Exp.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    currency.value += dt * bonus * getC1(c1.level).pow(getC1Exponent(c1Exp.level)) *
                                   getC2(c2.level).pow(getC2Exponent(c2Exp.level)) *
                                   starTotal;

    let temp=BigNumber.ONE;//would be more optimal if i could get this to only update on tap
    for(let i=0; i<stars.length;i++)
    {
        temp*=Math.pow((stars[i]+BigNumber.ONE), Math.sqrt(i+1));
    }
    starTotal=temp;
    
    let spd=1;//some other multiplier here soon
    prgGacha += dt * spd;
    if (prgGacha >= 1) {
        gacha += prgGacha.floor();
        gachaTotal += prgGacha.floor();
        prgGacha -= prgGacha.floor();
        //theory.invalidatePrimaryEquation();
        //theory.invalidateSecondaryEquation();
    }
    prgBar.progress = Math.min([prgGacha][stage].toNumber(), 1);
    theory.invalidateQuaternaryValues();
}



var getEquationOverlay = () => ui.createGrid({
    margin: new Thickness(40, 0, 40, 0),
    children: [
        prgBar = ui.createProgressBar({ progress: 0, verticalOptions: LayoutOptions.START }),
    ],
    onTouched: (e) => {
        if (e.type != TouchType.PRESSED) return;
        if (stage == 0) {//might change stage later
            if (gacha < 1) return;
            let multi = Math.min(gacha, 1);// + gachaBulk.level);
            let odds = [5, 4, 3, 2, 1, 0].map((x) => Math.pow(5 - .2,x));//gachaValue.level * .2, x));
            for (let n = 0; n < multi; n++) {
                let osum = odds.reduce((x, y) => x + y);
                for (let a = 0; a < 6; a++) {
                    let rand = Math.random() < odds[a] / osum ? 1 : 0;
                    stars[a] += rand * 1//(gachaValue2.level + 1);
                    if (rand > 0) break;
                    osum -= odds[a];
                }
                /*tSkill = 0;
                let a = 0;
                while (a < 1000 || tSkill >= 13) {
                    tSkill = Math.floor(Math.random() * skillData.length);
                    if (tSkill < 8) break;
                    else if (tSkill < 13 && Math.random() < 0.5) break;
                    else if (spUnlock.level > 0 && Math.random() < 0.02) break;
                    a++;
                }
                let skill = skills[tSkill];
                if (skill.level == 0) skill.level += 1;
                tSkill = null;*/
            }
            
            gacha -= multi;
            seSeed = Math.floor(Math.random() * 2147483647);
            //theory.invalidatePrimaryEquation();
            //theory.invalidateSecondaryEquation();
            //theory.invalidateQuaternaryValues();
            //updateAvailability();
        }
    }
});

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = c_1";

    if (c1Exp.level == 1) result += "^{1.05}";
    if (c1Exp.level == 2) result += "^{1.1}";
    if (c1Exp.level == 3) result += "^{1.15}";

    result += "c_2";

    if (c2Exp.level == 1) result += "^{1.05}";
    if (c2Exp.level == 2) result += "^{1.1}";
    if (c2Exp.level == 3) result += "^{1.15}";

    result += "⋆_t"
    theory.primaryEquationScale = 1;
    return result;
}


var getSecondaryEquation = () => {
    return "⋆_t = \\prod\\nolimits_{i=1}^6\\left(1+⋆_i^{\\sqrt{i}}\\right)";
  }
var getTertiaryEquation = () => theory.latexSymbol + "=\\max\\rho";

var getQuaternaryEntries = () => {
    if (quaternaryEntries.length == 0)
    {
        quaternaryEntries.push(new QuaternaryEntry("⋆_1", null));
        quaternaryEntries.push(new QuaternaryEntry("⋆_2", null));
        quaternaryEntries.push(new QuaternaryEntry("⋆_3", null));
        quaternaryEntries.push(new QuaternaryEntry("⋆_4", null));
        quaternaryEntries.push(new QuaternaryEntry("⋆_5", null));
        quaternaryEntries.push(new QuaternaryEntry("⋆_6", null));
        quaternaryEntries.push(new QuaternaryEntry("⋆_t", null));
        quaternaryEntries.push(new QuaternaryEntry("θ", null));
    }

    quaternaryEntries[0].value = stars[0].toString();
    quaternaryEntries[1].value = stars[1].toString();
    quaternaryEntries[2].value = stars[2].toString();
    quaternaryEntries[3].value = stars[3].toString();
    quaternaryEntries[4].value = stars[4].toString();
    quaternaryEntries[5].value = stars[5].toString();
    quaternaryEntries[6].value = starTotal.toString();
    quaternaryEntries[7].value = gacha.toString();

    return quaternaryEntries;
}



var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC2 = (level) => BigNumber.TWO.pow(level);
var getC1Exponent = (level) => BigNumber.from(1 + 0.05 * level);
var getC2Exponent = (level) => BigNumber.from(1 + 0.05 * level);

init();