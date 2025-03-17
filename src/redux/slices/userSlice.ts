import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// ✅ Define User Input Type
interface UserInput {
  email: string;
  password: string;
}

// ✅ Define Response Type
interface UserResponse {
  userName: string;
  token: string;
}

// ✅ Define User State Type
interface UserState {
  user: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ✅ Initial State
const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// ✅ Async thunk for login
export const loginUser = createAsyncThunk<UserResponse, UserInput, { rejectValue: string }>(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", userData);
      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Something went wrong!';
      return rejectWithValue(
        error instanceof Error ? message : "Login failed"
      );
    }
  }
);

// ✅ Async thunk for logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.get("/auth/logout");
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  }
);

// ✅ User Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null; // Reset error on manual logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.loading = false;
        state.user = action.payload.userName;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null; // Reset error on successful logout
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload || "Logout failed";
      });
  },
});

// export const { logout } = userSlice.actions;
export default userSlice.reducer;
