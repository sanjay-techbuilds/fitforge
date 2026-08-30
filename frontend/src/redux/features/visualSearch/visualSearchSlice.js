// frontend/src/redux/features/visualSearch/visualSearchSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    model: null, // This will hold the loaded AI model
    status: 'Click the icon to start...', // This will show loading/ready messages
    results: [], // This will store the search results
};

const visualSearchSlice = createSlice({
    name: 'visualSearch',
    initialState,
    reducers: {
        // Action to save the loaded model into the state
        setModel: (state, action) => {
            state.model = action.payload;
        },
        // Action to update the status message
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        // Action to save the search results
        setResults: (state, action) => {
            state.results = action.payload;
        },
    },
});

export const { setModel, setStatus, setResults } = visualSearchSlice.actions;
export default visualSearchSlice.reducer;