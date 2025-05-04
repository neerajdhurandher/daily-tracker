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
    return true; // Return true to indicate success
  } catch (error) {
    console.error('Error saving task:', error);
    return false; // Return false to indicate failure
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

      const finalTaskList = filteredTasks.filter((task) => task.isDeleted === undefined || task.isDeleted === false);

      // update time format of tasks in 24 hours format
      const updatedTasks = updateTasksTimeFormat(finalTaskList);

      if (updatedTasks.length > 0) {
        // update tasks in batch
        const isUpdated = await updateTasksInBatch(updatedTasks);
        if (isUpdated) {
          return updatedTasks;
        }
      }
      return finalTaskList;
    } else {
      console.log('No tasks found for this user.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// Update a task in Firestore
export const updateTask = async (userId, taskId, updatedTask) => {
  try {
    const userDocRef = doc(fireStoreDb, 'tasks', userId); // Reference to the user's tasks document
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const tasks = userDoc.data().tasks || []; // Get the existing tasks array
      const updatedTasks = tasks.map((task) => (task.task_id === taskId ? updatedTask : task)); // Update the specific task
      await updateDoc(userDocRef, { tasks: updatedTasks }); // Save the updated tasks array
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

// Delete a task from Firestore
export const deleteTask = async (userId, taskId) => {
  try {
    const userDocRef = doc(fireStoreDb, 'tasks', userId); // Reference to the user's tasks document
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const tasks = userDoc.data().tasks || []; // Get the existing tasks array

      // iterate tasks and if taskId is found then update task.isDeleted to true
      const updatedTasks = tasks.map((task) => (task.task_id === taskId ? { ...task, isDeleted: true } : task)); // Update the specific task

      await updateDoc(userDocRef, { tasks: updatedTasks }); // Save the updated tasks array
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

async function updateTasksInBatch(tasks) {
  // update the tasks in batch
  try {
    for (const task of tasks) {
      // itterate through each task and update the task in Firestore using updateTask function
      const userId = task.user_id; // Get the userId from the task object
      const taskId = task.task_id; // Get the taskId from the task object
      const updatedTask = { ...task }; // Create a copy of the task object
      const isUpdated = await updateTask(userId, taskId, updatedTask);
      if (!isUpdated) {
        console.error(`Failed to update task with ID: ${taskId}`);
      }
    }
    return true;
  } catch (error) {
    console.error('Error updating tasks in batch:', error);
    return false; // Return false to indicate failure
  }
}


function updateTasksTimeFormat(tasks) {
  // Iterate through each task and update the time format
  // Return only those tasks whose time format is updated to 24-hour format
  const updatedTasks = tasks
    .filter((task) => task.time && !checkValid24HoursTimeFormat(task.time)) // Filter tasks that need time format conversion
    .map((task) => {
      const updatedTask = { ...task }; // Create a copy of the task object
      updatedTask.time = convertTo24HourFormat(task.time); // Convert to 24-hour format
      return updatedTask;
    });

  return updatedTasks;
}

function checkValid24HoursTimeFormat(time) {
  // Regular expression to match 24-hour time format (hh:mm:ss)
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
  return regex.test(time);
}

function convertTo24HourFormat(time12h) {
  // Check if the input is already in 24-hour format (hh:mm:ss)
  const is24HourFormat = checkValid24HoursTimeFormat(time12h);
  if (is24HourFormat) {
    return time12h; // Return the input as is
  }

  // Split the time into components
  const [time, modifier] = time12h.split(' '); // Separate time and AM/PM
  let [hours, minutes] = time.split(':').map(Number); // Split hours and minutes

  // Convert hours to 24-hour format
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  // Format hours, minutes, and seconds as hh:mm:ss
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = '00'; // Default seconds to 00

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
