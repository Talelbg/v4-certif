import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Unsubscribe,
  DocumentReference,
  CollectionReference,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  DeveloperRecord, 
  AdminUser, 
  Invoice, 
  CommunityAgreement, 
  CommunityEvent, 
  OutreachCampaign, 
  CommunityMasterRecord,
  DatasetVersion
} from '../types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CERTIFICATES: 'certificates',
  DEVELOPERS: 'developers',
  ADMINS: 'admins',
  INVOICES: 'invoices',
  AGREEMENTS: 'agreements',
  EVENTS: 'events',
  CAMPAIGNS: 'campaigns',
  MASTER_REGISTRY: 'masterRegistry',
  DATASET_VERSIONS: 'datasetVersions',
  UPLOADS: 'uploads'
} as const;

// Generic CRUD operations with error handling

/**
 * Get a single document by ID
 */
export async function getDocument<T>(
  collectionName: string, 
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw new Error(`Failed to fetch document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all documents from a collection with optional query constraints
 */
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints) 
      : query(collectionRef);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw new Error(`Failed to fetch documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add a new document to a collection
 */
export async function addDocument<T extends DocumentData>(
  collectionName: string, 
  data: Omit<T, 'id'>
): Promise<string> {
  try {
    // Validate data is not empty object
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new Error('Document data cannot be empty');
    }

    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw new Error(`Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>
): Promise<void> {
  try {
    // Validate document ID
    if (!docId || docId.trim() === '') {
      throw new Error('Document ID is required');
    }

    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string, 
  docId: string
): Promise<void> {
  try {
    // Validate document ID
    if (!docId || docId.trim() === '') {
      throw new Error('Document ID is required');
    }

    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Subscribe to real-time updates on a collection
 */
export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = []
): Unsubscribe {
  try {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints) 
      : query(collectionRef);

    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      console.error(`Error in collection subscription for ${collectionName}:`, error);
    });
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    throw new Error(`Failed to subscribe to collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Subscribe to real-time updates on a single document
 */
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): Unsubscribe {
  try {
    const docRef = doc(db, collectionName, docId);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in document subscription for ${collectionName}/${docId}:`, error);
    });
  } catch (error) {
    console.error(`Error setting up document subscription for ${collectionName}/${docId}:`, error);
    throw new Error(`Failed to subscribe to document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Typed service functions for specific collections

// Developer Records
export const getDeveloperRecords = () => getDocuments<DeveloperRecord>(COLLECTIONS.DEVELOPERS);
export const getDeveloperById = (id: string) => getDocument<DeveloperRecord>(COLLECTIONS.DEVELOPERS, id);
export const addDeveloperRecord = (data: Omit<DeveloperRecord, 'id'>) => addDocument(COLLECTIONS.DEVELOPERS, data);
export const updateDeveloperRecord = (id: string, data: Partial<DeveloperRecord>) => updateDocument(COLLECTIONS.DEVELOPERS, id, data);
export const deleteDeveloperRecord = (id: string) => deleteDocument(COLLECTIONS.DEVELOPERS, id);
export const subscribeToDevelopers = (callback: (data: DeveloperRecord[]) => void) => 
  subscribeToCollection<DeveloperRecord>(COLLECTIONS.DEVELOPERS, callback);

// Admin Users
export const getAdminUsers = () => getDocuments<AdminUser>(COLLECTIONS.ADMINS);
export const getAdminById = (id: string) => getDocument<AdminUser>(COLLECTIONS.ADMINS, id);
export const addAdminUser = (data: Omit<AdminUser, 'id'>) => addDocument(COLLECTIONS.ADMINS, data);
export const updateAdminUser = (id: string, data: Partial<AdminUser>) => updateDocument(COLLECTIONS.ADMINS, id, data);
export const deleteAdminUser = (id: string) => deleteDocument(COLLECTIONS.ADMINS, id);
export const subscribeToAdmins = (callback: (data: AdminUser[]) => void) => 
  subscribeToCollection<AdminUser>(COLLECTIONS.ADMINS, callback);

// Invoices
export const getInvoices = () => getDocuments<Invoice>(COLLECTIONS.INVOICES);
export const getInvoiceById = (id: string) => getDocument<Invoice>(COLLECTIONS.INVOICES, id);
export const addInvoice = (data: Omit<Invoice, 'id'>) => addDocument(COLLECTIONS.INVOICES, data);
export const updateInvoice = (id: string, data: Partial<Invoice>) => updateDocument(COLLECTIONS.INVOICES, id, data);
export const deleteInvoice = (id: string) => deleteDocument(COLLECTIONS.INVOICES, id);
export const subscribeToInvoices = (callback: (data: Invoice[]) => void) => 
  subscribeToCollection<Invoice>(COLLECTIONS.INVOICES, callback);

// Community Agreements
export const getAgreements = () => getDocuments<CommunityAgreement>(COLLECTIONS.AGREEMENTS);
export const getAgreementById = (id: string) => getDocument<CommunityAgreement>(COLLECTIONS.AGREEMENTS, id);
export const addAgreement = (data: Omit<CommunityAgreement, 'id'>) => addDocument(COLLECTIONS.AGREEMENTS, data);
export const updateAgreement = (id: string, data: Partial<CommunityAgreement>) => updateDocument(COLLECTIONS.AGREEMENTS, id, data);
export const deleteAgreement = (id: string) => deleteDocument(COLLECTIONS.AGREEMENTS, id);
export const subscribeToAgreements = (callback: (data: CommunityAgreement[]) => void) => 
  subscribeToCollection<CommunityAgreement>(COLLECTIONS.AGREEMENTS, callback);

// Community Events
export const getEvents = () => getDocuments<CommunityEvent>(COLLECTIONS.EVENTS);
export const getEventById = (id: string) => getDocument<CommunityEvent>(COLLECTIONS.EVENTS, id);
export const addEvent = (data: Omit<CommunityEvent, 'id'>) => addDocument(COLLECTIONS.EVENTS, data);
export const updateEvent = (id: string, data: Partial<CommunityEvent>) => updateDocument(COLLECTIONS.EVENTS, id, data);
export const deleteEvent = (id: string) => deleteDocument(COLLECTIONS.EVENTS, id);
export const subscribeToEvents = (callback: (data: CommunityEvent[]) => void) => 
  subscribeToCollection<CommunityEvent>(COLLECTIONS.EVENTS, callback);

// Outreach Campaigns
export const getCampaigns = () => getDocuments<OutreachCampaign>(COLLECTIONS.CAMPAIGNS);
export const getCampaignById = (id: string) => getDocument<OutreachCampaign>(COLLECTIONS.CAMPAIGNS, id);
export const addCampaign = (data: Omit<OutreachCampaign, 'id'>) => addDocument(COLLECTIONS.CAMPAIGNS, data);
export const updateCampaign = (id: string, data: Partial<OutreachCampaign>) => updateDocument(COLLECTIONS.CAMPAIGNS, id, data);
export const deleteCampaign = (id: string) => deleteDocument(COLLECTIONS.CAMPAIGNS, id);
export const subscribeToCampaigns = (callback: (data: OutreachCampaign[]) => void) => 
  subscribeToCollection<OutreachCampaign>(COLLECTIONS.CAMPAIGNS, callback);

// Community Master Registry
export const getMasterRegistry = () => getDocuments<CommunityMasterRecord>(COLLECTIONS.MASTER_REGISTRY);
export const getMasterRecordById = (id: string) => getDocument<CommunityMasterRecord>(COLLECTIONS.MASTER_REGISTRY, id);
export const addMasterRecord = (data: Omit<CommunityMasterRecord, 'id'>) => addDocument(COLLECTIONS.MASTER_REGISTRY, data);
export const updateMasterRecord = (id: string, data: Partial<CommunityMasterRecord>) => updateDocument(COLLECTIONS.MASTER_REGISTRY, id, data);
export const deleteMasterRecord = (id: string) => deleteDocument(COLLECTIONS.MASTER_REGISTRY, id);
export const subscribeToMasterRegistry = (callback: (data: CommunityMasterRecord[]) => void) => 
  subscribeToCollection<CommunityMasterRecord>(COLLECTIONS.MASTER_REGISTRY, callback);

// Dataset Versions
export const getDatasetVersions = () => getDocuments<DatasetVersion>(COLLECTIONS.DATASET_VERSIONS);
export const getDatasetVersionById = (id: string) => getDocument<DatasetVersion>(COLLECTIONS.DATASET_VERSIONS, id);
export const addDatasetVersion = (data: Omit<DatasetVersion, 'id'>) => addDocument(COLLECTIONS.DATASET_VERSIONS, data);
export const updateDatasetVersion = (id: string, data: Partial<DatasetVersion>) => updateDocument(COLLECTIONS.DATASET_VERSIONS, id, data);
export const deleteDatasetVersion = (id: string) => deleteDocument(COLLECTIONS.DATASET_VERSIONS, id);
export const subscribeToDatasetVersions = (callback: (data: DatasetVersion[]) => void) => 
  subscribeToCollection<DatasetVersion>(COLLECTIONS.DATASET_VERSIONS, callback);

// Query helpers
export { where, orderBy, limit, query, collection } from 'firebase/firestore';
