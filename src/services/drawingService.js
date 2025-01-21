import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export const uploadDrawing = async (dataUrl, userId, title = 'Untitled') => {
  try {
    console.log('Starting drawing upload process...');
    console.log('Title:', title); // Debug title
    
    // Upload image to Storage
    const storageRef = ref(storage, `drawings/${userId}/${Date.now()}.png`);
    console.log('Created storage reference:', storageRef.fullPath);
    
    console.log('Uploading image to Firebase Storage...');
    await uploadString(storageRef, dataUrl, 'data_url');
    console.log('Image uploaded successfully');
    
    console.log('Getting download URL...');
    const imageUrl = await getDownloadURL(storageRef);
    console.log('Got download URL:', imageUrl);

    // Add metadata to Firestore
    console.log('Adding metadata to Firestore...');
    const drawingData = {
      userId,
      title: title.trim() || 'Untitled',
      imageUrl,
      createdAt: new Date().toISOString(),
      storageRef: storageRef.fullPath,
      likes: 0
    };
    console.log('Drawing data to save:', drawingData);
    
    const drawingRef = await addDoc(collection(db, 'drawings'), drawingData);
    console.log('Drawing metadata added to Firestore with ID:', drawingRef.id);

    return drawingRef.id;
  } catch (error) {
    console.error('Error uploading drawing:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

export const getRecentDrawings = async (limitCount = 20) => {
  try {
    console.log('Fetching recent drawings...');
    const q = query(
      collection(db, 'drawings'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const drawings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Fetched drawings:', drawings.length);
    return drawings;
  } catch (error) {
    console.error('Error fetching drawings:', error);
    throw error;
  }
};

export const getUserDrawings = async (userId) => {
  try {
    console.log('Fetching drawings for user:', userId);
    // First try without orderBy to test if it's an index issue
    const q = query(
      collection(db, 'drawings'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const drawings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const drawing = {
        id: doc.id,
        ...data,
        title: data.title || 'Untitled'
      };
      console.log('Processed drawing:', drawing);
      return drawing;
    });
    
    console.log('Fetched drawings:', drawings.length);
    return drawings;
  } catch (error) {
    console.error('Error fetching user drawings:', error);
    throw error;
  }
};

export const deleteDrawing = async (drawingId) => {
  try {
    console.log('Starting deletion process for drawing:', drawingId);
    
    // Get the drawing document first
    const drawingRef = doc(db, 'drawings', drawingId);
    const drawingSnap = await getDoc(drawingRef);
    
    if (!drawingSnap.exists()) {
      console.log('Drawing document not found:', drawingId);
      throw new Error('Drawing not found in database');
    }

    const drawingData = drawingSnap.data();
    console.log('Found drawing to delete:', drawingData);

    let errors = [];

    // Delete the document from Firestore first
    try {
      await deleteDoc(drawingRef);
      console.log('Successfully deleted drawing document:', drawingId);
    } catch (firestoreError) {
      console.error('Error deleting from Firestore:', firestoreError);
      errors.push('Failed to delete drawing data');
      throw firestoreError; // Rethrow to stop the process
    }

    // Then try to delete the image from Storage if it exists
    if (drawingData.storageRef) {
      try {
        const storageRef = ref(storage, drawingData.storageRef);
        await deleteObject(storageRef);
        console.log('Deleted image from storage:', drawingData.storageRef);
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
        errors.push('Failed to delete image file');
        // Don't throw here since document is already deleted
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  } catch (error) {
    console.error('Error in deleteDrawing:', error);
    throw error;
  }
}; 