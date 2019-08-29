function getData(){
  var sheet = SpreadsheetApp.openById("179xeek6vPb7Qt1Cd1G5tAjG4zNko5mlpeoMdDHmi_64").getSheetByName("Aba 1");
  var matrix = sheet.getDataRange().getValues();

  
   // define como constante as colunas da planilha de acordo com os nomes
  const NOME_PRODUTO = Math.floor(matrix[0].indexOf("Name"));
  const PRECO = Math.floor(matrix[0].indexOf("Price"));
  const LINK = Math.floor(matrix[0].indexOf("URL"));
  
  const EMAIL = "automacao@raccoon.ag"
  const ASSUNTO = "[Treinamento URLs] Igor";
 
  
  const KABUM1 = findMinKabum1(sheet, matrix, LINK, NOME_PRODUTO, PRECO, 1);
  const ADIAS = findMinADias(sheet, matrix, LINK, NOME_PRODUTO, PRECO, 2);
  const EFACIL = findMinEFacil(sheet, matrix, LINK, NOME_PRODUTO, PRECO, 3);
  const POLISHOP1 = findMinPolishop(sheet, matrix, LINK, NOME_PRODUTO, PRECO, 4);
  const POLISHOP2 = findMinPolishop(sheet, matrix, LINK, NOME_PRODUTO, PRECO, 5);
  const KABUM2 = findMinKabum2(sheet, matrix, LINK, NOME_PRODUTO, PRECO, 6);
 
  var mensagem = "Produtos, valores mínimos e URL's \n";
  mensagem = mensagem.concat(KABUM1,"\n", ADIAS,"\n",EFACIL,"\n", POLISHOP1,"\n", POLISHOP2,"\n",KABUM2);
  MailApp.sendEmail(EMAIL, ASSUNTO, mensagem); 
  
}


function findMinKabum1(sheet, matrix, LINK, NOME_PRODUTO, PRECO, linha){
  const REGEX_NOME = new RegExp(/"name":"(.*?)","/g);
  const REGEX_PRECO = new RegExp(/"price":(.*?),"/g);
  const REGEX_DISPONIVEL = new RegExp(/"available":(.*?)}/g);
  var precos = [];
  var nomes = [];
  var aux;
  const TEXTO =  UrlFetchApp.fetch(matrix[linha][LINK]).getContentText();
  const URL = matrix[linha][LINK];
  // procura por várias ocorrências da regex no texto
  aux = REGEX_PRECO.exec(TEXTO);
  while(aux != null){
    if(REGEX_DISPONIVEL.exec(TEXTO)[1] == "true"){
      precos.push(parseFloat(aux[1]));
      nomes.push(REGEX_NOME.exec(TEXTO)[1]);
    }
    aux = REGEX_PRECO.exec(TEXTO);
  }
  // procura o menor preço
  const MENOR = Math.min.apply(null,precos);
  const IDX = precos.indexOf(MENOR);
  
  // atualiza valores na planilha
  sheet.getRange(linha + 1, PRECO+1).setValue(MENOR);
  sheet.getRange(linha + 1, NOME_PRODUTO+1).setValue(nomes[IDX]);
  
  // concatena no padrão final
  return "Produto: " + nomes[IDX] + "  |  Valor: R$ " + MENOR + "   | URL: " + URL;
}

function findMinKabum2(sheet, matrix, LINK, NOME_PRODUTO, PRECO, linha){
  const REGEX_NOME = new RegExp(/[0-9]","name":"(.*?)"/g);
  const REGEX_PRECO = new RegExp(/"price":(.*?),"/g);
  const REGEX_DISPONIVEL = new RegExp(/"available":(.*?)}/g);
  var precos = [];
  var nomes = [];
  var aux;
  const TEXTO =  UrlFetchApp.fetch(matrix[linha][LINK]).getContentText();
  const URL = matrix[linha][LINK];
  // procura por várias ocorrências da regex no texto
  aux = REGEX_PRECO.exec(TEXTO);
  while(aux != null){
    if(REGEX_DISPONIVEL.exec(TEXTO)[1] == "true"){
      precos.push(parseFloat(aux[1]));
      nomes.push(REGEX_NOME.exec(TEXTO)[1]);
    }
    aux = REGEX_PRECO.exec(TEXTO);
  }
  // procura o menor preço
  const MENOR = Math.min.apply(null,precos);
  const IDX = precos.indexOf(MENOR);
  
  // atualiza valores na planilha
  sheet.getRange(linha + 1, PRECO+1).setValue(MENOR);
  sheet.getRange(linha + 1, NOME_PRODUTO+1).setValue(nomes[IDX]);
  
  // concatena no padrão final
  return "Produto: " + nomes[IDX] + "  |  Valor: R$ " + MENOR + "   | URL: " + URL;
}

function findMinADias(sheet, matrix, LINK, NOME_PRODUTO, PRECO, linha){
  const REGEX_NOME = new RegExp(/pproductsname: \["(.*?)"],/g);
  const REGEX_PRECO = new RegExp(/ecomm_totalvalue: \[(.*?)\]/g);
  var nomes, precos;
  const TEXTO =  UrlFetchApp.fetch(matrix[linha][LINK]).getContentText();
  const URL = matrix[linha][LINK];
  // procura pelo padrão no texto
  precos = REGEX_PRECO.exec(TEXTO);
  nomes = REGEX_NOME.exec(TEXTO);
  
  // transforma nomes e preços em arrays
  precos = precos[1].split(",");
  nomes = nomes[1].split('","');
  
  // transforma cada string em float do array de preços
  precos.forEach(function(float, idx) {precos[idx] = parseFloat(float);});

  const MENOR = Math.min.apply(null,precos);
  const IDX = precos.indexOf(MENOR);
  
  // atualiza valores na planilha
  sheet.getRange(linha + 1, PRECO+1).setValue(MENOR);
  sheet.getRange(linha + 1, NOME_PRODUTO+1).setValue(nomes[IDX]);
  
  return "Produto: " + nomes[IDX] + "  |  Valor: R$ " + MENOR + "   | URL: " + URL;
}

function findMinEFacil(sheet, matrix, LINK, NOME_PRODUTO, PRECO, linha){
  const REGEX_NOME = new RegExp(/id="nameProduct" value="(.*?)"/g);
  const REGEX_PRECO = new RegExp(/itemprop="price" content="(.*?)"/g);
  var nomes, precos;
  const TEXTO =  UrlFetchApp.fetch(matrix[linha][LINK]).getContentText();
  const URL = matrix[linha][LINK];
  
  // procura pelo padrão no texto
  precos = parseFloat(REGEX_PRECO.exec(TEXTO)[1]);
  nomes = REGEX_NOME.exec(TEXTO)[1];
  
  // se estiver disponível faz o que é necessário
  if(/"available": 		"(.*?)"/g.exec(TEXTO)[1] == "true"){
    // atualiza valores na planilha
    sheet.getRange(linha + 1, PRECO+1).setValue(precos);
    sheet.getRange(linha + 1, NOME_PRODUTO+1).setValue(nomes);
    return "Produto: " + nomes + "  |  Valor: R$ " + precos + "   | URL: " + URL;
  }
  else{
    return "Produto indisponível na URL: " + URL;
  }
}


function findMinPolishop(sheet, matrix, LINK, NOME_PRODUTO, PRECO, linha){
  const REGEX_NOME = new RegExp(/class="product-name"><a title="(.*?)"/g);
  const REGEX_PRECO = new RegExp(/Por:<\/span><strong>R\$ (.*?)</g);
  var precos = [];
  var nomes = [];
  var aux;
  const TEXTO =  UrlFetchApp.fetch(matrix[linha][LINK]).getContentText();
  const URL = matrix[linha][LINK];
  // procura por várias ocorrências da regex no texto
  aux = REGEX_PRECO.exec(TEXTO);
  while(aux != null){
    precos.push(parseFloat(aux[1].replace(",", ".")));
    aux = REGEX_PRECO.exec(TEXTO);
    nomes.push(REGEX_NOME.exec(TEXTO)[1]);
  }
  
  // procura o menor preço
  const MENOR = Math.min.apply(null,precos);
  const IDX = precos.indexOf(MENOR);
  
  // atualiza valores na planilha
  sheet.getRange(linha + 1, PRECO+1).setValue(MENOR);
  sheet.getRange(linha + 1, NOME_PRODUTO+1).setValue(nomes[IDX]);
  
  // concatena no padrão final
  return "Produto: " + nomes[IDX] + "  |  Valor: R$ " + MENOR + "   | URL: " + URL;
}
    