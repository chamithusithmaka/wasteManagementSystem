import { useState } from 'react';

/**
 * Custom hook for managing modal states and data
 */
export const useModalManagement = () => {
  // Modal states
  const [modals, setModals] = useState({
    edit: { isOpen: false, container: null },
    location: { isOpen: false, container: null },
    deleteConfirm: { isOpen: false, container: null },
    deactivateConfirm: { isOpen: false, container: null }
  });

  // Modal data states
  const [locationData, setLocationData] = useState({
    address: '',
    city: '',
    province: ''
  });

  const [loadingStates, setLoadingStates] = useState({
    update: false,
    action: false
  });

  const [notifications, setNotifications] = useState({
    updateError: null,
    updateSuccess: false,
    actionError: null
  });

  // Modal management functions
  const openModal = (modalType, container = null) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { isOpen: true, container }
    }));

    // Set location data if it's a location modal
    if (modalType === 'location' && container) {
      setLocationData({
        address: container.containerLocation?.address || '',
        city: container.containerLocation?.city || '',
        province: container.containerLocation?.province || ''
      });
    }

    // Clear notifications
    clearNotifications();
  };

  const closeModal = (modalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { isOpen: false, container: null }
    }));

    if (modalType === 'location') {
      setLocationData({ address: '', city: '', province: '' });
    }

    clearNotifications();
  };

  const setLoading = (loadingType, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [loadingType]: isLoading
    }));
  };

  const setNotification = (notificationType, value) => {
    setNotifications(prev => ({
      ...prev,
      [notificationType]: value
    }));
  };

  const clearNotifications = () => {
    setNotifications({
      updateError: null,
      updateSuccess: false,
      actionError: null
    });
  };

  return {
    // States
    modals,
    locationData,
    setLocationData,
    loadingStates,
    notifications,

    // Actions
    openModal,
    closeModal,
    setLoading,
    setNotification,
    clearNotifications
  };
};