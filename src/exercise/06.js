// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import warning from 'warning'

import {Switch} from '../switch'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useWarnings(value, onChange) {
  const prevValueRef = React.useRef(value)
  const isReadOnly = value && !onChange;
  const isProdEnv = process.env.NODE_ENV === 'production';

  React.useEffect(() => {
    const wasControlled = prevValueRef.current != null && value == null
    const wasUncontrolled = prevValueRef.current == null && value != null

    warning(
      !(wasControlled && !isProdEnv),
      'changed from controlled to uncontrolled',
    )
    warning(
      !(wasUncontrolled && !isProdEnv),
      'changed from uncontrolled to controlled',
    )

    prevValueRef.current = value
  }, [value, onChange, isProdEnv])

  // TODO: Ask Kent why the warnings need to be wrapped in a useEffect
  React.useEffect(() => {
    warning(
      !(isReadOnly && !isProdEnv),
      'Failed prop type: You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    )
  }, [isReadOnly, isProdEnv])
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  on: controlledOn,
  onChange,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const isOnControlled = controlledOn != null // true || false
  const on = isOnControlled ? controlledOn : state.on

  useWarnings(controlledOn)

  function dispatchWithOnChange(action) {
    // 2. if isOnControlled is false, call dispatch with that action
    if (!isOnControlled) {
      dispatch(action)
    }

    // 3. Then call `onChange` with our "suggested changes" and the action.
    onChange && onChange(reducer({...state, on}, action), action)
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: isControlled, onChange }) {
  const {on, getTogglerProps} = useToggle({on: isControlled, onChange})
  const props = getTogglerProps({})

  return <Switch on={on} {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }

    setBothOn(state.on);
    setTimesClicked(c => c + 1)
  } 

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>

      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}

      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>

        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
