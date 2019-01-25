import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'unstated'
import { ThemeProvider } from 'emotion-theming'
import { theme as smoothTheme } from '@smooth-ui/core-em'
import App from './App'
import * as serviceWorker from './serviceWorker'

const theme = {
  ...smoothTheme,
  primary: '#000',
  info: '#198CFF',
}

ReactDOM.render(
  <Provider>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
