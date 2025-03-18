import { ExponentialCost, LinearCost, ConstantCost, CompositeCost, FreeCost, StepwiseCost, Cost, CustomCost } from "./api/Costs";
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
var c1, c2, c3, c4;
var a;
var pullAmount;
var c1Exp, c2Exp;

//progress bar variable(s)
var prgBar;
var prgGacha = BigNumber.ZERO;

var gacha;// = BigNumber.ZERO;
var gachaTotal = BigNumber.ZERO;
var gachaPullMax=1;
var stars =new Array(6);
var starNames =["⋆₁","⋆₂","⋆₃","⋆₄","⋆₅","⋆₆"];
var starTotal=BigNumber.ZERO;

var achievement1, achievement2;
var chapter1, chapter2;

quaternaryEntries = [];

var getInternalState = () => JSON.stringify
({
    version: version,
    time: time,
    //stars: stars,
    //gacha: gacha.toBase64String(),
    gachaTotal: gachaTotal.toBase64String()
}) 

var setInternalState = (stateStr) =>
{
    if(!stateStr)
        return;

    let state = JSON.parse(stateStr);
    version = state.version ?? version
    //stars= state.stars ?? new Array(6);
    //gacha =   BigNumber.fromBase64String(state.gacha) ?? BigNumber.ZERO;
    gachaTotal =  BigNumber.fromBase64String(state.gachaTotal) ?? BigNumber.ZERO;
}
/*var getInternalState = () => `${stars[[0]]} ${stars[[1]]} ${stars[[2]]} ${stars[[3]]} ${stars[[4]]} ${stars[[5]]} ${gacha} ${gachaTotal}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) stars[0] = parseBigNumber(values[0]);
    else stars[0]=0;
    if (values.length > 1) stars[1] = parseBigNumber(values[1]);
    if (values.length > 2) stars[2] = parseBigNumber(values[2]);
    if (values.length > 3) stars[3] = parseBigNumber(values[3]);
    if (values.length > 4) stars[4] = parseBigNumber(values[4]);
    if (values.length > 5) stars[5] = parseBigNumber(values[5]);
    if (values.length > 6) gacha = parseBigNumber(values[6]);
    if (values.length > 7) gachaTotal = parseBigNumber(values[7]);
}*/

var postPublish = () => {
    //stars=[0,0,0,0,0,0];
    //var gacha = BigNumber.ZERO;
}

var init = () => {
    currency = theory.createCurrency();
    gacha = theory.createCurrency("θ","\ominus")

    for (let i = 0; i < 6; i++) {
        stars[i] = theory.createCurrency(starNames[i], starNames[i]);
    }

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

    // a
    {
        let getDesc = (level) => "a=" + getA(level).toString(0);
        a = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, .35)));
        a.getDescription = (_) => Utils.getMath(getDesc(a.level));
        a.getInfo = (amount) => Utils.getMathTo(getDesc(a.level), getDesc(a.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e20);
    theory.createBuyAllUpgrade(1, currency, 1e30);
    theory.createAutoBuyerUpgrade(2, currency, 1e40);

    // Multi Pull
    {
        let getDesc = (level) => {
            switch(level) {
                case 0:
                    return "New Multi-Pull Feature! Maximum 10 pulls per tap with 10 pulls giving 1 bonus pull!";
                case 1:
                    return "Additional Multi-Pull Content! Massive 100 pull capabilities with an additional 1 pull for 100 pulls! (Total 11 bonus at 100)";
                case 2:
                    return "Never-Before-Seen Multi-Pull DLC! Stupendous 1000 pull availability with a COMPLETELY FREE 1 pull for 1000 pulls! (Total 111 bonus at 1000)";
                default:
                    return "Standard 10 times increase in pull capability increase with a bonus pull at every "+Math.pow(10,1+pullAmount.level)+" pulls.";
              }
        };
        pullAmount = theory.createPermanentUpgrade(3, gacha, new ExponentialCost(100,Math.log2(10)));
        pullAmount.getDescription = (_) => getDesc(pullAmount.level);
        var bonuspulls="";
        if(pullAmount.level>0) 
        {
            var temp="with ";
            for( var i=0; i<pullAmount.level;i++)
            {
                temp+="1";
            }
            bonuspulls=temp+" max bonus pulls ";
        }

        pullAmount.getInfo = (amount) => {
            var temp="with ";
            for( var i=0; i<pullAmount.level+amount;i++)
            {
                temp+="1";
            }
            temp+=" max bonus pulls.";
            return "Go from "+Math.pow(10,pullAmount.level)+" max pulls "+bonuspulls+"to "+Math.pow(10,pullAmount.level+amount)+" max pulls "+temp;
        }
    }

    // c1
    {
        let getDesc = (level) => "c_1=" + getC1(level).toString(0);
        c1 = theory.createPermanentUpgrade(4, stars[0], new ConstantCost(250));
        c1.getDescription = (_) => Utils.getMath(getDesc(c1.level));
        c1.getInfo = (amount) => Utils.getMathTo(getDesc(c1.level), getDesc(c1.level + amount));
    }
    // c2
    {
        let getDesc = (level) => "c_2=" + getC2(level).toString(0);
        c2 = theory.createPermanentUpgrade(5, stars[1], new ConstantCost(50));
        c2.getDescription = (_) => Utils.getMath(getDesc(c2.level));
        c2.getInfo = (amount) => Utils.getMathTo(getDesc(c2.level), getDesc(c2.level + amount));
    }
    // c3
    {
        let getDesc = (level) => "c_3=" + getC3(level).toString(0);
        c3 = theory.createPermanentUpgrade(6, stars[2], new ConstantCost(10));
        c3.getDescription = (_) => Utils.getMath(getDesc(c3.level));
        c3.getInfo = (amount) => Utils.getMathTo(getDesc(c3.level), getDesc(c3.level + amount));
    }
    // c4
    {
        let getDesc = (level) => "c_4=" + getC4(level).toString(0);
        c4 = theory.createPermanentUpgrade(7, stars[3], new ConstantCost(2));
        c4.getDescription = (_) => Utils.getMath(getDesc(c4.level));
        c4.getInfo = (amount) => Utils.getMathTo(getDesc(c4.level), getDesc(c4.level + amount));
    }

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
    chapter1 = theory.createStoryChapter(0, "My Second Chapter", "This is line 1 again,\nand this is line 2... again.\n\nNice again.", () => c2.level > 0);
    //multi pull chaps
    chapter2 = theory.createStoryChapter(1, "The Glory of Multi-Pulls, Part I", "You have unlocked,\nand this line is why bonus pulls are better.\n\nGacha.", () => pullAmount.level == 1);
    chapter3 = theory.createStoryChapter(2, "The Glory of Multi-Pulls, Part II", "This is a line about why 10 pulls is better than 1,\nand this line is why bonus pulls are better.\n\nGacha.", () => pullAmount.level == 2);
    chapter4 = theory.createStoryChapter(3, "The Glory of Multi-Pulls, Part III", "This is a line about why 10 pulls is better than 1,\nand this line is why bonus pulls are better.\n\nGacha.", () => pullAmount.level == 3);

    updateAvailability();
}

var isCurrencyVisible = (index) =>!index;

var updateAvailability = () => {
    c2Exp.isAvailable = c1Exp.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    currency.value += dt * bonus * getA(a.level) * getC1(c1.level).pow(getC1Exponent(c1Exp.level)) *
                                   getC2(c2.level).pow(getC2Exponent(c2Exp.level)) * getC3(c3.level) *
                                   getC4(c4.level) * starTotal;

    let temp=BigNumber.ONE;//would be more optimal if i could get this to only update on tap
    for(let i=0; i<stars.length;i++)
    {
        temp*=Math.pow((stars[i].value+BigNumber.ONE), Math.sqrt(i+1));
    }
    starTotal=temp;
    
    let spd=.65;//some other multiplier here soon
    prgGacha += dt * spd;
    if (prgGacha >= 1) {
        gacha.value += prgGacha.floor();
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
            if (gacha.value < 1) return;
            let scale=Math.pow(10,Math.floor(Math.log10(gacha.value)));//result is a form of 10eN  N being a nonnegative whole number
            gachaPullMax=Math.pow(10,pullAmount.level);
            let multi = Math.min(scale, gachaPullMax);//pulls will be done by exponents of 10. 
            gacha.value = gacha.value - multi;

            //modifies amount of pulls based off multi pull bonuses
            let bonus = Math.floor(multi/10);
            if (multi==gachaPullMax && multi>1)
            { 
                for (let i = 0; i<=Math.log10(bonus);i++)
                {
                    multi+=Math.pow(10,i);//10 pull gives 1 bonus, 100 gives 11 bonus, 1000 gives 111, etc with this line and the one below
                }
            }


            let odds = [5, 4, 3, 2, 1, 0].map((x) => Math.pow(5 - .2,x));//gachaValue.level * .2, x));
            for (let n = 0; n < multi; n++) {
                let osum = odds.reduce((x, y) => x + y);
                for (let a = 0; a < 6; a++) {
                    let rand = Math.random() < odds[a] / osum ? 1 : 0;
                    stars[a].value =stars[a].value + rand * 1//(gachaValue2.level + 1);
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
            
            seSeed = Math.floor(Math.random() * 2147483647);
            //theory.invalidatePrimaryEquation();
            //theory.invalidateSecondaryEquation();
            //theory.invalidateQuaternaryValues();
            //updateAvailability();
        }
    }
});

//  \; - a thick space
//  \: - a medium space
//  \, - a thin space

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = ac_1";

    if (c1Exp.level == 1) result += "^{1.05}";
    if (c1Exp.level == 2) result += "^{1.1}";
    if (c1Exp.level == 3) result += "^{1.15}";

    result += "c_2";

    if (c2Exp.level == 1) result += "^{1.05}";
    if (c2Exp.level == 2) result += "^{1.1}";
    if (c2Exp.level == 3) result += "^{1.15}";

    result += "c_3c_4⋆_t"
    theory.primaryEquationScale = 1;
    return result;
}


var getSecondaryEquation = () => {
    return "⋆_t = \\prod\\nolimits_{i=1}^6\\left(1+⋆_i^{\\sqrt{i}}\\right)";
  }
var getTertiaryEquation = () => theory.latexSymbol + "=\\max\\rho^{0.1}";

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

    quaternaryEntries[0].value = stars[0].value.toString();
    quaternaryEntries[1].value = stars[1].value.toString();
    quaternaryEntries[2].value = stars[2].value.toString();
    quaternaryEntries[3].value = stars[3].value.toString();
    quaternaryEntries[4].value = stars[4].value.toString();
    quaternaryEntries[5].value = stars[5].value.toString();
    quaternaryEntries[6].value = starTotal.toString();
    quaternaryEntries[7].value = gacha.value.toString();

    return quaternaryEntries;
}

var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value.pow(0.1)
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

//var getC1 = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getC1 = (level) => BigNumber.TWO.pow(level);//change this and four below to random
var getC2 = (level) => BigNumber.THREE.pow(level);
var getC3 = (level) => BigNumber.FIVE.pow(level);
var getC4 = (level) => BigNumber.SEVEN.pow(level);
var getA = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getPullMax = (level) => BigNumber.TEN.pow(level);
var getC1Exponent = (level) => BigNumber.from(1 + 0.05 * level);
var getC2Exponent = (level) => BigNumber.from(1 + 0.05 * level);

init();