<script lang="ts">
  import { CARRIER_NAMES } from '../locker';
  import { CARRIERS, type Carrier, type Parcel, type ParcelStatus } from '../types';

  let {
    parcels,
    tab = $bindable(),
    carrier = $bindable(),
    placingId,
    focusedId,
    busy,
    onstartplacing,
    onplaceautomatically,
    oncancel,
    onpickup,
  }: {
    parcels: Parcel[];
    tab: ParcelStatus;
    carrier: Carrier | null;
    placingId: string | null;
    focusedId: string | null;
    busy: boolean;
    onstartplacing: (parcel: Parcel) => void;
    onplaceautomatically: () => void;
    oncancel: () => void;
    onpickup: (parcel: Parcel) => void;
  } = $props();

  const TABS: { status: ParcelStatus; label: string; empty: string }[] = [
    { status: 'created', label: 'Waiting', empty: 'No parcels waiting. Create one to place it in the locker.' },
    { status: 'placed', label: 'In locker', empty: 'The locker has no parcels.' },
    { status: 'picked_up', label: 'Picked up', empty: 'No parcels have been picked up yet.' },
  ];

  const byCarrier = $derived(carrier ? parcels.filter((p) => p.carrier === carrier) : parcels);
  const visible = $derived(byCarrier.filter((p) => p.status === tab));
  const current = $derived(TABS.find((t) => t.status === tab)!);

  function count(status: ParcelStatus): number {
    return byCarrier.filter((p) => p.status === status).length;
  }
</script>

<section aria-labelledby="parcels-title">
  <div class="head">
    <h2 id="parcels-title" class="expanded">Parcels</h2>
    <label class="carrier">
      <span class="visually-hidden">Carrier</span>
      <select bind:value={carrier}>
        <option value={null}>All carriers</option>
        {#each CARRIERS as c (c)}
          <option value={c}>{CARRIER_NAMES[c]}</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="tabs" role="group" aria-label="Parcel status">
    {#each TABS as t (t.status)}
      <button
        type="button"
        aria-pressed={tab === t.status}
        class:active={tab === t.status}
        onclick={() => (tab = t.status)}
      >
        {t.label} <span class="count">{count(t.status)}</span>
      </button>
    {/each}
  </div>

  {#if visible.length === 0}
    <p class="empty">{current.empty}</p>
  {:else}
    <ul>
      {#each visible as p (p.id)}
        <li class:active={p.id === placingId || p.id === focusedId}>
          <span class="stripe" style:background="var(--{p.carrier})" aria-hidden="true"></span>
          <div class="info">
            <span class="id expanded">{p.id}</span>
            <span class="meta">
              Size {p.size}, {CARRIER_NAMES[p.carrier]}{#if p.compartmentId}, {p.status === 'placed' ? 'in' : 'was in'} {p.compartmentId}{/if}
            </span>
          </div>
          <div class="actions">
            {#if p.status === 'created' && p.id !== placingId}
              <button class="btn" type="button" disabled={busy || placingId !== null} onclick={() => onstartplacing(p)}>
                Place
              </button>
            {:else if p.status === 'placed'}
              <button class="btn" type="button" disabled={busy} onclick={() => onpickup(p)}>Pick up</button>
            {/if}
          </div>
          {#if p.id === placingId}
            <div class="placing">
              <p>Choose a highlighted compartment in the locker, or let the system pick the smallest one that fits.</p>
              <div class="row">
                <button class="btn primary" type="button" disabled={busy} onclick={onplaceautomatically}>
                  Place automatically
                </button>
                <button class="btn" type="button" onclick={oncancel}>Cancel</button>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  section {
    display: grid;
    gap: 0.75rem;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  h2 {
    font-size: 1rem;
    font-weight: 650;
  }

  select {
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--line);
    border-radius: 2px;
    background: transparent;
    font-size: 0.8125rem;
  }

  select option {
    background: var(--room);
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
  }

  .tabs button {
    margin-bottom: -1px;
    padding: 0.45rem 0.8rem;
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
    color: var(--ink-muted);
    font-weight: 600;
    cursor: pointer;
  }

  .tabs button.active {
    border-bottom-color: var(--ink);
    color: var(--ink);
  }

  .count {
    margin-left: 0.2rem;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }

  .empty {
    padding: 1rem 0;
    color: var(--ink-muted);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 4px 1fr auto;
    gap: 0 0.75rem;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--line);
  }

  li.active .id {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  .stripe {
    align-self: stretch;
    border-radius: 1px;
  }

  .info {
    display: grid;
    min-width: 0;
  }

  .id {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .meta {
    font-size: 0.8125rem;
    color: var(--ink-muted);
  }

  .placing {
    grid-column: 2 / -1;
    display: grid;
    gap: 0.6rem;
    margin-top: 0.6rem;
    font-size: 0.875rem;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
