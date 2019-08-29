function report() {
  var mccAccount = AdsApp.currentAccount();
  // procura pelo id da conta
  var childAccounts = AdsManagerApp.accounts().withIds(['615-675-6174']).get();
  var childAccount = childAccounts.next();
  // seleciona a copnta desejada para verificação
  AdsManagerApp.select(childAccount);
  
  const MELHOR_CAMPANHA = generateReport();
  setBestCampaign(MELHOR_CAMPANHA);
}

function generateReport(){
  var sheet = SpreadsheetApp.openById("179xeek6vPb7Qt1Cd1G5tAjG4zNko5mlpeoMdDHmi_64").getSheetByName("Questao4");
  // seleciona o que é necessário para o relatório
  var report = AdsApp.report("SELECT CampaignName, Cost, ConversionValue " +
       "FROM CAMPAIGN_PERFORMANCE_REPORT " +
       "WHERE Cost > 0 " +
       "DURING 20190101,20190826");
  var roi = [];
  var rowsIterator = report.rows();
  // calcula o roi de cada campanha e insere no vetor
  while(rowsIterator.hasNext()){
    var campanha = rowsIterator.next();
    roi.push(parseFloat((parseFloat(campanha.formatForUpload()["Total conv. value (opt.)"].replace(/,/g,""))/parseFloat(campanha.formatForUpload()["Cost"].replace(/,/g,""))).toFixed(2)));
  }
  // exporta para a planilha
  report.exportToSheet(sheet);
  sheet.getRange(1, 4).setValue("ROI");
  // exporta o roi calculado para a respectiva campanha
  roi.forEach(function(campanha, idx) { sheet.getRange(idx+2, 4).setValue(campanha);});
  
  // calcula a campanha de melhor performance
  var MAX = Math.max.apply(null, roi);
  var IDX = roi.indexOf(parseFloat(MAX));
  const MELHOR_CAMPANHA = sheet.getDataRange().getCell(IDX+2, 1).getValue();
  
  return MELHOR_CAMPANHA;
}

function setBestCampaign(MELHOR_CAMPANHA){
  var sheet = SpreadsheetApp.openById("179xeek6vPb7Qt1Cd1G5tAjG4zNko5mlpeoMdDHmi_64").getSheetByName("Device");
  // cria os campos da planilha
  sheet.getRange(1, 1).setValue("Melhor campanha: " + MELHOR_CAMPANHA);
  sheet.getRange(2, 1).setValue("Device");
  sheet.getRange(2, 2).setValue("ROI");
  
  const DEVICE_LIST = ["DESKTOP", "HIGH_END_MOBILE", "TABLET", "CONNECTED_TV"];
  
  // para cada device, faz uma consulta no relatório da melhor campanha e calcula roi por dispositivo
  for(var i = 0; i < DEVICE_LIST.length; i++){
    var report = AdsApp.report("SELECT CampaignName, Cost, ConversionValue, Device " +
        "FROM CAMPAIGN_PERFORMANCE_REPORT " +
        "WHERE CampaignName = '" + MELHOR_CAMPANHA + "' AND Device = '" + DEVICE_LIST[i] + "' " +
        "DURING 20190101,20190826");
    var roi = parseFloat(((report.rows().next().formatForUpload()["Total conv. value (opt.)"].replace(/,/g,""))/parseFloat(report.rows().next().formatForUpload()["Cost"].replace(/,/g,""))).toFixed(2));
    sheet.getRange(i+3, 1).setValue(DEVICE_LIST[i]);
    
    // verifica se algum roi não existe
    if(!isNaN(roi)){
      sheet.getRange(i+3, 2).setValue(roi);
    }
    else{
      sheet.getRange(i+3, 2).setValue(0);
    }
  }
}
