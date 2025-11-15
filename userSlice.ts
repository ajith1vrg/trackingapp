import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  tripCode: string;
  userName: string;
  vehicleNo: string;
  phoneNo: string;
  isStart: boolean;
}

interface UserState {
  username: string | null;
  userId: string | null;
  profile: UserProfile | null;
}

const initialState: UserState = {
  username: null,
  userId: null,
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ✅ combine username + userid in one action
    setLogin: (state, action: PayloadAction<{ userId: string; username: string }>) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearUser: (state) => {
      state.username = null;
      state.userId = null;
      state.profile = null;
    },
  },
});

export const { setLogin, setProfile, clearUser } = userSlice.actions;
export default userSlice.reducer;