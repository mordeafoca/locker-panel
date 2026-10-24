import type { Compartment } from '../domain/compartment.js';
import type { CompartmentRepository } from '../domain/compartment-repository.js';
import { CompartmentModel, type CompartmentDoc } from './compartment-model.js';

function toDomain(doc: CompartmentDoc): Compartment {
    return { id: doc._id, size: doc.size, status: doc.status, parcelId: doc.parcelId};
}

export class MongoCompartmentRepository implements CompartmentRepository {
    async findAll(): Promise<Compartment[]> {
        const docs = await CompartmentModel.find().sort({ _id:1}).lean<CompartmentDoc[]>();
        return docs.map(toDomain);
    }
}