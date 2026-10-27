<script lang="ts">
  import type { ScreenState } from '../screen';
  import { SIZES, type Compartment } from '../types';

  let { screen, compartments }: { screen: ScreenState; compartments: Compartment[] } = $props();

  const free = $derived(compartments.filter((c) => c.status === 'free'));
  const freeBySize = $derived(
    SIZES.map((size) => ({ size, count: free.filter((c) => c.size === size).length })),
  );
</script>

<div class="cell">
  <div class="screen" aria-live="polite">
    {#if screen.kind === 'connecting'}
      <p class="small">Connecting to the locker…</p>
    {:else if screen.kind === 'offline'}
      <p class="big expanded">Offline</p>
      <p class="small">The API is not answering.</p>
    {:else if screen.kind === 'placing'}
      <p class="small">Placing</p>
      <p class="id">{screen.parcel.id}</p>
      <p class="small">
        {#if screen.options === 0}
          No free compartment fits size {screen.parcel.size}.
        {:else}
          Size {screen.parcel.size} fits {screen.options}
          {screen.options === 1 ? 'compartment' : 'compartments'}.
        {/if}
      </p>
    {:else if screen.kind === 'placed'}
      <p class="small">Placed <span class="strong">{screen.parcelId}</span> in</p>
      <p class="big expanded">{screen.compartmentId}</p>
    {:else if screen.kind === 'picked'}
      <p class="small">Picked up <span class="strong">{screen.parcelId}</span> from</p>
      <p class="big expanded">{screen.compartmentId}</p>
    {:else}
      <p class="big expanded">{free.length}</p>
      <p class="small">free of {compartments.length}</p>
      <dl class="sizes">
        {#each freeBySize as { size, count } (size)}
          <div><dt>{size}</dt><dd>{count}</dd></div>
        {/each}
      </dl>
    {/if}
  </div>
  <div class="reader" aria-hidden="true">
    <span class="slot"></span>
    <span class="pad"></span>
  </div>
</div>

<style>
  .cell {
    grid-column: 2;
    grid-row: 1 / span 4;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px 10%;
    background: linear-gradient(180deg, var(--door), var(--door-shade));
    box-shadow: inset 0 0 0 1px var(--seam);
  }

  .screen {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    padding: 0.6rem 0.7rem;
    border-radius: 3px;
    background: var(--screen);
    color: var(--screen-ink);
    box-shadow:
      0 0 0 3px var(--seam),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    overflow: hidden;
  }

  .big {
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    font-weight: 650;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .id {
    font-size: clamp(0.85rem, 1.25vw, 1rem);
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .strong {
    font-weight: 650;
    white-space: nowrap;
  }

  .small {
    font-size: 0.75rem;
    line-height: 1.35;
    opacity: 0.85;
  }

  .sizes {
    display: grid;
    gap: 0.1rem;
    margin: 0.6rem 0 0;
    font-size: 0.75rem;
  }

  .sizes div {
    display: flex;
    gap: 0.5rem;
  }

  .sizes dt {
    opacity: 0.7;
  }

  .sizes dd {
    margin: 0;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }

  .reader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 18px;
    padding: 0 6%;
  }

  .slot {
    width: 42%;
    height: 3px;
    border-radius: 2px;
    background: var(--seam);
  }

  .pad {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    background: var(--seam);
    opacity: 0.8;
  }
</style>
