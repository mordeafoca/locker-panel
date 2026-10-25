import type { Compartment } from "./compartment.js";

export interface CompartmentRepository {
    findAll(): Promise<Compartment[]>;
    occupy(compartmentId: string, parcelId: string): Promise<boolean>;
}