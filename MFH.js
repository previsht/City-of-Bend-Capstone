function run() {
  // System Information & loose variables
  //alert(loadProfile.reduce(getSum))
  //Jan. Feb. March April May June July Aug. Sept. Oct. Nov. Dec.
  //numbers are in kilowatt hours per month
  var itcMacrsOffset = 1,batteryCosts=0;
  var macrs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var panelEfficiancyLosses = [0, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015, 0.015];
    var generation, numberOfPanels, installationCosts, inverterReplacement, i;
      generation = [6426, 8017, 12661, 14026, 15994, 16243, 17965, 17123, 15781, 10663, 5639, 4799];
      numberOfPanels = 321;
      installationCosts = 155825;
      inverterReplacement = [0, 0, 0, 0, 0, 0, 0, 0, 0, 21456, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  //Read in Power Cost and generation
  var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  var costPerKWh = document.getElementById("energyCost").value;
  for (i = 0; i < 12; i++) {
    var monthlySavings = generation[i] * costPerKWh;
    var num = monthlySavings.toString();
    var output = "$" + parseFloat(num).toFixed(2);
    document.getElementById(months[i]).innerHTML = output;
  }

  //Calculate total savings
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
      var subCost = costWatt * 91450;
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
      var subCostU = costWattU * 91450;
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
    cumulativeCF[n + 1] = +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - (inverterReplacement[n] * pVF);
    npvCost = +npvCost  + (inverterReplacement[n] * pVF);
    k = cumulativeCF.reduce(getSum);
    discountCF= discountCF +((yearlySavings[n] + macrsSavings[n] + incentiveSavings[n]) * pVF) - (inverterReplacement[n] * pVF);//current cash flow
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
