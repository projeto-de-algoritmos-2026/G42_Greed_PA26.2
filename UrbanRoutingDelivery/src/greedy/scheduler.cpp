#include "scheduler.hpp"
#include <algorithm>
#include <stdexcept>

void DeliveryScheduler::addTask(const std::string& id, const std::string& destination, int startTime, int endTime) {
    if (startTime < 0 || endTime < 0 || endTime <= startTime) {
        throw std::invalid_argument("Invalid time range");
    }
    tasks.push_back({id, destination, startTime, endTime});
}

void DeliveryScheduler::clearTasks() {
    tasks.clear();
}

ScheduleResult DeliveryScheduler::calculateOptimalSchedule() const {
    std::vector<DeliveryTask> localTasks = tasks;

    std::sort(localTasks.begin(), localTasks.end(), [](const DeliveryTask& a, const DeliveryTask& b) {
        if (a.endTime != b.endTime) {
            return a.endTime < b.endTime;
        }
        if (a.startTime != b.startTime) {
            return a.startTime < b.startTime;
        }
        return a.id < b.id;
    });

    ScheduleResult result;
    int currentEndTime = -1;

    for (const auto& task : localTasks) {
        if (task.startTime >= currentEndTime) {
            result.selectedTasks.push_back(task);
            currentEndTime = task.endTime;
        } else {
            result.rejectedTasks.push_back(task);
        }
    }

    result.totalScheduled = static_cast<int>(result.selectedTasks.size());
    return result;
}
