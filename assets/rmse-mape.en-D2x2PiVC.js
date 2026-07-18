const e=`---
title: "RMSE vs MAPE: How to Measure an AI's Number-Prediction Accuracy"
description: A beginner's guide to regression error metrics — MAE, RMSE, and MAPE — and how to pick the right one for sales, demand, and cost forecasting.
category: ai-adoption-metrics
categoryLabel: AI Adoption Metrics
difficulty: Beginner
updated: 2026-07-18
---

When companies talk about "AI accuracy," they usually picture a model sorting things into buckets: spam or not spam, defective or fine, will churn or won't. [Precision, Recall, and F1: What '99% Accurate' Doesn't Tell You](/knowledge/precision-recall-f1) covered that world — classification, where every prediction is either right or wrong. But a huge share of real business forecasting isn't about categories at all. It's about predicting a *number*: how many units you'll sell tomorrow, next week's footfall, the cost of raw materials, the temperature of a machine on the line. That's called regression, and the moment you're predicting a continuous number, "accuracy" quietly stops making sense. This article explains why, and introduces the two metrics that replace it: RMSE and MAPE.

## Why "Accuracy" Doesn't Apply Here

Classification metrics work by a simple mechanism: label each prediction right or wrong, then count. Accuracy is just the fraction you got right. That only works because "right" is well-defined — an email either is spam or it isn't.

Now try to apply the same idea to a number. Your model predicts tomorrow's sales will be 98 units; the actual turns out to be 100. Was that "right"? Calling it wrong feels far too harsh — you were off by two out of a hundred. But calling it right isn't honest either, because you didn't hit 100. And here's the deeper problem: with continuous numbers, you will *almost never* hit the exact value. Predicting 100.000 when reality lands on 100.000 basically doesn't happen. An accuracy score that demands exact matches would report 0% forever, which tells you nothing.

So the question has to change. Instead of asking "did it get it right?" we ask "how far off was it?" RMSE and MAPE are two different ways of measuring the *size* of that gap.

## The Foundation: Error (Residual)

Everything starts with a single, intuitive quantity — the error, also called the residual:

**Error = Prediction − Actual**

A positive error means the model predicted too high (over-forecast). A negative error means it predicted too low (under-forecast). Simple enough.

The obvious next move is to average these errors across all your predictions and report the result. Don't. There's a trap. Suppose on Monday you over-forecast by 100 units and on Tuesday you under-forecast by 100. The two errors are +100 and −100. Their average is exactly 0 — a flawless score, according to that method. But your model was wildly off on *both* days. The positive and negative errors canceled each other out and hid the damage.

To measure error size honestly, you first have to strip away the sign so overs and unders can't cancel. There are two standard ways to do this, and they lead to different metrics:

- Take the **absolute value** of each error — this leads to MAE and MAPE.
- **Square** each error — this leads to RMSE.

## MAE: The Most Intuitive Measure

Mean Absolute Error is the friendliest place to start. You take the absolute value of every error and average them:

$$ \\text{MAE} = \\frac{1}{n} \\sum_{i=1}^{n} \\left| \\hat{y}_i - y_i \\right| $$

Here $\\hat{y}_i$ is the model's prediction for item $i$, $y_i$ is the actual observed value, and $n$ is the number of predictions. So MAE is simply "on average, how many units off were we?"

Its great strength is interpretability. MAE is expressed in the same units as the thing you're predicting. If you're forecasting units sold and MAE is 12, you can tell a manager "our forecast is off by about 12 units per day on average," and everyone understands it immediately.

MAE also treats every error linearly and even-handedly: an error of 10 counts as 10, an error of 100 counts as 100 — ten times worse, no more. That makes MAE relatively robust to the occasional outlier; one freak day doesn't dominate the score.

But that even-handedness is also its limitation. In some businesses, a single large miss is *far* more dangerous than many small ones — and MAE, by counting errors linearly, isn't sensitive enough to flag that. That's exactly what RMSE is built for.

## RMSE: When Big Misses Are Catastrophic

Root Mean Squared Error follows three steps: square each error, average the squares, then take the square root.

$$ \\text{RMSE} = \\sqrt{\\frac{1}{n} \\sum_{i=1}^{n} \\left( \\hat{y}_i - y_i \\right)^2} $$

The key ingredient is the squaring. Squaring blows large errors out of proportion: an error of 10 becomes 100, but an error of 100 becomes 10,000. A gap that was 10 times bigger becomes 100 times bigger in the score. As a result, RMSE is extremely sensitive to a handful of large errors — one bad miss will pull the number up sharply. The final square root simply rescales everything back to the original units so the result stays interpretable.

A useful property: RMSE is always greater than or equal to MAE. The *gap between them* is itself informative. If RMSE and MAE are close, your errors are fairly uniform — lots of similar small misses. If RMSE towers over MAE, you have a few enormous errors hiding among the small ones.

Use RMSE when one big failure is catastrophic rather than merely inconvenient. Power-grid load forecasting is the classic case: consistently small errors are fine, but a single large under-forecast can mean a blackout, so you want a metric that screams about big misses. Capacity and inventory planning is similar — one large stockout can halt a production line, a cost that dwarfs a week of tiny forecasting wobbles.

## RMSE's Blind Spot

For all its sensitivity, RMSE has one serious weakness: it carries units, so it can't compare across different scales.

"RMSE = 500" is meaningless on its own. Is that good or bad? It depends entirely on the size of what you're predicting. An RMSE of 500 on a store doing 1,000,000 in daily sales is superb — you're essentially nailing it. An RMSE of 500 on a store doing 1,000 in daily sales is a catastrophe — you're off by half. Same number, opposite verdicts.

The same problem blocks comparison across locations. You can't put a giant hypermarket's RMSE next to a corner convenience store's and say which model is "better," because they operate at completely different volumes. The big store's errors will naturally be larger in absolute terms even if its forecasts are proportionally sharper.

So whenever you need to compare across products, regions, or scales — or simply tell an executive "we're off by X percent" — you need a *relative* metric. That's MAPE.

## MAPE: Speaking in Percentages

Mean Absolute Percentage Error divides each error by the actual value, averages the absolute results, and expresses them as a percentage:

$$ \\text{MAPE} = \\frac{100\\%}{n} \\sum_{i=1}^{n} \\left| \\frac{\\hat{y}_i - y_i}{y_i} \\right| $$

Because it divides out the scale, MAPE is unitless and reads as a plain percentage: "our forecast is off by about 8% on average." Anyone can grasp that instantly, with no knowledge of your sales volumes, and it's directly comparable across products of wildly different sizes. That's why MAPE is the default headline metric in most demand- and sales-forecasting reports — it's the number that goes in front of leadership.

It's also the most easily misused metric of the bunch. The next section explains why.

## MAPE's Two Traps

**Trap 1: It explodes when actuals are near zero.** The denominator in MAPE is the actual value. If an actual is exactly 0, you're dividing by zero — undefined. And if an actual is merely *tiny*, a small absolute miss turns into a gigantic percentage. Predict 5 when the truth was 1, and you're "400% off," even though you missed by only 4 units. A few low-volume days like that can completely dominate and distort your MAPE. The practical rule: do not use MAPE on intermittent, low-volume, or zero-containing series — new-product launches, long-tail SKUs, spare parts, anything that frequently sits near zero.

**Trap 2: It's asymmetric and secretly rewards under-forecasting.** Because the denominator is the actual value, over-forecasting and under-forecasting are not penalized equally. Over-forecast and the percentage error can exceed 100%: predict 300 when the actual is 100, and that's a 200% error. But under-forecast and the error is capped at 100%: even if you predict 0 when the actual is 100, that's "only" 100% off. So a model tuned to minimize MAPE will quietly learn to under-predict, because under-predicting is cheaper in MAPE terms. If your business actually fears stockouts — where under-forecasting is the *expensive* mistake — then optimizing MAPE is pushing your model in exactly the wrong direction.

There are better-behaved relatives worth knowing. sMAPE (symmetric MAPE) balances the over/under penalty. WAPE or WMAPE (weighted absolute percentage error) aggregates errors by total volume, which makes it robust to zeros and low-volume items; it's a staple in retail and supply-chain forecasting. For cross-scale comparison in particular, WAPE is often the safer choice.

## Which One Should You Use?

Don't pick a metric by fashion — pick it by your business pain. Work through this checklist:

1. **What's the cost structure of your errors?** If a single large miss is catastrophic (blackout, halted line), use **RMSE** — it's designed to punish big misses. If error cost is roughly linear and you want robustness against the occasional outlier, use **MAE**.

2. **Do you need to compare across products or regions, or report a clean percentage to leadership?** Use **MAPE** — but first confirm you don't have actuals sitting near zero. If you do, switch to **WAPE**.

3. **Does your business clearly fear under-forecasting** — is a stockout worse than overstock? Then don't lean on MAPE alone, because it structurally favors under-forecasting. Pair it with **RMSE** or an asymmetric measure that reflects your true costs.

4. **Set concrete acceptance thresholds.** For example: "MAPE must be ≤ 10% AND no single day may be off by more than 30%." A blended criterion catches both average drift and dangerous one-off spikes.

5. **Keep monitoring after launch.** Demand is not stationary — it drifts with seasonality, promotions, and long-term trends. A model that hit 8% MAPE at launch can quietly decay, so track the metric continuously rather than checking it once.

A closing test you can use on any vendor. When someone pitches you with "our forecast is 95% accurate" — which almost always means a MAPE of about 5% — ask two questions back: *"How do you handle actuals that are near zero?"* and *"For our business, is over-forecasting or under-forecasting the more expensive mistake?"* How they answer tells you, in about thirty seconds, whether they genuinely understand forecasting or are just quoting a number.
`;export{e as default};
