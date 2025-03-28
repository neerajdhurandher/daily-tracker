import React, { useState, useEffect } from 'react';

const AddCategoryPopUp = ({ onClose, onSave, mode = 'add', category = null, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#ffffff',
    });

    // Initialize form data when the component mounts or when the category changes
    useEffect(() => {
        if (mode === 'edit' && category) {
            setFormData({
                name: category.name,
                description: category.description,
                color: category.color,
            });
        } else {
            setFormData({ name: '', description: '', color: '#ffffff' });
        }
    }, [mode, category]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle save button click
    const handleSave = () => {
        if (formData.name.trim()) {
            onSave(formData); // Pass form data to the parent component
        } else {
            alert('Category Name is required!');
        }
    };


    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-header">
                    <h2>{mode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="popup-body">
                    <label>
                        Category Name:
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter category name"
                            required
                        />
                    </label>
                    <label>
                        Category Description:
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter category description"
                        ></textarea>
                    </label>

                    <label>
                        Category Colour:
                        <div
                            className="color-preview"
                            style={{ backgroundColor: formData.color }}

                        >
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                            />
                        </div>

                    </label>

                </div>
                <div className="popup-footer">
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={!formData.name.trim() || isLoading} // Disable button if name is empty or isLoading is true
                    >
                        {isLoading ? 'Saving...' : 'Save'} {/* Show "Saving..." when loading */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryPopUp;