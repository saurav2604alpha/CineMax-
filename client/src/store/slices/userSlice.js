import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({ name:"user", initialState:{ users:[] }, reducers:{
  toFetchUsers:(s,a)=>{s.users=a.payload;},
  toAddUser:(s,a)=>{s.users.push(a.payload);},
  toDeleteUser:(s,a)=>{s.users=s.users.filter(u=>u._id!==a.payload);},
}});
export const{toFetchUsers,toAddUser,toDeleteUser}=userSlice.actions;
export default userSlice.reducer;
