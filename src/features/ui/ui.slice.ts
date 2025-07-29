import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit';

import type { RootState } from '@/app/store';

export interface Tab {
  id: string;
  order?: number;
  title: string;
  contentID: string;
  type: string;
  rendered: boolean;
}

export interface TabBar {
  id: string;
  tabs: Record<string, Tab>;
  selectedTab?: Tab['id'];
  rendered?: boolean;
}

interface UiState {
  documents: { [key: string]: Document };
  tabBars: Record<string, TabBar>;
  settings: Record<string, any>;
}

interface Author {
  firstName: string;
  lastName: string;
  id: string;
}

interface Document {
  id: string;
  author: Author;
}

const initialState: UiState = {
  documents: {},
  tabBars: { '0': { id: '0', tabs: {} }, '1': { id: '1', tabs: {} } },
  settings: {
    alignScrolling: true,
    showAnnotations: true
  }
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /*createTabInTabBar: (state, action: PayloadAction<string>) => {
      const tabBarId = action.payload;
      const key = nanoid(4);
      if (state.tabBars[tabBarId] != null) {
        const tab = {
          id: key,
          title: key,
          content: 'Empty',
          order: Object.keys(state.tabBars[tabBarId]!.tabs).length,
        };
        state.tabBars[tabBarId]!.tabs[key] = tab;
      }
    },*/
    setSetting: (state, action: PayloadAction<{ setting: string; value: any }>) => {
      const { setting, value } = action.payload;
      if(state.settings[setting] !== undefined) {
        state.settings[setting] = value;
      }
    },
    setTabRendered: (state, action: PayloadAction<{ tabID: string; rendered: boolean }>) => {
      const { tabID, rendered } = action.payload;
      for (const tabBarID of Object.keys(state.tabBars)) {
        const tabBar = state.tabBars[tabBarID];
        if (
          tabBar != null &&
          tabBar.tabs[tabID] != null &&
          state.tabBars[tabBarID] != null &&
          state.tabBars[tabBarID].tabs[tabID] != null
        ) {
          state.tabBars[tabBarID].tabs[tabID].rendered = rendered;
        }
      }
    },
    createTabInTabBarWithDocumentID: (
      state,
      action: PayloadAction<{ id: string; documentID: string }>,
    ) => {
      // const tabBarId = action.payload.id;
      // const documentID = action.payload.documentID;
      const { id, documentID } = action.payload;
      const key = nanoid(4);

      if (state.tabBars[id] != null) {
        const tab = {
          id: key,
          title: 'Will be set later', //tab.tsx
          contentID: documentID,
          order: 0,
          type: 'document',
          rendered: false,
        };
        state.tabBars[id]!.tabs[key] = tab;
      }
    },
    createEmptyTab: (state, action: PayloadAction<string>) => {
      const id = `emptyTab-${nanoid(4)}`;
      const tabBarId = action.payload;

      if (state.tabBars[tabBarId] != null) {
        const tab = {
          id: id,
          title: 'Will be set later', //tab.tsx
          contentID: id,
          order: 0,
          type: 'emptyTab',
          rendered: false,
        };

        state.tabBars[tabBarId]!.tabs[id] = tab;
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      for (const tabBarId of Object.keys(state.tabBars)) {
        if (state.tabBars[tabBarId]!.tabs[tabId] != null) {
          delete state.tabBars[tabBarId]!.tabs[tabId];
        }
      }
    },
    moveTabToTabBar: (
      state: UiState,
      action: PayloadAction<{ tabId: string; destinationTabBar: string }>,
    ) => {
      const { tabId, destinationTabBar } = action.payload;
      for (const tabBarId of Object.keys(state.tabBars)) {
        const tabBar = state.tabBars[tabBarId];
        if (tabBar != null && tabBar.tabs[tabId] != null) {
          const copyTab = tabBar.tabs[tabId] as Tab;
          delete tabBar.tabs[tabId];
          const newTabBar = state.tabBars[destinationTabBar] as TabBar;
          newTabBar.tabs[copyTab.id] = copyTab;
        }
      }
    },
    selectTabInTabBar: (
      state: UiState,
      action: PayloadAction<{ tabId: string; tabBar: string }>,
    ) => {
      const { tabId, tabBar } = action.payload;
      if (Object.keys(state.tabBars).includes(tabBar)) {
        state.tabBars[tabBar]!.selectedTab = tabId;
      }
    },
    addTabBar: (state: UiState) => {
      const newID = nanoid(4);
      state.tabBars[newID] = { id: newID, tabs: {} };
    },
    deleteTabBar: (state: UiState, action: PayloadAction<{ tabBar: string }>) => {
      const { tabBar } = action.payload;
      if (state.tabBars[tabBar]) {
        delete state.tabBars[tabBar];
      }
    },
  },
});

export const {
  removeTab,
  moveTabToTabBar,
  createTabInTabBarWithDocumentID,
  selectTabInTabBar,
  createEmptyTab,
  setTabRendered,
  addTabBar,
  deleteTabBar,
  setSetting,
} = uiSlice.actions;

/* export function selectTabs(state: RootState): Record<string, Tab> {
  return state.ui.present.tabs;
} */

export function selectTabBars(state: RootState): Record<string, TabBar> {
  return state.ui.present.tabBars;
}

export const selectSetting = createSelector(
  (state: RootState) => {
    return state.ui.present.settings;
  },
  (state: RootState, setting: string) => {
    return setting;
  },
  (settings, setting) => {
    return settings[setting];
  },
);

// export const selectTabByID = createSelector(
//   (state: RootState) => {
//     return state.ui;
//   },
//   (state: RootState, id: string) => {
//     return id;
//   },
//   (uiState, id: string) => {
//     return uiState.present.tabs[id];
//   },
// );

// export const selectTabBarByID = createSelector(
//   (state: RootState) => {
//     return state.ui;
//   },
//   (state: RootState, id: string) => {
//     return id;
//   },
//   (uiState, id: string) => {
//     return uiState.present.tabs[id];
//   },
// );
