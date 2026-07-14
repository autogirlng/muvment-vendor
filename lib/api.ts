import { getSession } from "next-auth/react";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ApiResponse<T> {
  status: "SUCCESSFUL" | "FAILED";
  message: string;
  errorCode?: string;
  data: T | null;
  timestamp: string;
}

// Fetch wrapper with error handling and NextAuth integration
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  let headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  // Check if we are on the client side and don't already have an Authorization header
  if (
    typeof window !== "undefined" &&
    !options.headers?.hasOwnProperty("Authorization")
  ) {
    const session = await getSession();
    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({}));

  if (response.status === 401) {
    // Attempt to open the session expiration modal
    if (typeof window !== "undefined" && (window as any).showSessionExpired) {
      (window as any).showSessionExpired();
    }
    throw new Error("Session expired");
  }

  if (!response.ok || data.status === "FAILED") {
    throw new Error(data.message || "An unexpected error occurred");
  }

  return data;
}

// --- Auth Endpoints ---

export const AuthAPI = {
  signup: (payload: any) =>
    fetchApi<null>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyAccount: (payload: { email: string; otp: string }) =>
    fetchApi<null>("/auth/verify-account", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: any) =>
    // We don't use fetchApi here because login sets the initial token and is called from auth.ts backend
    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json()),

  forgotPassword: (payload: { email: string }) =>
    fetchApi<null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: any) =>
    fetchApi<null>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refreshToken: (payload: { refreshToken: string }) =>
    fetchApi<{ accessToken: string }>("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// --- Vendor Endpoints ---

export const VendorAPI = {
  createVendor: (payload: any) =>
    fetchApi<any>("/vendors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  myVendors: () => fetchApi<any[]>("/vendors/my-vendors", { method: "GET" }),

  getVendorDetails: (vendorId: string) =>
    fetchApi<any>(`/vendors/${vendorId}`, { method: "GET" }),

  getKycStatus: (vendorId: string) =>
    fetchApi<any>(`/vendors/${vendorId}/kyc`, {
      method: "GET",
    }),

  submitKyc: (vendorId: string, payload: { rcNumber: string; officeAddress: string; staffCount: number; natureOfServices: string }) =>
    fetchApi<any>(`/vendors/${vendorId}/kyc`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // --- Team & Invites ---

  inviteStaff: (vendorId: string, payload: { email: string }) =>
    fetchApi<any>(`/vendors/${vendorId}/staff`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMembers: (vendorId: string, page: number = 0, size: number = 10) =>
    fetchApi<any>(`/vendors/${vendorId}/members?page=${page}&size=${size}`, {
      method: "GET",
    }),

  getPendingInvites: (vendorId: string) =>
    fetchApi<any[]>(`/vendors/${vendorId}/invites`, {
      method: "GET",
    }),

  cancelInvite: (vendorId: string, inviteId: string) =>
    fetchApi<any>(`/vendors/${vendorId}/invites/${inviteId}`, {
      method: "DELETE",
    }),

  resendInvite: (vendorId: string, inviteId: string) =>
    fetchApi<any>(`/vendors/${vendorId}/invites/${inviteId}/resend`, {
      method: "POST",
    }),

  changeMemberRole: (vendorId: string, userId: string, newRole: "VENDOR_ADMIN" | "VENDOR_STAFF") =>
    fetchApi<any>(`/vendors/${vendorId}/members/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ newRole }),
    }),

  toggleStaffSuspension: (vendorId: string, userId: string) =>
    fetchApi<any>(`/vendors/${vendorId}/staff/${userId}/suspend`, {
      method: "PATCH",
    }),

  removeStaff: (vendorId: string, userId: string) =>
    fetchApi<any>(`/vendors/${vendorId}/staff/${userId}`, {
      method: "DELETE",
    }),

  // --- API Keys ---

  generateApiKey: (vendorId: string, payload: { name: string }) =>
    fetchApi<any>(`/vendors/${vendorId}/api-keys`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getApiKeys: (vendorId: string) =>
    fetchApi<any[]>(`/vendors/${vendorId}/api-keys`, {
      method: "GET",
    }),

  revokeApiKey: (vendorId: string, keyId: string) =>
    fetchApi<any>(`/vendors/${vendorId}/api-keys/${keyId}`, {
      method: "DELETE",
    }),
};
