import React, { useState, useEffect } from 'react';
import { getCategories, saveCategory, updateCategory, deleteCategory } from '../lib/services/categoryService';
import AddCategoryPopUp from '../lib/components/AddCategoryPopUp';
import PageContainer from './PageContainer';
import uuid from 'react-uuid';

const CategoryPage = ({ user }) => {

    const [categories, setCategories] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [popupMode, setPopupMode] = useState('add'); // 'add' or 'edit'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null); 
    const [isPageContainerOpen, setIsPageContainerOpen] = useState(false);
    
    // Check if user is logged in
    if (!user) {
        return <div>Please log in to view categories.</div>; 
    }


    // Fetch categories from Firestore for the logged-in user
    useEffect(() => {
        const fetchCategories = async () => {
            if (!user?.uid) return; // Ensure user is logged in
            const fetchedCategories = await getCategories(user.uid); // Use taskService's getCategories
            setCategories(fetchedCategories);
            localStorage.setItem('categories', JSON.stringify(fetchedCategories));
        };
        fetchCategories();
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

    return (
        <>
            {(isPageContainerOpen && selectedCategory) ? (
                <PageContainer user={user} category={selectedCategory} onClose={closePageContainer} />
            ) : (
                <div className="category-page">
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
                                        <img
                                            src="/three-dots-icon.svg"
                                            alt="Options"
                                            className="three-dots-icon"
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
                            <img src="/plus-icon.svg" alt="Add" className="add-icon" />
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

export default CategoryPage;
