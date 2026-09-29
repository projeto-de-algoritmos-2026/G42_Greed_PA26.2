cmake_minimum_required(VERSION 3.10)
project(UrbanRoutingDelivery)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(urban_router
    src/main.cpp
    src/graphs/graph.cpp
    src/router.cpp
)

target_include_directories(urban_router PRIVATE src src/graphs)
