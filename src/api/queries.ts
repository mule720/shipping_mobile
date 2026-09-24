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

// ─── VENDOR REPORTS (date-filtered) ───────────────────────────────────────────

export const DAILY_SHIPMENTS_REPORT_QUERY = `
  query DailyShipmentsReport($companyId: UUID!, $days: Int) {
    dailyShipmentsReport(companyId: $companyId, days: $days) {
      date
      total
      delivered
      returned
      cancelled
    }
  }
`;

export const BRANCH_PERFORMANCE_QUERY = `
  query BranchPerformanceReport($companyId: UUID!, $days: Int) {
    branchPerformanceReport(companyId: $companyId, days: $days) {
      city
      total
      delivered
      pending
      onTimeRate
    }
  }
`;

export const DELIVERY_PERFORMANCE_QUERY = `
  query DeliveryPerformanceReport($companyId: UUID!, $days: Int) {
    deliveryPerformanceReport(companyId: $companyId, days: $days) {
      status
      count
      percentage
    }
  }
`;

export const STAFF_PERFORMANCE_QUERY = `
  query StaffPerformanceStats($companyId: UUID!) {
    staffPerformanceStats(companyId: $companyId) {
      employeeName
      role
      totalDeliveries
      onTimeDeliveries
      avgRating
    }
  }
`;

// ─── ANNOUNCEMENTS (for vendor dashboard banner) ──────────────────────────────

export const ANNOUNCEMENTS_QUERY = `
  query Announcements {
    announcements {
      id
      title
      body
      target
      isActive
      createdAt
      expiresAt
    }
  }
`;

// ─── PLATFORM ADMIN ───────────────────────────────────────────────────────────

export const ADMIN_REVENUE_QUERY = `
  query AdminRevenue {
    adminRevenue {
      totalRevenue
      monthlyRevenue
      totalShipments
      activeCompanies
      monthlyData { month revenue }
      companiesPerMonth { month count }
    }
  }
`;

export const ALL_COMPANIES_QUERY = `
  query AllCompanies {
    allCompanies {
      id
      name
      email
      phone
      slug
      isActive
      userCount
      branchCount
      createdAt
    }
  }
`;

export const APPROVE_COMPANY_MUTATION = `
  mutation ApproveCompany($companyId: UUID!) {
    approveCompany(companyId: $companyId) { id isActive }
  }
`;

export const SUSPEND_COMPANY_MUTATION = `
  mutation SuspendCompany($companyId: UUID!) {
    suspendCompany(companyId: $companyId) { id isActive }
  }
`;

export const ADMIN_PAYOUTS_QUERY = `
  query AdminPayouts {
    adminPayouts {
      id
      aggregatorName
      amount
      reference
      status
      periodStart
      periodEnd
      notes
      createdAt
      paidAt
    }
  }
`;

export const GENERATE_PAYOUT_MUTATION = `
  mutation GeneratePayout($aggregatorId: UUID!, $amount: Float!, $periodStart: Date!, $periodEnd: Date!, $reference: String, $notes: String) {
    generatePayout(aggregatorId: $aggregatorId, amount: $amount, periodStart: $periodStart, periodEnd: $periodEnd, reference: $reference, notes: $notes) {
      id status amount createdAt
    }
  }
`;

export const MARK_PAYOUT_PAID_MUTATION = `
  mutation MarkPayoutPaid($payoutId: UUID!, $reference: String) {
    markPayoutPaid(payoutId: $payoutId, reference: $reference) {
      id status paidAt
    }
  }
`;

export const ALL_ANNOUNCEMENTS_QUERY = `
  query AllAnnouncements {
    allAnnouncements {
      id title body target isActive createdAt expiresAt
    }
  }
`;

export const CREATE_ANNOUNCEMENT_MUTATION = `
  mutation CreateAnnouncement($title: String!, $body: String!, $target: String!, $expiresAt: DateTime) {
    createAnnouncement(title: $title, body: $body, target: $target, expiresAt: $expiresAt) {
      id title isActive createdAt
    }
  }
`;

export const TOGGLE_ANNOUNCEMENT_MUTATION = `
  mutation ToggleAnnouncement($announcementId: UUID!) {
    toggleAnnouncement(announcementId: $announcementId) { id isActive }
  }
`;

export const DELETE_ANNOUNCEMENT_MUTATION = `
  mutation DeleteAnnouncement($announcementId: UUID!) {
    deleteAnnouncement(announcementId: $announcementId) { ok }
  }
`;

export const ADMIN_SUBSCRIPTIONS_QUERY = `
  query AdminSubscriptions {
    adminSubscriptions {
      id name description price billingCycle maxUsers maxBranches maxShipmentsPerMonth features isActive subscriberCount createdAt
    }
  }
`;

export const CREATE_SUBSCRIPTION_PLAN_MUTATION = `
  mutation CreateSubscription($name: String!, $description: String, $price: Float!, $billingCycle: String!, $maxUsers: Int, $maxBranches: Int, $maxShipmentsPerMonth: Int, $features: [String!]) {
    createSubscription(name: $name, description: $description, price: $price, billingCycle: $billingCycle, maxUsers: $maxUsers, maxBranches: $maxBranches, maxShipmentsPerMonth: $maxShipmentsPerMonth, features: $features) {
      id name price billingCycle
    }
  }
`;

export const UPDATE_SUBSCRIPTION_PLAN_MUTATION = `
  mutation UpdateSubscription($subscriptionId: UUID!, $name: String, $price: Float, $billingCycle: String, $maxUsers: Int, $maxBranches: Int, $maxShipmentsPerMonth: Int, $features: [String!], $isActive: Boolean) {
    updateSubscription(subscriptionId: $subscriptionId, name: $name, price: $price, billingCycle: $billingCycle, maxUsers: $maxUsers, maxBranches: $maxBranches, maxShipmentsPerMonth: $maxShipmentsPerMonth, features: $features, isActive: $isActive) {
      id name price isActive
    }
  }
`;

export const GLOBAL_ANALYTICS_QUERY = `
  query GlobalAnalytics {
    globalAnalytics {
      totalShipments
      shipmentsThisMonth
      topCities { city count }
      statusBreakdown { status count percentage }
      revenueByMonth { month revenue }
    }
  }
`;

export const PLATFORM_HEALTH_QUERY = `
  query PlatformHealth {
    platformHealth {
      dbStatus
      totalCompanies
      activeCompanies
      totalUsers
      totalShipments
      totalAggregators
      pendingPayouts
    }
  }
`;

export const ACTIVITY_LOGS_QUERY = `
  query ActivityLogs($limit: Int, $search: String) {
    activityLogs(limit: $limit, search: $search) {
      id action entity entityId actor createdAt
    }
  }
`;

export const ALL_AGGREGATORS_QUERY = `
  query AllAggregators {
    allAggregators {
      id companyName phone email isActive createdAt
    }
  }
`;

// ─── AGGREGATOR PORTAL ────────────────────────────────────────────────────────

export const MY_AGGREGATOR_PROFILE_QUERY = `
  query MyAggregatorProfile {
    myAggregatorProfile {
      id companyName contactPerson phone operatingHours address lat lng
      perJobFee localDeliveryFee pricingModel notes averageRating ratingCount serviceLevel serviceProvince serviceAreas
    }
  }
`;

export const MY_PICKUP_JOBS_QUERY = `
  query MyPickupJobs($status: String) {
    myPickupJobs(status: $status) {
      id jobType status scheduledAt completedAt earnedFee notes
      shipment { id trackingNumber senderName senderAddress senderCity receiverName receiverCity weight }
    }
  }
`;

// claimShipmentForPickup replaces the old "acceptPickupJob" name that never existed on the backend.
export const ACCEPT_JOB_MUTATION = `
  mutation ClaimShipmentForPickup($shipmentId: UUID!) {
    claimShipmentForPickup(shipmentId: $shipmentId) {
      job { id status shipment { id trackingNumber } }
      success
      error
    }
  }
`;

// updatePickupJobStatus replaces the old "completePickupJob" name that never existed on the backend.
export const COMPLETE_JOB_MUTATION = `
  mutation UpdatePickupJobStatus($jobId: UUID!, $status: String!, $notes: String, $code: String) {
    updatePickupJobStatus(jobId: $jobId, status: $status, notes: $notes, code: $code) {
      job { id status deliveredAt }
      success
      error
    }
  }
`;

export const MY_EARNINGS_QUERY = `
  query MyEarnings {
    myEarnings {
      totalEarned
      pickupFees
      lastMileFees
      completedJobs
      pendingJobs
      jobs {
        id jobType status earnedFee completedAt
        shipment { trackingNumber senderCity receiverCity }
      }
    }
  }
`;

export const MY_RATINGS_QUERY = `
  query MyRatings($limit: Int) {
    myRatings(limit: $limit) {
      id rating comment createdAt
    }
    myRatingSummary {
      averageRating totalRatings fiveStar fourStar threeStar twoStar oneStar
    }
  }
`;

export const MY_AGGREGATOR_ANALYTICS_QUERY = `
  query MyAggregatorAnalytics {
    myAggregatorAnalytics {
      totalJobs
      completedJobs
      pendingJobs
      avgCompletionTime
      earningsByCity { city amount count }
      driverPerformance { employeeName totalDeliveries onTimeDeliveries avgRating }
    }
  }
`;

export const UPDATE_AGGREGATOR_PROFILE_MUTATION = `
  mutation UpdateAggregatorProfile($companyName: String, $contactPerson: String, $phone: String, $operatingHours: String, $address: String, $perJobFee: Float, $localDeliveryFee: Float, $pricingModel: String, $notes: String) {
    updateAggregatorProfile(companyName: $companyName, contactPerson: $contactPerson, phone: $phone, operatingHours: $operatingHours, address: $address, perJobFee: $perJobFee, localDeliveryFee: $localDeliveryFee, pricingModel: $pricingModel, notes: $notes) {
      id companyName phone
    }
  }
`;

export const MY_NOTIFICATION_PREFERENCES_QUERY = `
  query MyNotificationPreferences {
    myNotificationPreferences {
      id preferredReceiptChannel emailEnabled smsEnabled pushEnabled
      shipmentUpdates paymentUpdates dispatchUpdates systemUpdates
    }
  }
`;

export const UPDATE_MY_NOTIFICATION_PREFERENCES_MUTATION = `
  mutation UpdateMyNotificationPreferences($preferredReceiptChannel: String) {
    updateMyNotificationPreferences(preferredReceiptChannel: $preferredReceiptChannel) {
      id preferredReceiptChannel
    }
  }
`;
