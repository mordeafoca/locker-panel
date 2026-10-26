import type { Compartment, CompartmentStatus } from "./compartment.js";

export interface CompartmentRepository {
    findAll(): Promise<Compartment[]>;
    occupy(compartmentId: string, parcelId: string): Promise<boolean>;
    release(compartmentId: string, parcelId: string, status: CompartmentStatus): Promise<boolean>;
}