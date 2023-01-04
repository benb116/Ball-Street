import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import App from './App';
import { store } from './app/store';
import * as serviceWorker from './serviceWorker';

const rootElement = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(rootElement!);
root.render(
  <Provider store={store}>
    <App />
    <Toaster />
  </Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
