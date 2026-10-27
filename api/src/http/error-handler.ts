import type { ErrorRequestHandler } from "express";
import { ZodError } from 'zod';
import { DomainError, type ErrorCode } from '../domain/errors.js';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
    COMPARTMENT_OUT_OF_SERVICE: 409,
    COMPARTMENT_OCCUPIED: 409,
    PARCEL_TOO_LARGE: 422,
    PARCEL_NOT_IN_COMPARTMENT: 409,
    PARCEL_ALREADY_EXISTS: 409,
    COMPARTMENT_NOT_FOUND: 404,
    NO_COMPARTMENT_AVAILABLE: 409,
    PARCEL_NOT_FOUND: 404,
    PARCEL_ALREADY_PLACED: 409,
    PARCEL_ALREADY_PICKED_UP: 409,
    PARCEL_NOT_PLACED: 409,
    CARRIER_NOT_FOUND: 404,
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    if(err instanceof ZodError) {
        res.status(400).json({ error: 'VALIDATION_ERROR', details: err.issues });
        return;
    }
    if (err instanceof SyntaxError) {
        res.status(400).json({ error: 'INVALID_JSON' });
        return;
    }
    if (err instanceof DomainError) {
        res.status(STATUS_BY_CODE[err.code]).json({ error: err.code });
        return;
    }
    req.log.error({ err }, 'unexpected error');
    res.status(500).json({ error: 'INTERNAL_ERROR' });
};