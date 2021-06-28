import { STATE_TOKEN_KEY_NAME } from "@okta/okta-auth-js";
import { createSlice } from "@reduxjs/toolkit";

export const linkOptionsSlice = createSlice({
  name: "linkOptions",
  initialState: {
    classifications: {
      saved: [],
      draft: [],
    },
    timeLimit: {
      saved: {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      draft: {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    },
    clickLimit: {
      saved: undefined,
      draft: undefined,
    },
    goRogue: false,
    didCheckCustomDomain: false,
    coolDownCount: 30,
  },
  reducers: {
    updateClassifications: (state, action) => {
      state.classifications.draft = action.payload;
    },
    saveClassifications: (state) => {
      state.classifications.saved = state.classifications.draft;
    },
    clearClassifications: (state) => {
      state.classifications.draft = state.classifications.saved;
    },
    updateTimeLimit: (state, action) => {
      state.timeLimit.draft = action.payload;
    },
    saveTimeLimit: (state) => {
      state.timeLimit.saved = state.timeLimit.draft;
    },
    clearTimeLimit: (state) => {
      state.timeLimit.draft = state.timeLimit.saved;
    },
    updateClickLimit: (state, action) => {
      state.clickLimit.draft = action.payload;
    },
    saveClickLimit: (state) => {
      state.clickLimit.saved = state.clickLimit.draft;
    },
    clearClickLimit: (state) => {
      state.clickLimit.draft = state.clickLimit.saved;
    },
    updateGoRogue: (state, action) => {
      state.goRogue = action.payload;
    },
    updateCustomDomainChecker: (state, action) => {
      if (action.payload === true) {
        state.didCheckCustomDomain = true;
        state.coolDownCount = 120;
      }
    },
    resetAllOptions: (state, action) => {
      state.classifications = {
        saved: [],
        draft: [],
      };

      state.timeLimit = {
        saved: {
          total: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        draft: {
          total: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
      };

      state.clickLimit = {
        saved: undefined,
        draft: undefined,
      };

      state.goRogue = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateClassifications,
  saveClassifications,
  clearClassifications,
  updateTimeLimit,
  saveTimeLimit,
  clearTimeLimit,
  updateClickLimit,
  saveClickLimit,
  clearClickLimit,
  updateGoRogue,
  updateCustomDomainChecker,
  resetAllOptions,
} = linkOptionsSlice.actions;

export default linkOptionsSlice.reducer;
