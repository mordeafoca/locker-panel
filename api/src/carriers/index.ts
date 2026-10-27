import type { Carrier } from '../domain/parcel.js';
import { andorinhaAdapter } from './andorinha.js';
import type { CarrierAdapter } from './carrier-adapter.js';
import { norteExpressAdapter } from './norte-express.js';
import { rapidexAdapter } from './rapidex.js';

export const CARRIER_ADAPTERS: Record<Carrier, CarrierAdapter> = {
  andorinha: andorinhaAdapter,
  rapidex: rapidexAdapter,
  'norte-express': norteExpressAdapter,
};