import { getToken } from './auth';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  prodi_nama?: string;
  prodi_kode?: string;
  angkatan: number;
  foto?: string | null;
  created_at?: string;
};

export type MahasiswaInput = {
  nim: string;
  nama: string;
  prodi_id: number;
  angkatan: number;
  foto?: File | null;
};

export type Prodi = {
  id: number;
  nama: string;
  kode: string;
};

type ApiResponse<T> = {
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired atau tidak valid — redirect ke login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    throw new Error(result.message || 'Terjadi kesalahan saat mengakses API');
  }
  return result;
}

// ===================== PRODI API =====================

export async function getProdi(): Promise<Prodi[]> {
  const response = await fetch(`${API_URL}/prodi`);
  const result = await handleResponse<Prodi[]>(response);
  return result.data || [];
}

// ===================== MAHASISWA API =====================

export async function getMahasiswa(params?: {
  search?: string;
  prodi_id?: number;
  page?: number;
  limit?: number;
}): Promise<{ data: Mahasiswa[]; meta: ApiResponse<Mahasiswa[]>['meta'] }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.prodi_id) query.set('prodi_id', String(params.prodi_id));
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const response = await fetch(`${API_URL}/mahasiswa?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  const result = await handleResponse<Mahasiswa[]>(response);
  return { data: result.data || [], meta: result.meta };
}

export async function createMahasiswa(payload: MahasiswaInput): Promise<Mahasiswa> {
  const formData = new FormData();
  formData.append('nim', payload.nim);
  formData.append('nama', payload.nama);
  formData.append('prodi_id', String(payload.prodi_id));
  formData.append('angkatan', String(payload.angkatan));
  if (payload.foto) {
    formData.append('foto', payload.foto);
  }

  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  const result = await handleResponse<Mahasiswa>(response);
  return result.data as Mahasiswa;
}

export async function updateMahasiswa(
  id: number,
  payload: MahasiswaInput
): Promise<void> {
  const formData = new FormData();
  formData.append('nim', payload.nim);
  formData.append('nama', payload.nama);
  formData.append('prodi_id', String(payload.prodi_id));
  formData.append('angkatan', String(payload.angkatan));
  if (payload.foto) {
    formData.append('foto', payload.foto);
  }

  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  await handleResponse(response);
}

export async function deleteMahasiswa(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse(response);
}
