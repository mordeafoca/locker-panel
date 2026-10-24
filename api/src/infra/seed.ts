import type { Size } from '../domain/size.js';
import { CompartmentModel} from './compartment-model.js';

const INITIAL_LAYOUT: Size [] = ['S', 'S', 'S', 'S', 'S', 'S', 'M', 'M', 'M', 'M', 'L', 'L'];

export async function seedCompartments(): Promise<void> {
    const count = await CompartmentModel.countDocuments();
    if (count > 0) {
        return;
    }

    await CompartmentModel.insertMany(
        INITIAL_LAYOUT.map((size, index) => ({
            _id: `C${String(index + 1).padStart(2, '0')}`,
            size,
            status: 'free',
            parcelId: null,
        })),
    );
}