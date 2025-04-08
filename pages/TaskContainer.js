import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AddItemPopUp from '../lib/components/AddItemPopUp';
import Login from './Login';
import { saveTask, getTasks } from '../lib/services/taskService';
import uuid from 'react-uuid';
import Image from 'next/image';

const TaskContainer = ({ user, category, onClose }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH;


  const userId = user ? user.uid : null; // Get user ID if user is logged in

  if (!user || !userId) {
    return <Login /> // Handle case when user is not logged in
  }

  // store the tasks in local storage
  const storeTasksInLocalStorage = (tasks) => {
    const taskObject = { userId: userId, tasks: tasks };
    localStorage.setItem('tasks', JSON.stringify(taskObject));
    loadTasksFromLocalStorage();
  }

  // Load tasks from local storage
  const loadTasksFromLocalStorage = () => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      if (parsedTasks.userId === userId) {
        // filter the tasks by category id
        const filteredTasks = parsedTasks.tasks.filter((task) => task.categoryId === category.id);
        setTasks(filteredTasks);
      } else {
        setTasks([]);
      }
    }
  };

  // Fetch tasks whenever the `user` state changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return; // Exit early if user is not logged in
      const userId = user.uid;
      const fetchedTasks = await getTasks(userId, category.id);
      if (fetchedTasks) {
        storeTasksInLocalStorage(fetchedTasks); 
      } else {
        storeTasksInLocalStorage([]);
      }
    };

    fetchTasks();
  }, [user]);

  // Handle case when user is not logged in
  if (!user) {
    return <div>Please log in to view tasks.</div>;
  }

  // Load tasks from local storage when the component mounts
  useEffect(() => {
    loadTasksFromLocalStorage();
  }, []);

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
    setIsLoading(false);
  };

  const addTask = async (newTask) => {
    setIsLoading(true);
    const userId = user.uid;
    const taskWithId = { ...newTask, task_id: uuid(), user_id: userId, categoryId: category.id };
    await saveTask(userId, taskWithId);
    storeTasksInLocalStorage([...tasks, taskWithId]);
    togglePopup();
  };

  // Group tasks by date in descending order and sort tasks by time within each date group
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Sort tasks within each date group by time in descending order
  Object.keys(groupedTasks).forEach((date) => {
    groupedTasks[date].sort((a, b) => {
      // Parse time strings into hours and minutes
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);

      // Compare times in descending order
      if (hoursA !== hoursB) {
        return hoursB - hoursA;
      }
      return minutesB - minutesA;
    });
  });

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(b) - new Date(a));

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    const currentYear = new Date().getFullYear();
    const taskYear = date.getFullYear();

    // Append the year if it's different from the current year
    return taskYear !== currentYear ? `${formattedDate} ${taskYear}` : formattedDate;
  };

  const toggleComment = (taskIndex) => {
    setExpandedTask((prev) => (prev === taskIndex ? null : taskIndex));
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <button className="close-button" onClick={onClose}>
            <Image src={`${basePath}/arrow-back-icon.svg`} alt="back" className="icon-image" width={50} height={40} />
          </button>
          <span className="page-title">{category.name}</span>
        </div>
        <div className="task-list">
          {sortedDates.length === 0 ? (
            <div className="no-tasks-container">
              <Image
                src={`${basePath}/no-task-icon.svg`}
                alt="No tasks"
                className="no-tasks-image"
                width={150}
                height={150}
              />
              <p className="no-tasks-text">No tasks</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="task-group">
                <h3 className="task-date">{formatDate(date)}</h3>
                {groupedTasks[date].map((task, index) => (
                  <div
                    key={index}
                    className={`task-card ${expandedTask === `${date}-${index}` ? 'expanded' : ''}`}
                    onClick={() => toggleComment(`${date}-${index}`)}
                  >
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-time">{task.time}</p>
                    {expandedTask === `${date}-${index}` && (
                      <p className={`task-comment ${task.comment ? '' : 'no-comment'}`}>
                        {task.comment || 'No comments'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="round-icon" onClick={togglePopup}>
        <Image src={`${basePath}/plus-icon-white.svg`} alt="Icon" className="icon-image" width={40} height={40} />
      </div>
      {isPopupOpen && <AddItemPopUp category={category} onClose={togglePopup} onSave={addTask} isLoading={isLoading} />}
    </>
  );
};

TaskContainer.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired, // Assuming `uid` is a required string in the `user` object
  }).isRequired,
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TaskContainer;
