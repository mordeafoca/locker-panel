import { DomainError } from '../domain/errors.js';
import type { Parcel } from '../domain/parcel.js';
import type { ParcelRepository } from '../domain/parcel-repository.js';
import { ParcelModel } from './parcel-model.js';

const DUPLICATE_KEY = 11000;

function isDuplicateKeyError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === DUPLICATE_KEY;
}

export class MongoParcelRepository implements ParcelRepository {
    async create(parcel: Parcel): Promise<void> {
        const { id, ...rest } = parcel;
        try {
            await ParcelModel.create({ _id: id, ...rest });
        } catch (error) {
            if(isDuplicateKeyError(error)) {
                throw new DomainError('PARCEL_ALREADY_EXISTS');
            }
            throw error;
        }
    }
}