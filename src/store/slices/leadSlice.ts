import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {leadAPI} from '../../services/api';

export type LeadStatus = 'New' | 'Contacted' | 'Converted' | 'Lost';

export interface Lead {
  id: string;
  title: string;
  description: string;
  status: LeadStatus;
  value: number;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  statusFilter: LeadStatus | 'All';
}

const initialState: LeadState = {
  leads: [],
  currentLead: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  statusFilter: 'All',
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params: {page?: number; status?: LeadStatus; customerId?: string} = {}) => {
    const response = await leadAPI.getLeads(params);
    return response;
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await leadAPI.createLead(leadData);
    return response;
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({id, data}: {id: string; data: Partial<Lead>}) => {
    const response = await leadAPI.updateLead(id, data);
    return response;
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string) => {
    await leadAPI.deleteLead(id);
    return id;
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id: string) => {
    const response = await leadAPI.getLeadById(id);
    return response;
  }
);

export const fetchLeadsByCustomer = createAsyncThunk(
  'leads/fetchLeadsByCustomer',
  async (customerId: string) => {
    const response = await leadAPI.getLeadsByCustomer(customerId);
    return response;
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<LeadStatus | 'All'>) => {
      state.statusFilter = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.totalCount = action.payload.totalCount;
        state.error = null;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(createLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.unshift(action.payload);
        state.totalCount += 1;
        state.error = null;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create lead';
      })
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leads.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?.id === action.payload.id) {
          state.currentLead = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update lead';
      })
      .addCase(deleteLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter(l => l.id !== action.payload);
        state.totalCount -= 1;
        if (state.currentLead?.id === action.payload) {
          state.currentLead = null;
        }
        state.error = null;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete lead';
      })
      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
        state.error = null;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lead';
      })
      .addCase(fetchLeadsByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadsByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
        state.error = null;
      })
      .addCase(fetchLeadsByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customer leads';
      });
  },
});

export const {setStatusFilter, setCurrentPage, clearError, clearCurrentLead} = leadSlice.actions;
export default leadSlice.reducer;
