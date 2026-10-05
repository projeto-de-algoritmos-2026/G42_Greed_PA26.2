# UrbanRoutingDelivery - Roteamento e Agendamento Logístico

O **UrbanRoutingDelivery** é um sistema logístico avançado que combina duas abordagens algorítmicas para otimização de entregas. O sistema possui uma arquitetura de módulo duplo: o primeiro focado na roteirização inteligente pela malha urbana, e o segundo focado em maximizar a agenda de trabalho do entregador, garantindo a maior eficiência operacional possível.

## Vídeo de Apresentação

[Link para o vídeo da apresentação](URL_AQUI)

## Módulo 1: Grafos (Dijkstra)

Implementado em `src/graphs/`, este módulo resolve o problema de deslocamento ao encontrar o menor caminho entre dois pontos na malha urbana. Utilizando o Algoritmo de Dijkstra sobre um grafo ponderado, o sistema calcula a rota com o menor custo (distância) para o entregador.

## Módulo 2: Algoritmos Ambiciosos (Interval Scheduling)

Implementado em `src/greedy/`, este módulo lida com a otimização da agenda de entregas (*Interval Scheduling*). Ele recebe dinamicamente uma lista de tarefas, cada uma com horário de início e fim. 

O objetivo é maximizar o número total de entregas feitas por um único entregador, rejeitando tarefas que se sobrepõem. Para isso, utilizamos a estratégia gulosa baseada na heurística **Earliest Finish Time First** (sempre selecionar a tarefa compatível que termina mais cedo). A complexidade de tempo do algoritmo é $O(N \log N)$, impulsionada pela etapa inicial de ordenação das tarefas.

## Como rodar o projeto

**1. Compilando o executável C++**
Na raiz do repositório, execute os comandos do CMake:
```bash
cmake -S UrbanRoutingDelivery -B UrbanRoutingDelivery/build && cmake --build UrbanRoutingDelivery/build