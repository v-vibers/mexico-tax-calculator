import { useState } from 'react';
import { useSubscribeDev } from '@subscribe.dev/react';
import { Header } from './Header';

interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  isr: number;
  netIncome: number;
  effectiveRate: number;
  bracket: string;
  explanation: string;
}

interface CalculationHistory {
  timestamp: number;
  income: number;
  result: TaxCalculation;
}

export function TaxCalculatorApp() {
  const { client, useStorage } = useSubscribeDev();
  const [income, setIncome] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxCalculation | null>(null);
  const [error, setError] = useState<string>('');

  const [history, setHistory, syncStatus] = useStorage!<CalculationHistory[]>('tax-history', []);

  const calculateTax = async () => {
    if (!client || !income) {
      setError('Please enter your annual income');
      return;
    }

    const incomeValue = parseFloat(income);
    const deductionsValue = deductions ? parseFloat(deductions) : 0;

    if (isNaN(incomeValue) || incomeValue <= 0) {
      setError('Please enter a valid income amount');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { output } = await client.run('openai/gpt-4o', {
        input: {
          messages: [
            {
              role: 'system',
              content: `You are a Mexican tax expert. Calculate taxes according to Mexican tax law (ISR - Impuesto Sobre la Renta).

For 2025, Mexico's ISR tax brackets for individuals are:
- Up to $7,735.00 MXN: 1.92%
- $7,735.01 to $65,651.07 MXN: 6.40%
- $65,651.08 to $115,375.90 MXN: 10.88%
- $115,375.91 to $134,119.41 MXN: 16.00%
- $134,119.42 to $160,577.65 MXN: 17.92%
- $160,577.66 to $323,862.00 MXN: 21.36%
- $323,862.01 to $510,451.00 MXN: 23.52%
- $510,451.01 to $974,535.03 MXN: 30.00%
- $974,535.04 to $1,299,380.04 MXN: 32.00%
- $1,299,380.05 to $3,898,140.12 MXN: 34.00%
- Above $3,898,140.12 MXN: 35.00%

Calculate the ISR (income tax) using the progressive tax bracket system. Return a JSON object with exact calculations.`
            },
            {
              role: 'user',
              content: `Calculate ISR for an annual gross income of ${incomeValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} with deductions of ${deductionsValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.`
            }
          ]
        },
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'TaxCalculation',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                grossIncome: { type: 'number' },
                deductions: { type: 'number' },
                taxableIncome: { type: 'number' },
                isr: { type: 'number' },
                netIncome: { type: 'number' },
                effectiveRate: { type: 'number' },
                bracket: { type: 'string' },
                explanation: { type: 'string' }
              },
              required: ['grossIncome', 'deductions', 'taxableIncome', 'isr', 'netIncome', 'effectiveRate', 'bracket', 'explanation'],
              additionalProperties: false
            }
          }
        }
      });

      const calculation = output[0] as TaxCalculation;
      setResult(calculation);

      // Save to history
      const newHistory: CalculationHistory = {
        timestamp: Date.now(),
        income: incomeValue,
        result: calculation
      };
      setHistory([newHistory, ...history.slice(0, 9)]); // Keep last 10 calculations
    } catch (err: any) {
      if (err.type === 'insufficient_credits') {
        setError('Insufficient credits. Please upgrade your subscription to continue.');
      } else if (err.type === 'rate_limit_exceeded') {
        setError(`Rate limit exceeded. Please try again in ${Math.ceil((err.retryAfter || 0) / 1000)} seconds.`);
      } else {
        setError('An error occurred while calculating. Please try again.');
        console.error('Tax calculation error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTax();
  };

  return (
    <div className="tax-calculator-container">
      <Header />

      <main className="calculator-main">
        <div className="calculator-card">
          <h2>Calculate Your Taxes</h2>
          <p className="card-subtitle">
            Enter your annual income to calculate ISR (Impuesto Sobre la Renta)
          </p>

          <form onSubmit={handleSubmit} className="calculator-form">
            <div className="form-group">
              <label htmlFor="income">Annual Gross Income (MXN)</label>
              <input
                id="income"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 500000"
                value={income}
                onChange={(e) => setIncome(e.target.value.replace(/[^0-9.]/g, ''))}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deductions">Annual Deductions (MXN)</label>
              <input
                id="deductions"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 50000"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value.replace(/[^0-9.]/g, ''))}
                className="input-field"
                disabled={loading}
              />
            </div>

            <button type="submit" className="calculate-btn" disabled={loading || !income}>
              {loading ? 'Calculating...' : 'Calculate Tax'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="loading-skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          )}

          {result && !loading && (
            <div className="result-card">
              <h3>Tax Calculation Results</h3>

              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Gross Income</span>
                  <span className="result-value">
                    {result.grossIncome.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </span>
                </div>

                <div className="result-item">
                  <span className="result-label">Taxable Income</span>
                  <span className="result-value">
                    {result.taxableIncome.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </span>
                </div>

                <div className="result-item highlight">
                  <span className="result-label">ISR (Tax)</span>
                  <span className="result-value">
                    {result.isr.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </span>
                </div>

                <div className="result-item">
                  <span className="result-label">Net Income</span>
                  <span className="result-value">
                    {result.netIncome.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </span>
                </div>

                <div className="result-item">
                  <span className="result-label">Effective Tax Rate</span>
                  <span className="result-value">
                    {result.effectiveRate.toFixed(2)}%
                  </span>
                </div>

                <div className="result-item">
                  <span className="result-label">Tax Bracket</span>
                  <span className="result-value">{result.bracket}</span>
                </div>
              </div>

              <div className="explanation">
                <h4>Explanation</h4>
                <p>{result.explanation}</p>
              </div>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="history-card">
            <div className="history-header">
              <h3>Calculation History</h3>
              <span className="sync-status">
                {syncStatus === 'synced' && '✓ Synced'}
                {syncStatus === 'syncing' && '⟳ Syncing...'}
                {syncStatus === 'local' && '📱 Local'}
                {syncStatus === 'error' && '⚠️ Error'}
              </span>
            </div>

            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(item.timestamp).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="history-details">
                    <span>Income: {item.income.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                    <span>Tax: {item.result.isr.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                    <span>Rate: {item.result.effectiveRate.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}