import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBasketItems } from '@/redux/actions/basketActions';
import firebaseInstance from '@/services/firebase';

const CartSync = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.auth?.id); // Fixed: auth reducer stores 'id', not 'uid'
  const basket = useSelector(state => state.basket || []);
  const isInitialLoad = useRef(true);
  const lastSyncedBasket = useRef(null);

  // Load basket from Firebase on auth change
  useEffect(() => {
    const unsubscribe = firebaseInstance.auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const doc = await firebaseInstance.db.collection('users').doc(user.uid).get();
          const data = doc.data();
          const firebaseBasket = data?.basket || [];

          // Mark as initial load to prevent immediate sync back
          isInitialLoad.current = true;
          lastSyncedBasket.current = JSON.stringify(firebaseBasket);

          dispatch(setBasketItems(firebaseBasket));
          console.log('✅ Loaded basket from Firebase:', firebaseBasket);
        } catch (e) {
          console.error('❌ Failed to load basket from Firebase:', e);
        }
      } else {
        // User logged out, clear basket
        isInitialLoad.current = true;
        lastSyncedBasket.current = null;
        dispatch(setBasketItems([]));
        console.log('🔓 User logged out, basket cleared');
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  // Sync basket to Firebase whenever it changes (but not on initial load)
  useEffect(() => {
    // Skip if no user is logged in
    if (!userId) {
      return;
    }

    // Skip initial load to prevent writing back what we just read
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Validate basket is an array
    if (!Array.isArray(basket)) {
      console.error('❌ Basket is not an array:', basket);
      return;
    }

    // Check if basket actually changed
    const currentBasketStr = JSON.stringify(basket);
    if (currentBasketStr === lastSyncedBasket.current) {
      return; // No change, skip sync
    }

    // Sync to Firebase
    console.log('🔄 Syncing basket to Firebase:', basket);
    firebaseInstance.updateCartInFirebase(userId, basket)
      .then(() => {
        lastSyncedBasket.current = currentBasketStr;
        console.log('✅ Basket synced to Firebase successfully');
      })
      .catch(e => {
        console.error('❌ Failed to sync basket to Firebase:', e);
      });
  }, [basket, userId]);

  return null;
};

export default CartSync;
