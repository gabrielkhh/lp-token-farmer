import BN from 'bn.js';

export const bigIntToBN = (value: bigint): BN => {
    return new BN(value.toString());
}

// export const formatTokenAmount = (amount: bigint | BN | undefined, decimals: number | undefined): number | undefined => {
//     if (decimals === undefined || amount === undefined) return undefined;

//     const amountBN = BN.isBN(amount) ? amount : bigIntToBN(amount);

//     // For zero amount, return 0
//     if (amountBN.isZero()) return 0;

//     // May have precision loss if decimals is too large
//     return amountBN.mul(new BN(10).pow(new BN(decimals).neg())).toNumber();
// }

export const formatTokenAmountAsString = (value: bigint, decimals: number = 0): string => {
    // Handle negative values
    const isNegative = value < BigInt(0);

    // Work with the absolute value
    let absValue = isNegative ? -value : value;

    // Convert BigInt to string
    let valueStr = absValue.toString();

    if (decimals <= 0) {
        // If decimals is 0 or negative, we're adding zeros to the right
        const zeros = '0'.repeat(Math.abs(decimals));
        valueStr = valueStr + zeros;
        return isNegative ? '-' + valueStr : valueStr;
    }

    // If decimals is greater than the string length, pad with leading zeros
    if (decimals >= valueStr.length) {
        valueStr = '0'.repeat(decimals - valueStr.length + 1) + valueStr;
    }

    // Insert the decimal point at the right position
    const insertPosition = valueStr.length - decimals;
    const result = valueStr.slice(0, insertPosition) + '.' + valueStr.slice(insertPosition);

    // Remove trailing zeros after decimal point, but keep at least one digit after decimal
    const cleanedResult = result.replace(/\.?0+$/, match => match.startsWith('.') ? '' : match);

    // Apply negative sign if needed
    return isNegative ? '-' + cleanedResult : cleanedResult;
};

export const decimalToBigInt = (decimalStr: string, decimals: number = 0): bigint => {
    // Validate input
    if (!decimalStr || typeof decimalStr !== 'string') {
        return BigInt(0);
    }

    // Check if it's a valid decimal number
    if (!/^-?\d+(\.\d+)?$/.test(decimalStr)) {
        throw new Error('Input must be a valid decimal number');
    }

    // Handle negative numbers
    const isNegative = decimalStr.startsWith('-');
    if (isNegative) {
        decimalStr = decimalStr.substring(1);
    }

    // Split the number into integer and decimal parts
    const [integerPart, decimalPart = ''] = decimalStr.split('.');

    let result: string;

    if (decimals === 0) {
        // Just remove the decimal point
        result = integerPart + decimalPart;
    } else if (decimals > 0) {
        // If decimal part is shorter than required decimals, pad with zeros
        const paddedDecimal = decimalPart.padEnd(decimals, '0');

        if (paddedDecimal.length > decimals) {
            // If we have more decimal places than needed, truncate
            result = integerPart + paddedDecimal.substring(0, decimals);
        } else {
            result = integerPart + paddedDecimal;
        }
    } else {
        // Negative decimals means we want to move the decimal point to the left
        // This effectively divides the number
        const absDecimals = Math.abs(decimals);
        const fullNumber = integerPart + decimalPart;

        if (fullNumber.length <= absDecimals) {
            // If the number is smaller than the decimal shift, result is 0
            return BigInt(0);
        }

        result = fullNumber.slice(0, fullNumber.length - absDecimals);
    }

    // Remove leading zeros to avoid octal interpretation issues
    const cleanedStr = result.replace(/^0+/, '') || '0';

    // Convert to BigInt and apply the sign
    const bigIntResult = BigInt(cleanedStr);
    return isNegative ? -bigIntResult : bigIntResult;
};

export const calculateBigIntPercentage = (formattedBalance: string, percentage: number, decimals: number = 0): string => {
    // Remove decimal point
    const parts = formattedBalance.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';
    
    // Convert to BigInt
    const valueAsBigInt = BigInt(integerPart + decimalPart);
    
    // Calculate percentage
    const result = (valueAsBigInt * BigInt(percentage)) / BigInt(100);
    
    // Convert back to string with proper decimal places
    let resultStr = result.toString();
    
    // Ensure the string has enough leading zeros
    while (resultStr.length <= decimals) {
      resultStr = '0' + resultStr;
    }
    
    // Insert decimal point
    const resultIntegerPart = resultStr.slice(0, resultStr.length - decimals) || '0';
    const resultDecimalPart = resultStr.slice(resultStr.length - decimals);
    
    return `${resultIntegerPart}.${resultDecimalPart}`;
  }