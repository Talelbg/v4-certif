import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import {
  subscribeToAdmins,
  subscribeToInvoices,
  subscribeToAgreements,
  subscribeToEvents,
  subscribeToCampaigns,
  subscribeToMasterRegistry,
  addAdminUser,
  updateAdminUser,
  deleteAdminUser,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  addAgreement,
  updateAgreement,
  deleteAgreement,
  addEvent,
  updateEvent,
  deleteEvent,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  addMasterRecord,
  updateMasterRecord,
  deleteMasterRecord
} from '../services/firestoreService';
import {
  AdminUser,
  Invoice,
  CommunityAgreement,
  CommunityEvent,
  OutreachCampaign,
  CommunityMasterRecord
} from '../types';

interface FirebaseDataState {
  admins: AdminUser[];
  invoices: Invoice[];
  agreements: CommunityAgreement[];
  events: CommunityEvent[];
  campaigns: OutreachCampaign[];
  masterRegistry: CommunityMasterRecord[];
  loading: boolean;
  error: string | null;
}

interface FirebaseDataActions {
  // Admin actions
  addAdmin: (data: Omit<AdminUser, 'id'>) => Promise<string>;
  updateAdmin: (id: string, data: Partial<AdminUser>) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
  
  // Invoice actions
  addNewInvoice: (data: Omit<Invoice, 'id'>) => Promise<string>;
  updateExistingInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  
  // Agreement actions
  addNewAgreement: (data: Omit<CommunityAgreement, 'id'>) => Promise<string>;
  updateExistingAgreement: (id: string, data: Partial<CommunityAgreement>) => Promise<void>;
  removeAgreement: (id: string) => Promise<void>;
  
  // Event actions
  addNewEvent: (data: Omit<CommunityEvent, 'id'>) => Promise<string>;
  updateExistingEvent: (id: string, data: Partial<CommunityEvent>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  
  // Campaign actions
  addNewCampaign: (data: Omit<OutreachCampaign, 'id'>) => Promise<string>;
  updateExistingCampaign: (id: string, data: Partial<OutreachCampaign>) => Promise<void>;
  removeCampaign: (id: string) => Promise<void>;
  
  // Master Registry actions
  addNewMasterRecord: (data: Omit<CommunityMasterRecord, 'id'>) => Promise<string>;
  updateExistingMasterRecord: (id: string, data: Partial<CommunityMasterRecord>) => Promise<void>;
  removeMasterRecord: (id: string) => Promise<void>;
  
  clearError: () => void;
}

export type UseFirebaseDataReturn = FirebaseDataState & FirebaseDataActions;

/**
 * Custom hook for real-time Firebase data synchronization
 * Provides live updates from Firestore collections and CRUD operations
 */
export function useFirebaseData(enabled: boolean = true): UseFirebaseDataReturn {
  const [state, setState] = useState<FirebaseDataState>({
    admins: [],
    invoices: [],
    agreements: [],
    events: [],
    campaigns: [],
    masterRegistry: [],
    loading: true,
    error: null
  });

  // Track subscriptions setup status
  const [subscriptionsReady, setSubscriptionsReady] = useState({
    admins: false,
    invoices: false,
    agreements: false,
    events: false,
    campaigns: false,
    masterRegistry: false
  });

  // Check if all subscriptions are ready
  useEffect(() => {
    const allReady = Object.values(subscriptionsReady).every(Boolean);
    if (allReady) {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [subscriptionsReady]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribers: Unsubscribe[] = [];

    try {
      // Subscribe to admins
      unsubscribers.push(
        subscribeToAdmins((data) => {
          setState(prev => ({ ...prev, admins: data }));
          setSubscriptionsReady(prev => ({ ...prev, admins: true }));
        })
      );

      // Subscribe to invoices
      unsubscribers.push(
        subscribeToInvoices((data) => {
          setState(prev => ({ ...prev, invoices: data }));
          setSubscriptionsReady(prev => ({ ...prev, invoices: true }));
        })
      );

      // Subscribe to agreements
      unsubscribers.push(
        subscribeToAgreements((data) => {
          setState(prev => ({ ...prev, agreements: data }));
          setSubscriptionsReady(prev => ({ ...prev, agreements: true }));
        })
      );

      // Subscribe to events
      unsubscribers.push(
        subscribeToEvents((data) => {
          setState(prev => ({ ...prev, events: data }));
          setSubscriptionsReady(prev => ({ ...prev, events: true }));
        })
      );

      // Subscribe to campaigns
      unsubscribers.push(
        subscribeToCampaigns((data) => {
          setState(prev => ({ ...prev, campaigns: data }));
          setSubscriptionsReady(prev => ({ ...prev, campaigns: true }));
        })
      );

      // Subscribe to master registry
      unsubscribers.push(
        subscribeToMasterRegistry((data) => {
          setState(prev => ({ ...prev, masterRegistry: data }));
          setSubscriptionsReady(prev => ({ ...prev, masterRegistry: true }));
        })
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to database'
      }));
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [enabled]);

  // Error handler wrapper
  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    errorPrefix: string
  ): Promise<T> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      return await operation();
    } catch (error) {
      const message = `${errorPrefix}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setState(prev => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Admin CRUD operations
  const addAdmin = useCallback(
    (data: Omit<AdminUser, 'id'>) => 
      withErrorHandling(() => addAdminUser(data), 'Failed to add admin'),
    [withErrorHandling]
  );

  const updateAdmin = useCallback(
    (id: string, data: Partial<AdminUser>) => 
      withErrorHandling(() => updateAdminUser(id, data), 'Failed to update admin'),
    [withErrorHandling]
  );

  const removeAdmin = useCallback(
    (id: string) => 
      withErrorHandling(() => deleteAdminUser(id), 'Failed to delete admin'),
    [withErrorHandling]
  );

  // Invoice CRUD operations
  const addNewInvoice = useCallback(
    (data: Omit<Invoice, 'id'>) => 
      withErrorHandling(() => addInvoice(data), 'Failed to add invoice'),
    [withErrorHandling]
  );

  const updateExistingInvoice = useCallback(
    (id: string, data: Partial<Invoice>) => 
      withErrorHandling(() => updateInvoice(id, data), 'Failed to update invoice'),
    [withErrorHandling]
  );

  const removeInvoice = useCallback(
    (id: string) => 
      withErrorHandling(() => deleteInvoice(id), 'Failed to delete invoice'),
    [withErrorHandling]
  );

  // Agreement CRUD operations
  const addNewAgreement = useCallback(
    (data: Omit<CommunityAgreement, 'id'>) => 
      withErrorHandling(() => addAgreement(data), 'Failed to add agreement'),
    [withErrorHandling]
  );

  const updateExistingAgreement = useCallback(
    (id: string, data: Partial<CommunityAgreement>) => 
      withErrorHandling(() => updateAgreement(id, data), 'Failed to update agreement'),
    [withErrorHandling]
  );

  const removeAgreement = useCallback(
    (id: string) => 
      withErrorHandling(() => deleteAgreement(id), 'Failed to delete agreement'),
    [withErrorHandling]
  );

  // Event CRUD operations
  const addNewEvent = useCallback(
    (data: Omit<CommunityEvent, 'id'>) => 
      withErrorHandling(() => addEvent(data), 'Failed to add event'),
    [withErrorHandling]
  );

  const updateExistingEvent = useCallback(
    (id: string, data: Partial<CommunityEvent>) => 
      withErrorHandling(() => updateEvent(id, data), 'Failed to update event'),
    [withErrorHandling]
  );

  const removeEvent = useCallback(
    (id: string) => 
      withErrorHandling(() => deleteEvent(id), 'Failed to delete event'),
    [withErrorHandling]
  );

  // Campaign CRUD operations
  const addNewCampaign = useCallback(
    (data: Omit<OutreachCampaign, 'id'>) => 
      withErrorHandling(() => addCampaign(data), 'Failed to add campaign'),
    [withErrorHandling]
  );

  const updateExistingCampaign = useCallback(
    (id: string, data: Partial<OutreachCampaign>) => 
      withErrorHandling(() => updateCampaign(id, data), 'Failed to update campaign'),
    [withErrorHandling]
  );

  const removeCampaign = useCallback(
    (id: string) => 
      withErrorHandling(() => deleteCampaign(id), 'Failed to delete campaign'),
    [withErrorHandling]
  );

  // Master Registry CRUD operations
  const addNewMasterRecord = useCallback(
    (data: Omit<CommunityMasterRecord, 'id'>) => 
      withErrorHandling(() => addMasterRecord(data), 'Failed to add master record'),
    [withErrorHandling]
  );

  const updateExistingMasterRecord = useCallback(
    (id: string, data: Partial<CommunityMasterRecord>) => 
      withErrorHandling(() => updateMasterRecord(id, data), 'Failed to update master record'),
    [withErrorHandling]
  );

  const removeMasterRecord = useCallback(
    (id: string) => 
      withErrorHandling(() => deleteMasterRecord(id), 'Failed to delete master record'),
    [withErrorHandling]
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    addAdmin,
    updateAdmin,
    removeAdmin,
    addNewInvoice,
    updateExistingInvoice,
    removeInvoice,
    addNewAgreement,
    updateExistingAgreement,
    removeAgreement,
    addNewEvent,
    updateExistingEvent,
    removeEvent,
    addNewCampaign,
    updateExistingCampaign,
    removeCampaign,
    addNewMasterRecord,
    updateExistingMasterRecord,
    removeMasterRecord,
    clearError
  };
}

export default useFirebaseData;
