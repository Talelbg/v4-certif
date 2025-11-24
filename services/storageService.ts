import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll,
  UploadMetadata,
  UploadTaskSnapshot,
  StorageReference
} from 'firebase/storage';
import { storage } from '../firebaseConfig';

// Storage paths
export const STORAGE_PATHS = {
  UPLOADS: 'uploads',
  CERTIFICATES: 'certificates',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents'
} as const;

export interface UploadResult {
  downloadURL: string;
  fullPath: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

/**
 * Validate file before upload
 */
function validateFile(
  file: File, 
  maxSizeMB: number = 10, 
  allowedTypes?: string[]
): void {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }

  // Check file type if allowedTypes is specified
  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        // Match mime type category (e.g., 'image/*')
        const category = type.replace('/*', '');
        return file.type.startsWith(category);
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }
}

/**
 * Generate a unique file name
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${baseName}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  path: string = STORAGE_PATHS.UPLOADS,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    customMetadata?: Record<string, string>;
    useOriginalName?: boolean;
  } = {}
): Promise<UploadResult> {
  const { 
    maxSizeMB = 10, 
    allowedTypes, 
    customMetadata = {},
    useOriginalName = false 
  } = options;

  try {
    // Validate file
    validateFile(file, maxSizeMB, allowedTypes);

    // Generate file name
    const fileName = useOriginalName ? file.name : generateUniqueFileName(file.name);
    const fullPath = `${path}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);

    // Set metadata
    const metadata: UploadMetadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        ...customMetadata
      }
    };

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      downloadURL,
      fullPath: snapshot.ref.fullPath,
      fileName,
      size: file.size,
      contentType: file.type
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload a file with progress tracking
 */
export function uploadFileWithProgress(
  file: File,
  path: string = STORAGE_PATHS.UPLOADS,
  onProgress: (progress: UploadProgress) => void,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    customMetadata?: Record<string, string>;
    useOriginalName?: boolean;
  } = {}
): Promise<UploadResult> {
  const { 
    maxSizeMB = 10, 
    allowedTypes, 
    customMetadata = {},
    useOriginalName = false 
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Validate file
      validateFile(file, maxSizeMB, allowedTypes);

      // Generate file name
      const fileName = useOriginalName ? file.name : generateUniqueFileName(file.name);
      const fullPath = `${path}/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, fullPath);

      // Set metadata
      const metadata: UploadMetadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...customMetadata
        }
      };

      // Start resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress,
            state: snapshot.state as UploadProgress['state']
          });
        },
        (error) => {
          console.error('Error during upload:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadURL,
              fullPath: uploadTask.snapshot.ref.fullPath,
              fileName,
              size: file.size,
              contentType: file.type
            });
          } catch (error) {
            reject(new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(fullPath: string): Promise<void> {
  try {
    if (!fullPath || fullPath.trim() === '') {
      throw new Error('File path is required');
    }

    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get download URL for a file
 */
export async function getFileDownloadURL(fullPath: string): Promise<string> {
  try {
    if (!fullPath || fullPath.trim() === '') {
      throw new Error('File path is required');
    }

    const fileRef = ref(storage, fullPath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all files in a directory
 */
export async function listFiles(path: string): Promise<StorageReference[]> {
  try {
    const listRef = ref(storage, path);
    const result = await listAll(listRef);
    return result.items;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload certificate image
 */
export async function uploadCertificateImage(
  file: File,
  certificateId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const options = {
    maxSizeMB: 5,
    allowedTypes: ['image/*', 'application/pdf'],
    customMetadata: {
      certificateId
    }
  };

  if (onProgress) {
    return uploadFileWithProgress(
      file, 
      `${STORAGE_PATHS.CERTIFICATES}/${certificateId}`,
      onProgress,
      options
    );
  }

  return uploadFile(file, `${STORAGE_PATHS.CERTIFICATES}/${certificateId}`, options);
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const options = {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    customMetadata: {
      userId
    }
  };

  if (onProgress) {
    return uploadFileWithProgress(
      file, 
      `${STORAGE_PATHS.AVATARS}/${userId}`,
      onProgress,
      options
    );
  }

  return uploadFile(file, `${STORAGE_PATHS.AVATARS}/${userId}`, options);
}

/**
 * Upload document
 */
export async function uploadDocument(
  file: File,
  folder: string = 'general',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const options = {
    maxSizeMB: 10,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  };

  if (onProgress) {
    return uploadFileWithProgress(
      file, 
      `${STORAGE_PATHS.DOCUMENTS}/${folder}`,
      onProgress,
      options
    );
  }

  return uploadFile(file, `${STORAGE_PATHS.DOCUMENTS}/${folder}`, options);
}
