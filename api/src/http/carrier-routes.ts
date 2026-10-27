import { Router } from 'express';
import type { LockerService } from '../application/locker-service.js';
import { CARRIER_ADAPTERS } from '../carriers/index.js';
import { DomainError } from '../domain/errors.js';
import { CARRIERS, type Carrier } from '../domain/parcel.js';

function isCarrier(value: string): value is Carrier {
  return (CARRIERS as readonly string[]).includes(value);
}

export function carrierRouter(locker: LockerService): Router {
  const router = Router();

  router.post('/carriers/:carrier/parcels', async (req, res) => {
    const { carrier } = req.params;
    if (!isCarrier(carrier)) {
      throw new DomainError('CARRIER_NOT_FOUND');
    }
    const input = CARRIER_ADAPTERS[carrier].toParcel(req.body);
    const parcel = await locker.createParcel(input);
    res.status(201).json(parcel);
  });

  return router;
}