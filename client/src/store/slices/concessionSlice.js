import { createSlice } from "@reduxjs/toolkit";

const concessionSlice = createSlice({
  name: "concession",
  initialState: { concessions: [] },
  reducers: {
    toFetchConcessions: (s, a) => { s.concessions = a.payload; },
    toAddConcession:    (s, a) => { s.concessions.push(a.payload); },
    toEditConcession:   (s, a) => {
      const i = s.concessions.findIndex(x => String(x._id) === String(a.payload.concessionId));
      if (i !== -1) s.concessions[i] = a.payload.updatedData;
    },
    toDeleteConcession: (s, a) => {
      s.concessions = s.concessions.filter(x => String(x._id) !== String(a.payload));
    },
    // BUG FIX: use String() comparison to avoid ObjectId vs string mismatch
    toUpdateStock: (s, a) => {
      (a.payload.updatedConcession || []).forEach(u => {
        const i = s.concessions.findIndex(c => String(c._id) === String(u._id));
        if (i !== -1) s.concessions[i] = { ...s.concessions[i], stock: u.stock };
      });
    },
  },
});

export const {
  toFetchConcessions, toAddConcession, toEditConcession,
  toDeleteConcession, toUpdateStock,
} = concessionSlice.actions;

export default concessionSlice.reducer;
