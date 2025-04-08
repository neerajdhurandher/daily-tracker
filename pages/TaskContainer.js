import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AddItemPopUp from '../lib/components/AddItemPopUp';
import { saveTask, getTasks } from '../lib/services/taskService';
import uuid from 'react-uuid';
import Image from 'next/image';

const TaskContainer = ({ user, category, onClose }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState([]); 
  const [expandedTask, setExpandedTask] = useState(null); 

  // Fetch tasks whenever the `user` state changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return; // Exit early if user is not logged in
      const userId = user.uid; 
      const fetchedTasks = await getTasks(userId, category.id);
      setTasks(fetchedTasks);
    };

    fetchTasks();
  }, [user]);

  // Handle case when user is not logged in
  if (!user) {
    return <div>Please log in to view tasks.</div>;
  }

  // Load tasks from local storage when the component mounts
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
        setTasks([]);
      }
    }
  }, []);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
    setIsLoading(false);
  };

  const addTask = async (task) => {
    setIsLoading(true); 
    const userId = user.uid;
    const taskWithId = { ...task, task_id: uuid(), user_id: userId, categoryId: category.id }; 
    await saveTask(userId, taskWithId);
    setTasks((prevTasks) => [...prevTasks, taskWithId]);
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
            <Image src="/arrow-back-icon.svg" alt="back" className="icon-image" width={50} height={40} />
          </button>
          <span className="page-title">{category.name}</span>
        </div>
        <div className="task-list">
        {sortedDates.length === 0 ? (
          <div className="no-tasks-container">
            <Image
              src="/no-task-icon.svg" 
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
        <Image src="plus-icon-white.svg" alt="Icon" className="icon-image" width={40} height={40}/>
      </div>
      {isPopupOpen && <AddItemPopUp category={category} onClose={togglePopup} onSave={addTask} isLoading={isLoading}/>}
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
