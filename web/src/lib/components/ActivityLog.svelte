<script lang="ts">
  import { CARRIER_NAMES } from '../locker';
  import type { LockerEvent } from '../types';

  let { events, now }: { events: LockerEvent[]; now: number } = $props();

  const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  function describe(event: LockerEvent): string {
    switch (event.type) {
      case 'parcel_created':
        return 'created';
      case 'parcel_placed':
        return `placed in ${event.compartmentId}`;
      case 'parcel_picked_up':
        return `picked up from ${event.compartmentId}`;
    }
  }

  function ago(at: string): string {
    const seconds = Math.round((new Date(at).getTime() - now) / 1000);
    if (seconds > -45) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes > -60) return relative.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (hours > -24) return relative.format(hours, 'hour');
    return relative.format(Math.round(hours / 24), 'day');
  }
</script>

<section aria-labelledby="activity-title">
  <h2 id="activity-title" class="expanded">Activity</h2>
  {#if events.length === 0}
    <p class="empty">Nothing has happened yet. Create a parcel to start.</p>
  {:else}
    <ol>
      {#each events as event (event.id)}
        <li>
          <span class="stripe" style:background="var(--{event.carrier})" aria-hidden="true"></span>
          <span class="what">
            <span class="id">{event.parcelId}</span>
            {describe(event)}
            <span class="visually-hidden">, {CARRIER_NAMES[event.carrier]}</span>
          </span>
          <time datetime={event.at}>{ago(event.at)}</time>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  section {
    display: grid;
    gap: 0.6rem;
  }

  h2 {
    font-size: 1rem;
    font-weight: 650;
  }

  .empty {
    color: var(--ink-muted);
    font-size: 0.875rem;
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 3px 1fr auto;
    gap: 0.65rem;
    align-items: center;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--line);
    font-size: 0.875rem;
  }

  .stripe {
    align-self: stretch;
    border-radius: 1px;
  }

  .what {
    min-width: 0;
    color: var(--ink-muted);
  }

  .id {
    color: var(--ink);
    font-weight: 600;
  }

  time {
    color: var(--ink-muted);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>
