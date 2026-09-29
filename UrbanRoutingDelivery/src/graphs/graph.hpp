#pragma once

#include <vector>
#include <limits>
#include <utility>
#include <stdexcept>

struct Edge {
    int targetNode;
    double weight;
};

struct PathResult {
    double totalCost;
    std::vector<int> path;
};

class Graph {
public:
    explicit Graph(int numNodes);

    void addDirectedEdge(int source, int target, double weight);
    void addUndirectedEdge(int nodeA, int nodeB, double weight);

    PathResult calculateShortestPath(int source, int target) const;

private:
    int numNodes;
    std::vector<std::vector<Edge>> adjacencyList;
};