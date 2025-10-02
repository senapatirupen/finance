I built you a ready-to-use Excel template with everything wired up:

* Inputs sheet to list any number of lump-sum investments (sample rows added: ₹1,00,000 Mutual Fund, ₹20,00,000 Land). Edit/append rows freely.
* Projections sheet auto-calculates future values at 1, 2, 5, 10 years + a customizable “N years” column (change “Custom Years” in Assumptions). It also shows inflation-adjusted (real) values using your editable inflation rate.
* Assumptions sheet controls defaults (inflation %, default CAGR for MF/Land).
* CAGR Helper sheet to compute CAGR from any start value, end value, and duration.
* A comparison chart (bar) for 10-year projected values.

Download it here: [Download the Excel](sandbox:/mnt/data/LumpSum_Investment_Projection.xlsx)

### How to use (quick steps)

1. Open the **Inputs** sheet → change “Principal (₹)” and “CAGR (%)” as you like (leave % as decimals or Excel-format, e.g., 12%).
2. Add more rows for other assets (e.g., Gold, REIT, Plot-2, etc.).
3. Optionally tweak **Assumptions**:

   * **Inflation (CPI) %** (default 6%) to see real (inflation-adjusted) values.
   * **Custom Years** (default 7) for the extra “Value at Ny” column.
   * Default CAGR for common types (used by sample rows; you can override per row).
4. See results in **Projections**: 1y, 2y, 5y, 10y, Ny + infl-adjusted 10y/Ny, plus portfolio totals at the bottom.
5. Use **CAGR\_Helper** if you know start/end values and years and want the exact CAGR.

### Notes

* Formulas use $\text{FV} = \text{Principal} \times (1+\text{CAGR})^{n}$.
* Real value = Nominal / $(1+\text{Inflation})^{n}$.
* The chart auto-updates as you add rows.

Want me to add taxes (e.g., LTCG for funds, stamp/registration for land) or a separate “cash-out year” scenario? I can extend the workbook with those too.

I made you a multi-loan Excel tracker with smart part-prepayment modeling. It handles home, car, and personal loans in one place and shows exactly how a part payment changes your EMI or tenure, total outgo, and interest saved.

[Download the Excel](sandbox:/mnt/data/Loan_Manager_with_Prepay.xlsx)

### What’s inside

* **Loans** sheet (edit here)

  * Enter: Loan ID, Type (Home/Car/Personal), **Principal**, **Annual Rate %**, **Tenure value + unit (Months/Years)**, Start Date (optional).
  * See automatic outputs:

    * **EMI**, **Total Payable**, **Total Interest**.
    * **Part-Prepayment** fields: amount, month of prepay (1..n), **Strategy**:

      * `TenureReduction`: keep EMI same, reduce remaining months.
      * `EMIReduction`: keep tenure same, reduce EMI.
    * **Post-prepayment** metrics: balance at prepay month, new principal, **new tenure / new EMI**, total paid incl. prepay, **new total interest**, **interest saved**, **months saved**.
* **Summary** sheet

  * Portfolio totals (principal, interest, payable) **before vs after** prepay.
  * Totals by loan type (Home, Car, Personal).
  * A chart comparing **per-loan total payable** (baseline vs with prepay).
* **Assumptions** sheet

  * Tenure unit hint (Months/Years) and chart lookback (how many loans to chart).

### How it works (key formulas)

* **EMI** = `P * r / (1 - (1+r)^-n)`, where `r = annual_rate/12/100`.
* **Balance after k months** = `P*(1+r)^k - EMI*((1+r)^k - 1)/r`.
* After prepay **A** at month **k** → new principal `P₂ = max(B_k - A, 0)`.

  * **TenureReduction**: EMI same; new tenure
    `N₂ = -LN(1 - r*P₂/EMI)/LN(1+r)`.
  * **EMIReduction**: tenure fixed (`n-k`); new EMI
    `EMI₂ = P₂*r / (1 - (1+r)^-(n-k))`.

### Quick start

1. Open **Loans** and replace sample rows (HOME001, CAR001, PL001) with your data.
2. Set a **Prepay Amount**, **Prepay Month**, and **Strategy** for each loan if applicable.
3. Read results instantly: **interest saved** and **months saved** will populate.
4. Check **Summary** for portfolio impact and the comparison chart.

### Extras I can add (tell me if you want them baked in)

* Full **amortization schedule** per loan (month-by-month table).
* **Multiple prepayments** per loan (e.g., yearly part payments).
* **Prepayment penalties** (% or flat) and tax-benefit toggles (e.g., home-loan Sec 24(b)/80C views).
* **What-if simulator**: slider/input cells to sweep rate/tenure/prepay timing.

If you’d like, I’ll extend this file with amortization tabs and multi-prepay support next.

Here’s a **Future Goals Planner Excel** you can use:

[Download the Excel](sandbox:/mnt/data/Future_Goals_Planner.xlsx)

---

### 📑 What’s inside

* **Assumptions**

  * Default inflation (6%), CAGR for land (9%) and mutual fund (12%).
  * Current year reference (2025 – change if needed).
* **Goals**

  * Add goals like *Kid’s Higher Education*, *Daughter’s Marriage*, etc.
  * Enter:

    * Target Year
    * Current Cost (e.g., ₹20,00,000 for engineering now)
    * Optional inflation override (else uses default)
    * Investment Asset, Invested Amount, Expected CAGR
  * Excel auto-calculates:

    * Future Cost
    * Future Value of investment
    * Surplus / Shortfall
    * Covered? (Yes/No)
* **Summary**

  * Consolidated view of all goals with a bar chart comparing **Future Cost vs Future Investment Value**.

---

### 🚀 Example

* **Kid Higher Education**

  * Current cost: ₹20,00,000
  * Target year: 2040 (15 years)
  * With 6% inflation → Future cost ≈ ₹48 lakh
  * If you invest ₹15 lakh in Land today @9% CAGR → Future value ≈ ₹55 lakh
  * ✅ Covered

* **Daughter Marriage**

  * Current cost: ₹10,00,000
  * Target year: 2035 (10 years)
  * Future cost ≈ ₹18 lakh
  * If you invest ₹5 lakh in MF @12% CAGR → Future value ≈ ₹15.5 lakh
  * ❌ Shortfall of \~₹2.5 lakh

---

Do you want me to extend this with **monthly SIP-based investment planning** (instead of only lump-sum) so you can see how much to save each month to achieve each goal?

Here’s a **Retirement Corpus Planner Excel** you can use:

[Download the Excel](sandbox:/mnt/data/Retirement_Corpus_Planner.xlsx)

---

### 📑 What’s inside

* **Assumptions**

  * Current age, retirement age, life expectancy
  * Current monthly expenses, inflation rate
  * Expected CAGR during accumulation and post-retirement
  * Current savings, planned SIP, one-time investments

* **Summary**

  * Years left to retirement
  * Inflation-adjusted **monthly & annual expenses at retirement**
  * **Corpus Required** (to sustain lifestyle till life expectancy)
  * **Corpus Achievable** (with your SIP + lump sum + CAGR)
  * Surplus/shortfall check
  * A chart comparing *Required vs Achievable corpus*

* **Projection**

  * Yearly table (till retirement):

    * Year, Age, Corpus Start, SIP added, Growth, Corpus End
  * Helps visualize how the corpus compounds over time

---

### 🚀 Example

* Current Age: 35 → Retirement at 60 → 25 years to invest
* Current Expenses: ₹50,000/month
* Inflation: 6% → At 60, expenses ≈ ₹2.15 lakh/month (\~₹25.8 lakh/year)
* Life expectancy: 85 → need corpus for 25 years post-retirement
* Corpus Required: \~₹4.5–5 crore
* With SIP of ₹50k/month @12% CAGR + ₹10L initial savings + ₹5L lumpsum → Achievable corpus \~₹8.5 crore
* ✅ Surplus

---

Would you like me to extend this to also **show yearly post-retirement withdrawal simulation** (so you see how corpus declines each year after 60)?

Here’s your **Stock Market Investment Tracker Excel**:

[Download the Excel](sandbox:/mnt/data/Stock_Market_Investment_Tracker.xlsx)

---

### 📑 What’s inside

* **Stocks / Mutual Funds / ETFs (separate sheets, 10 each)**

  * Columns:

    * Name, Symbol, Units, Buy Price, Current Price, Investment Date
    * Investment Value, Current Value, Profit/Loss, Return %, CAGR %
  * Auto-calculated totals per category

* **Summary**

  * Category-wise totals for **Investment Value, Current Value, Profit/Loss**
  * Overall portfolio totals
  * Charts:

    * **Portfolio Allocation Pie** (based on Investment Value)
    * **Profit/Loss Bar Chart** (by category)

---

### 🚀 Example usage

* Enter your **10 stocks** in *Stocks* tab with units, buy & current price.
* Enter your **10 mutual funds** in *Mutual Funds* tab.
* Enter your **10 ETFs** in *ETFs* tab.
* Excel auto-calculates **portfolio performance** and updates charts.

---

👉 Do you want me to extend this so each stock/MF/ETF also has a **transaction history tab** (multiple buy/sell dates → auto average price and updated units)? That would make it a full-fledged tracker.


Done! I upgraded your tracker to a full **transaction-driven** system. Grab it here:

[Download: Stock\_Tracker\_with\_Transactions.xlsx](sandbox:/mnt/data/Stock_Tracker_with_Transactions.xlsx)

### What you get

* **Universe**: list all assets you track (Type, Name, Symbol). Add up to \~40 rows; e.g., 10 stocks, 10 MFs, 10 ETFs.
* **Prices**: just enter current prices. It auto-pulls symbols & names from Universe.
* **Transactions**: log every **BUY/SELL** with `Date, Type, Name, Symbol, Units, Price, Fees`.

  * Auto-calculated:

    * **Amount** = Units × Price + Fees
    * **Signed Units** (+ for BUY, − for SELL)
    * **Signed Amount** (− for BUY outflow, + for SELL inflow)
* **Holdings** (auto-aggregated per symbol)

  * **Units Held**, **Buy Units**, **Buy Cost**, **Avg Buy Price**
  * **Net Cashflow** (buys negative, sells positive)
  * **Current Price** (from Prices), **Current Value**
  * **Total P/L** = Current Value + Net Cashflow
  * **Return %** = P/L ÷ (−Net Cashflow)
  * Portfolio totals at the bottom
* **Summary**

  * Total Current Value, Net Cashflow, Total P/L
  * **Allocation pie** (by Current Value) and **P/L bar** (by Type)

### How to use (quick)

1. In **Universe**, add your 10 Stocks, 10 Mutual Funds, 10 ETFs.
2. In **Prices**, fill the **Current Price** column (symbols auto-filled).
3. In **Transactions**, record all buys/sells.
4. See your live **Holdings** and **Summary** update instantly. Charts refresh too.

### Notes & next-level add-ons

* This model uses a clean **cashflow P/L**: `P/L = Current Value + Net Cashflow`.
  It naturally handles realized + unrealized gains together.
* Want **FIFO realized P/L** and **tax lots** (LTCG/STCG), or **dividends**/**SIP logs**? I can extend the workbook with those tabs and formulas.

Perfect — I built a **tracking-only market watchlist** (no P\&L/returns). It’s for organizing what you follow: notes, status, priorities, events, and review dates.

[Download: Market\_Watchlist\_Tracker.xlsx](sandbox:/mnt/data/Market_Watchlist_Tracker.xlsx)

### What’s inside

* **Watchlist** (main sheet)

  * Type (Stocks / Mutual Funds / ETFs), Name, Symbol/ISIN, Exchange, Sector
  * Risk, Timeframe, Priority, Status (dropdowns)
  * Entry range / Target / Stop (optional placeholders)
  * Thesis, Catalysts/Events, Earnings/Key Date, Tags, Links, Notes
  * **Next Review date** (shows up on dashboard)
* **Notes\_Log**

  * Date, Topic, Note/Decision, Next Action, Owner, Due Date, Status — to keep a clean research history.
* **Alerts**

  * Free-text alert rules (e.g., “price crosses 1800”, “monthly review on 1st”) + status & notes.
* **Dashboard**

  * KPIs: Total items, Active, Researching, **Next 30-day reviews due**.
  * Charts: **Items by Type** (bar), **Status distribution** (pie).
* **Data**

  * Dropdown sources for Type, Risk, Timeframe, Status, Priority (editable).

### How to use

1. Open **Watchlist** and add up to \~50 items (more rows can be added).
2. Use dropdowns to set **Status/Priority**; add **Next Review** dates.
3. Log research updates in **Notes\_Log** → this creates a tidy audit trail.
4. Set simple monitoring rules in **Alerts** (for your own reference).
5. See **Dashboard** for counts and upcoming reviews.

Want me to add:

* Conditional formatting to highlight overdue reviews,
* A “weekly agenda” view,
* Or a lightweight import template (CSV) for bulk adding symbols?

Running a home smoothly can really benefit from a set of well-structured Excel sheets. Think of them as your **home operating system**. Here are the essential ones you may want:

---

## 🏦 **Financial Management Excels**

1. **Monthly Household Budget**

   * Income (salary, other income).
   * Fixed expenses (rent/EMI, utilities, groceries, insurance).
   * Variable expenses (entertainment, dining, shopping).
   * Savings & Investments.
   * Balance at month end.

2. **Expense Tracker**

   * Daily entry sheet with date, category, amount, payment mode.
   * Category-wise & monthly summaries (pivot/chart).
   * Inflation factor (optional).

3. **Loan & EMI Tracker**

   * Details of home loan, car loan, personal loan, etc.
   * EMI amount, interest, outstanding balance, part payments.
   * Interest saved vs tenure reduced.

4. **Investment Tracker**

   * Mutual funds, stocks, gold, real estate.
   * Amount invested, current value, CAGR.
   * Maturity dates & redemption alerts.

5. **Retirement & Goal Planning**

   * Goals like kids’ education, marriage, retirement corpus.
   * Current cost vs inflation-adjusted future cost.
   * Investment needed to achieve the goals.

---

## 🏡 **Household Operation Excels**

6. **Grocery & Pantry List**

   * Monthly/weekly checklist for essentials.
   * Track purchase date, stock left, expiry dates.

7. **Utility Bills & Subscriptions**

   * Electricity, water, gas, internet, OTT subscriptions.
   * Payment due dates & amounts.
   * Auto-renewal reminders.

8. **Home Maintenance Tracker**

   * Appliances warranty details.
   * Annual servicing (AC, water filter, pest control).
   * Renovation or repair logs with costs.

9. **Medical & Health Tracker**

   * Family health records, vaccinations.
   * Health insurance premiums, claims.
   * Medicine purchase logs.

---

## 👨‍👩‍👧 **Family & Lifestyle Excels**

10. **Education & Kids’ Tracker**

    * School fees schedule.
    * Tuition classes, extra activities.
    * Progress reports.

11. **Travel & Vacation Planner**

    * Budget, itinerary, bookings.
    * Packing checklists.

12. **Event & Festival Planner**

    * Birthdays, anniversaries, pujas, festivals.
    * Gift budgets & planning.

---

✅ **Pro Tip:**
Keep one **“Master Dashboard” Excel** with links/pivots from all other sheets so you see:

* Income vs Expense vs Savings
* Upcoming bills
* Goal progress
  …all in one place.

---

Would you like me to **design a ready-to-use Excel template pack** (with sheets & sample data for each of the above), so you can just start using it?

