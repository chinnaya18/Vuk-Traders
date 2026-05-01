/**
 * Convert a number to words in Indian format
 * Example: 1234567 -> "Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven"
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

const TEENS = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const SCALE = ["", "Thousand", "Lakh", "Crore"];

function convertTriplet(num) {
  let result = "";

  // Hundreds place
  if (num >= 100) {
    result += ONES[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  // Tens and ones place
  if (num >= 20) {
    result += TENS[Math.floor(num / 10)] + " ";
    if (num % 10 > 0) {
      result += ONES[num % 10];
    }
  } else if (num >= 10) {
    result += TEENS[num - 10];
  } else if (num > 0) {
    result += ONES[num];
  }

  return result.trim();
}

export function numberToWords(num) {
  if (num === 0) return "Zero";

  // Handle negative numbers
  let isNegative = num < 0;
  num = Math.abs(Math.floor(num));

  if (num === 0) return "Zero";

  const parts = [];
  let scaleIndex = 0;

  // Break number into triplets (Indian numbering system)
  while (num > 0) {
    if (num % 1000 !== 0) {
      parts.unshift(convertTriplet(num % 1000) + (SCALE[scaleIndex] ? " " + SCALE[scaleIndex] : ""));
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  let result = parts.join(" ").trim();
  
  // Clean up extra spaces
  result = result.replace(/\s+/g, " ");

  return (isNegative ? "Minus " : "") + result;
}

/**
 * Count unique HSN/SAC codes
 */
export function countHSNSACCodes(items) {
  const uniqueCodes = new Set(items.map(item => item.hsn_sac).filter(code => code));
  return uniqueCodes.size;
}

/**
 * Get HSN/SAC summary
 */
export function getHSNSACSummary(items) {
  const uniqueCodes = new Set(items.map(item => item.hsn_sac).filter(code => code));
  const count = uniqueCodes.size;
  return `${count} HSN/SAC Code${count !== 1 ? "s" : ""}`;
}
