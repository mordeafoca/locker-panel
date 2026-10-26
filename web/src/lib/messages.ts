import { ApiError } from './api';

const MESSAGES: Record<string, string> = {
  PARCEL_ALREADY_EXISTS: 'A parcel with this ID already exists. Use a different ID.',
  PARCEL_NOT_FOUND: 'This parcel no longer exists. The list has been refreshed.',
  PARCEL_ALREADY_PLACED: 'This parcel is already in another compartment.',
  PARCEL_ALREADY_PICKED_UP: 'This parcel has already been picked up.',
  PARCEL_NOT_PLACED: 'This parcel is not in the locker yet.',
  PARCEL_TOO_LARGE: 'The parcel does not fit in that compartment. Choose a larger one.',
  PARCEL_NOT_IN_COMPARTMENT: 'The parcel is no longer in that compartment. The locker has been refreshed.',
  COMPARTMENT_OCCUPIED: 'That compartment was just taken by another parcel. Choose another one.',
  COMPARTMENT_OUT_OF_SERVICE: 'That compartment is out of service. Choose another one.',
  COMPARTMENT_NOT_FOUND: 'That compartment does not exist.',
  NO_COMPARTMENT_AVAILABLE: 'There is no free compartment big enough for this parcel.',
  VALIDATION_ERROR: 'Some fields are invalid. Check the parcel ID, size and carrier.',
};

export function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? `The API answered with an unexpected error (${error.code}).`;
  }
  return 'Cannot reach the API. Check that it is running on port 3000.';
}
