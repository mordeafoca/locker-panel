import { DomainError } from '../domain/errors.js';
import type { Parcel } from '../domain/parcel.js';
import type { ParcelRepository, ParcelFilter } from '../domain/parcel-repository.js';
import { ParcelModel, type ParcelDoc } from './parcel-model.js';

const DUPLICATE_KEY = 11000;

function isDuplicateKeyError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === DUPLICATE_KEY;
}

function toDomain(doc: ParcelDoc): Parcel{
    const { _id, ...rest } = doc;
    return { id: _id, ...rest };
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

    async findById(id: string): Promise<Parcel | null> {
        const doc = await ParcelModel.findById(id).lean<ParcelDoc>();
        return doc ? toDomain(doc) : null;
    }

    async markPlaced(parcelId: string, compartmentId: string): Promise<void> {
        await ParcelModel.updateOne(
            { _id: parcelId }, 
            { $set: { status: 'placed', compartmentId}}
        );
    }

    async markPickedUp(parcelId: string): Promise<void> {
        await ParcelModel.updateOne(
            { _id: parcelId}, 
            { $set: { status: 'picked_up'}}
        );
    }

    async findAll(filter: ParcelFilter): Promise<Parcel[]> {
        const docs = await ParcelModel.find(filter).sort({ _id: 1}).lean<ParcelDoc[]>();
        return docs.map(toDomain);
    }

}