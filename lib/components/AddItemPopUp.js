import React, { useEffect, useState } from 'react';

const AddItemPopUp = ({ category, onClose, onSave, currentTask = null, popupMode = 'add', isLoading = false }) => {

    function getTime() {
        const date = new Date();
        const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

        // Format the date string to YYYY-MM-DD
        // Replace slashes with dashes
        const formattedDate = dateString.replace(/\//g, '-');
        // Split the date string into parts
        const parts = formattedDate.split('-');
        // Rearrange the parts to YYYY-MM-DD format
        const formattedDateString = `${parts[2]}-${parts[0]}-${parts[1]}`;

        return formattedDateString;
    }

    const [task, setTask] = useState('');
    const [date, setDate] = useState(getTime()); // Default to today's date
    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })); // Default to current time
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (popupMode === 'edit' && currentTask) {
            setTask(currentTask.title);
            setDate(currentTask.date);
            setTime(currentTask.time || time);
            setComment(currentTask.comment || ''); // Set comment if it exists
        }
    }, [popupMode, currentTask]);

    const handleSave = () => {
        if (task.trim()) {
            if (popupMode === 'add') {
                const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Get current time
                setTime(currentTime); // Update time state with current time
            }
            onSave({ title: task, date, time, comment }); // Pass task data to parent
        } else {
            alert('Task input is mandatory!');
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-header">
                    <h2>Add Task</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="popup-body">
                    <label className="category-name">Category
                        <input
                            type="text"
                            value={category.name}
                            disabled
                        />
                    </label>
                    <label>
                        Task (required):
                        <input
                            type="text"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            placeholder="Enter task"
                            required
                        />
                    </label>
                    <label>
                        Date:
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={getTime()} // Restrict future dates
                        />
                    </label>
                    <label>
                        Comment:
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter comment (optional)"
                        ></textarea>
                    </label>
                </div>
                <div className="popup-footer">
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={!task.trim() || isLoading} // Disable save button if task is empty
                    >
                        {isLoading ? 'Saving...' : 'Save'} {/* Show "Saving..." when loading */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddItemPopUp;