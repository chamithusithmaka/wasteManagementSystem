// Container Types - Centralized constants
export const CONTAINER_TYPES = [
  { value: 'organic', label: 'Organic' },
  { value: 'recyclable', label: 'Recyclable' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'general', label: 'General' }
];

export const CONTAINER_STATUS = [
  'Available',
  'Near Full', 
  'Full',
  'Needs Maintenance',
  'Out of Service'
];

export default { CONTAINER_TYPES, CONTAINER_STATUS };