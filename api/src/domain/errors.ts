export type ErrorCode =
| 'COMPARTMENT_OUT_OF_SERVICE'
| 'COMPARTMENT_OCCUPIED'
| 'PARCEL_TOO_LARGE'
| 'PARCEL_NOT_IN_COMPARTMENT'
| 'PARCEL_ALREADY_EXISTS';

export class DomainError extends Error {
    readonly code: ErrorCode;

    constructor(code: ErrorCode) {
        super(code);
        this.name = 'DomainError';
        this.code = code;
    }
}