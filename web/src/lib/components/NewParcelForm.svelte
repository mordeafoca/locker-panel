<script lang="ts">
  import { CARRIER_NAMES, SIZE_ROWS } from '../locker';
  import { CARRIERS, SIZES, type Carrier, type NewParcel, type Size } from '../types';

  let { busy, oncreate }: { busy: boolean; oncreate: (input: NewParcel) => Promise<boolean> } =
    $props();

  let id = $state('');
  let size = $state<Size>('S');
  let carrier = $state<Carrier>('andorinha');

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const created = await oncreate({ id: id.trim(), size, carrier });
    if (created) id = '';
  }
</script>

<form onsubmit={submit}>
  <h2 class="expanded">New parcel</h2>

  <label class="field">
    <span>Parcel ID</span>
    <input bind:value={id} required maxlength="64" placeholder="e.g. PT-2026-0147" autocomplete="off" />
  </label>

  <fieldset class="field">
    <legend>Size</legend>
    <div class="sizes">
      {#each SIZES as s (s)}
        <label class="size" class:checked={size === s}>
          <input type="radio" name="size" value={s} bind:group={size} class="visually-hidden" />
          <span class="box" style:height="{SIZE_ROWS[s] * 8 + 4}px" aria-hidden="true"></span>
          <span class="expanded">{s}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  <label class="field">
    <span>Carrier</span>
    <select bind:value={carrier}>
      {#each CARRIERS as c (c)}
        <option value={c}>{CARRIER_NAMES[c]}</option>
      {/each}
    </select>
  </label>

  <button class="btn primary" type="submit" disabled={busy || id.trim() === ''}>Create parcel</button>
</form>

<style>
  form {
    display: grid;
    gap: 0.9rem;
  }

  h2 {
    font-size: 1rem;
    font-weight: 650;
  }

  .field {
    display: grid;
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 0.8125rem;
    color: var(--ink-muted);
  }

  legend {
    padding: 0;
    margin-bottom: 0.3rem;
  }

  input:not([type='radio']),
  select {
    width: 100%;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--line);
    border-radius: 2px;
    background: transparent;
    color: var(--ink);
    font-size: 0.9375rem;
  }

  select option {
    background: var(--room);
  }

  input::placeholder {
    color: var(--ink-muted);
    opacity: 0.7;
  }

  .sizes {
    display: flex;
    gap: 0.5rem;
  }

  .size {
    display: flex;
    flex: 1;
    align-items: flex-end;
    gap: 0.6rem;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--line);
    border-radius: 2px;
    color: var(--ink);
    font-weight: 600;
    cursor: pointer;
  }

  .size.checked {
    border-color: var(--ink);
    box-shadow: inset 0 0 0 1px var(--ink);
  }

  .size:has(input:focus-visible) {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  .box {
    width: 18px;
    border: 1.5px solid currentColor;
    border-radius: 1px;
    opacity: 0.7;
  }

  .btn {
    justify-self: start;
  }
</style>
