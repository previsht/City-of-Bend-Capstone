function run() {
  // total generation
  var cO2generation = [30318, 34698, 68208, 71076, 84977, 83097, 90489, 84836, 74382, 52935, 29370, 26757];
  //initialize variables
  var itcMacrsOffset = 1;
  var macrs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var batteryCosts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //Is an array of zeroes the length of systemLife
  var panelEfficiancyLosses = [0, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015]; //Is an array the length of systemLife
  //pull battery costs
  var batteryCost = document.getElementById("batteryCost").value;
  var numberOfBatteries = document.getElementById("numberBatteries").value;
  var totalBatteryCost = batteryCost * numberOfBatteries;
  var generation1,generation2, numberOfPanels, installationCosts, inverterReplacement, i, fixedCostsSavings,iBatteryCosts;
  //choose storage option
  switch (getCheckedRadioValue("storageOption")) {
    case "none":
      generation1 = [0, 726, 5871, 7062, 9002, 7088, 6191, 5647, 5794, 1101, 0, 0];
      generation2 = [7579, 7948, 11181, 10707, 12242, 13686, 16431, 15562, 12800, 12132, 7343, 6689];
      iBatteryCosts = 0;
      numberOfPanels = 1444;
      installationCosts = 843150;
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 57925, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      fixedCostsSavings = [92.56,91.22,118.43,130.80,139.7,141.16,138.13,151.09,164.26,113.13,81.07,81.69];
      break;
    case "TOU":
      generation1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      generation2 = [587.51,666.75,1335.36,1333.64,1627.3,1540.23,1727.43,1771.71,1671.44,1039.21,564.79,530.2];
      iBatteryCosts = totalBatteryCost+27282+10995;
      batteryCosts[9] = totalBatteryCost;
      numberOfPanels = 1444;
      installationCosts = 843150 ; //1305395
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 68920, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      fixedCostsSavings = [113.68,112.33,107.49,154.33,5.32,162.83,158.57,174.94,189.38,135.18,100.69,101.67];
      break;
    
  }
  //Read in Power Cost
  var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  var costPerKWh1 = document.getElementById("energyCost1").value;
  var costPerKWh2 = document.getElementById("energyCost2").value;
  for (i = 0; i < 12; i++) {
    var monthlySavings =((generation2[i] * costPerKWh2)+ (generation1[i] * costPerKWh1) + fixedCostsSavings[i])*4;
    var num = monthlySavings.toString();
    var output = "$" + parseFloat(num).toFixed(2);
    document.getElementById(months[i]).innerHTML = output;
  }
  //Calculate total savings
  var yearOneSaving =((generation2.reduce(getSum) * costPerKWh2)+ (generation1.reduce(getSum) * costPerKWh1) + fixedCostsSavings.reduce(getSum))*4;
  document.getElementById("outSave").value = yearOneSaving.toFixed(2);
//read in incentives
  var itc = 0.0,state = 0.0,utility = 0.0,percent = 0.0,flat = 0.0;
  if (document.getElementById("taxed").checked === true) {
    if (document.getElementById("itc").checked === true) {
      itc = document.getElementById("itcPercent").value;
    }
    var stateMax = document.getElementById("stateMax").value;
    if (document.getElementById("state").checked === true) {
      var costWatt = document.getElementById("statePercent").value;
      var subCost = costWatt * 497000;
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
      var subCostU = costWattU * 497000;
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
  var yearlyGeneration1 = generation1.reduce(getSum);
  var yearlyGeneration2 = generation2.reduce(getSum);//sum of generation array
  var generationArray2 = [],generationArray1 = [],macrsSavings = [],yearlySavings = [];
  // Determine cost and savings over the lifetime of the array
  for (i = 0; i < systemLength + 1; i++) {
    yearlyGeneration1 = yearlyGeneration1 - (yearlyGeneration1 * panelEfficiancyLosses[i]);
    yearlyGeneration2 = yearlyGeneration2 - (yearlyGeneration2 * panelEfficiancyLosses[i]);
    generationArray1[i] = yearlyGeneration1;
    generationArray2[i] = yearlyGeneration2;
    macrsSavings[i] = totalCost * itcMacrsOffset * macrs[i];
    yearlySavings[i] = ((generationArray2[i] * costPerKWh2)+(generationArray1[i] * costPerKWh1) +fixedCostsSavings.reduce(getSum)) * 4;
  }

  // Determining present value
  var discountRate = document.getElementById("discountRate").value / 100;
  var cumulativeCF = [],npvSavings = 0,npvCost = 0,pVF,k,payback,done=false;
  cumulativeCF[0] = -(totalCost+iBatteryCosts);
  npvCost = totalCost +iBatteryCosts;
  var discountCF = -(totalCost+iBatteryCosts);
  var totalTaxSavings = taxIncentive;
  var totalIncentives = incentiveSavings[0];
  //alert(cumulativeCF.reduce(getSum))
  for (var n = 0; n < 20; n++) {
    // Present value factor
    pVF = 1 / Math.pow(1 + discountRate, n + 1);
    cumulativeCF[n + 1] = +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - ((batteryCosts[n]) * pVF) - (inverterReplacement[n] * pVF);
    //discountCF = ((yearlySavings[n] + macrsSavings[n] - batteryCosts[n]) * pVF)
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
  var co2Offset = 0.000744 * cO2generation.reduce(getSum); //metric tons co2/kWh
  document.getElementById("outCO2").value = co2Offset.toFixed(2);
  document.getElementById("system1").value = parseFloat(totalCost+iBatteryCosts);
  document.getElementById("system2").value = (parseFloat(totalCost+iBatteryCosts) -totalIncentives).toFixed(2);
  
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
      document.getElementById("energyCost1").value = 0.0628;
      document.getElementById("energyCost2").value = 0.06119;
      document.getElementById("energyCost1").hidden = false;
      document.getElementById("energyCost2").hidden = false;
      document.getElementById("batteryCost").readOnly = true;
      break;
    case "TOU":
      document.getElementById("batteryCost").value = 9610;
      document.getElementById("numberBatteries").value = 14;
      document.getElementById("energyCost1").value = 1;
      document.getElementById("energyCost2").value = 1;
      document.getElementById("energyCost1").hidden = true;
      document.getElementById("energyCost2").hidden = true;
      document.getElementById("batteryCost").readOnly = false;
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