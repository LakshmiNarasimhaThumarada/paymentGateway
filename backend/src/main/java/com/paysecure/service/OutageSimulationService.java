package com.paysecure.service;

import com.paysecure.model.Region;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OutageSimulationService {

    private final Map<Region, Boolean> outageMap = new ConcurrentHashMap<>();

    public OutageSimulationService() {
        // Initially, all regions are fully functional (no outages)
        for (Region region : Region.values()) {
            outageMap.put(region, false);
        }
    }

    public void setOutage(Region region, boolean isOutage) {
        outageMap.put(region, isOutage);
    }

    public boolean hasOutage(Region region) {
        return outageMap.getOrDefault(region, false);
    }

    public Map<Region, Boolean> getStatus() {
        return outageMap;
    }
}
