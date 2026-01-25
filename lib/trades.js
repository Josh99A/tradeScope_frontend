import api from "@/lib/axios";

const normalizeParams = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  return search.toString();
};

export const createTradeRequest = async (payload) => {
  
  try {
    const response = await api.post("/trade-requests", payload);
    
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const userMessage = (() => {
      if (!data) return "Unable to submit trade request.";
      if (typeof data === "string") return data;
      if (typeof data?.detail === "string") return data.detail;
      if (typeof data?.message === "string") return data.message;
      if (typeof data?.error === "string") return data.error;
      if (typeof data?.non_field_errors?.[0] === "string") {
        return data.non_field_errors[0];
      }
      if (typeof data?.requested_amount_usd?.[0] === "string") {
        return data.requested_amount_usd[0];
      }
      const firstKey = data && typeof data === "object" ? Object.keys(data)[0] : null;
      if (firstKey) {
        const firstVal = data[firstKey];
        if (typeof firstVal === "string") return firstVal;
        if (Array.isArray(firstVal) && typeof firstVal[0] === "string") {
          return firstVal[0];
        }
      }
      return "Unable to submit trade request.";
    })();
    console.error("Trade request failed", {
      status,
      data,
      payload,
    });
    const wrapped = new Error(userMessage);
    wrapped.cause = error;
    throw wrapped;
  }
};

export const getTradeRequests = async (params = {}) => {
  const query = normalizeParams(params);
  const response = await api.get(
    `/trade-requests${query ? `?${query}` : ""}`
  );
  return response.data;
};

export const getTrades = async (params = {}) => {
  const query = normalizeParams(params);
  const response = await api.get(`/trades${query ? `?${query}` : ""}`);
  return response.data;
};

export const getAdminTradeRequests = async (params = {}) => {
  const query = normalizeParams(params);
  const response = await api.get(
    `/admin/trade-requests${query ? `?${query}` : ""}`
  );
  return response.data;
};

export const executeTradeRequest = async (id, payload) => {
  try {
    const response = await api.post(
      `/admin/trade-requests/${id}?action=execute`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Execute trade request failed", {
      id,
      payload,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

export const rejectTradeRequest = async (id, reason) => {
  try {
    const response = await api.post(
      `/admin/trade-requests/${id}?action=reject`,
      { reason }
    );
    return response.data;
  } catch (error) {
    console.error("Reject trade request failed", {
      id,
      reason,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};
