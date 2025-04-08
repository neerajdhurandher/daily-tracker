import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, updateCategory, deleteCategory } from '../lib/services/categoryService';
import AddCategoryPopUp from '../lib/components/AddCategoryPopUp';
import TaskContainer from './TaskContainer';
import uuid from 'react-uuid';
import PropTypes from 'prop-types';
import Image from 'next/image';

const CategoryPage = ({ user }) => {

    const [categories, setCategories] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [popupMode, setPopupMode] = useState('add');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [isPageContainerOpen, setIsPageContainerOpen] = useState(false);

    // Check if user is logged in
    if (!user) {
        return <div>Please log in to view categories.</div>;
    }

    const fetchCategories = async () => {
        if (!user?.uid) return;
        const fetchedCategories = await getCategories(user.uid);
        setCategories(fetchedCategories);
        localStorage.setItem('categories', JSON.stringify(fetchedCategories));
    };

    // Fetch categories from localstorage or Firestore for the logged-in user
    useEffect(() => {
        console.log('Fetching categories...');
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        } else {
            fetchCategories();
        }

    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setOpenDropdownId(null); // Close any open dropdown
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Apply text color adjustment after rendering
        const textElements = document.querySelectorAll('.category-name');
        textElements.forEach(setTextColorBasedOnParent);
    }, [categories]); // Reapply when categories change



    // Function to handle category card click
    const handleCategoryClick = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        setSelectedCategory(category);
        setIsPageContainerOpen(true); // Open PageContainer
    };

    // Close PageContainer and return to CategoryPage
    const closePageContainer = () => {
        setIsPageContainerOpen(false);
        setSelectedCategory(null);
    };

    // Toggle dropdown visibility
    const toggleDropdown = (categoryId) => {
        console.log('toggleDropdown', categoryId);
        setOpenDropdownId((prevId) => (prevId === categoryId ? null : categoryId));
    };

    // Open popup for adding or editing a category
    const openPopup = (mode, category = null) => {
        toggleDropdown(null);
        setPopupMode(mode);
        setSelectedCategory(category);
        setIsPopupOpen(true);
    };

    // Close popup
    const closePopup = () => {
        setIsLoading(false);
        setIsPopupOpen(false);
        setSelectedCategory(null);
    };

    // Save or update category
    const handleSave = async (formData) => {
        // Ensure user is logged in
        if (!user?.uid) return;
        setIsLoading(true);
        const time = new Date().toISOString();
        if (popupMode === 'add') {
            const categoryIdUuid = uuid();
            const newCategory = { ...formData, userId: user.uid, createdAt: time, updatedAt: time, id: categoryIdUuid };
            const savedCategoryResult = await saveCategory(user.uid, newCategory);
            if (!savedCategoryResult) return;
            setCategories((prev) => [...prev, newCategory]);
            localStorage.setItem('categories', JSON.stringify([...categories, newCategory]));
        } else if (popupMode === 'edit' && selectedCategory) {
            const updatedCategory = { ...selectedCategory, ...formData, updatedAt: time };
            await updateCategory(user.uid, selectedCategory.id, updatedCategory);
            const updatedCategories = categories.map((cat) =>
                cat.id === selectedCategory.id ? updatedCategory : cat
            );
            setCategories(updatedCategories);
            localStorage.setItem('categories', JSON.stringify(updatedCategories));
        }
        closePopup();
    };

    // Open delete confirmation popup
    const openDeletePopup = (category) => {
        toggleDropdown(null);
        setSelectedCategory(category);
        setIsDeletePopupOpen(true);
    };

    // Close delete confirmation popup
    const closeDeletePopup = () => {
        setIsLoading(false);
        setIsDeletePopupOpen(false);
        setSelectedCategory(null);
    };

    // Delete category
    const handleDelete = async () => {
        if (!selectedCategory) return;
        setIsLoading(true);
        await deleteCategory(user.uid, selectedCategory.id);
        const updatedCategories = categories.filter((cat) => cat.id !== selectedCategory.id);
        setCategories(updatedCategories);
        localStorage.setItem('categories', JSON.stringify(updatedCategories));
        closeDeletePopup();
    };

    function setTextColorBasedOnParent(element) {
        const parent = element.parentElement;  // header div
        const superParent = parent.parentElement; // category-card div
        const parentStyle = window.getComputedStyle(superParent);
        let bgColor = parentStyle.backgroundColor;
    
        // Convert hex or named colors to RGB if necessary
        if (!bgColor.startsWith('rgb')) {
            const tempDiv = document.createElement('div');
            tempDiv.style.backgroundColor = bgColor;
            document.body.appendChild(tempDiv);
            bgColor = window.getComputedStyle(tempDiv).backgroundColor;
            document.body.removeChild(tempDiv);
        }
    
        // Extract RGB values
        const rgb = bgColor.match(/\d+/g).map(Number);
    
        // Calculate luminance
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        console.log('Luminance:', luminance, 'Background Color:', bgColor);
        console.log('Text Color:', luminance > 0.5 ? 'black' : 'white',);
    
        // Set text color based on luminance
        element.style.color = luminance > 0.5 ? 'black' : 'white';
    }

    return (
        <>
            {(isPageContainerOpen && selectedCategory) ? (
                <TaskContainer user={user} category={selectedCategory} onClose={closePageContainer} />
            ) : (
                <div className="category-page">
                    <span className="category-header-text">Categories</span>
                    <div className="category-grid">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="category-card"
                                style={{ backgroundColor: category.color }} onClick={() => handleCategoryClick(category.id)}

                            >
                                <div className="category-header">
                                    <span className="category-name">{category.name}</span>
                                    <div className="dropdown"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the parent onClick
                                        }}>
                                        <Image
                                            src="/three-dots-icon.svg"
                                            alt="Options"
                                            className="three-dots-icon"
                                            width={40}
                                            height={40}
                                            onClick={() => toggleDropdown(category.id)}
                                        />
                                        {openDropdownId === category.id && (
                                            <div className="dropdown-menu">
                                                <span onClick={() => openPopup('edit', category)} className="dropdown-item">
                                                    Edit
                                                </span>
                                                <span onClick={() => openDeletePopup(category)} className="dropdown-item">
                                                    Delete
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="category-description">{category.description}</p>
                            </div>
                        ))}
                        <div className="add-category-card" onClick={() => openPopup('add')}>
                            <Image src="/plus-icon.svg" alt="Add" className="add-icon" width={40}
                                height={40} />
                        </div>
                    </div>

                    {isPopupOpen && (
                        <AddCategoryPopUp
                            onClose={closePopup}
                            onSave={handleSave}
                            mode={popupMode}
                            category={selectedCategory}
                            isLoading={isLoading}
                        />
                    )}

                    {isDeletePopupOpen && (
                        <div className="popup-overlay">
                            <div className="popup-container">
                                <h2>Delete {selectedCategory?.name} category ?</h2>
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
                </div>
            )}
        </>
    );
};

CategoryPage.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired,
    }).isRequired,
};

export default CategoryPage;
