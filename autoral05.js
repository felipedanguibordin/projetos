function getcep () {
  var req = new XMLHttpRequest()
req.open('GET', 'https:/viacep.com.br/ws/' + '85506610' + '/json/', true);
req.onreadystatechange = function() {
  console.log(req.response);
}
console.log(`O cep é ${req}!`)
}
