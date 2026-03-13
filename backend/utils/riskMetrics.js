// ============================================================
// utils/riskMetrics.js
// ------------------------------------------------------------
// Financial risk calculations — this is what most dashboards
// completely skip. These metrics are used by professionals
// at every major investment firm.
//
// Formulas:
//   Sharpe Ratio  = (Return - Risk-Free Rate) / Std Deviation
//   Volatility    = Standard deviation of daily returns (annualised)
//   Beta          = Cov(stock, market) / Var(market)
// ============================================================

const RISK_FREE_RATE = 0.0525; // Current US 10yr Treasury ~5.25%
const TRADING_DAYS   = 252;    // Number of trading days in a year

/**
 * Given an array of closing prices, compute daily % returns.
 * e.g. [100, 105, 103] → [+5%, -1.9%]
 */
function getDailyReturns(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

/**
 * Mean (average) of an array of numbers.
 */
function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Standard deviation of an array of numbers.
 */
function stdDev(arr) {
  const avg = mean(arr);
  const squaredDiffs = arr.map((x) => Math.pow(x - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

/**
 * Annualised volatility (risk) as a percentage.
 * Higher = riskier.
 */
function calcVolatility(closingPrices) {
  if (!closingPrices || closingPrices.length < 5) return null;
  const returns = getDailyReturns(closingPrices);
  const dailyStdDev = stdDev(returns);
  const annualVol = dailyStdDev * Math.sqrt(TRADING_DAYS);
  return parseFloat((annualVol * 100).toFixed(2)); // return as %
}

/**
 * Sharpe Ratio — reward per unit of risk.
 * > 1.0  = good
 * > 2.0  = very good
 * < 0    = losing money vs risk-free rate (bad)
 */
function calcSharpeRatio(closingPrices) {
  if (!closingPrices || closingPrices.length < 5) return null;
  const returns = getDailyReturns(closingPrices);

  // Annualise the daily return mean
  const annualReturn = mean(returns) * TRADING_DAYS;
  const annualStdDev = stdDev(returns) * Math.sqrt(TRADING_DAYS);

  if (annualStdDev === 0) return null;

  const sharpe = (annualReturn - RISK_FREE_RATE) / annualStdDev;
  return parseFloat(sharpe.toFixed(2));
}

/**
 * Beta — how much a stock moves relative to the S&P 500.
 * Beta = 1.0  → moves with the market
 * Beta > 1.0  → more volatile than market (e.g. 1.5 = 50% more)
 * Beta < 1.0  → less volatile (defensive stock)
 * Beta < 0    → moves opposite to market (hedge)
 *
 * stockPrices and marketPrices must be the same length.
 */
function calcBeta(stockPrices, marketPrices) {
  if (
    !stockPrices || !marketPrices ||
    stockPrices.length < 5 ||
    stockPrices.length !== marketPrices.length
  ) return null;

  const stockReturns  = getDailyReturns(stockPrices);
  const marketReturns = getDailyReturns(marketPrices);

  const stockMean  = mean(stockReturns);
  const marketMean = mean(marketReturns);

  // Covariance(stock, market)
  let covariance = 0;
  for (let i = 0; i < stockReturns.length; i++) {
    covariance += (stockReturns[i] - stockMean) * (marketReturns[i] - marketMean);
  }
  covariance /= stockReturns.length;

  // Variance(market)
  const marketVariance = Math.pow(stdDev(marketReturns), 2);

  if (marketVariance === 0) return null;

  const beta = covariance / marketVariance;
  return parseFloat(beta.toFixed(2));
}

/**
 * Returns a human-readable risk label based on volatility.
 */
function riskLabel(volatility) {
  if (volatility === null) return "Unknown";
  if (volatility < 15) return "Low";
  if (volatility < 30) return "Moderate";
  if (volatility < 50) return "High";
  return "Very High";
}

/**
 * Calculate all risk metrics for one stock.
 * Returns an object with volatility, sharpe, beta, riskLabel.
 */
function calcAllMetrics(stockPrices, marketPrices) {
  const volatility = calcVolatility(stockPrices);
  const sharpe     = calcSharpeRatio(stockPrices);
  const beta       = calcBeta(stockPrices, marketPrices);

  return {
    volatility,
    sharpeRatio: sharpe,
    beta,
    riskLabel: riskLabel(volatility),
  };
}

module.exports = { calcAllMetrics, calcVolatility, calcSharpeRatio, calcBeta, riskLabel };
