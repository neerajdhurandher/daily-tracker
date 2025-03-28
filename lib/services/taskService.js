import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { fireStoreDb } from '../firebase/firebase';

// Save a task to Firestore
export const saveTask = async (userId, task) => {
  try {
    const userDocRef = doc(fireStoreDb, 'tasks', userId); // Reference to the user's tasks document
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // If the user already has tasks, update the tasks array
      const existingTasks = userDoc.data().tasks || [];
      const updatedTasks = [...existingTasks, task];
      await updateDoc(userDocRef, { tasks: updatedTasks });
    } else {
      // If the user doesn't have tasks, create a new document
      await setDoc(userDocRef, { tasks: [task] });
    }

    console.log('Task saved successfully!');
  } catch (error) {
    console.error('Error saving task:', error);
  }
};

// Get all tasks for a user
export const getTasks = async (userId, categoryId) => {
  try {
    console.log('Fetching tasks');
    const userDocRef = doc(fireStoreDb, 'tasks', userId); // Reference to the user's tasks document
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const tasks = userDoc.data().tasks || []; // Return the tasks array
      // Filter tasks by categoryId
      const filteredTasks = tasks.filter((task) => task.categoryId === categoryId);
      return filteredTasks;
    } else {
      console.log('No tasks found for this user.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};