export type UserRole =
  | 'platform_admin'
  | 'company_admin'
  | 'branch_manager'
  | 'warehouse_officer'
  | 'dispatch_officer'
  | 'driver'
  | 'accounts_officer'
  | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  branchId?: string;
  phone?: string;
  isActive: boolean;
  customPermissions?: string[];
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  subscription: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  registrationNumber?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  companyId: string;
  managerId?: string;
  isActive: boolean;
}

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_warehouse'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderEmail?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  recipientEmail?: string;
  weight: number;
  pieces: number;
  description: string;
  paymentType: 'prepaid' | 'cod' | 'credit';
  shippingCost: number;
  codAmount?: number;
  originBranch: string;
  destinationBranch: string;
  isFragile?: boolean;
  isSensitive?: boolean;
  isColdChain?: boolean;
  isInsured?: boolean;
  insuranceValue?: number;
  specialInstructions?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  driverId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleId?: string;
  branchId: string;
  isActive: boolean;
  isAvailable?: boolean;
  activeDeliveries?: number;
  totalDeliveries?: number;
  rating?: number;
  licenseExpiry?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  capacityKg: number;
  branchId: string;
  isActive: boolean;
}

export interface Manifest {
  id: string;
  manifestNumber: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  shipmentCount?: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  originBranch?: string;
  destinationBranch?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  companyId: string;
  totalShipments?: number;
  totalRevenue?: number;
  lastShipment?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  amount: number;
  type: string;
  status: string;
  collectedAt?: string;
  reconciledAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issuedAt: string;
  dueDate: string;
  paidDate?: string;
  items?: { description: string; qty: number; rate: number; total: number }[];
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  managerName: string;
  warehouseType: string;
  capacity: number;
  currentLoad: number;
  availableCapacity: number;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalShipments: number;
  pendingShipments: number;
  totalRevenue: number;
  pendingInvoices: number;
  activeAlerts: number;
  deliveredShipments?: number;
  inTransitShipments?: number;
  cancelledShipments?: number;
  todayShipments?: number;
  monthlyRevenue?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
