import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../api/client';
import { useStore } from '../store/useStore';
import * as Q from '../api/queries';

// ============ DASHBOARD ============
export function useDashboardStats() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['dashboard-stats', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.DASHBOARD_SUMMARY_QUERY, { companyId: company!.id });
      return data.dashboardSummary;
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

export function useShipmentsByStatus() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['shipments-by-status', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.SHIPMENTS_BY_STATUS_QUERY, { companyId: company!.id });
      return data.shipmentsByStatus;
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

// ============ SHIPMENTS ============
export function useShipments(status?: string) {
  const { company } = useStore();
  return useQuery({
    queryKey: ['shipments', company?.id, status],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.SHIPMENTS_QUERY, { companyId: company!.id, status });
      return data.shipments ?? [];
    },
    enabled: !!company?.id,
    staleTime: 10000,
    retry: 1,
  });
}

export function useShipmentByTracking(trackingNumber: string) {
  return useQuery({
    queryKey: ['tracking', trackingNumber],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.SHIPMENT_BY_TRACKING_QUERY, { trackingNumber });
      return data.shipmentByTracking;
    },
    enabled: !!trackingNumber,
    retry: false,
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_SHIPMENT_MUTATION, variables).then(d => d.createShipment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      graphqlClient.mutate(Q.UPDATE_SHIPMENT_STATUS_MUTATION, { id, status }).then(d => d.updateShipmentStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// ============ BRANCHES ============
export function useBranches() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['branches', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.BRANCHES_QUERY, { companyId: company!.id });
      return data.branches ?? [];
    },
    enabled: !!company?.id,
    staleTime: 60000,
    retry: 1,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_BRANCH_MUTATION, variables).then(d => d.createBranch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
  });
}

// ============ DRIVERS ============
export function useDrivers() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['drivers', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.DRIVERS_QUERY, { companyId: company!.id });
      return data.drivers ?? [];
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_DRIVER_MUTATION, variables).then(d => d.createDriver),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });
}

// ============ VEHICLES ============
export function useVehicles() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['vehicles', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.VEHICLES_QUERY, { companyId: company!.id });
      return data.vehicles ?? [];
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_VEHICLE_MUTATION, variables).then(d => d.createVehicle),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

// ============ DISPATCH ============
export function useManifests(status?: string) {
  const { company } = useStore();
  return useQuery({
    queryKey: ['manifests', company?.id, status],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.MANIFESTS_QUERY, { companyId: company!.id, status });
      return data.manifests ?? [];
    },
    enabled: !!company?.id,
    staleTime: 15000,
    retry: 1,
  });
}

export function useCreateManifest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_MANIFEST_MUTATION, variables).then(d => d.createManifest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manifests'] });
      qc.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useUpdateManifestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ manifestId, status }: { manifestId: string; status: string }) =>
      graphqlClient.mutate(Q.UPDATE_MANIFEST_STATUS_MUTATION, { manifestId, status }).then(d => d.updateManifestStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manifests'] }),
  });
}

// ============ USERS ============
export function useUsers() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['users', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.USERS_QUERY, { companyId: company!.id });
      return data.users ?? [];
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_EMPLOYEE_MUTATION, variables).then(d => d.createEmployee),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ============ CUSTOMERS ============
export function useCustomers() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['customers', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.CUSTOMERS_QUERY, { companyId: company!.id });
      return data.customers ?? [];
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

// ============ FINANCE ============
export function useInvoices(status?: string) {
  const { company } = useStore();
  return useQuery({
    queryKey: ['invoices', company?.id, status],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.INVOICES_QUERY, { companyId: company!.id, status });
      return data.invoices ?? [];
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

export function usePayments() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['payments', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.PAYMENTS_QUERY, { companyId: company!.id });
      return data.payments ?? [];
    },
    enabled: !!company?.id,
    staleTime: 15000,
    retry: 1,
  });
}

export function useFinanceSummary() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['finance-summary', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.FINANCIAL_SUMMARY_QUERY, { companyId: company!.id });
      return data.financialSummary;
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

// ============ WAREHOUSES ============
export function useWarehouses() {
  const { company } = useStore();
  return useQuery({
    queryKey: ['warehouses', company?.id],
    queryFn: async () => {
      const data = await graphqlClient.query(Q.WAREHOUSES_QUERY, { companyId: company!.id });
      return data.warehouses ?? [];
    },
    enabled: !!company?.id,
    staleTime: 30000,
    retry: 1,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variables: any) => graphqlClient.mutate(Q.CREATE_WAREHOUSE_MUTATION, variables).then(d => d.createWarehouse),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  });
}
