import type { Size } from '../domain/size.js';
import { CompartmentModel} from './compartment-model.js';

const INITIAL_LAYOUT: Size [] = ['S', 'S', 'S', 'S', 'S', 'S', 'M', 'M', 'M', 'M', 'L', 'L'];

export async function seedCompartments(): Promise<void> {
  await CompartmentModel.bulkWrite(
    INITIAL_LAYOUT.map((size, index) => ({
      updateOne: {
        filter: { _id: `C${String(index + 1).padStart(2, '0')}` },
        update: { $setOnInsert: { size, status: 'free', parcelId: null } },
        upsert: true,
      },
    })),
  );
}