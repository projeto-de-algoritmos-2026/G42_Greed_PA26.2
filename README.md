# UrbanRoutingDelivery - Roteamento e Agendamento Logístico

O **UrbanRoutingDelivery** é um sistema logístico duplo e robusto projetado para solucionar problemas complexos do mundo real. Nossa solução integra roteamento inteligente e otimização de agenda de trabalho, resolvendo desafios de Roteamento através da Teoria dos Grafos e problemas de Agendamento utilizando Algoritmos Ambiciosos (Greedy).

## Vídeo de Apresentação

[Link para o vídeo da apresentação](https://youtu.be/WrGcgliPeXk)

## Arquitetura do Sistema

Nossa aplicação foi desenvolvida utilizando uma arquitetura Full-Stack moderna e dividida em três camadas fortemente integradas:
- **Frontend (React + Tailwind CSS):** Interface gráfica interativa. O Frontend envia requisições dinâmicas para o Backend para consultar rotas e agendamentos.
- **API Backend (Express / Node.js):** Camada intermediária de comunicação. Recebe as requisições HTTP do Frontend e, via `child_process`, executa o motor de cálculos matemático.
- **Motor de Roteamento (C++17):** O núcleo de alta performance estruturado em binário C++ encapsula as estruturas de dados complexas e a lógica bruta dos algoritmos.

## Módulo 1: Grafos (Dijkstra)

O módulo de Roteamento resolve o problema clássico de deslocamento, encontrando o menor caminho entre dois pontos dentro de uma malha urbana. Utilizando o Algoritmo de Dijkstra aplicado sobre um grafo ponderado, este módulo garante a descoberta da rota de menor custo, viabilizando as entregas no menor tempo e distância possíveis.

## Módulo 2: Algoritmos Ambiciosos (Interval Scheduling)

O módulo de Agendamento aborda o problema de maximizar o número de entregas realizadas por um único entregador sem que os horários se sobreponham. 
Para isso, aplicamos a modelagem de *Interval Scheduling* empregando a heurística gulosa **Earliest Finish Time First** (sempre escolhemos a tarefa compatível que termina mais cedo). Essa estratégia garante uma solução ótima global. A complexidade de tempo do algoritmo é de **$O(N \log N)$**, determinada predominantemente pela etapa inicial de ordenação (sorting) cronológica de todas as tarefas de entrega disponíveis.

## Guia de Execução

Siga rigorosamente os 3 passos abaixo para iniciar a aplicação completa em seu ambiente local.

### Passo 1: Compilar o Motor C++
Na raiz do projeto, gere os arquivos de compilação e faça o build do executável:
```bash
cmake -S UrbanRoutingDelivery -B UrbanRoutingDelivery/build && cmake --build UrbanRoutingDelivery/build