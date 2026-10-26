import type { Compartment, NewParcel, Parcel, ParcelFilter } from './types';

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.error ?? 'UNKNOWN_ERROR', res.status);
  }
  return body as T;
}

export async function getLocker(): Promise<Compartment[]> {
  const body = await request<{ compartments: Compartment[] }>('/locker');
  return body.compartments;
}

export async function listParcels(filter: ParcelFilter = {}): Promise<Parcel[]> {
  const params = new URLSearchParams();
  if (filter.carrier) params.set('carrier', filter.carrier);
  if (filter.status) params.set('status', filter.status);
  const query = params.toString();
  const body = await request<{ parcels: Parcel[] }>(query ? `/parcels?${query}` : '/parcels');
  return body.parcels;
}

export function createParcel(input: NewParcel): Promise<Parcel> {
  return request<Parcel>('/parcels', { method: 'POST', body: JSON.stringify(input) });
}

export function placeParcel(parcelId: string, compartmentId?: string): Promise<Parcel> {
  return request<Parcel>(`/parcels/${encodeURIComponent(parcelId)}/place`, {
    method: 'POST',
    body: JSON.stringify({ compartmentId }),
  });
}

export function pickUpParcel(parcelId: string): Promise<Parcel> {
  return request<Parcel>(`/parcels/${encodeURIComponent(parcelId)}/pick-up`, { method: 'POST' });
}