#ifndef SCHEDULER_HPP
#define SCHEDULER_HPP

#include <string>
#include <vector>

struct DeliveryTask {
    std::string id;
    std::string destination;
    int startTime;
    int endTime;
};

struct ScheduleResult {
    std::vector<DeliveryTask> selectedTasks;
    std::vector<DeliveryTask> rejectedTasks;
    int totalScheduled;
};

class DeliveryScheduler {
public:
    void addTask(const std::string& id, const std::string& destination, int startTime, int endTime);
    void clearTasks();
    ScheduleResult calculateOptimalSchedule() const;

private:
    std::vector<DeliveryTask> tasks;
};

#endif
