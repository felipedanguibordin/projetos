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


// Se eu quiser mostra a Hilux o c(em echo na linha 22) deverá ser minúsculo :)
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
//$2121nome 
//$carro*&!@#
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