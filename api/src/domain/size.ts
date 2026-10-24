export const SIZES = ['S' , 'M' , 'L'] as const;

export type Size = (typeof SIZES)[number]

export const SIZE_ORDER: Record<Size, number> = {S: 1, M: 2, L:3};

export function fits(parcel: Size, compartment: Size): boolean{
    return SIZE_ORDER[compartment] >= SIZE_ORDER[parcel];
}