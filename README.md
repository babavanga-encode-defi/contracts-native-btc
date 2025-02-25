# How Polymarket Prices Are Determined

## Initial Price Formation

### Zero Initial Shares
- When a market is first created, no shares exist, and there’s no preset price.

### Limit Orders by Market Makers
- Market makers place limit orders to buy or sell YES and NO shares at the prices they’re willing to trade.

### Order Matching Example
- **Example:**  
  - Trader A places a limit order to **buy YES** shares at **$0.60**.  
  - Trader B places a limit order to **sell NO** shares at **$0.40**.
- When these orders match, they form the initial market price:
  - **YES share value:** $0.60  
  - **NO share value:** $0.40
- Together, the sum of the prices is **$1.00**, representing a probability split of **60% vs. 40%**.

## Future Price Dynamics

### Midpoint Pricing
- The market displays prices as the midpoint between the best bid and ask.
- Exception: If the spread is wide (over $0.10), the last traded price is shown.

### Supply & Demand
- Prices adjust in real-time based on traders’ orders.
- As more users buy or sell, the bid-ask spread changes, causing the displayed probabilities to shift.

### Peer-to-Peer Trading
- Trades occur directly between users, not with a centralized bookie.

## Mapping to Our Prediction Market with AMMs (CSMM)

### Market Creation & Token Minting (Same as Polymarket)

#### Event Setup
- Users create a prediction market (e.g., “Will Bitcoin reach 125K USD by March?”) and define two outcomes.

#### Mint Outcome Tokens
- Two tokens (YES and NO) are minted upfront.
- These tokens represent the two possible outcomes and provide a fixed supply for the market.

### Liquidity & CSMM Setup

#### Liquidity Deposit
- Users (or the market creator) deposit native BTC along with the outcome tokens into the AMM pool.

#### Constant Sum Invariant
- The CSMM model ensures that the sum of the prices of YES and NO tokens remains fixed (e.g., $1).
- **Example:**  
  - Initially, there are 100 YES tokens and 100 NO tokens.
  - Implied price for each token: **$0.50**  
    (since 0.50 + 0.50 = $1.00)

#### Dynamic Price Adjustments
- When a user trades—say, buying YES tokens—the ratio of tokens in the pool shifts.
- The AMM calculates the new price such that if the pool ends up with more YES tokens, the YES token price increases and the NO token price decreases.
- This always ensures:
  
Price(YES) + Price(NO) = 1



### Trading Dynamics (Replacing the Order Book)

#### Continuous Pricing
- Instead of waiting for matching limit orders, users can swap tokens continuously against the liquidity pool.
- The AMM’s algorithm calculates the price for each swap.

#### Real-Time Probability Reflection
- Just as in Polymarket, where the price (midpoint of the bid/ask) reflects the probability, our AMM’s calculated price reflects the market’s current belief in the event outcome.

#### Slippage & Trade Size
- The algorithm accounts for slippage—large trades will shift the price more, similar to how a wide bid-ask spread in an order book might affect the final traded price.

## Market Resolution Using an Oracle

### Oracle Price Feed
- On the resolution day (or shortly after), an off-chain oracle fetches the current BTC/USD price (or another relevant data point) and produces a signed commitment.

### Resolution Logic
- **Example:**  
- Market question: "Will Bitcoin reach 125K USD by March?"  
- Oracle reports a price of **126K USD**.
- The contract resolves in favor of **YES**.

### Embedding Oracle Data
- The oracle commitment (a signed message) is included in the market resolution transaction.
- The contract verifies the signature against a trusted public key before locking the winning outcome tokens.

## Claim Process

### Payout
- Holders of the winning tokens can redeem them for collateral (e.g., native BTC).

### Fixed Payout
- In our design, each winning share typically redeems for a fixed value (e.g., **$1** or equivalent BTC value), mirroring Polymarket’s payout system.
