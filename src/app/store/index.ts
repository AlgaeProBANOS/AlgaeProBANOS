import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { PersistConfig } from 'redux-persist';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import undoable from 'redux-undo';

import { service as memoriseApiService } from '@/api/memorise.service';
import { slice as memeroiseSlice } from '@/app/store/memorise.slice';
import { visualizationSlice } from '@/features/common/visualization.slice';
import { uiSlice } from '@/features/ui/ui.slice';

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  version: 1,
  whitelist: [uiSlice.name, memeroiseSlice.name, visualizationSlice.name],
};

const undoableUIReducer = undoable(uiSlice.reducer);

const rootReducer = combineReducers({
  [memoriseApiService.reducerPath]: memoriseApiService.reducer,
  [memeroiseSlice.name]: memeroiseSlice.reducer,
  [visualizationSlice.name]: visualizationSlice.reducer,
  [uiSlice.name]: undoableUIReducer,
  // [uiSlice.name]: uiSlice.reducer,
});

const persistedRootReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          /** `redux-persist` */
          FLUSH,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          REHYDRATE,
        ],
        ignoreState: true,
      },
      /* immutableCheck: {
        // Ignore state paths, e.g. state for 'items':
        ignoredPaths: ['memorise.fragmentsByID'],
      }, */
      immutableCheck: false,
    }).concat(memoriseApiService.middleware);
  },
});

// export const store = configureAppStore();
export const persistor = persistStore(store);

setupListeners(store.dispatch);

// export type AppStore = ReturnType<EnhancedStore>;
// export type AppDispatch = AppStore['dispatch'];
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
