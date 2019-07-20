function getData(){
  var sheet = SpreadsheetApp.openById("1_0KJ83aL6JrIY1Cp-ROM8es5-NSqYrgGQ6-xnLP61qw").getSheetByName("Produtos");
  var matrix = sheet.getDataRange().getValues();
  
  // define como constante as colunas da planilha de acordo com os nomes
  const PRODUTO = Math.floor(matrix[0].indexOf("Produto"));
  const PRECO_CONTROLE = Math.floor(matrix[0].indexOf("Preço controle"));
  const PRECO_SITE = Math.floor(matrix[0].indexOf("Preço site"));
  const LINK = Math.floor(matrix[0].indexOf("Link"));
  
  // regex para buscar o preço do site
  const REGEX = new RegExp(/"price":(.*?),"category"/);
  
  const EMAIL = "automacao@raccoon.ag"
  const ASSUNTO = "Processo Seletivo - Produtos com preços incompatíveis";
  const CODIGOJS = "https://github.com/igorbianchi/AutomacaoRaccoon/blob/master/script.js"
  
  var produtos = [];
  var precos_controle = [];
  var precos_site = [];
  var valor_inserido;
  
  //laço para verificar todos os produtos que vieram da planilha, começa em 1 pois a primeira linha (linha 0) é o cabeçalho
  for(var i = 1; i < matrix.length; i++){
    // retorna o valor do site que foi inserido na planilha para que seja feita a comparação
    valor_inserido = setSheet(sheet, matrix, LINK, PRECO_SITE, i, REGEX);
    
    if(matrix[i][PRECO_CONTROLE] != valor_inserido){ // se o valor do site é diferente da planilha, adiciona os valores desejados para o email em vetores
      produtos.push(matrix[i][PRODUTO]);
      precos_controle.push(matrix[i][PRECO_CONTROLE]);
      precos_site.push(matrix[i][PRECO_SITE]);
    }
  }
  
  if(produtos.length > 0){ //se teve um produto que o valor foi dsiferente entre site e planilha, aciona a função que envia o email
    var mensagem = sendEmail(produtos, precos_controle, precos_site, EMAIL, ASSUNTO, CODIGOJS);
  }    
}

// função para atualizar valores na planilha
function setSheet(sheet, matrix, LINK, PRECO_SITE, linha, REGEX){
  // recebe os dados do link informado na planilha e busca pela regex
  contentText = UrlFetchApp.fetch(matrix[linha][LINK]).getContentText();  
  var valor_inserido = REGEX.exec(contentText);
  
  if(valor_inserido != null){ // verifica se conseguiu dar match com a regex
    sheet.getRange(linha+1, PRECO_SITE + 1).setValue(valor_inserido[1]);
    return valor_inserido[1];
  }
  else{ //caso não tenha dado certo a busca pela regex, amntém o valor atual na planilha
    return matrix[linha][colunaPrecoSite];
  }
}

//função para criar a mensagem e enviar para o email
function sendEmail(produtos, precos_controle, precos_site, EMAIL, ASSUNTO, CODIGOJS){
  var mensagem = "Produtos com valores diferentes entre a planilha e o site:\n";
  for(var i = 0; i < produtos.length; i++){
     mensagem = mensagem.concat(produtos[i], ", Preço de controle: R$ ", precos_controle[i], ", Preço no site: R$ ", precos_site[i], "\n");
  }
  mensagem = mensagem.concat("\nLink para o código do script: ", CODIGOJS, "\n");
  MailApp.sendEmail(EMAIL, ASSUNTO, mensagem);
}  