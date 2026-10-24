import type { Compartment } from "./compartment.js";

export interface CompartmentRepository {
    findAll(): Promise<Compartment[]>;
}