import '@fontsource-variable/archivo/wdth.css';
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { theme } from './lib/theme.svelte';

// Set the finish before the first paint, so the page never flashes the wrong one.
document.documentElement.dataset.theme = theme.current;

const app = mount(App, { target: document.getElementById('app')! });

export default app;
