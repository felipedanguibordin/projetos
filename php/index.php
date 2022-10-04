<?php // AULA DE VARIÁVEIS!!!
// Meus dados
$nome = "Felipe Bordin";
$idade = 15;
$altura = 1.71;

echo "Meu nome é $nome, minha idade é $idade e minha altura é $altura <br>";

// Alterando meus dados
$nome = "Isabela Chaise";
$idade = 14;
$altura = 1.53;

echo "Meu nome é $nome, minha idade é $idade e minha altura é $altura <br>";
echo "<hr>";


// Se eu quiser mostra a Hilux o c(em Carro na linha 22) deverá ser minúsculo :)
$carro = "Hilux";
$Carro = "Fusca";

echo $Carro;

// Outro exemplo como o de cima ↑
$meunome = "Felipe";
$meuNome = "Isabela"

echo $meuNome;



// Nomes válidos (para variável)
// $nome
// $_meunome
// $carro10
// $nota1
// $meu_nome
// $meuNome

// Nomes inválidos (para variáveis)
// $2121nome 
// $carro*&!@#
// $meu carro





//AULA DE VARIÁVEIS DINÂMICAS
$bebida = "refrigerante";

$$bebida = "Guaraná";

echo $refrigerante // A resposta do site vai ser Guaraná!

// Outro exemplo como o de cima ↑

$destino = "cidade";

$$destino = "Ilhéus";

echo $cidade; // A resposta vai ser Ilhéus





//TIPOS DE DADOS
/****** Escalares ******/

// string
$nome = "Olá mundo";
var_dump($nome); // O var_dump vai dar mais informações sobre a variável $nome por exemplo :)
if(is_string($nome)):
    echo "É uma string"; // No caso a resposta certa é essa, mas se por exemplo a variável fosse {$nome = 123;} a resposta correta iria ser não é uma string ✓
else:
    echo "Não é uma string";
endif; 


// int
$idade = 27.5;
var_dump($idade); // O var_dump vai dar mais informações sobre a variável $idade por exemplo :)
if(is_int($idade)):
    echo "É um inteiro";
else:
    echo "Não é um inteiro"; // No caso a resposta certa é essa, mas se por exemplo a variável fosse {$idade = 27;} a resposta correta seria é um inteiro ✓
endif;


// float
$altura = 1.77;
var_dump($altura); // O var_dump vai dar mais informações sobre a variável $altura por exemplo :)
if(is_float($altura)):
    echo "É um float"; // No caso a resposta certa é essa, mas se por exemplo a variável fosse {$altura = 123;} a resposta correta iria ser não é um float ✓
else:
    echo "Não é um float"; 
endif;


// boolean
$admin = false; // O valor da variável também poderia ser true
var_dump($admin); // O var_dump vai dar mais informações sobre a variável $admin por exemplo :)
if(is_bool($admin)):
    echo "É um boolean"; // No caso a resposta certa é essa, mas se por exemplo a variável fosse {$admin = Rogério70 ou (qualquer coisa diferente de true e false)} a resposta correta iria ser não é um boolean ✓
else:
    echo "Não é um boolean";
endif;



/****** Compostos ******/

// array
$carros = array("Gol", "Uno", "Camaro", 12, 20.6, true); // É uma variável que pode guardar mais de um valor, além de aceitar todos os dados escalares 
var_dump($carros);
if(is_array)($carros):
    echo "É um array"; // A resposta certa é essa, porém se ouvesse apenas um valor a resposta seria não é um array ✓
else:
    echo "Não é um array";
endif;


// object
class Cliente {
    public $nome;
    public function atribuirNome($nome) {
        $this -> $nome = $nome; // Se tu naum enendeu tamo na mesma 
    }
}

$cliente = new Cliente();
$cliente -> atribuirNome("Antonio"); // Acho que entendi (não entendi não)
var_dump($cliente);
if(is_object($cliente)):
    echo "É um object"; // Sei que a resposta é essa mas não sei o motivo ✓
else:
    echo "Não é um object";
endif;


/****** Especiais ******/
// NULL
$cidade = NULL; // É usado quando a variável não tem um valor 
var_dump($cidade);





//ASPAS SIMPLES, ASPAS DUPLAS E CONCATENAÇÃO


// Aspas simples
$nome = 'Rodrigo Oliveira'; // Tudo que estiver entre aspas simples vai ser considerado texto
echo 'Meu nome é $nome'; // Nesse caso a resposta seria: Meu nome é $nome. Já que as aspas simples(''), são literais e não vão ser interpretadas 

// Para o echo de cima ↑ funcionar de maneira correta deve ser feito uma concatenação
echo 'Meu nome é '.$nome. ' e minha idade é 23';


// Aspas duplas
$carro = "Gol";
echo "Meu carro é $carro"; // Já as aspas duplas são interpretativas, se uma variável sor inscerida no meio dela a resposta sairá da maneira correta





//ESCOPO DE VARIÁVEIS


$nome = "Felipe Bordin"; // Está variavel esta no escopo global e para executar uma function deve ser chamada dentro dessa função 
$a = 1; // Essa variável vai ser usada na linha 197 do código
$b = 3; // Essa variável vai ser usada na linha 197 do código
$c = 7; // Essa variável vai ser usada na linha 197 do código
// Escopo global ↑
function exibeNome() {
    global $nome; // Essa é a maneira de como chamar uma variável global dentro da function
    echo $nome;
}

exibeNome();


// Outro exemplo como o de cima ↑

function exibeCidade() {
// Escopo local ↓
    global $cidade;
    $cidade = "Rio de Janeiro"; // Esse variável está no escopo local e para acessar ela é necessario definir ela como global
}

exibeCidade();


// Outra forma de acessar variáveis de escopo global 🌍

function soma() {
    echo $GLOBALS['a'] + $GLOBALS['b'] + $GLOBALS['c']; // Essa é outra forma de chamar variávei de escopo global, usando a variável implementada no php ($GLOBALS)
}

soma(); 





//CONSTANTES 
define("NOME", "José Carlos"); // Esse valor não pode alterar durante a execução do script 
echo NOME;





//ARRAYS
/****** Arrays Numéricos ******/
    // a maneira que o array organiza é por números, sendo feito desse jeito ↓
             //   0       1       2
$carros = array("BMW", "Hilux", "Audi"); // Os arrays são utilizados qunado você tem um grande número de variáveis, e para não perder muito tempo escrevendo tantas ele junta tudo em uma só passando valores de 0 a infinito
$carros[] = "Porche"; // Essa é uma maneira de adicionar uma variável a um array 
print_r ($carros); // O print_r é uma função especifica para mostrar arrays (ela traz informação do nome e da posição da variável)
echo $carros[0]; // Para mostrar uma variável que está em um array é nessecario passar o seu indice, por exemplo a BMW é o indice 0 


// Count
echo count($carros); // Vai mostrar a quantidade de elementos que tem em um array


// Foreach
foreach($carros as $valor) { //Foreach quer dizer para cada, então todos os elementos do array carros vai ser atribuido a variável valor 
    echo $valor; // Nesse caso ele vai percorrer todo o elemento e retornar todos os carros (BMW, Hilux, Audi, Porche)

}


/****** Arrays Associativos ******/
$pessoa = array("nome" => "Felipe", "idade" => 15, "altura" => 1.70); // Ao invez de inteiros são utilizadas strings em arrays associativos 
echo $pessoa["nome"];

foreach($pessoa as $indice => $valor) {
    echo $indice. ":" .$valor;
}


/****** Arrays Multidimensionais ******/
$times = array("Cariocas" => array("Vasco", "Flamengo", "Botafogo"), 
               "Paulistas" => array("São Paulo", "Corinthians", "Santos"), 
               "Baianos" => array("Bahia", "Vitória", "Itabuna")); // É um array dentro de um array, utilizado principalmente para separar informações distintas 
echo $times["Cariocas"][1]; // A resposta do site vai ser Flamengo (os parametros que estão entre [] servem como um filtro para achar exatamente o valor desejado dentro de um array)





//FUNÇÕES DE ARRAY
/*
* is_array($array) = verificar se uma determinada variável é um array
* in_array($valor, $array) = verificar se um determinado valor existe em alguma posição do array
* array_keys($array) = retorna um novo array com as chaves do array passado como parâmetro
* array_values($array) = retorna um novo array com os valores do array passado como parâmetro 
* array_marge($array1, $array2) = agrega o conteúdo dos dois arrays 
* array_pop($array) = exclui a última posição do array
* array_shift($array) = exclui a primeira posição do array
* array_unshift($arr, "valor") = adiciona um ou mais elementos no início do array
* array_push($array, "valor", "valor") = adiciona um ou mais elelmentos no final do array
* array_combine($keys, $values) = mescla os dois arrays passados 
* array_sum() = calcula a soma dos elementos do array
* explode("/", "20/01/2001") = transforma string em array
* implode("-", $arr) = transforma array em string
*/





//CONDICIONAIS 
/*
* if (Tradução: se)
* else (Tradução: senão)
* elseif (Tradução: senão se)
*/

$numero = 7;

if ($numero == 10):
    echo "É igual a 10";

elseif($numero <= 9):
    echo "É menor ou igual a 9";

else: 
    echo "É diferente de 10";

endif;


// Outro exemplo como o de cima ↑
$media = 8;

echo ($media >= 7) ? "Aprovado!" : "Reprovado!";


// Switch e Case
$cor = "roxo";

switch ($cor):
    case "vermelho":
        echo "Sua cor preferida é o vermelho.";
        break;
    case "roxo":
        echo "Sua cor preferida é o roxo.";
        break;
    case "preto":
        echo "Sua cor preferida é o preto.";
    default:
        echo "Sua cor preferida não é vermelho, roxo ou preto."
endswitch;





//OPERADORES ARITMETICOS

// São usados com valores numéricos para executar operações aritiméticas comuns, como adição, subtração, multiplicação etc.

/*
* Adição +
* Subtração -
* Multiplicação * 
* Divisão /
* Módulo %
* Exponenciação ** 
*/

echo 10 + 10; // Resposta = 20 ✓
echo 25 - 5; // Resposta = 20 ✓
echo 5 * 4; // Resposta = 20 ✓
echo 40 / 2; // Resposta = 20 ✓
echo 120 % 10; // Resposta = 20 ✓
echo 3 ** 5; // Resposta = 243 ✓


// Operadores com variável
$a = 10;
$b = 20;
$c = 30;
$d = 5;
$e = 16;

$adicao = $a + $b;
echo $adicao; // Resposta = 30 ✓

$subtracao = $c - $a;
echo $subtracao; // Resposta = 20 ✓

$multiplicacao = $d * $a;
echo $multiplicacao;  // Resposta = 50 ✓

$divisao = $c / $a;
echo $divisao;  // Resposta = 3 ✓

$modulo = $e % $d;
echo $modulo;  // Resposta = 1 ✓

$exponenciacao = $a ** $d
echo $exponenciacao;  // Resposta = 100000 ✓






//OPERADORES DE INCREMENTO E DECREMENTO 


// Servem para somar ou subtrair em (+1 ou -1) qualquer valr do tipo numérico ou string

$valor = 20;

// Pré-incremento 
echo ++$valor; // Resposta = 21 ✓

// Pós-incremento
echo $valor++;  // Resposta = 20 e na próxima chamada 21 ✓


// Pré-decremento
echo --$valor;  // Resposta = 19 ✓

// Pós-decremento
echo $valor--;  // Resposta = 20 e na próxima 19 ✓






//OPERADORES LÓGICOS


// Nos permitem fazer comparações entre expressões
// (&& - and querem dizer 'e')
// (|| - or querem dizer 'ou')
// (! quer dizer negação ou diferente)

$idade = 25;
$nome = "Felipe";

if ((idade == 25) and ($nome == "Felipe")):
    echo "É verdadeiro";
else:
    echo "É falso";
endif;





//WHILE E DO WHILE


$contador = 1;

// While

while ($contador <= 10): // While quer dizer enquanto 
    echo "Contador é $contador";
    $contador++; 
endwhile;

// Do While

do { // O Do While faz a mesma coisa que o While mas ele primeiro faz e depois verifica 

    echo "Contador é $contador";
    $contador++;
} while ($contador <= 10);






//FOR E FOREACH


// for

for ($contador = 0; $contador <= 10; $contador++): // For quer dizer 'para'
    echo "8 x $contador = ".($contador * 8); // Essa é uma meneira de calcular a tabuada de algum algarismo 
endfor;


// foreanch

$cores = array("Verde", "Vermelho", "Azul");

foreach($cores as $valor): // Foreach quer dizer 'para cada'
    echo $valor
endforeach;





//FUNÇÕES PARA STRINGS
/*
* strtoupper
* strtolower
* substr
* str_pad
* str_repeat
* strlen
* str_replace
* strpos
*/

$nome = "ISABELA";
$novoNome = strtolower; // Essa função vai transformar todas as letras em minisculas
echo $novoNome;