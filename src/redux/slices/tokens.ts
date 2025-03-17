import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import { notification } from 'antd';

export interface TokenRequest {
  id?: string;
  name?: string;
  documentType?: string;
  mobileNumber?: string;
  isPaymentDone?: boolean;
  paymentMode?: PaymentMode;
  isReturn?: boolean;
  userId?: string;
  userDetail?: User;
  amount?: number;
  createdAt?: Date;
}

// Assuming PaymentMode and User interfaces are defined elsewhere
export enum PaymentMode {
  CASH = "CASH",
  CARD = "CARD",
  ONLINE = "ONLINE",
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

interface UserState {
  tokens: TokenRequest[];
  loading: boolean;
  error: string | null;
}

// ✅ Initial State
const initialState: UserState = {
  tokens: [],
  loading: false,
  error: null,
};

interface TokenResponse {
  data: TokenRequest[],
}

export const getAllTokens = createAsyncThunk<
  any, // Replace with actual response type if known
  void,
  { rejectValue: string }
>("tokens/getAllTokens", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/tokens/getAllTokens");
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.error || "Something went wrong!";
    return rejectWithValue(
      error instanceof Error ? message : "Fetching tokens failed"
    );
  }
});


// ✅ Async thunk for logout
export const createToken = createAsyncThunk<TokenRequest, void, { rejectValue: string }>(
  "tokens/createToken",
  async (tokenData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/tokens/createToken", tokenData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  }
);

export const updateToken = createAsyncThunk<any, any, { rejectValue: string }>(
  "tokens/updateToken",
  async (payload, { rejectWithValue }) => {
    const { tokenId, data } = payload;

    try {
      const response = await axiosInstance.patch(`/tokens/${tokenId}`, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  }
);

// ✅ User Slice
const tokenSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTokens.fulfilled, (state, action: any) => {
        state.loading = false;
        state.tokens = action.payload;
      })
      .addCase(getAllTokens.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(createToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createToken.fulfilled, (state, action: any) => {
        state.loading = false;
        state.tokens = [action.payload, ...state.tokens];
      })
      .addCase(createToken.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(updateToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateToken.fulfilled, (state, action: any) => {
        const updatedData = action?.payload?.updatedToken;
        if(updatedData) {
          const updatedTokens = state.tokens.map(token => 
            token.id === updatedData.id ? { ...token, ...updatedData } : token
          );
          state.tokens = updatedTokens;
          state.loading = false;
        }
        
      })
      .addCase(updateToken.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Update Failed";
      })
  },
});

// export const { logout } = tokenSlice.actions;
export default tokenSlice.reducer;
