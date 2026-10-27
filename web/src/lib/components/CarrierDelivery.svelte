<script lang="ts">
  import { CARRIER_NAMES } from '../locker';
  import { CARRIERS, type Carrier } from '../types';

  let {
    busy,
    last,
    ondeliver,
  }: {
    busy: boolean;
    last: { carrier: Carrier; payload: unknown } | null;
    ondeliver: (carrier: Carrier) => void;
  } = $props();
</script>

<section aria-labelledby="delivery-title">
  <div>
    <h2 id="delivery-title" class="expanded">Carrier delivery</h2>
    <p class="hint">Each carrier sends parcels in its own format. Simulate one to see it land in the locker.</p>
  </div>

  <div class="carriers">
    {#each CARRIERS as c (c)}
      <button class="btn" type="button" disabled={busy} onclick={() => ondeliver(c)}>
        <span class="stripe" style:background="var(--{c})" aria-hidden="true"></span>
        {CARRIER_NAMES[c]}
      </button>
    {/each}
  </div>

  {#if last}
    <figure>
      <figcaption>Sent by {CARRIER_NAMES[last.carrier]}</figcaption>
      <pre><code>{JSON.stringify(last.payload, null, 2)}</code></pre>
    </figure>
  {/if}
</section>

<style>
  section {
    display: grid;
    gap: 0.75rem;
  }

  h2 {
    font-size: 1rem;
    font-weight: 650;
  }

  .hint {
    color: var(--ink-muted);
    font-size: 0.8125rem;
  }

  .carriers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stripe {
    width: 3px;
    height: 1em;
    border-radius: 1px;
  }

  figure {
    margin: 0;
  }

  figcaption {
    margin-bottom: 0.3rem;
    color: var(--ink-muted);
    font-size: 0.75rem;
  }

  pre {
    margin: 0;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--line);
    border-radius: 2px;
    overflow-x: auto;
    font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
    font-size: 0.75rem;
    line-height: 1.5;
  }
</style>
