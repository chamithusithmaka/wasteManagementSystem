# Testing Location Assignment Endpoint

## New Endpoint Added

### Check if Container Has Location Assigned
- **URL**: `GET /api/containers/:id/location-assigned`
- **Purpose**: Returns true if container has both address and city assigned
- **Response**: 
```json
{
  "containerId": "CONT001",
  "isLocationAssigned": true
}
```

## Testing Steps

1. **Create a container without location:**
```bash
POST /api/containers
{
  "containerId": "TEST001",
  "containerType": "Recycling",
  "containerCapacity": 100
}
```

2. **Check location assignment (should return false):**
```bash
GET /api/containers/TEST001/location-assigned
# Expected: {"containerId": "TEST001", "isLocationAssigned": false}
```

3. **Assign location:**
```bash
PUT /api/containers/TEST001/location
{
  "address": "123 Main Street",
  "city": "Colombo",
  "province": "Western Province"
}
```

4. **Check location assignment again (should return true):**
```bash
GET /api/containers/TEST001/location-assigned
# Expected: {"containerId": "TEST001", "isLocationAssigned": true}
```

## Sensor Simulator Changes

### New Behavior:
1. **Level Updates**: Only containers with assigned locations will have their levels updated (+2% every 5 minutes)
2. **Error Triggers**: Only containers with assigned locations can have errors triggered (2% of eligible containers every 4 minutes)
3. **Auto Recovery**: When an error is triggered, the container status automatically recovers to normal after 5 minutes

### Console Messages:
- `📡 Skipping Level Update -> Container CONT001: No location assigned` - when location not assigned
- `⏰ Status Recovery Scheduled -> Container CONT001: Will recover in 5 minutes` - when error triggered
- `🔄 Auto Status Recovery -> Container CONT001: Recovered to Available` - when status recovers

### Status Recovery Logic:
- After 5 minutes, error flag is cleared and status is set based on current level:
  - Level >= 95%: "Full"
  - Level >= 80%: "Near Full" 
  - Level < 80%: "Available"