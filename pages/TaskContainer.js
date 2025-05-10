import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import AddItemPopUp from '../lib/components/AddItemPopUp';
import Login from './Login';
import { saveTask, getTasks, updateTask, deleteTask } from '../lib/services/taskService';
import uuid from 'react-uuid';
import Image from 'next/image';

const TaskContainer = ({ user, category, onClose }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [popupMode, setPopupMode] = useState('add');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

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


  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the dropdown if the click is outside any dropdown
      if (!event.target.closest('.dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Toggle dropdown visibility
  const toggleDropdown = (taskId) => {
    setOpenDropdownId((prevId) => (prevId === taskId ? null : taskId));
  };

  const openPopup = (mode, task = null) => {
    setIsPopupOpen(true);
    setPopupMode(mode);
    if (mode === 'edit' && task) {
      setSelectedTask(task);
    } else {
      setSelectedTask(null);
    }
  };

  // Open delete confirmation popup
  const openDeletePopup = (task) => {
    toggleDropdown(task.task_id);
    setSelectedTask(task);
    setIsDeletePopupOpen(true);
  };

  // Close delete confirmation popup
  const closeDeletePopup = () => {
    setIsLoading(false);
    setIsDeletePopupOpen(false);
    setSelectedTask(null);
  };

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
    setIsLoading(false);
    toggleDropdown((prev) => (prev === openDropdownId ? null : openDropdownId));
  };

  // Handle save action for adding or editing tasks
  const handleSave = async (newTask) => {
    // Ensure user id logged in
    if (!user) {
      alert('Please log in to save tasks.');
      return <Login />; // Handle case when user is not logged in
    }
    setIsLoading(true);
    const userId = user.uid;
    if (popupMode === 'add') {
      const taskWithId = { ...newTask, task_id: uuid(), user_id: userId, categoryId: category.id };
      let result = await saveTask(userId, taskWithId);
      if (result) {
        storeTasksInLocalStorage([...tasks, taskWithId]);
      }
      // If editing an existing task, update it
    } else if (popupMode === 'edit' && selectedTask) {
      const updatedTask = { ...newTask, task_id: selectedTask.task_id, user_id: userId, categoryId: category.id };

      let result = await updateTask(userId, selectedTask.task_id, updatedTask);
      if (result) {
        storeTasksInLocalStorage([...tasks.filter(task => task.task_id !== selectedTask.task_id), updatedTask]);
      }
    }
    togglePopup();

  };

  const handleDelete = async () => {
    setIsLoading(true);
    const userId = user.uid;
    const taskId = selectedTask.task_id;
    const updatedTasks = tasks.filter((task) => task.task_id !== taskId);
    let result = await deleteTask(userId, taskId);
    if (result) {
      storeTasksInLocalStorage(updatedTasks);
    }
    closeDeletePopup();
  }

  function convertTo12HourFormat(time24h) {
    // Validate the input format (hh:mm:ss)
    const isValidFormat = /^\d{2}:\d{2}:\d{2}$/.test(time24h);
    if (!isValidFormat) {
      return "not available";
    }

    // Split the time into hours, minutes, and seconds
    const [hours, minutes] = time24h.split(':').map(Number);

    // Validate hours and minutes range
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return "not available";
    }

    // Determine AM/PM and convert hours to 12-hour format
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

    // Return the formatted time
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }


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
      const [hoursA, minutesA, secondsA] = a.time.split(':').map(Number);
      const [hoursB, minutesB, secondsB] = b.time.split(':').map(Number);

      // Compare times in descending order
      if (hoursA !== hoursB) {
        return hoursB - hoursA;
      }
      if (minutesA !== minutesB || (secondsA == undefined || secondsB == undefined)) {
        return minutesB - minutesA;
      }
      return secondsB - secondsA;
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
                    <div className='task-header'>
                      <span className="task-title">{task.title}</span>
                      <div className="dropdown"
                        onClick={(e) => {
                          // Prevent triggering the parent onClick event
                          e.stopPropagation();
                        }}>
                        <Image
                          src={`${basePath}/three-dots-icon.svg`}
                          alt="Options"
                          className="three-dots-icon"
                          width={40}
                          height={40}
                          onClick={() => toggleDropdown(task.task_id)}
                        />
                        {openDropdownId === task.task_id && (
                          <div className="dropdown-menu">
                            <span onClick={() => openPopup('edit', task)} className="dropdown-item">
                              Edit
                            </span>
                            <span onClick={() => openDeletePopup(task)} className="dropdown-item">
                              Delete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="task-time">{convertTo12HourFormat(task.time)}</p>
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
      {isPopupOpen && (
        <AddItemPopUp
          category={category}
          onClose={togglePopup}
          onSave={handleSave}
          currentTask={selectedTask}
          popupMode={popupMode}
          isLoading={isLoading}
        />
      )}

      {isDeletePopupOpen && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2>Delete {selectedTask?.title} task ?</h2>
            <div className="popup-footer">
              {isLoading ? (
                <button className="deleting-button" disabled>
                  Deleting...
                </button>
              ) : (
                <>
                  <button className="delete-button" onClick={handleDelete}>
                    Yes
                  </button>
                  <button className="cancel-button" onClick={closeDeletePopup}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
