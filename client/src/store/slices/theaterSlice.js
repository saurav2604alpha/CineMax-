import { createSlice } from "@reduxjs/toolkit";
const theaterSlice = createSlice({ name:"theater", initialState:{ theaters:[] }, reducers:{
  toFetchTheaters:(s,a)=>{s.theaters=a.payload;},
  toAddTheater:(s,a)=>{s.theaters.push(a.payload);},
  toEditTheater:(s,a)=>{const i=s.theaters.findIndex(t=>t._id===a.payload.theaterId);if(i!==-1)s.theaters[i]=a.payload.updatedData;},
  toDeleteTheater:(s,a)=>{s.theaters=s.theaters.filter(t=>t._id!==a.payload);},
}});
export const{toFetchTheaters,toAddTheater,toEditTheater,toDeleteTheater}=theaterSlice.actions;
export default theaterSlice.reducer;
