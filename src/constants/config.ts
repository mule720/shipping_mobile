export const API_URL = 'http://localhost:8003/graphql/';
export const PRIMARY_COLOR = '#4f46e5';
export const SECONDARY_COLOR = '#06b6d4';
export const APP_NAME = 'ShipFlow';

export const ZAMBIAN_CITIES = [
  'Lusaka', 'Ndola', 'Kitwe', 'Livingstone', 'Kabwe',
  'Chipata', 'Mufulira', 'Luanshya', 'Kasama', 'Solwezi',
  'Mazabuka', 'Chingola', 'Mongu', 'Kafue', 'Choma',
];

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_warehouse: 'In Warehouse',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  picked_up: '#3b82f6',
  in_warehouse: '#8b5cf6',
  in_transit: '#6366f1',
  out_for_delivery: '#06b6d4',
  delivered: '#10b981',
  returned: '#f97316',
  cancelled: '#ef4444',
  active: '#10b981',
  completed: '#6b7280',
  draft: '#f59e0b',
  sent: '#3b82f6',
  paid: '#10b981',
  overdue: '#ef4444',
};

export const ROLES = [
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'warehouse_officer', label: 'Warehouse Officer' },
  { value: 'dispatch_officer', label: 'Dispatch Officer' },
  { value: 'driver', label: 'Driver' },
  { value: 'accounts_officer', label: 'Accounts Officer' },
];

export const PAYMENT_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'credit', label: 'Credit' },
];

export const VEHICLE_TYPES = [
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
];

export const WAREHOUSE_TYPES = [
  { value: 'storage', label: 'Storage' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'fulfillment', label: 'Fulfillment' },
  { value: 'cold_storage', label: 'Cold Storage' },
];
