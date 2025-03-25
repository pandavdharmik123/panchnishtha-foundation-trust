import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../utils/axiosInstance";

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
  tokenNumber?: number;
  returnDate?: Date;
}

export enum PaymentMode {
  CASH = "CASH",
  FREE = "FREE",
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

// ✅ Async thunk to fetch all tokens
export const getAllTokens = createAsyncThunk<
  TokenRequest[], // Response Type
  void,
  { rejectValue: string }
>("tokens/getAllTokens", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/tokens/getAllTokens");
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error: string }>;
    return rejectWithValue(axiosError.response?.data?.error || "Fetching tokens failed");
  }
});

// ✅ Async thunk for creating a token
export const createToken = createAsyncThunk<
  TokenRequest,
  TokenRequest,
  { rejectValue: string }
>(
  "tokens/createToken",
  async (tokenData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/tokens/createToken", tokenData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error: string }>;
      return rejectWithValue(axiosError.response?.data?.error || "Token creation failed");
    }
  }
);

// ✅ Async thunk for updating a token
export const updateToken = createAsyncThunk<
  {updatedToken: TokenRequest},
  { tokenId: string; data: TokenRequest },
  { rejectValue: string }
>(
  "tokens/updateToken",
  async ({ tokenId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/tokens/${tokenId}`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error: string }>;
      return rejectWithValue(axiosError.response?.data?.error || "Token update failed");
    }
  }
);

// ✅ Token Slice
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
      .addCase(getAllTokens.fulfilled, (state, action: PayloadAction<TokenRequest[]>) => {
        state.loading = false;
        state.tokens = action.payload;
      })
      .addCase(getAllTokens.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Fetching tokens failed";
      })
      .addCase(createToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createToken.fulfilled, (state, action: PayloadAction<TokenRequest>) => {
        state.loading = false;
        state.tokens = [action.payload, ...state.tokens];
      })
      .addCase(createToken.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Token creation failed";
      })
      .addCase(updateToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateToken.fulfilled, (state, action: PayloadAction<{updatedToken : TokenRequest}>) => {
        const updatedToken = action.payload?.updatedToken;
        console.log('updatedToken==', updatedToken);
        if (updatedToken) {

          state.tokens = state.tokens.map(token =>
            token.id === updatedToken.id ? { ...token, ...updatedToken } : token
          );
        }
        state.loading = false;
      })
      .addCase(updateToken.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Token update failed";
      });
  },
});

export default tokenSlice.reducer;
