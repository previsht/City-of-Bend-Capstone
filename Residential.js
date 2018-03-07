function run() {
  //Initialize variables
  var itcMacrsOffset = 1;
  var macrs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var batteryCosts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //Is an array of zeroes the length of systemLife
  var panelEfficiancyLosses = [0, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015]; //Is an array the length of systemLife
  //Pull battery information
  var batteryCost = document.getElementById("batteryCost").value;
  var numberOfBatteries = document.getElementById("numberBatteries").value;
  var totalBatteryCost = batteryCost * numberOfBatteries;
  var generation, numberOfPanels, installationCosts, inverterReplacement, i;
  //choose storage option
  switch (getCheckedRadioValue("storageOption")) {
    case "none":
      generation = [413.6, 411.20, 639.70, 664.00, 787.90, 773.10, 849.9, 801.70, 693.3, 601.00, 388.60, 387.60];
      numberOfPanels = 16;
      installationCosts = 10410;
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      break;
    case "backup":
      generation = [413.6, 411.20, 639.70, 664.00, 787.90, 773.10, 849.9, 801.70, 693.3, 601.00, 388.60, 387.60];
      //Warranty good for 5 years
      batteryCosts[4] = totalBatteryCost;
      batteryCosts[9] = totalBatteryCost;
      batteryCosts[14] = totalBatteryCost;
      numberOfPanels = 16;
      installationCosts = +10410 + 10225 +totalBatteryCost; //10325 is inverter + install
      inverterReplacement = [0, 0, 0, 0, 248, 0, 0, 0, 0, 2248, 0, 0, 0, 0,248, 0, 0, 0, 0, 0];

      break;
    case "netZero":
      generation = [935, 804, 807, 719, 689, 601, 651, 594, 656, 746, 810, 907];
      //Warranty good for 10 years
      batteryCosts[11] = totalBatteryCost;
      numberOfPanels = 52;
      installationCosts = +35507 + 10940 +totalBatteryCost;
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 4785, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      break;
  }
  //Read in power cost and determine monthly savings
  var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  var costPerKWh = document.getElementById("energyCost").value;
  for (i = 0; i < 12; i++) {
    var monthlySavings = generation[i] * costPerKWh;
    var num = monthlySavings.toString();
    var output = "$" + parseFloat(num).toFixed(2);
    document.getElementById(months[i]).innerHTML = output;
  }
//Calculate year one savings
  var sumGen = generation.reduce(getSum);
  var yearOneSaving = +sumGen * costPerKWh;
  document.getElementById("outSave").value = yearOneSaving;
  //Incentives
  var itc = 0.0,    state = 0.0,    utility = 0.0,    percent = 0.0,    flat = 0.0;
  if (document.getElementById("taxed").checked === true) {
    if (document.getElementById("itc").checked === true) {
      itc = document.getElementById("itcPercent").value;
    }
    var stateMax = document.getElementById("stateMax").value;
    if (document.getElementById("state").checked === true) {
      var costWatt = document.getElementById("statePercent").value;
      var subCost = costWatt * 4560;
      if (subCost <stateMax){
      	state = subCost;
      }
      else {
      	state = stateMax;
      }
    }
    if (document.getElementById("macrs").checked === true) {
      macrs = [0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      itcMacrsOffset = 0.85; //Since only half of the ITC credit applies to MACRS
    }
  }
  var utilityMax = document.getElementById("utilityMax").value;
  if (document.getElementById("utility").checked === true) {
    var costWattU = document.getElementById("utilityFlat").value;
      var subCostU = costWattU * 4560;
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
  var utilitySavings= totalCost - parseFloat(utility);
  var stateSavings = utilitySavings -  parseFloat(state);
  incentiveSavings[0] =+ parseFloat(stateSavings * (itc / 100)) + parseFloat(flat) + (stateSavings * parseFloat(percent / 100)) + parseFloat(state) + parseFloat(utility);
  var taxIncentive =+ parseFloat(stateSavings * (itc / 100)) + parseFloat(state);
  var systemLength = 19; //20 years starting at zero
  var yearlyGeneration = generation.reduce(getSum); //sum of generation array
  var generationArray = [];
  var macrsSavings = [];
  var yearlySavings = [];
  // Determine cost and savings over the lifetime of the array
  for (i = 0; i < systemLength + 1; i++) {
    yearlyGeneration = yearlyGeneration - (yearlyGeneration * panelEfficiancyLosses[i]);
    generationArray[i] = yearlyGeneration;
    macrsSavings[i] = totalCost * itcMacrsOffset * macrs[i];
    yearlySavings[i] = generationArray[i] * costPerKWh;
  }
  // Determining present value
  var discountRate = document.getElementById("discountRate").value / 100;
  var cumulativeCF = [],npvSavings = 0,npvCost = 0,pVF,k,payback,done=false;
  cumulativeCF[0] = -(totalCost);
  npvCost = totalCost;
  var discountCF = -(totalCost);
  var totalTaxSavings = taxIncentive;
  var totalIncentives = incentiveSavings[0];
  for (var n = 0; n < 20; n++) {
    // Present value factor
    pVF = 1 / Math.pow(1 + discountRate, n + 1);
    cumulativeCF[n + 1] = +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - ((batteryCosts[n]) * pVF) - (inverterReplacement[n] * pVF);
    npvCost = +npvCost + (batteryCosts[n] * pVF) + (inverterReplacement[n] * pVF);
    k = cumulativeCF.reduce(getSum);
    discountCF= discountCF +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - ((batteryCosts[n]) * pVF) - (inverterReplacement[n] * pVF);//current cash flow
    npvSavings = parseFloat(npvSavings) + ((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF);//present value of savings
    totalTaxSavings = totalTaxSavings + (macrsSavings[n] * pVF);//total Tax credit
    totalIncentives = totalIncentives + (macrsSavings[n] * pVF);
    //payback loop
    if(k >=0){
      if(done) break;//breaks loop once cashflow become positive
       payback = n + (discountCF/npvSavings);
       payback = payback.toFixed(2);
      done = true;
    }
    else{
      payback = "Never Pays Back";
    }
  }
 //Total Tax Incentives
  document.getElementById("Tax").value = totalTaxSavings.toFixed(2);
  // ROI & NPV
  var returnOnInvestment = (cumulativeCF.reduce(getSum) / (npvCost)) * 100;
  document.getElementById("outROI").value = returnOnInvestment.toFixed(2);
  var nPV = cumulativeCF.reduce(getSum);
  document.getElementById("outPay").value = nPV.toFixed(2);
  //Payback
  document.getElementById("payback").value = payback;
  //CO2 offset
  var co2Offset = 0.000744 * generation.reduce(getSum); //metric tons co2/kWh
  document.getElementById("outCO2").value = co2Offset.toFixed(2);
  document.getElementById("system1").value = parseFloat(totalCost);
  document.getElementById("system2").value = (parseFloat(totalCost) -totalIncentives).toFixed(2);
}

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
      break;
    case "backup":
      document.getElementById("batteryCost").value = 316;
      document.getElementById("numberBatteries").value = 16;
      break;
    case "netZero":
      document.getElementById("batteryCost").value = 1745;
      document.getElementById("numberBatteries").value = 27;
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
    document.getElementById("macrs").hidden = true;//false

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
