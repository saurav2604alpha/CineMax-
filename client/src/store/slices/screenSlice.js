import { createSlice } from "@reduxjs/toolkit";
const screenSlice = createSlice({ name:"screen", initialState:{ screens:[] }, reducers:{
  toFetchScreens:(s,a)=>{s.screens=a.payload;},
  toAddScreen:(s,a)=>{s.screens.push(a.payload);},
  toEditScreen:(s,a)=>{const i=s.screens.findIndex(x=>x._id===a.payload.screenId);if(i!==-1)s.screens[i]=a.payload.updatedData;},
  toDeleteScreen:(s,a)=>{s.screens=s.screens.filter(x=>x._id!==a.payload);},
}});
export const{toFetchScreens,toAddScreen,toEditScreen,toDeleteScreen}=screenSlice.actions;
export default screenSlice.reducer;
