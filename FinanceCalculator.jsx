import { useState } from 'react'

function FinanceCalculator({ onAddToHistory }) {
  const [tool, setTool] = useState('emi')

  // EMI fields
  const [loanAmount, setLoanAmount] = useState('500000')
  const [loanRate, setLoanRate] = useState('8.5')
  const [loanYears, setLoanYears] = useState('5')

  // Interest fields
  const [principal, setPrincipal] = useState('10000')
  const [interestRate, setInterestRate] = useState('5')
  const [years, setYears] = useState('3')
  const [frequency, setFrequency] = useState('12')

  // Discount fields
  const [price, setPrice] = useState('1000')
  const [discount, setDiscount] = useState('20')

  // GST fields
  const [gstPrice, setGstPrice] = useState('1000')
  const [gstRate, setGstRate] = useState('18')
  const [gstMode, setGstMode] = useState('exclusive')

  const [savedMessage, setSavedMessage] = useState('')

  const money = (value) =>
    Number.isFinite(value)
      ? value.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 2,
        })
      : 'Invalid input'

  const validPositive = (...values) =>
    values.every((value) => Number.isFinite(value) && value >= 0)

  // Loan EMI
  const calculateEMI = () => {
    const amount = Number(loanAmount)
    const rate = Number(loanRate)
    const duration = Number(loanYears)

    if (
      loanAmount.trim() === '' ||
      loanRate.trim() === '' ||
      loanYears.trim() === '' ||
      !validPositive(amount, rate, duration) ||
      amount === 0 ||
      duration === 0
    ) {
      return null
    }

    const months = duration * 12
    const monthlyRate = rate / 1200

    const emi =
      monthlyRate === 0
        ? amount / months
        : (amount *
            monthlyRate *
            Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1)

    if (!Number.isFinite(emi)) return null

    return {
      emi,
      totalPayment: emi * months,
      totalInterest: emi * months - amount,
    }
  }

  // Simple interest
  const calculateSimpleInterest = () => {
    const p = Number(principal)
    const r = Number(interestRate)
    const t = Number(years)

    if (
      principal.trim() === '' ||
      interestRate.trim() === '' ||
      years.trim() === '' ||
      !validPositive(p, r, t)
    ) {
      return null
    }

    const interest = (p * r * t) / 100

    return {
      interest,
      total: p + interest,
    }
  }

  // Compound interest
  const calculateCompoundInterest = () => {
    const p = Number(principal)
    const r = Number(interestRate)
    const t = Number(years)
    const n = Number(frequency)

    if (
      principal.trim() === '' ||
      interestRate.trim() === '' ||
      years.trim() === '' ||
      frequency.trim() === '' ||
      !validPositive(p, r, t, n) ||
      n === 0
    ) {
      return null
    }

    const amount = p * Math.pow(1 + r / (100 * n), n * t)

    if (!Number.isFinite(amount)) return null

    return {
      interest: amount - p,
      total: amount,
    }
  }

  // Discount
  const calculateDiscount = () => {
    const originalPrice = Number(price)
    const discountRate = Number(discount)

    if (
      price.trim() === '' ||
      discount.trim() === '' ||
      !validPositive(originalPrice, discountRate) ||
      discountRate > 100
    ) {
      return null
    }

    const saved = (originalPrice * discountRate) / 100

    return {
      saved,
      finalPrice: originalPrice - saved,
    }
  }

  // GST
  const calculateGST = () => {
    const amount = Number(gstPrice)
    const rate = Number(gstRate)

    if (
      gstPrice.trim() === '' ||
      gstRate.trim() === '' ||
      !validPositive(amount, rate) ||
      rate > 100
    ) {
      return null
    }

    if (gstMode === 'exclusive') {
      const gstAmount = (amount * rate) / 100

      return {
        baseAmount: amount,
        gstAmount,
        total: amount + gstAmount,
      }
    }

    const baseAmount = amount / (1 + rate / 100)

    return {
      baseAmount,
      gstAmount: amount - baseAmount,
      total: amount,
    }
  }

  const emiResult = tool === 'emi' ? calculateEMI() : null
  const simpleResult = tool === 'simple' ? calculateSimpleInterest() : null
  const compoundResult =
    tool === 'compound' ? calculateCompoundInterest() : null
  const discountResult = tool === 'discount' ? calculateDiscount() : null
  const gstResult = tool === 'gst' ? calculateGST() : null

  // Save the selected financial calculation to shared history
  const saveFinanceHistory = () => {
    let entry = ''

    switch (tool) {
      case 'emi':
        if (!emiResult) {
          setSavedMessage('Please enter valid loan details first.')
          return
        }

        entry =
          `[Finance - EMI] Loan: ${money(Number(loanAmount))}, ` +
          `Rate: ${loanRate}% annually, Duration: ${loanYears} years, ` +
          `Monthly EMI = ${money(emiResult.emi)}`
        break

      case 'simple':
        if (!simpleResult) {
          setSavedMessage('Please enter valid interest details first.')
          return
        }

        entry =
          `[Finance - Simple Interest] Principal: ${money(Number(principal))}, ` +
          `Rate: ${interestRate}%, Duration: ${years} years, ` +
          `Interest = ${money(simpleResult.interest)}, ` +
          `Total = ${money(simpleResult.total)}`
        break

      case 'compound':
        if (!compoundResult) {
          setSavedMessage('Please enter valid compound-interest details first.')
          return
        }

        entry =
          `[Finance - Compound Interest] Principal: ${money(Number(principal))}, ` +
          `Rate: ${interestRate}%, Duration: ${years} years, ` +
          `Frequency: ${frequency} times/year, ` +
          `Interest = ${money(compoundResult.interest)}, ` +
          `Final Amount = ${money(compoundResult.total)}`
        break

      case 'discount':
        if (!discountResult) {
          setSavedMessage('Please enter a valid price and discount.')
          return
        }

        entry =
          `[Finance - Discount] Original Price: ${money(Number(price))}, ` +
          `Discount: ${discount}%, Savings = ${money(discountResult.saved)}, ` +
          `Final Price = ${money(discountResult.finalPrice)}`
        break

      case 'gst':
        if (!gstResult) {
          setSavedMessage('Please enter a valid GST amount and rate.')
          return
        }

        entry =
          `[Finance - GST ${gstMode}] Amount: ${money(Number(gstPrice))}, ` +
          `Rate: ${gstRate}%, GST = ${money(gstResult.gstAmount)}, ` +
          `Total = ${money(gstResult.total)}`
        break

      default:
        return
    }

    if (typeof onAddToHistory === 'function') {
      onAddToHistory(entry)
      setSavedMessage('✓ Calculation saved to history!')
    } else {
      setSavedMessage('History connection is missing. Check App.jsx.')
    }
  }

  const inputField = (label, value, setter, step = 'any') => (
    <label className="finance-field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => {
          setter(event.target.value)
          setSavedMessage('')
        }}
      />
    </label>
  )

  const resultRow = (label, value) => (
    <div className="finance-result-row" key={label}>
      <span>{label}</span>
      <strong>{money(value)}</strong>
    </div>
  )

  return (
    <section className="finance-panel">
      <header className="finance-heading">
        <h2>Finance Calculator</h2>
        <p>Smart tools for everyday financial calculations.</p>
      </header>

      <label className="finance-field">
        <span>Select Financial Tool</span>
        <select
          value={tool}
          onChange={(event) => {
            setTool(event.target.value)
            setSavedMessage('')
          }}
        >
          <option value="emi">Loan EMI Calculator</option>
          <option value="simple">Simple Interest</option>
          <option value="compound">Compound Interest</option>
          <option value="discount">Discount Calculator</option>
          <option value="gst">GST Calculator</option>
        </select>
      </label>

      {tool === 'emi' && (
        <>
          {inputField('Loan Amount (₹)', loanAmount, setLoanAmount)}
          {inputField('Annual Interest Rate (%)', loanRate, setLoanRate)}
          {inputField('Loan Duration (Years)', loanYears, setLoanYears)}

          {emiResult ? (
            <div className="finance-results">
              <h3>Loan Summary</h3>
              {resultRow('Monthly EMI', emiResult.emi)}
              {resultRow('Total Interest', emiResult.totalInterest)}
              {resultRow('Total Repayment', emiResult.totalPayment)}
            </div>
          ) : (
            <p className="finance-error">
              Enter a positive loan amount and duration, with a non-negative
              interest rate.
            </p>
          )}
        </>
      )}

      {tool === 'simple' && (
        <>
          {inputField('Principal Amount (₹)', principal, setPrincipal)}
          {inputField('Annual Interest Rate (%)', interestRate, setInterestRate)}
          {inputField('Time (Years)', years, setYears)}

          {simpleResult ? (
            <div className="finance-results">
              <h3>Simple Interest Summary</h3>
              {resultRow('Interest Earned', simpleResult.interest)}
              {resultRow('Total Amount', simpleResult.total)}
            </div>
          ) : (
            <p className="finance-error">Enter valid non-negative values.</p>
          )}
        </>
      )}

      {tool === 'compound' && (
        <>
          {inputField('Principal Amount (₹)', principal, setPrincipal)}
          {inputField('Annual Interest Rate (%)', interestRate, setInterestRate)}
          {inputField('Time (Years)', years, setYears)}

          <label className="finance-field">
            <span>Compounding Frequency</span>
            <select
              value={frequency}
              onChange={(event) => {
                setFrequency(event.target.value)
                setSavedMessage('')
              }}
            >
              <option value="1">Annually</option>
              <option value="2">Half-yearly</option>
              <option value="4">Quarterly</option>
              <option value="12">Monthly</option>
              <option value="365">Daily (approximate)</option>
            </select>
          </label>

          {compoundResult ? (
            <div className="finance-results">
              <h3>Compound Interest Summary</h3>
              {resultRow('Interest Earned', compoundResult.interest)}
              {resultRow('Final Amount', compoundResult.total)}
            </div>
          ) : (
            <p className="finance-error">Enter valid non-negative values.</p>
          )}
        </>
      )}

      {tool === 'discount' && (
        <>
          {inputField('Original Price (₹)', price, setPrice)}
          {inputField('Discount (%)', discount, setDiscount)}

          {discountResult ? (
            <div className="finance-results">
              <h3>Discount Summary</h3>
              {resultRow('You Save', discountResult.saved)}
              {resultRow('Final Price', discountResult.finalPrice)}
            </div>
          ) : (
            <p className="finance-error">
              Enter a valid price and a discount between 0% and 100%.
            </p>
          )}
        </>
      )}

      {tool === 'gst' && (
        <>
          {inputField('Amount (₹)', gstPrice, setGstPrice)}

          <label className="finance-field">
            <span>GST Rate</span>
            <select
              value={gstRate}
              onChange={(event) => {
                setGstRate(event.target.value)
                setSavedMessage('')
              }}
            >
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </label>

          <label className="finance-field">
            <span>Amount Type</span>
            <select
              value={gstMode}
              onChange={(event) => {
                setGstMode(event.target.value)
                setSavedMessage('')
              }}
            >
              <option value="exclusive">Add GST to the amount</option>
              <option value="inclusive">GST already included</option>
            </select>
          </label>

          {gstResult ? (
            <div className="finance-results">
              <h3>GST Summary</h3>
              {resultRow('Base Amount', gstResult.baseAmount)}
              {resultRow('GST Amount', gstResult.gstAmount)}
              {resultRow('Total Amount', gstResult.total)}
            </div>
          ) : (
            <p className="finance-error">Enter a valid amount.</p>
          )}
        </>
      )}

      <button
        type="button"
        className="finance-save-button"
        onClick={saveFinanceHistory}
      >
        💾 Save to History
      </button>

      {savedMessage && (
        <p className="finance-save-message" role="status">
          {savedMessage}
        </p>
      )}

      <p className="finance-note">
        Results are estimates for calculation purposes. Actual loan payments,
        interest, and applicable GST rates may vary.
      </p>
    </section>
  )
}

export default FinanceCalculator