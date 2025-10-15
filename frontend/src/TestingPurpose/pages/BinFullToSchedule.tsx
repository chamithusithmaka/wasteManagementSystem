import React, { useState } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import SlotItem from '../components/SlotItem';
import InfoRow from '../components/InfoRow';
import Toast from '../components/Toast';

const BinFullToSchedule: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("REG");
  const [notes, setNotes] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  // Mock data
  const mockSensorEvent = {
    binId: "BIN-7A21",
    location: {
      label: "Sector 14 – Lake Road Junction",
      lat: 6.9271,
      lng: 79.8612
    },
    detectedAt: "2025-09-28T07:32:00Z",
    fillLevelPct: 92,            // trigger threshold: 80%
    lastPickup: "2025-09-21T08:10:00Z",
    binType: "General Waste (660L)",
    batteryStatus: "Good",
    anomalies: []                // e.g., ["Ultrasonic bounce", "Lid jammed"]
  };

  const mockAvailableSlots = [
    { id: "S1", date: "2025-09-28", window: "09:00–11:00", capacityLeft: 2, recommended: true },
    { id: "S2", date: "2025-09-28", window: "13:00–15:00", capacityLeft: 5, recommended: false },
    { id: "S3", date: "2025-09-29", window: "08:00–10:00", capacityLeft: 4, recommended: false }
  ];

  const mockServiceTypes = [
    { id: "REG", label: "Regular Pickup" },
    { id: "PRIO", label: "Priority / Overflow Pickup" },
    { id: "BULK", label: "Bulk Item Add-on" }
  ];

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days since last pickup
  const getDaysSinceLastPickup = () => {
    const lastPickup = new Date(mockSensorEvent.lastPickup);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - lastPickup.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (!selectedSlot) return;
    
    const selectedSlotDetails = mockAvailableSlots.find(slot => slot.id === selectedSlot);
    
    const payload = {
      binId: mockSensorEvent.binId,
      selectedServiceType,
      selectedSlotId: selectedSlot,
      slot: { 
        date: selectedSlotDetails?.date || "", 
        window: selectedSlotDetails?.window || "" 
      },
      sensor: {
        fillLevelPct: mockSensorEvent.fillLevelPct,
        detectedAt: mockSensorEvent.detectedAt,
        lastPickup: mockSensorEvent.lastPickup
      },
      notes: notes.trim() ? notes : undefined
    };
    
    console.log(payload);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showToast && (
        <Toast 
          message="Pickup request confirmed successfully!" 
          type="success" 
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bin Full – Schedule Collection</h1>
          <p className="text-gray-600">{mockSensorEvent.binId} • {mockSensorEvent.location.label}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card title="Sensor Snapshot">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-5xl font-bold text-blue-600">{mockSensorEvent.fillLevelPct}%</div>
                  <p className="text-sm text-gray-500">Fill Level</p>
                </div>
                {mockSensorEvent.fillLevelPct >= 90 && (
                  <Badge variant="warning">High Priority</Badge>
                )}
              </div>

              <div className="space-y-3">
                <InfoRow label="Bin Type" value={mockSensorEvent.binType} />
                <InfoRow 
                  label="Last Pickup" 
                  value={`${getDaysSinceLastPickup()} days ago (${formatDate(mockSensorEvent.lastPickup)})`} 
                />
                <InfoRow label="Detected At" value={formatDate(mockSensorEvent.detectedAt)} />
                <InfoRow label="Battery" value={mockSensorEvent.batteryStatus} />
                
                {mockSensorEvent.anomalies.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-gray-700">Anomalies:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mockSensorEvent.anomalies.map((anomaly, index) => (
                        <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                          {anomaly}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-medium">{mockSensorEvent.location.label}</p>
                  <div className="mt-2 bg-gray-200 h-24 rounded-md flex items-center justify-center">
                    <p className="text-xs text-gray-600">
                      Map Placeholder<br />
                      Lat: {mockSensorEvent.location.lat}, Lng: {mockSensorEvent.location.lng}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Service Type">
              <div className="space-y-3">
                {mockServiceTypes.map(serviceType => (
                  <div key={serviceType.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`service-${serviceType.id}`}
                      name="serviceType"
                      value={serviceType.id}
                      checked={selectedServiceType === serviceType.id}
                      onChange={() => setSelectedServiceType(serviceType.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`service-${serviceType.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                      {serviceType.label}
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Special Instructions (Optional)">
              <textarea
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Special instructions for crew..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card title="Available Collection Slots">
              <div className="space-y-4">
                {mockAvailableSlots.map(slot => (
                  <SlotItem
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlot === slot.id}
                    onSelect={() => setSelectedSlot(slot.id)}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">Crew ETA is within the selected window.</p>
            </Card>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleConfirm}
                disabled={!selectedSlot}
                className={`w-full py-3 rounded-xl text-white font-medium shadow-sm
                  ${!selectedSlot 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'}
                `}
              >
                Confirm Pickup Request
              </button>
              <button
                onClick={() => console.log("open calendar")}
                className="w-full py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50"
              >
                View Other Days
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinFullToSchedule;