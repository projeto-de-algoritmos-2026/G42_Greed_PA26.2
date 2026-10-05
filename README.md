# UrbanRoutingDelivery - Roteamento e Agendamento Logístico

O **UrbanRoutingDelivery** é um sistema logístico duplo projetado para solucionar problemas complexos de otimização operacional. O sistema une com eficiência a resolução de problemas de Roteamento, utilizando a Teoria dos Grafos, e problemas de Agendamento, através de Algoritmos Ambiciosos (Greedy), fornecendo uma solução computacional completa para rotas e entregas urbanas.

## Vídeo de Apresentação

[Link para o vídeo da apresentação](https://youtu.be/WrGcgliPeXk)

## Arquitetura do Sistema

Nossa aplicação adota uma arquitetura Full-Stack moderna e modular, dividida em três camadas altamente integradas:
* **Frontend (React + Tailwind CSS):** Interface gráfica interativa que permite a visualização da malha urbana, do trajeto e da linha do tempo da agenda. O Frontend envia requisições dinâmicas à API para consulta de rotas e agendamentos.
* **API Backend (Express / Node.js):** Camada intermediária de comunicação. É responsável por orquestrar as requisições HTTP do Frontend e acionar o motor de cálculos matemático através da interface `child_process`.
* **Motor de Roteamento (C++17):** O núcleo de alta performance estruturado em um binário C++ que encapsula as estruturas de dados e executa a lógica bruta dos algoritmos.

## Módulo 1: Grafos (Dijkstra)

O módulo de Roteamento resolve o problema clássico de deslocamento na malha urbana. Implementando o **Algoritmo de Dijkstra** sobre um grafo ponderado, este módulo é capaz de encontrar o menor caminho (a rota de menor custo e distância) entre dois pontos, viabilizando rotas eficientes para o entregador.

## Módulo 2: Algoritmos Ambiciosos (Interval Scheduling)

O módulo de Agendamento foca em um desafio logístico crucial: maximizar o número de entregas realizadas por um único entregador sem que haja sobreposição de horários em sua agenda. 

Para solucionar isso, modelamos a situação através do problema de *Interval Scheduling* e utilizamos a heurística gulosa **Earliest Finish Time First** (sempre escolhemos a tarefa compatível que termina mais cedo). Essa abordagem garante matematicamente uma solução ótima global. A complexidade de tempo do algoritmo é de **$O(N \log N)$**, ditada pela etapa inicial obrigatória de ordenação cronológica de todas as tarefas.

## Guia de Execução

Siga rigorosamente as 3 etapas abaixo para compilar e iniciar o projeto completo em seu ambiente local.

### Passo 1: Compilar o Motor C++
Na raiz do repositório, gere os arquivos de configuração e faça a compilação do binário:
```bash
cmake -S UrbanRoutingDelivery -B UrbanRoutingDelivery/build && cmake --build UrbanRoutingDelivery/build
```

### Passo 2: Iniciar a API (Backend)
Navegue até a pasta da API, instale as dependências e inicie o servidor (ele rodará na porta `3000`):
```bash
cd UrbanRoutingDelivery/api
npm install
npm start
```

### Passo 3: Iniciar o Frontend
Em um novo terminal (mantendo a API rodando no primeiro), navegue até a pasta do Frontend, instale as dependências e inicie a interface:
```bash
cd UrbanRoutingDelivery/frontend
npm install
npm run dev
```