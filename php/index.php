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