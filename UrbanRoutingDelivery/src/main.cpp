#include "router.hpp"

#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    if (argc >= 2 && std::string(argv[1]) == "--schedule") {
        Router router(100);

        router.addDeliveryTask("T1", "Taguatinga", 480, 540);
        router.addDeliveryTask("T2", "Ceilandia", 500, 560);
        router.addDeliveryTask("T3", "Plano Piloto", 550, 610);
        router.addDeliveryTask("T4", "Guara", 600, 660);
        router.addDeliveryTask("T5", "Aguas Claras", 620, 680);
        router.addDeliveryTask("T6", "Asa Sul", 690, 750);

        std::cout << router.getOptimalScheduleJson() << std::endl;
        return 0;
    }

    Router router(16);

    router.addRoute("Centro de Distribuicao", "Asa Norte", 8.5);
    router.addRoute("Centro de Distribuicao", "Asa Sul", 6.0);
    router.addRoute("Asa Norte", "Lago Norte", 4.2);
    router.addRoute("Asa Sul", "Lago Sul", 5.4);
    router.addRoute("Asa Norte", "Sudoeste", 7.1);
    router.addRoute("Asa Sul", "Sudoeste", 3.9);
    router.addRoute("Sudoeste", "Taguatinga", 12.3);
    router.addRoute("Taguatinga", "Ceilandia", 9.8);
    router.addRoute("Lago Sul", "Jardim Botanico", 10.5);
    router.addRoute("Lago Norte", "Sobradinho", 14.0);
    router.addRoute("Ceilandia", "Samambaia", 6.7);
    router.addLocation("Deposito Isolado");

    if (argc < 3) {
        std::cout << "{\"status\": \"error\", \"message\": \"Usage: urban_router <source> <target>\"}"
                  << std::endl;
        return 1;
    }

    const std::string source(argv[1]);
    const std::string target(argv[2]);

    std::cout << router.getShortestPathJson(source, target) << std::endl;
    return 0;
}
