import random

def jogar_adivinhacao():
    numero_secreto = random.randint(1, 100)
    tentativas = 0
    pontuacao = 1000

    print("Bem-vindo ao jogo da adivinhação!")
    print("O número secreto está entre 1 e 100.")

    while True:
        palpite = int(input("Qual é o seu palpite? "))
        tentativas += 1

        if palpite == numero_secreto:
            print(f"Parabéns, você acertou em {tentativas} tentativas!")
            print(f"Sua pontuação final é {pontuacao}.")
            break
        elif palpite > numero_secreto:
            print("Seu palpite foi alto demais!")
        else:
            print("Seu palpite foi baixo demais!")

        pontuacao -= abs(numero_secreto - palpite) * 10

    print("Obrigado por jogar!")

if __name__ == "__main__":
    jogar_adivinhacao()