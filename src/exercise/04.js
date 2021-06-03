// Prop Collections and Getters
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {Switch} from '../switch'

function callAll(...fns) {
  return (...args) => {
    fns.forEach(fn => {
      fn && fn(...args)
    })
  }
}

function useToggle() {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)
  const togglerProps = {'aria-pressed': on, onClick: toggle}

  function getTogglerProps({onClick, ...options}) {
    return {
      ...togglerProps,
      ...options,
      onClick: callAll(onClick, toggle),
    }
  }

  return {on, toggle, getTogglerProps}
}

function App() {
  const {on, getTogglerProps} = useToggle()
  const switchProps = getTogglerProps({on})

  const buttonProps = getTogglerProps({
    'aria-label': 'custom-button',
    onClick: () => console.info('onButtonClick'),
    id: 'custom-button-id',
  })

  return (
    <div>
      <Switch {...switchProps} />
      <hr />
      <button {...buttonProps}>{on ? 'on' : 'off'}</button>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
