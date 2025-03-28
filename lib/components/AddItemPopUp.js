import React, { useState } from 'react';

const AddItemPopUp = ({ category, onClose, onSave, isLoading }) => {
    const [task, setTask] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
    const [comment, setComment] = useState('');

    const handleSave = () => {
        if (task.trim()) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get current time
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
                            max={new Date().toISOString().split('T')[0]} // Restrict future dates
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