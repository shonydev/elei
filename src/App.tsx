/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Business, BusinessCategory } from './types';
import { loadBusinesses, saveBusinesses, resetToDefaults } from './services/storage';
import { exportBusinessesToCSV } from './services/csvExport';
import {
  auth,
  onAuthStateChanged,
  signOut,
  checkIsAdmin,
  subscribeToBusinesses,
  saveBusinessToFirestore,
  deleteBusinessFromFirestore,
  seedInitialBusinesses,
  User,
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { MapContainer } from './components/MapContainer';
import { BusinessListView } from './components/BusinessListView';
import { AddBusinessModal } from './components/AddBusinessModal';
import { BusinessDetailsModal } from './components/BusinessDetailsModal';
import { UberBottomDrawer } from './components/UberBottomDrawer';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { RelocationBar } from './components/RelocationBar';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AdminLoginModal } from './components/AdminLoginModal';

export default function App() {
  const [businesses, setBusinesses] = useState<Business[]>(() => loadBusinesses());
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [lastDeletedBusiness, setLastDeletedBusiness] = useState<Business | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Admin RBAC State
  // Default for all visitors: isAdmin = false (Read-only, no add/edit/delete buttons)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Relocation state
  const [relocatingBusiness, setRelocatingBusiness] = useState<Business | null>(null);
  const [relocationCoordinates, setRelocationCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Listen to Auth State Changes & check Admin status
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdm = await checkIsAdmin(user);
        setIsAdmin(isAdm);
        if (isAdm) {
          // Sync base businesses to Firestore so all visitors see them
          seedInitialBusinesses().catch((e) => console.warn('Auto-seed check:', e));
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Realtime Cloud Firestore sync for businesses across all users
  useEffect(() => {
    const unsubscribeFirestore = subscribeToBusinesses(
      (cloudBusinesses) => {
        setBusinesses(cloudBusinesses);
      },
      (error) => {
        console.warn('Realtime sync fallback to local storage:', error);
      }
    );

    return () => unsubscribeFirestore();
  }, []);

  // Backup cache in localStorage for instant offline access
  useEffect(() => {
    if (businesses.length > 0) {
      saveBusinesses(businesses);
    }
  }, [businesses]);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [businesses, selectedCategory, searchQuery]);

  // Add new business handler (Cloud synced)
  const handleSaveBusiness = async (
    newBusinessData: Omit<Business, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>
  ) => {
    const newBusiness: Business = {
      ...newBusinessData,
      id: `business-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 1,
    };

    // Update local state immediately
    const updated = [newBusiness, ...businesses];
    setBusinesses(updated);
    setIsPickingLocation(false);
    setDraftCoordinates(null);
    setSelectedBusiness(newBusiness);
    setViewMode('map');
    setToastMessage(`"${newBusiness.name}" agregada con éxito al mapa`);

    // Sync to Cloud Firestore if Admin
    try {
      await saveBusinessToFirestore(newBusiness);
      setToastMessage(`"${newBusiness.name}" guardada y sincronizada en la nube`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error saving to cloud Firestore:', error);
      setToastMessage(`"${newBusiness.name}" guardada (Aviso nube: ${error.message || 'sin conexión'})`);
    }
  };

  // Trigger delete confirmation modal
  const handleRequestDelete = (business: Business) => {
    if (!isAdmin) return;
    setBusinessToDelete(business);
  };

  // Confirm delete handler (Cloud synced)
  const handleConfirmDelete = async () => {
    if (!businessToDelete || !isAdmin) return;
    const toDelete = businessToDelete;
    setBusinesses((prev) => prev.filter((b) => b.id !== toDelete.id));
    if (selectedBusiness?.id === toDelete.id) {
      setSelectedBusiness(null);
    }
    setLastDeletedBusiness(toDelete);
    setToastMessage(`"${toDelete.name}" se eliminó del mapa`);
    setBusinessToDelete(null);

    // Sync deletion to Cloud Firestore
    try {
      await deleteBusinessFromFirestore(toDelete.id);
    } catch (err) {
      console.error('Error deleting from cloud Firestore:', err);
    }
  };

  // Undo delete handler
  const handleUndoDelete = async () => {
    if (lastDeletedBusiness && isAdmin) {
      const restored = lastDeletedBusiness;
      setBusinesses((prev) => [restored, ...prev]);
      setSelectedBusiness(restored);
      setToastMessage(`"${restored.name}" fue restaurada`);
      setLastDeletedBusiness(null);

      try {
        await saveBusinessToFirestore(restored);
      } catch (err) {
        console.error('Error restoring to cloud Firestore:', err);
      }
    }
  };

  // Handle location picked from clicking on the map
  const handleLocationPicked = (coords: { lat: number; lng: number }) => {
    setDraftCoordinates(coords);
    if (isPickingLocation) {
      setIsPickingLocation(false);
      setIsAddModalOpen(true);
    }
  };

  // Start map pick flow (Admin only)
  const handleStartMapPick = () => {
    if (!isAdmin) return;
    setIsAddModalOpen(false);
    setIsPickingLocation(true);
    setViewMode('map');
  };

  // Relocation handlers (Admin only)
  const handleStartRelocation = (business: Business) => {
    if (!isAdmin) return;
    setRelocatingBusiness(business);
    setRelocationCoordinates({ lat: business.lat, lng: business.lng });
    setSelectedBusiness(null);
    setViewMode('map');
    setToastMessage(`Reubicando "${business.name}". Toca una calle o arrastra el marcador.`);
  };

  const handleConfirmRelocation = async () => {
    if (!relocatingBusiness || !relocationCoordinates || !isAdmin) return;
    const targetId = relocatingBusiness.id;
    const newLat = Number(relocationCoordinates.lat.toFixed(6));
    const newLng = Number(relocationCoordinates.lng.toFixed(6));

    const updatedBusinesses = businesses.map((b) => {
      if (b.id === targetId) {
        return {
          ...b,
          lat: newLat,
          lng: newLng,
        };
      }
      return b;
    });

    setBusinesses(updatedBusinesses);
    const updatedBusiness = updatedBusinesses.find((b) => b.id === targetId) || null;
    setRelocatingBusiness(null);
    setRelocationCoordinates(null);
    setSelectedBusiness(updatedBusiness);
    setToastMessage(`"${updatedBusiness?.name || 'Local'}" reubicado con éxito`);

    // Sync updated coordinates to Cloud Firestore
    if (updatedBusiness) {
      try {
        await saveBusinessToFirestore(updatedBusiness);
      } catch (err) {
        console.error('Error updating business in cloud Firestore:', err);
      }
    }
  };

  const handleCancelRelocation = () => {
    setRelocatingBusiness(null);
    setRelocationCoordinates(null);
  };

  // Admin Logout
  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setCurrentUser(null);
      setToastMessage('Sesión de administrador cerrada');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-stone-100 font-sans select-none">
      {/* Top Navbar with search, filters and role indicators */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        businessCount={filteredBusinesses.length}
        onExportCSV={() => exportBusinessesToCSV(businesses)}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Viewport: Map View or List View */}
      <div className="relative flex-1 w-full h-full">
        {viewMode === 'map' ? (
          <>
            <MapContainer
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={setSelectedBusiness}
              isPickingLocation={isPickingLocation}
              draftCoordinates={draftCoordinates}
              onLocationPicked={handleLocationPicked}
              searchFilter={searchQuery}
              onShowToast={setToastMessage}
              relocatingBusiness={relocatingBusiness}
              relocationCoordinates={relocationCoordinates}
              onRelocationCoordinatesChange={setRelocationCoordinates}
            />

            {/* Uber-style Bottom Drawer */}
            <UberBottomDrawer
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={setSelectedBusiness}
              onClearSelection={() => setSelectedBusiness(null)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onRequestDelete={handleRequestDelete}
              onStartRelocation={handleStartRelocation}
              onShowToast={setToastMessage}
              onExportCSV={() => exportBusinessesToCSV(businesses)}
              isAdmin={isAdmin}
            />
          </>
        ) : (
          <BusinessListView
            businesses={filteredBusinesses}
            onSelectBusiness={(b) => {
              setSelectedBusiness(b);
              setViewMode('map');
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onRequestDelete={handleRequestDelete}
            onStartRelocation={handleStartRelocation}
            onResetDefaults={() => {
              const defaults = resetToDefaults();
              setBusinesses(defaults);
              setToastMessage('Locales sugeridos restaurados');
            }}
            onExportCSV={() => exportBusinessesToCSV(businesses)}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Relocation Floating Bar */}
      {relocatingBusiness && relocationCoordinates && (
        <RelocationBar
          business={relocatingBusiness}
          coordinates={relocationCoordinates}
          onConfirm={handleConfirmRelocation}
          onCancel={handleCancelRelocation}
          onSnapToBulnes={() => {
            const clocks = businesses.find((b) => b.name.toLowerCase().includes('clocks'));
            const targetLat = clocks ? clocks.lat : -37.474403;
            const targetLng = clocks ? clocks.lng : -72.350113;
            setRelocationCoordinates({ lat: targetLat, lng: targetLng });
            setToastMessage('📍 Puesta junto a Clocks en Calle Bulnes');
          }}
        />
      )}

      {/* Business Details Modal (from list view) */}
      {viewMode === 'list' && (
        <BusinessDetailsModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onDelete={(id) => {
            const b = businesses.find((item) => item.id === id);
            if (b) handleRequestDelete(b);
          }}
          onShowOnMap={(b) => {
            setSelectedBusiness(b);
            setViewMode('map');
          }}
          isAdmin={isAdmin}
        />
      )}

      {/* Add New Business Modal (Admin only) */}
      <AddBusinessModal
        isOpen={isAddModalOpen && isAdmin}
        onClose={() => {
          setIsAddModalOpen(false);
          setDraftCoordinates(null);
        }}
        onSave={handleSaveBusiness}
        onStartMapPick={handleStartMapPick}
        initialCoords={draftCoordinates}
      />

      {/* Pure React Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(businessToDelete)}
        business={businessToDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => setBusinessToDelete(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={(isAdm) => {
          if (isAdm) {
            setToastMessage('¡Bienvenido, Administrador!');
          } else {
            setToastMessage('Inicio de sesión exitoso');
          }
        }}
      />

      {/* Toast Notification with Undo */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        undoAction={lastDeletedBusiness ? handleUndoDelete : undefined}
      />

      {/* Offline Status Pill */}
      <OfflineIndicator />
    </div>
  );
}
