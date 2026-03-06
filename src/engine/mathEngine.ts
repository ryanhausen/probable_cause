/**
 * Evaluates the DA's decision based on plausibility.
 * Plausibility must be > 50 to have a chance of winning.
 * The probability of winning is equal to the plausibility percentage.
 * Uses a Bernoulli trial (Binomial with n=1) for the win/loss outcome.
 *
 * @param plausibility The calculated plausibility percentage (0-100)
 * @returns An object containing the outcome (win/loss) and a message
 */
export const evaluateCase = (plausibility: number): { success: boolean; message: string } => {
    if (plausibility <= 50) {
        return {
            success: false,
            message: `The District Attorney rejected the case outright. A plausibility of ${Math.round(plausibility)}% is not enough to go to trial. You need more evidence.`
        };
    }

    // Calculate chance of success
    const randomValue = Math.random() * 100; // 0 to 99.999...
    const success = randomValue < plausibility;

    if (success) {
        return {
            success: true,
            message: `The DA took the case to court and won! Your evidence held up, proving the suspect's guilt. (Plausibility: ${Math.round(plausibility)}%)`
        };
    } else {
        return {
            success: false,
            message: `The DA took the case to court, but the defense found a loophole. The jury found the suspect not guilty. (Plausibility: ${Math.round(plausibility)}%)`
        };
    }
};
