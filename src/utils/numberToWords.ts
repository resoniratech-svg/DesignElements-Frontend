export function numberToWords(n: number): string {
    if (n === 0) return "ZERO QAR ONLY";

    
    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FOURTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];   


    function convertTens(num: number): string {
        if (num < 20) return ones[num];
        const digit = num % 10;
        if (digit === 0) return tens[Math.floor(num / 10)];
        return tens[Math.floor(num / 10)] + " " + ones[digit];
    }

    function convertHundreds(num: number): string {
        if (num > 99) {
            return ones[Math.floor(num / 100)] + " HUNDRED " + (num % 100 === 0 ? "" : "AND " + convertTens(num % 100));
        } else {
            return convertTens(num);
        }
    }

    let result = "";
    if (n >= 1000000) {
        result += convertHundreds(Math.floor(n / 1000000)) + " MILLION ";
        n %= 1000000;
    }
    if (n >= 1000) {
        result += convertHundreds(Math.floor(n / 1000)) + " THOUSAND ";
        n %= 1000;
    }
    if (n > 0 || result === "") {
        result += convertHundreds(n);
    }
    return result.trim().replace(/\s+/g, ' ') + " QAR ONLY";
}
