import type { Compartment } from "./compartment.js";
import { fits, SIZE_ORDER, type Size} from './size.js';

export function suggestCompartment(
    compartments: readonly Compartment[],
    parcelSize: Size,
): Compartment | null {
    const candidates = compartments.filter(
        (c) => c.status === 'free' && fits(parcelSize, c.size),
    );

    if(candidates.length === 0){
        return null;
    }
    
    return candidates.reduce((best, c) =>
    SIZE_ORDER[c.size] < SIZE_ORDER[best.size] ? c : best,
    );
}