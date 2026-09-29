#include "graph.hpp"
#include <queue>
#include <algorithm>

Graph::Graph(int numNodes) : numNodes(numNodes), adjacencyList(numNodes) {}

void Graph::addDirectedEdge(int source, int target, double weight) {
    if (source < 0 || source >= numNodes || target < 0 || target >= numNodes) {
        throw std::out_of_range("Node index out of bounds");
    }
    adjacencyList[source].push_back({target, weight});
}

void Graph::addUndirectedEdge(int nodeA, int nodeB, double weight) {
    addDirectedEdge(nodeA, nodeB, weight);
    addDirectedEdge(nodeB, nodeA, weight);
}

PathResult Graph::calculateShortestPath(int source, int target) const {
    if (source < 0 || source >= numNodes || target < 0 || target >= numNodes) {
        throw std::out_of_range("Node index out of bounds");
    }

    std::vector<double> minCosts(numNodes, std::numeric_limits<double>::infinity());
    std::vector<int> predecessors(numNodes, -1);
    
    using QueueElement = std::pair<double, int>;
    std::priority_queue<QueueElement, std::vector<QueueElement>, std::greater<QueueElement>> priorityQueue;

    minCosts[source] = 0.0;
    priorityQueue.push({0.0, source});

    while (!priorityQueue.empty()) {
        auto [currentCost, currentNode] = priorityQueue.top();
        priorityQueue.pop();

        if (currentNode == target) {
            break;
        }

        if (currentCost > minCosts[currentNode]) {
            continue;
        }

        for (const auto& edge : adjacencyList[currentNode]) {
            double newCost = currentCost + edge.weight;
            
            if (newCost < minCosts[edge.targetNode]) {
                minCosts[edge.targetNode] = newCost;
                predecessors[edge.targetNode] = currentNode;
                priorityQueue.push({newCost, edge.targetNode});
            }
        }
    }

    PathResult result;
    result.totalCost = minCosts[target];

    if (result.totalCost != std::numeric_limits<double>::infinity()) {
        int current = target;
        while (current != -1) {
            result.path.push_back(current);
            current = predecessors[current];
        }
        std::reverse(result.path.begin(), result.path.end());
    }

    return result;
}