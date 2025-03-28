import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { fireStoreDb } from '../firebase/firebase';


// Save a category to Firestore
export const saveCategory = async (userId, category) => {
    try {
        const userDocRef = doc(fireStoreDb, 'categories', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const categories = userDoc.data().categories || [];
            const updatedCategories = [...categories, category];
            await updateDoc(userDocRef, { categories: updatedCategories });
            console.log('Category saved successfully!');
            return true
        } else {
            await setDoc(userDocRef, { categories: [category] });
            console.log('Category saved successfully!');
            return true;
        }
    } catch (error) {
        console.error('Error saving category:', error);
        return false;
    }
};

// Get all categories for a user
export const getCategories = async (userId) => {
    try {
        const userDocRef = doc(fireStoreDb, 'categories', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const categories = userDoc.data().categories || [];
            return categories;
        }
        console.log('No categories found for this user.');
        return [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// Update a category in Firestore
export const updateCategory = async (userId, categoryId, updatedCategory) => {
    try {
        const userDocRef = doc(fireStoreDb, 'categories', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const categories = userDoc.data().categories || [];
            const updatedCategories = categories.map((cat) => (cat.id === categoryId ? updatedCategory : cat));
            await updateDoc(userDocRef, { categories: updatedCategories });
            console.log('Category updated successfully!');
            return true;
        } else {
            console.log('No categories found for this user.');
            return false;
        }
    } catch (error) {
        console.error('Error updating category:', error);
        return false;
    }
};

// Delete a category from Firestore
export const deleteCategory = async (userId, categoryId) => {
    try {
        const userDocRef = doc(fireStoreDb, 'categories', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const categories = userDoc.data().categories || [];
            const updatedCategories = categories.filter((cat) => cat.id !== categoryId);
            await updateDoc(userDocRef, { categories: updatedCategories });
            console.log('Category deleted successfully!');
            return true;
        } else {
            console.log('No categories found for this user.');
            return false;
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
};