import { useState } from 'react'

const units = {
  Length: {
    Millimetres: 0.001,
    Centimetres: 0.01,
    Metres: 1,
    Kilometres: 1000,
    Inches: 0.0254,
    Feet: 0.3048,
    Miles: 1609.344,
  },

  Weight: {
    Milligrams: 0.001,
    Grams: 1,
    Kilograms: 1000,
    Ounces: 28.349523125,
    Pounds: 453.59237,
  },

  Volume: {
    Millilitres: 1,
    Litres: 1000,
    'US Gallons': 3785.411784,
    'US Cups': 236.5882365,
  },
}

function UnitConverter({ onAddToHistory }) {
  const [category, setCategory] = useState('Length')
  const [amount, setAmount] = useState('1')
  const [fromUnit, setFromUnit] = useState('Metres')
  const [toUnit, setToUnit] = useState('Kilometres')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const categories = ['Length', 'Weight', 'Temperature', 'Volume']

  const getUnits = (selectedCategory = category) => {
    if (selectedCategory === 'Temperature') {
      return ['Celsius', 'Fahrenheit', 'Kelvin']
    }

    return Object.keys(units[selectedCategory])
  }

  const convertTemperature = (value, from, to) => {
    let celsius

    if (from === 'Celsius') {
      celsius = value
    } else if (from === 'Fahrenheit') {
      celsius = ((value - 32) * 5) / 9
    } else {
      celsius = value - 273.15
    }

    if (to === 'Celsius') return celsius
    if (to === 'Fahrenheit') return (celsius * 9) / 5 + 32

    return celsius + 273.15
  }

  const formatResult = (value) => {
    return Number(value.toPrecision(10)).toLocaleString('en-US', {
      maximumFractionDigits: 8,
    })
  }

  const calculateConversion = () => {
    const value = Number(amount)

    if (amount.trim() === '' || !Number.isFinite(value)) {
      return { error: 'Please enter a valid number.' }
    }

    if (
      category === 'Temperature' &&
      ((fromUnit === 'Kelvin' && value < 0) ||
        (fromUnit === 'Celsius' && value < -273.15) ||
        (fromUnit === 'Fahrenheit' && value < -459.67))
    ) {
      return { error: 'Temperature cannot be below absolute zero.' }
    }

    let convertedValue

    if (category === 'Temperature') {
      convertedValue = convertTemperature(value, fromUnit, toUnit)
    } else {
      convertedValue =
        (value * units[category][fromUnit]) / units[category][toUnit]
    }

    if (!Number.isFinite(convertedValue)) {
      return { error: 'Unable to calculate this conversion.' }
    }

    return {
      value: convertedValue,
      formatted: formatResult(convertedValue),
    }
  }

  const handleConvert = () => {
    const conversion = calculateConversion()

    if (conversion.error) {
      setError(conversion.error)
      setResult(null)
      return
    }

    setError('')
    setResult(conversion.formatted)

    const inputValue = Number(amount)

    const historyEntry =
      `[Unit Converter - ${category}] ` +
      `${inputValue} ${fromUnit} = ${conversion.formatted} ${toUnit}`

    if (typeof onAddToHistory === 'function') {
      onAddToHistory(historyEntry)
    }
  }

  const changeCategory = (newCategory) => {
    setCategory(newCategory)
    setResult(null)
    setError('')

    if (newCategory === 'Temperature') {
      setFromUnit('Celsius')
      setToUnit('Fahrenheit')
    } else if (newCategory === 'Length') {
      setFromUnit('Metres')
      setToUnit('Kilometres')
    } else if (newCategory === 'Weight') {
      setFromUnit('Grams')
      setToUnit('Kilograms')
    } else {
      setFromUnit('Millilitres')
      setToUnit('Litres')
    }
  }

  const handleFromChange = (value) => {
    setFromUnit(value)
    setResult(null)
    setError('')

    if (value === toUnit) {
      setToUnit(getUnits().find((unit) => unit !== value))
    }
  }

  const handleToChange = (value) => {
    setToUnit(value)
    setResult(null)
    setError('')

    if (value === fromUnit) {
      setFromUnit(getUnits().find((unit) => unit !== value))
    }
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setResult(null)
    setError('')
  }

  const availableUnits = getUnits()

  return (
    <div className="converter">
      <h2>Unit Converter</h2>
      <p>Convert units instantly and accurately.</p>

      <label>Conversion Category</label>
      <select
        value={category}
        onChange={(event) => changeCategory(event.target.value)}
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label>Enter Value</label>
      <input
        type="number"
        value={amount}
        onChange={(event) => {
          setAmount(event.target.value)
          setResult(null)
          setError('')
        }}
        placeholder="Enter a number"
      />

      <label>From</label>
      <select
        value={fromUnit}
        onChange={(event) => handleFromChange(event.target.value)}
      >
        {availableUnits.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      <button className="swap-button" onClick={swapUnits}>
        ⇅ Swap Units
      </button>

      <label>To</label>
      <select
        value={toUnit}
        onChange={(event) => handleToChange(event.target.value)}
      >
        {availableUnits.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      <button className="convert-button" onClick={handleConvert}>
        Convert &amp; Save to History
      </button>

      {error && (
        <p className="converter-error" role="alert">
          {error}
        </p>
      )}

      <div className="conversion-result">
        <span>Converted Result</span>
        <h3>{result ?? '—'}</h3>
        <p>{result !== null ? toUnit : 'Click Convert to calculate'}</p>
      </div>
    </div>
  )
}

export default UnitConverter