export const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      token
      refreshToken: token
      message
      user {
        id
        name
        email
        role
        companyId
        branchId
        isActive
      }
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me {
      id
      name
      email
      role
      companyId
      branchId
      isActive
    }
  }
`;

export const DASHBOARD_SUMMARY_QUERY = `
  query DashboardSummary($companyId: UUID!) {
    dashboardSummary(companyId: $companyId) {
      totalShipments
      pendingShipments
      totalRevenue
      pendingInvoices
      activeAlerts
      deliveredShipments
      inTransitShipments
      cancelledShipments
      todayShipments
      monthlyRevenue
    }
  }
`;

export const SHIPMENTS_BY_STATUS_QUERY = `
  query ShipmentsByStatus($companyId: UUID!) {
    shipmentsByStatus(companyId: $companyId) {
      status
      count
    }
  }
`;

export const SHIPMENTS_QUERY = `
  query Shipments($companyId: UUID!, $status: String) {
    shipments(companyId: $companyId, status: $status) {
      id
      trackingNumber
      status
      senderName
      senderPhone
      senderAddress
      senderCity
      senderEmail
      receiverName
      receiverPhone
      receiverAddress
      receiverCity
      recipientEmail
      weight
      pieces
      description
      paymentType
      shippingCost
      codAmount
      originBranch
      destinationBranch
      isFragile
      isSensitive
      isColdChain
      isInsured
      insuranceValue
      specialInstructions
      estimatedDelivery
      actualDelivery
      driverId
      companyId
      createdAt
      updatedAt
      deliveredAt
    }
  }
`;

export const SHIPMENT_BY_TRACKING_QUERY = `
  query ShipmentByTracking($trackingNumber: String!) {
    shipmentByTracking(trackingNumber: $trackingNumber) {
      id
      trackingNumber
      status
      senderName
      senderCity
      receiverName
      receiverCity
      weight
      originBranch
      destinationBranch
      estimatedDelivery
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SHIPMENT_MUTATION = `
  mutation CreateShipment(
    $companyId: UUID!
    $senderName: String!
    $senderPhone: String!
    $senderAddress: String!
    $senderCity: String!
    $senderEmail: String
    $receiverName: String!
    $receiverPhone: String!
    $receiverAddress: String!
    $receiverCity: String!
    $recipientEmail: String
    $weight: Float!
    $pieces: Int!
    $description: String!
    $paymentType: String!
    $shippingCost: Float!
    $codAmount: Float
    $originBranch: String!
    $destinationBranch: String!
    $isFragile: Boolean
    $isSensitive: Boolean
    $isColdChain: Boolean
    $isInsured: Boolean
    $insuranceValue: Float
    $specialInstructions: String
  ) {
    createShipment(
      companyId: $companyId
      senderName: $senderName
      senderPhone: $senderPhone
      senderAddress: $senderAddress
      senderCity: $senderCity
      senderEmail: $senderEmail
      receiverName: $receiverName
      receiverPhone: $receiverPhone
      receiverAddress: $receiverAddress
      receiverCity: $receiverCity
      recipientEmail: $recipientEmail
      weight: $weight
      pieces: $pieces
      description: $description
      paymentType: $paymentType
      shippingCost: $shippingCost
      codAmount: $codAmount
      originBranch: $originBranch
      destinationBranch: $destinationBranch
      isFragile: $isFragile
      isSensitive: $isSensitive
      isColdChain: $isColdChain
      isInsured: $isInsured
      insuranceValue: $insuranceValue
      specialInstructions: $specialInstructions
    ) {
      id
      trackingNumber
      status
      createdAt
    }
  }
`;

export const UPDATE_SHIPMENT_STATUS_MUTATION = `
  mutation UpdateShipmentStatus($id: UUID!, $status: String!) {
    updateShipmentStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const BRANCHES_QUERY = `
  query Branches($companyId: UUID!) {
    branches(companyId: $companyId) {
      id
      name
      code
      address
      city
      companyId
      managerId
      isActive
    }
  }
`;

export const CREATE_BRANCH_MUTATION = `
  mutation CreateBranch(
    $companyId: UUID!
    $name: String!
    $code: String!
    $address: String!
    $city: String!
  ) {
    createBranch(
      companyId: $companyId
      name: $name
      code: $code
      address: $address
      city: $city
    ) {
      id
      name
      code
      city
    }
  }
`;

export const DRIVERS_QUERY = `
  query Drivers($companyId: UUID!) {
    drivers(companyId: $companyId) {
      id
      name
      phone
      licenseNumber
      vehicleId
      branchId
      isActive
      isAvailable
      activeDeliveries
      totalDeliveries
      rating
    }
  }
`;

export const CREATE_DRIVER_MUTATION = `
  mutation CreateDriver(
    $companyId: UUID!
    $name: String!
    $phone: String!
    $licenseNumber: String!
    $branchId: UUID!
  ) {
    createDriver(
      companyId: $companyId
      name: $name
      phone: $phone
      licenseNumber: $licenseNumber
      branchId: $branchId
    ) {
      id
      name
      phone
    }
  }
`;

export const VEHICLES_QUERY = `
  query Vehicles($companyId: UUID!) {
    vehicles(companyId: $companyId) {
      id
      plateNumber
      make
      model
      year
      vehicleType
      capacityKg
      branchId
      isActive
    }
  }
`;

export const CREATE_VEHICLE_MUTATION = `
  mutation CreateVehicle(
    $companyId: UUID!
    $plateNumber: String!
    $make: String!
    $model: String!
    $year: Int!
    $vehicleType: String!
    $capacityKg: Float!
    $branchId: UUID!
  ) {
    createVehicle(
      companyId: $companyId
      plateNumber: $plateNumber
      make: $make
      model: $model
      year: $year
      vehicleType: $vehicleType
      capacityKg: $capacityKg
      branchId: $branchId
    ) {
      id
      plateNumber
    }
  }
`;

export const MANIFESTS_QUERY = `
  query Manifests($companyId: UUID!, $status: String) {
    manifests(companyId: $companyId, status: $status) {
      id
      manifestNumber
      driverName
      vehiclePlate
      shipmentCount
      status
      originBranch
      destinationBranch
      notes
      createdAt
      completedAt
    }
  }
`;

export const CREATE_MANIFEST_MUTATION = `
  mutation CreateManifest(
    $companyId: UUID!
    $driverId: UUID!
    $vehicleId: UUID!
    $shipmentIds: [UUID!]!
    $originBranch: String
    $destinationBranch: String
    $notes: String
  ) {
    createManifest(
      companyId: $companyId
      driverId: $driverId
      vehicleId: $vehicleId
      shipmentIds: $shipmentIds
      originBranch: $originBranch
      destinationBranch: $destinationBranch
      notes: $notes
    ) {
      id
      manifestNumber
      driverName
      vehiclePlate
      shipmentCount
      status
      createdAt
    }
  }
`;

export const UPDATE_MANIFEST_STATUS_MUTATION = `
  mutation UpdateManifestStatus($manifestId: UUID!, $status: String!) {
    updateManifestStatus(manifestId: $manifestId, status: $status) {
      id
      status
      completedAt
    }
  }
`;

export const USERS_QUERY = `
  query Users($companyId: UUID!) {
    users(companyId: $companyId) {
      id
      name
      email
      role
      branchId
      isActive
    }
  }
`;

export const CREATE_EMPLOYEE_MUTATION = `
  mutation CreateEmployee(
    $companyId: UUID!
    $name: String!
    $email: String!
    $password: String!
    $role: String!
    $branchId: UUID
  ) {
    createEmployee(
      companyId: $companyId
      name: $name
      email: $email
      password: $password
      role: $role
      branchId: $branchId
    ) {
      id
      name
      email
      role
    }
  }
`;

export const CUSTOMERS_QUERY = `
  query Customers($companyId: UUID!) {
    customers(companyId: $companyId) {
      id
      name
      email
      phone
      address
      city
      companyId
      totalShipments
      totalRevenue
      lastShipment
      createdAt
    }
  }
`;

export const INVOICES_QUERY = `
  query Invoices($companyId: UUID!, $status: String) {
    invoices(companyId: $companyId, status: $status) {
      id
      invoiceNumber
      customerName
      customerEmail
      amount
      subtotal
      tax
      discount
      total
      status
      issuedAt
      dueDate
      paidDate
    }
  }
`;

export const FINANCIAL_SUMMARY_QUERY = `
  query FinancialSummary($companyId: UUID!) {
    financialSummary(companyId: $companyId) {
      totalRevenue
      pendingAmount
      collectedAmount
      codPending
      monthlyRevenue
    }
  }
`;

export const PAYMENTS_QUERY = `
  query Payments($companyId: UUID!) {
    payments(companyId: $companyId) {
      id
      shipmentId
      trackingNumber
      amount
      type
      status
      collectedAt
      reconciledAt
    }
  }
`;

export const WAREHOUSES_QUERY = `
  query Warehouses($companyId: UUID!) {
    warehouses(companyId: $companyId) {
      id
      name
      code
      address
      city
      state
      country
      phone
      email
      managerName
      warehouseType
      capacity
      currentLoad
      availableCapacity
      isActive
      createdAt
    }
  }
`;

export const CREATE_WAREHOUSE_MUTATION = `
  mutation CreateWarehouse(
    $companyId: UUID!
    $name: String!
    $code: String
    $address: String
    $city: String
    $state: String
    $country: String
    $phone: String
    $email: String
    $managerName: String
    $warehouseType: String
    $capacity: Float
  ) {
    createWarehouse(
      companyId: $companyId
      name: $name
      code: $code
      address: $address
      city: $city
      state: $state
      country: $country
      phone: $phone
      email: $email
      managerName: $managerName
      warehouseType: $warehouseType
      capacity: $capacity
    ) {
      id
      name
      code
      city
    }
  }
`;

export const COMPANY_QUERY = `
  query Company($id: UUID!) {
    company(id: $id) {
      id
      name
      primaryColor
      secondaryColor
      subscription
      isActive
    }
  }
`;

export const RECENT_ACTIVITY_QUERY = `
  query RecentActivity($companyId: UUID!, $limit: Int) {
    recentActivity(companyId: $companyId, limit: $limit) {
      id
      type
      description
      entityId
      entityType
      createdAt
    }
  }
`;
