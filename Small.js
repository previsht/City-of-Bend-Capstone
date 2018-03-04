function run() {
  // Total generation for CO2 offset. Jan. Feb. March April May June July Aug. Sept. Oct. Nov. Dec.
  var cO2generation = [1124, 1283, 2507, 2622, 3140, 3112, 3488, 3293, 2819, 1965, 1092, 994];//Kwh
  //Initialize Variables
    var generation, numberOfPanels, installationCosts, inverterReplacement, i, fixedCostsSavings,iBatteryCosts;
  var itcMacrsOffset = 1;
  var macrs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var batteryCosts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var panelEfficiancyLosses = [0, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015]; 
  //Pull battery information
  var batteryCost = document.getElementById("batteryCost").value;
  var numberOfBatteries = document.getElementById("numberBatteries").value;
  var totalBatteryCost = batteryCost * numberOfBatteries;
  //Choose storage option
  switch (getCheckedRadioValue("storageOption")) {
    case "none":
      generation = [1124, 1283, 2507, 2622, 3140, 3112, 3488, 3293, 2819, 1965, 1092, 994];
      numberOfPanels = 62;
      installationCosts = 30167;
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 4500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      fixedCostsSavings = [15,15,27,21,23,21,22,29,25,17,13,14];
      iBatteryCosts = 0;
      break;
    case "TOU":
      generation = [107,117,217,216,260,250,286,295,273,174,103,99];
        //Warranty good for 5 years
      iBatteryCosts = totalBatteryCost+5100+ 11693;
      batteryCosts[9] = totalBatteryCost;
      numberOfPanels = 62;
      installationCosts = 30167;
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 9600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//9600
      fixedCostsSavings = [36,35,48,42,47,40,46,49,50,43,34,34];
      break;
    
  }
  //Read in power cost and determine monthly savings
  var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  var costPerKWh = document.getElementById("energyCost2").value;
  for (i = 0; i < 12; i++) {
    var monthlySavings = (generation[i] * costPerKWh) + fixedCostsSavings[i];
    var num = monthlySavings.toString();
    var output = "$" + parseFloat(num).toFixed(2);
    document.getElementById(months[i]).innerHTML = output;
  }
  //Calculate year one savings
  var sumGen = generation.reduce(getSum);
  var yearOneSaving = +(sumGen * costPerKWh) + fixedCostsSavings.reduce(getSum);
  document.getElementById("outSave").value = yearOneSaving;
  //read in incentives
  var itc = 0.0,state = 0.0,utility = 0.0,percent = 0.0,flat = 0.0;
  if (document.getElementById("taxed").checked === true) {
    if (document.getElementById("itc").checked === true) {
      itc = document.getElementById("itcPercent").value;
    }
    var stateMax = document.getElementById("stateMax").value;
    if (document.getElementById("state").checked === true) {
      var costWatt = document.getElementById("statePercent").value;
      var subCost = costWatt * 17700;
      if (subCost <stateMax){
      	state = subCost;
      }
      else {
      	state = stateMax;
      }
    }
    if (document.getElementById("macrs").checked === true) {
      macrs = [0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      if (document.getElementById("itc").checked === true) {
      itcMacrsOffset = 0.85; //Since only half of the ITC credit applies to MACRS
      }
    }
  }
  var utilityMax = document.getElementById("utilityMax").value;
  if (document.getElementById("utility").checked === true) {
    var costWattU = document.getElementById("utilityFlat").value;
      var subCostU = costWattU * 17700;
      if (subCostU <utilityMax){
      	utility = subCostU;
      }
      else {
      	utility = utilityMax;
      }
  }
  if (document.getElementById("percent").checked === true) {
    percent = document.getElementById("miscPercent").value;

  }
  if (document.getElementById("flat").checked === true) {
    flat = document.getElementById("miscFlat").value;

  }
  // Cost calculations
  var panelCost = document.getElementById("panelCost").value;
  var totalCost = (panelCost * numberOfPanels) + installationCosts;
  var incentiveSavings = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  incentiveSavings[0] =+ parseFloat(totalCost * (itc / 100)) + parseFloat(state) + parseFloat(utility) + parseFloat(flat) + (totalCost * parseFloat(percent / 100));
  var systemLength = 19; //20 years starting at zero
  var yearlyGeneration = generation.reduce(getSum); //sum of generation array
  var generationArray = [],macrsSavings = [],yearlySavings = [];
  // Determine cost and savings over the lifetime of the array
  for (i = 0; i < systemLength + 1; i++) {
    yearlyGeneration = yearlyGeneration - (yearlyGeneration * panelEfficiancyLosses[i]);
    generationArray[i] = yearlyGeneration;
    macrsSavings[i] = totalCost * itcMacrsOffset * macrs[i];
    yearlySavings[i] = ((generationArray[i] * costPerKWh) +fixedCostsSavings.reduce(getSum));
  }
  // Determining present value
  var discountRate = document.getElementById("discountRate").value / 100;
  var cumulativeCF = [],npvSavings = 0,npvCost = 0,pVF,k,payback,done=false;
  cumulativeCF[0] = -(totalCost+iBatteryCosts);
  npvCost = totalCost+iBatteryCosts;
  var discountCF = -(totalCost+iBatteryCosts);
  var totalTaxSavings = incentiveSavings[0];
  for (var n = 0; n < 20; n++) {
    // Present value factor
    pVF = 1 / Math.pow(1 + discountRate, n+1);
    cumulativeCF[n + 1] = +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - ((batteryCosts[n]) * pVF) - (inverterReplacement[n] * pVF);//cumulative cash flow
    npvCost = +npvCost + (batteryCosts[n] * pVF) + (inverterReplacement[n] * pVF);//present value of costs
    k = cumulativeCF.reduce(getSum);
    discountCF= discountCF +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - ((batteryCosts[n]) * pVF) - (inverterReplacement[n] * pVF);//current cash flow
    npvSavings = parseFloat(npvSavings) + ((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF);//present value of savings
    totalTaxSavings = totalTaxSavings + (macrsSavings[n] * pVF);//total Tax credit
    //payback loop
    if(k >=0){
      if(done) break;//breaks loop once cashflow become positive
       payback = n + (discountCF/npvSavings);
      done = true;
    }
    else{
      payback = "Never Pays Back";
    }
  }
  //Total Tax Incentives
  document.getElementById("Tax").value = totalTaxSavings;
  // ROI & NPV
  var returnOnInvestment = (cumulativeCF.reduce(getSum) / (npvCost)) * 100;
  document.getElementById("outROI").value = returnOnInvestment;
  var nPV = cumulativeCF.reduce(getSum);
  document.getElementById("outPay").value = nPV;
  //Payback
  document.getElementById("payback").value = payback;
  //CO2 offset
  var co2Offset = 0.000744 * cO2generation.reduce(getSum); //metric tons co2/kWh
  document.getElementById("outCO2").value = co2Offset;
}

  //Debugging and verification (ignore please)
  //alert(payback)
  //alert(totalCost+iBatteryCosts)
  //alert(batteryCosts[9]+inverterReplacement[9])
  //alert(npvSavings)
  //alert(npvCost)

//gets the value of the checked radio button
function getCheckedRadioValue(name) {
  var elements = document.getElementsByName(name);

  for (var i = 0, len = elements.length; i < len; ++i)
    if (elements[i].checked) return elements[i].value;
}

function storageQuery() {
  switch (getCheckedRadioValue("storageOption")) {
    case "none":
      document.getElementById("batteryCost").value = 0;
      document.getElementById("numberBatteries").value = 0;
      document.getElementById("energyCost1").value = 0.0628;
      document.getElementById("energyCost2").value = 0.06119;
      document.getElementById("energyCost1").hidden = false;
      document.getElementById("energyCost2").hidden = false;
      break;
    case "TOU":
      document.getElementById("batteryCost").value = 9610;
      document.getElementById("numberBatteries").value = 6;
      document.getElementById("energyCost1").value = 0;
      document.getElementById("energyCost2").value = 1;
      document.getElementById("energyCost1").hidden = true;
      document.getElementById("energyCost2").hidden = true;
      break;
    default:
      alert("Error!");
  }
}

//Will disable or enable tax only incentives
function profitQuery() {
  if (document.getElementById("taxed").checked === true) {
    document.getElementById("itc").hidden = false;
    document.getElementById("itcPercent").value = 30;
    document.getElementById("itcPercent").readOnly = false;
    document.getElementById("state").hidden = false;
    document.getElementById("statePercent").value = 0;
    document.getElementById("statePercent").readOnly = false;
    document.getElementById("macrs").hidden = false;

  } else if (document.getElementById("taxed").checked === false) {
    document.getElementById("itc").hidden = true;
    document.getElementById("itc").checked = false;
    document.getElementById("itcPercent").value = 0;
    document.getElementById("itcPercent").readOnly = true;
    document.getElementById("state").hidden = true;
    document.getElementById("state").checked = false;
    document.getElementById("statePercent").value = 0;
    document.getElementById("statePercent").readOnly = true;
    document.getElementById("macrs").hidden = true;
    document.getElementById("macrs").checked = false;
  }

}

function getSum(total, num) {
  return total + num;
}

var acc = document.getElementsByClassName("accordion");
var l;

for (l = 0; l < acc.length; l++) {
  acc[l].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight){
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}