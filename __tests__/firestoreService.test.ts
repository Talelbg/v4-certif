import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  COLLECTIONS
} from '../services/firestoreService';

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn((ref) => ref),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn()
}));

// Mock firebaseConfig
jest.mock('../firebaseConfig', () => ({
  db: {}
}));

import { getDoc, getDocs, addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';

describe('firestoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocument', () => {
    it('should return document data when document exists', async () => {
      const mockData = { name: 'Test', email: 'test@test.com' };
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'test-id',
        data: () => mockData
      });

      const result = await getDocument('users', 'test-id');

      expect(result).toEqual({ id: 'test-id', ...mockData });
    });

    it('should return null when document does not exist', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        id: 'test-id',
        data: () => null
      });

      const result = await getDocument('users', 'nonexistent-id');

      expect(result).toBeNull();
    });

    it('should throw error when firestore operation fails', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getDocument('users', 'test-id')).rejects.toThrow('Failed to fetch document');
    });
  });

  describe('getDocuments', () => {
    it('should return array of documents', async () => {
      const mockDocs = [
        { id: 'doc1', name: 'User 1' },
        { id: 'doc2', name: 'User 2' }
      ];
      (collection as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockDocs.map(d => ({
          id: d.id,
          data: () => ({ name: d.name })
        }))
      });

      const result = await getDocuments('users');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'doc1', name: 'User 1' });
      expect(result[1]).toEqual({ id: 'doc2', name: 'User 2' });
    });

    it('should return empty array when collection is empty', async () => {
      (collection as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

      const result = await getDocuments('users');

      expect(result).toEqual([]);
    });

    it('should throw error when firestore operation fails', async () => {
      (collection as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getDocuments('users')).rejects.toThrow('Failed to fetch documents');
    });
  });

  describe('addDocument', () => {
    it('should add document and return id', async () => {
      const mockData = { name: 'Test User', email: 'test@test.com' };
      (collection as jest.Mock).mockReturnValue({});
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-doc-id' });

      const result = await addDocument('users', mockData);

      expect(result).toBe('new-doc-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should throw error when data is empty', async () => {
      await expect(addDocument('users', {})).rejects.toThrow('Document data cannot be empty');
    });

    it('should throw error when firestore operation fails', async () => {
      (collection as jest.Mock).mockReturnValue({});
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(addDocument('users', { name: 'Test' })).rejects.toThrow('Failed to add document');
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const updateData = { name: 'Updated Name' };
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await expect(updateDocument('users', 'test-id', updateData)).resolves.not.toThrow();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw error when document id is empty', async () => {
      await expect(updateDocument('users', '', { name: 'Test' })).rejects.toThrow('Document ID is required');
    });

    it('should throw error when firestore operation fails', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(updateDocument('users', 'test-id', { name: 'Test' })).rejects.toThrow('Failed to update document');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await expect(deleteDocument('users', 'test-id')).resolves.not.toThrow();
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw error when document id is empty', async () => {
      await expect(deleteDocument('users', '')).rejects.toThrow('Document ID is required');
    });

    it('should throw error when firestore operation fails', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'test-id' });
      (deleteDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(deleteDocument('users', 'test-id')).rejects.toThrow('Failed to delete document');
    });
  });

  describe('COLLECTIONS', () => {
    it('should have correct collection names', () => {
      expect(COLLECTIONS.USERS).toBe('users');
      expect(COLLECTIONS.CERTIFICATES).toBe('certificates');
      expect(COLLECTIONS.DEVELOPERS).toBe('developers');
      expect(COLLECTIONS.ADMINS).toBe('admins');
      expect(COLLECTIONS.INVOICES).toBe('invoices');
      expect(COLLECTIONS.AGREEMENTS).toBe('agreements');
      expect(COLLECTIONS.EVENTS).toBe('events');
      expect(COLLECTIONS.CAMPAIGNS).toBe('campaigns');
      expect(COLLECTIONS.MASTER_REGISTRY).toBe('masterRegistry');
      expect(COLLECTIONS.UPLOADS).toBe('uploads');
    });
  });
});
