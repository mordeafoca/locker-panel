<script lang="ts">
  import { onMount } from 'svelte';
  import * as api from './lib/api';
  import { samplePayload } from './lib/carrier-samples';
  import ActivityLog from './lib/components/ActivityLog.svelte';
  import CarrierDelivery from './lib/components/CarrierDelivery.svelte';
  import LockerFront from './lib/components/LockerFront.svelte';
  import NewParcelForm from './lib/components/NewParcelForm.svelte';
  import ParcelList from './lib/components/ParcelList.svelte';
  import { canTake } from './lib/locker';
  import { messageFor } from './lib/messages';
  import type { ScreenState } from './lib/screen';
  import { theme, toggleTheme } from './lib/theme.svelte';
  import type { Carrier, Compartment, LockerEvent, NewParcel, Parcel, ParcelStatus } from './lib/types';

  const REFRESH_MS = 4000;

  let compartments = $state<Compartment[]>([]);
  let parcels = $state<Parcel[]>([]);
  let events = $state<LockerEvent[]>([]);
  let now = $state(Date.now());
  let online = $state<boolean | null>(null);
  let busy = $state(false);
  let error = $state<string | null>(null);

  let tab = $state<ParcelStatus>('created');
  let carrier = $state<Carrier | null>(null);
  let placingId = $state<string | null>(null);
  let focusedId = $state<string | null>(null);
  let lastEvent = $state<ScreenState | null>(null);
  let lastDelivery = $state<{ carrier: Carrier; payload: unknown } | null>(null);

  const placing = $derived(parcels.find((p) => p.id === placingId && p.status === 'created') ?? null);

  const screen = $derived<ScreenState>(
    online === null
      ? { kind: 'connecting' }
      : online === false
        ? { kind: 'offline' }
        : placing
          ? { kind: 'placing', parcel: placing, options: compartments.filter((c) => canTake(c, placing.size)).length }
          : (lastEvent ?? { kind: 'idle' }),
  );

  $effect(() => {
    document.documentElement.dataset.theme = theme.current;
  });

  // The screen shows the result of an action for a few seconds, then goes back to idle.
  $effect(() => {
    if (!lastEvent) return;
    const timer = setTimeout(() => (lastEvent = null), 6000);
    return () => clearTimeout(timer);
  });

  async function refresh() {
    try {
      const [nextCompartments, nextParcels, nextEvents] = await Promise.all([
        api.getLocker(),
        api.listParcels(),
        api.listEvents(),
      ]);
      compartments = nextCompartments;
      parcels = nextParcels;
      events = nextEvents;
      now = Date.now();
      if (online === false) error = null;
      online = true;
    } catch (e) {
      if (online !== false) error = messageFor(e);
      online = false;
    }
  }

  // Every action goes through here: one place for the busy flag, errors and the refresh.
  async function run(action: () => Promise<void>): Promise<boolean> {
    busy = true;
    error = null;
    try {
      await action();
      return true;
    } catch (e) {
      error = messageFor(e);
      return false;
    } finally {
      await refresh();
      busy = false;
    }
  }

  function create(input: NewParcel) {
    return run(async () => {
      await api.createParcel(input);
      tab = 'created';
      placingId = input.id;
      focusedId = null;
    });
  }

  function deliver(carrier: Carrier) {
    const payload = samplePayload(carrier);
    lastDelivery = { carrier, payload };
    run(async () => {
      const parcel = await api.deliverFromCarrier(carrier, payload);
      tab = 'created';
      placingId = parcel.id;
      focusedId = null;
    });
  }

  function place(compartmentId?: string) {
    if (!placing) return;
    const parcelId = placing.id;
    run(async () => {
      const parcel = await api.placeParcel(parcelId, compartmentId);
      placingId = null;
      lastEvent = { kind: 'placed', parcelId: parcel.id, compartmentId: parcel.compartmentId ?? '' };
    });
  }

  function pickUp(parcel: Parcel) {
    run(async () => {
      await api.pickUpParcel(parcel.id);
      focusedId = null;
      lastEvent = { kind: 'picked', parcelId: parcel.id, compartmentId: parcel.compartmentId ?? '' };
    });
  }

  function onDoor(c: Compartment) {
    if (busy) return;
    if (placing) {
      if (canTake(c, placing.size)) place(c.id);
      return;
    }
    if (c.parcelId) {
      const parcel = parcels.find((p) => p.id === c.parcelId);
      if (parcel && carrier && parcel.carrier !== carrier) carrier = null;
      tab = 'placed';
      focusedId = c.parcelId;
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      placingId = null;
      focusedId = null;
    }
  }

  onMount(() => {
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !busy) refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  });
</script>

<svelte:window onkeydown={onKeydown} />

<div class="shell">
  <header>
    <div>
      <h1 class="expanded">Locker panel</h1>
      <p class="where">Santa Catarina, Porto</p>
    </div>
    <button class="btn" type="button" onclick={toggleTheme}>
      {theme.current === 'dark' ? 'Light finish' : 'Dark finish'}
    </button>
  </header>

  <main>
    <div class="front">
      <LockerFront
      {compartments}
      {parcels}
      {placing}
      {carrier}
      focusedParcelId={focusedId}
      {screen}
      ondoor={onDoor}
      />
    </div>

    <div class="activity">
      <ActivityLog {events} {now} />
    </div>

    <aside>
      {#if error}
        <div class="alert" role="alert">
          <p>{error}</p>
          <button class="btn" type="button" onclick={() => (error = null)}>Dismiss</button>
        </div>
      {/if}

      <NewParcelForm {busy} oncreate={create} />

      <CarrierDelivery {busy} last={lastDelivery} ondeliver={deliver} />

      <ParcelList
        {parcels}
        bind:tab
        bind:carrier
        {placingId}
        {focusedId}
        {busy}
        onstartplacing={(p) => {
          placingId = p.id;
          focusedId = null;
        }}
        onplaceautomatically={() => place()}
        oncancel={() => (placingId = null)}
        onpickup={pickUp}
      />
    </aside>
  </main>
</div>

<style>
  .shell {
    max-width: 1080px;
    margin: 0 auto;
    padding: 1.5rem 1rem 3rem;
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2.25rem;
  }

  h1 {
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .where {
    color: var(--ink-muted);
    font-size: 0.875rem;
  }

  main {
    display: grid;
    grid-template-columns: minmax(0, 480px) minmax(0, 1fr);
    grid-template-areas:
      'front aside'
      'activity aside';
    grid-template-rows: auto 1fr;
    gap: 2.5rem 4rem;
    align-items: start;
  }

  .front {
    grid-area: front;
    width: 100%;
  }

  .activity {
    grid-area: activity;
    width: 100%;
  }

  aside {
    grid-area: aside;
    width: 100%;
    display: grid;
    gap: 2.25rem;
  }

  .alert {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 0.8rem;
    border-left: 3px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    font-size: 0.875rem;
  }

  .alert .btn {
    flex-shrink: 0;
    padding: 0.2rem 0.5rem;
    font-size: 0.8125rem;
  }

  @media (max-width: 860px) {
    main {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'front'
        'aside'
        'activity';
      grid-template-rows: auto;
      justify-items: center;
      gap: 2.5rem;
    }
  }
</style>
