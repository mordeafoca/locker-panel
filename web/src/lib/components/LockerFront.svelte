<script lang="ts">
  import { CARRIER_NAMES, SIZE_ROWS, canTake, doorOrder } from '../locker';
  import type { ScreenState } from '../screen';
  import type { Carrier, Compartment, Parcel } from '../types';
  import KioskScreen from './KioskScreen.svelte';

  let {
    compartments,
    parcels,
    placing,
    carrier,
    focusedParcelId,
    screen,
    ondoor,
  }: {
    compartments: Compartment[];
    parcels: Parcel[];
    placing: Parcel | null;
    carrier: Carrier | null;
    focusedParcelId: string | null;
    screen: ScreenState;
    ondoor: (compartment: Compartment) => void;
  } = $props();

  const doors = $derived(doorOrder(compartments));
  const parcelById = $derived(new Map(parcels.map((p) => [p.id, p])));

  function describe(c: Compartment, parcel: Parcel | undefined): string {
    if (c.status === 'out_of_service') return `${c.id}, size ${c.size}, out of service`;
    if (c.status === 'free') {
      return placing && canTake(c, placing.size)
        ? `${c.id}, size ${c.size}, free. Place ${placing.id} here`
        : `${c.id}, size ${c.size}, free`;
    }
    const who = parcel ? `${parcel.id} from ${CARRIER_NAMES[parcel.carrier]}` : c.parcelId;
    return `${c.id}, size ${c.size}, holds ${who}`;
  }

  function dimmed(c: Compartment, parcel: Parcel | undefined): boolean {
    if (placing) return !canTake(c, placing.size);
    if (carrier) return parcel?.carrier !== carrier;
    return false;
  }
</script>

<figure class="locker" class:placing={placing !== null}>
  <div class="canopy" aria-hidden="true"><span class="led"></span></div>
  <div class="cabinet">
    <div class="glow" aria-hidden="true"></div>
    <div class="grid">
      <KioskScreen {screen} {compartments} />
      {#each doors as c (c.id)}
        {@const parcel = c.parcelId ? parcelById.get(c.parcelId) : undefined}
        {@const candidate = placing !== null && canTake(c, placing.size)}
        <button
          type="button"
          class="door {c.status}"
          class:candidate
          class:dim={dimmed(c, parcel)}
          class:focused={parcel !== undefined && parcel.id === focusedParcelId}
          style:grid-row="span {SIZE_ROWS[c.size]}"
          aria-label={describe(c, parcel)}
          onclick={() => ondoor(c)}
        >
          <span class="num expanded">{c.id}<span class="size">{c.size}</span></span>
          {#if c.status === 'out_of_service'}
            <span class="note">Out of service</span>
          {:else if c.parcelId}
            <span class="sticker" style:--carrier={parcel ? `var(--${parcel.carrier})` : 'var(--ink-muted)'}>
              {c.parcelId}
            </span>
          {/if}
          <span class="latch" aria-hidden="true"></span>
        </button>
      {/each}
    </div>
  </div>
  <div class="plinth" aria-hidden="true"></div>
  <figcaption class="visually-hidden">
    Front of the locker. Door height shows the compartment size.
  </figcaption>
</figure>

<style>
  .locker {
    --unit: clamp(46px, 6vw, 74px);
    width: 100%;
    max-width: 480px;
    margin: 0;
    padding-top: 6px;
  }

  .canopy {
    position: relative;
    height: 14px;
    margin: 0 -12px;
    border-radius: 3px 3px 8px 8px;
    background: linear-gradient(180deg, var(--body), var(--body-shade));
    box-shadow: 0 6px 14px -8px var(--shadow);
  }

  .led {
    position: absolute;
    left: 7%;
    right: 7%;
    bottom: 3px;
    height: 3px;
    border-radius: 2px;
    background: var(--led);
    box-shadow:
      0 0 10px 2px var(--led-glow),
      0 6px 22px 6px var(--led-glow);
    transform-origin: center;
    animation: led-on 900ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
  }

  .cabinet {
    position: relative;
    margin-top: 2px;
    padding: 8px;
    background: linear-gradient(180deg, var(--body), var(--body-shade));
    box-shadow:
      inset 0 0 0 1px var(--seam),
      0 40px 60px -40px var(--shadow);
  }

  .glow {
    position: absolute;
    inset: 0 0 auto;
    height: 45%;
    pointer-events: none;
    background: radial-gradient(ellipse 60% 100% at 50% 0%, var(--led-glow), transparent 70%);
    opacity: 0.35;
    z-index: 1;
    animation: glow-on 1200ms 250ms ease-out both;
  }

  .grid {
    display: grid;
    grid-template-rows: repeat(6, var(--unit));
    grid-auto-flow: column dense;
    grid-auto-columns: minmax(0, 1fr);
    gap: 3px;
  }

  .door {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    min-width: 0;
    padding: 6px 8px;
    border: 0;
    border-radius: 0;
    background: linear-gradient(180deg, var(--door), var(--door-shade));
    box-shadow:
      inset 0 0 0 1px var(--seam),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    color: var(--ink-muted);
    text-align: left;
    cursor: pointer;
    transition: opacity 160ms ease;
  }

  .door.out_of_service {
    background:
      repeating-linear-gradient(-45deg, var(--hatch) 0 2px, transparent 2px 8px),
      linear-gradient(180deg, var(--door), var(--door-shade));
    cursor: default;
  }

  .num {
    display: flex;
    gap: 0.4em;
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .size {
    opacity: 0.6;
  }

  .note {
    font-size: 0.6875rem;
    line-height: 1.2;
  }

  .sticker {
    max-width: calc(100% - 12px);
    padding: 2px 6px 2px 7px;
    border-left: 4px solid var(--carrier);
    background: var(--label);
    color: var(--label-ink);
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
  }

  .latch {
    position: absolute;
    right: 7px;
    top: 50%;
    width: 3px;
    height: 12px;
    border-radius: 2px;
    background: var(--seam);
    transform: translateY(-50%);
  }

  .door.dim {
    opacity: 0.38;
  }

  .door.candidate {
    box-shadow:
      inset 0 0 0 2px var(--accent),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    color: var(--ink);
  }

  .door.candidate:hover,
  .door.candidate:focus-visible {
    background: color-mix(in srgb, var(--accent) 22%, var(--door));
  }

  .placing .door:not(.candidate) {
    cursor: not-allowed;
  }

  .door.focused {
    box-shadow:
      inset 0 0 0 2px var(--ink),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .door:focus-visible {
    outline-offset: -4px;
  }

  .plinth {
    position: relative;
    height: 20px;
    margin: 0 4px;
    background:
      repeating-linear-gradient(-45deg, var(--seam) 0 1.5px, transparent 1.5px 7px),
      var(--body-shade);
    opacity: 0.9;
  }

  .plinth::before,
  .plinth::after {
    content: '';
    position: absolute;
    bottom: -8px;
    width: 18%;
    height: 8px;
    border-radius: 0 0 2px 2px;
    background: var(--line);
  }

  .plinth::before {
    left: 6%;
  }

  .plinth::after {
    right: 6%;
  }

  @media (max-width: 480px) {
    .door {
      padding: 5px;
    }

    .latch {
      display: none;
    }

    .sticker {
      max-width: 100%;
      padding: 1px 4px;
      border-left-width: 3px;
      font-size: 0.625rem;
    }
  }

  @keyframes led-on {
    from {
      transform: scaleX(0);
      opacity: 0;
    }
    to {
      transform: scaleX(1);
      opacity: 1;
    }
  }

  @keyframes glow-on {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .led,
    .glow {
      animation: none;
    }

    .door {
      transition: none;
    }
  }
</style>
