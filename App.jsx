import { useState } from 'react'
import './App.css'
import UnitConverter from './UnitConverter'
import FinanceCalculator from './FinanceCalculator'

function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [display, setDisplay] = useState('0')
  const [firstNumber, setFirstNumber] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForSecondNumber, setWaitingForSecondNumber] = useState(false)
  const [scientificMode, setScientificMode] = useState(false)
  const [historySearch, setHistorySearch] = useState('')

  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('calculatorHistory')
      )
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  // Save calculations to history and localStorage
  const addToHistory = (calculation) => {
    setHistory((previous) => {
      const updated = [calculation, ...previous]

      try {
        localStorage.setItem(
          'calculatorHistory',
          JSON.stringify(updated)
        )
      } catch (error) {
        console.error('Unable to save history:', error)
      }

      return updated
    })
  }

  // Format calculation results
  const formatResult = (value) => {
    if (!Number.isFinite(value)) return 'Error'
    return String(Number(value.toPrecision(12)))
  }

  // Handle number buttons
  const handleNumber = (number) => {
    if (display === 'Error') {
      setDisplay(number)
      setFirstNumber(null)
      setOperator(null)
      setWaitingForSecondNumber(false)
      return
    }

    if (waitingForSecondNumber) {
      setDisplay(number)
      setWaitingForSecondNumber(false)
    } else if (display === '0') {
      setDisplay(number)
    } else {
      setDisplay(display + number)
    }
  }

  // Handle decimal button
  const handleDecimal = () => {
    if (display === 'Error' || waitingForSecondNumber) {
      setDisplay('0.')
      setWaitingForSecondNumber(false)
      return
    }

    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  // Perform arithmetic calculations
  const calculate = (first, second, selectedOperator) => {
    switch (selectedOperator) {
      case '+':
        return first + second
      case '−':
        return first - second
      case '×':
        return first * second
      case '÷':
        return second === 0 ? NaN : first / second
      case '^':
        return Math.pow(first, second)
      default:
        return NaN
    }
  }

  // Handle arithmetic operators
  const handleOperator = (selectedOperator) => {
    if (display === 'Error') return

    const currentNumber = Number(display)

    if (operator !== null && !waitingForSecondNumber) {
      calculateResult(currentNumber, selectedOperator)
      return
    }

    setFirstNumber(currentNumber)
    setOperator(selectedOperator)
    setWaitingForSecondNumber(true)
  }

  // Handle equals button
  const handleEquals = () => {
    if (
      firstNumber === null ||
      operator === null ||
      waitingForSecondNumber ||
      display === 'Error'
    ) {
      return
    }

    const secondNumber = Number(display)
    const result = calculate(firstNumber, secondNumber, operator)
    const formatted = formatResult(result)

    if (formatted === 'Error') {
      setDisplay('Error')
    } else {
      addToHistory(
        `${firstNumber} ${operator} ${secondNumber} = ${formatted}`
      )
      setDisplay(formatted)
    }

    setFirstNumber(null)
    setOperator(null)
    setWaitingForSecondNumber(true)
  }

  // Continue chained calculations
  const calculateResult = (secondNumber, nextOperator) => {
    const result = calculate(firstNumber, secondNumber, operator)
    const formatted = formatResult(result)

    if (formatted === 'Error') {
      setDisplay('Error')
      setFirstNumber(null)
      setOperator(null)
      setWaitingForSecondNumber(true)
      return
    }

    addToHistory(
      `${firstNumber} ${operator} ${secondNumber} = ${formatted}`
    )

    setDisplay(formatted)
    setFirstNumber(Number(formatted))
    setOperator(nextOperator)
    setWaitingForSecondNumber(true)
  }

  // Clear calculator display
  const handleClear = () => {
    setDisplay('0')
    setFirstNumber(null)
    setOperator(null)
    setWaitingForSecondNumber(false)
  }

  // Backspace
  const handleBackspace = () => {
    if (display === 'Error') {
      handleClear()
      return
    }

    if (waitingForSecondNumber) return

    if (
      display.length <= 1 ||
      (display.length === 2 && display.startsWith('-'))
    ) {
      setDisplay('0')
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  // Percentage
  const handlePercentage = () => {
    if (display === 'Error') return

    setDisplay(formatResult(Number(display) / 100))
    setWaitingForSecondNumber(false)
  }

  // Scientific calculator functions
  const handleScientific = (operation) => {
    if (display === 'Error') return

    const number = Number(display)
    let result
    let expression

    switch (operation) {
      case 'sqrt':
        result = number >= 0 ? Math.sqrt(number) : NaN
        expression = `√(${number})`
        break

      case 'square':
        result = number * number
        expression = `${number}²`
        break

      case 'sin':
        result = Math.sin((number * Math.PI) / 180)
        expression = `sin(${number}°)`
        break

      case 'cos':
        result = Math.cos((number * Math.PI) / 180)
        expression = `cos(${number}°)`
        break

      case 'tan':
        result =
          Math.abs(Math.cos((number * Math.PI) / 180)) < 1e-12
            ? NaN
            : Math.tan((number * Math.PI) / 180)
        expression = `tan(${number}°)`
        break

      case 'log':
        result = number > 0 ? Math.log10(number) : NaN
        expression = `log(${number})`
        break

      case 'ln':
        result = number > 0 ? Math.log(number) : NaN
        expression = `ln(${number})`
        break

      default:
        return
    }

    const formatted = formatResult(result)

    if (formatted === 'Error') {
      setDisplay('Error')
    } else {
      addToHistory(`${expression} = ${formatted}`)
      setDisplay(formatted)
    }

    setFirstNumber(null)
    setOperator(null)
    setWaitingForSecondNumber(true)
  }

  // Power function
  const handlePower = () => {
    if (display === 'Error') return

    setFirstNumber(Number(display))
    setOperator('^')
    setWaitingForSecondNumber(true)
  }

  // Pi function
  const handlePi = () => {
    setDisplay(formatResult(Math.PI))
    setFirstNumber(null)
    setOperator(null)
    setWaitingForSecondNumber(false)
  }

  // Delete one history item
  const deleteHistoryItem = (indexToDelete) => {
    setHistory((previous) => {
      const updated = previous.filter(
        (_, index) => index !== indexToDelete
      )

      try {
        localStorage.setItem(
          'calculatorHistory',
          JSON.stringify(updated)
        )
      } catch (error) {
        console.error('Unable to update history:', error)
      }

      return updated
    })
  }

  // Reuse a previous numeric result
  const reuseHistoryResult = (calculation) => {
    const separator = calculation.lastIndexOf('=')

    if (separator === -1) return

    const result = calculation.slice(separator + 1).trim()
    const numericResult = Number(result)

    if (result !== '' && Number.isFinite(numericResult)) {
      setDisplay(formatResult(numericResult))
      setFirstNumber(null)
      setOperator(null)
      setWaitingForSecondNumber(false)
      setActiveTab('calculator')
    }
  }

  // Clear all history
  const clearHistory = () => {
    setHistory([])

    try {
      localStorage.removeItem('calculatorHistory')
    } catch (error) {
      console.error('Unable to clear history:', error)
    }
  }

  // Filter history using the search box
  const filteredHistory = history
    .map((calculation, index) => ({ calculation, index }))
    .filter(({ calculation }) =>
      calculation
        .toLowerCase()
        .includes(historySearch.toLowerCase().trim())
    )

  return (
    <div className="calculator-app">
      <h1>Smart Calculator Pro</h1>
      <p className="app-subtitle">
        Your everyday calculation toolkit
      </p>

      {/* Main navigation */}
      <nav className="main-navigation">
        <button
          className={activeTab === 'calculator' ? 'active-tab' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 Calculator
        </button>

        <button
          className={activeTab === 'converter' ? 'active-tab' : ''}
          onClick={() => setActiveTab('converter')}
        >
          💱 Converter
        </button>

        <button
          className={activeTab === 'finance' ? 'active-tab' : ''}
          onClick={() => setActiveTab('finance')}
        >
          💰 Finance
        </button>

        <button
          className={activeTab === 'history' ? 'active-tab' : ''}
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
      </nav>

      {/* Calculator tab */}
      {activeTab === 'calculator' && (
        <>
          <button
            className="mode-toggle"
            onClick={() => setScientificMode(!scientificMode)}
          >
            {scientificMode
              ? 'Switch to Standard Mode'
              : 'Switch to Scientific Mode'}
          </button>

          <div className="calculator">
            <div className="display">
              <span>{display}</span>
            </div>

            {scientificMode && (
              <div className="buttons scientific-buttons">
                <button onClick={() => handleScientific('sqrt')}>√</button>
                <button onClick={() => handleScientific('square')}>x²</button>
                <button onClick={handlePower}>xʸ</button>
                <button onClick={() => handleScientific('sin')}>sin</button>

                <button onClick={() => handleScientific('cos')}>cos</button>
                <button onClick={() => handleScientific('tan')}>tan</button>
                <button onClick={() => handleScientific('log')}>log</button>
                <button onClick={() => handleScientific('ln')}>ln</button>

                <button onClick={handlePi}>π</button>
              </div>
            )}

            <div className="buttons">
              <button onClick={handleClear}>AC</button>
              <button onClick={handleBackspace}>⌫</button>
              <button onClick={handlePercentage}>%</button>
              <button onClick={() => handleOperator('÷')}>÷</button>

              <button onClick={() => handleNumber('7')}>7</button>
              <button onClick={() => handleNumber('8')}>8</button>
              <button onClick={() => handleNumber('9')}>9</button>
              <button onClick={() => handleOperator('×')}>×</button>

              <button onClick={() => handleNumber('4')}>4</button>
              <button onClick={() => handleNumber('5')}>5</button>
              <button onClick={() => handleNumber('6')}>6</button>
              <button onClick={() => handleOperator('−')}>−</button>

              <button onClick={() => handleNumber('1')}>1</button>
              <button onClick={() => handleNumber('2')}>2</button>
              <button onClick={() => handleNumber('3')}>3</button>
              <button onClick={() => handleOperator('+')}>+</button>

              <button onClick={() => handleNumber('0')}>0</button>
              <button onClick={handleDecimal}>.</button>
              <button onClick={handleEquals}>=</button>
            </div>
          </div>
        </>
      )}

      {/* Converter tab */}
{activeTab === 'converter' && (
  <UnitConverter onAddToHistory={addToHistory} />
)}

{/* Finance tab */}
{activeTab === 'finance' && (
  <FinanceCalculator onAddToHistory={addToHistory} />
)}

      {/* Advanced History tab */}
      {activeTab === 'history' && (
        <div className="history advanced-history">
          <div className="history-header">
            <div>
              <h2>Calculation History</h2>
              <p className="history-count">
                Total calculations: {history.length}
              </p>
            </div>

            <button
              onClick={() => {
                if (
                  history.length > 0 &&
                  window.confirm('Delete all calculation history?')
                ) {
                  clearHistory()
                  setHistorySearch('')
                }
              }}
              disabled={history.length === 0}
            >
              Clear All
            </button>
          </div>

          <input
            type="text"
            className="history-search"
            placeholder="🔍 Search calculations..."
            value={historySearch}
            onChange={(event) => setHistorySearch(event.target.value)}
          />

          {history.length === 0 ? (
            <p>No calculations yet. Start calculating!</p>
          ) : filteredHistory.length === 0 ? (
            <p>No matching calculations found.</p>
          ) : (
            <ul className="advanced-history-list">
              {filteredHistory.map(({ calculation, index }) => (
                <li key={`${calculation}-${index}`}>
                  <span className="history-calculation">
                    {calculation}
                  </span>

                  <div className="history-actions">
                    <button
                      onClick={() => reuseHistoryResult(calculation)}
                    >
                      Use Result
                    </button>

                    <button
                      onClick={() => deleteHistoryItem(index)}
                      aria-label={`Delete ${calculation}`}
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default App