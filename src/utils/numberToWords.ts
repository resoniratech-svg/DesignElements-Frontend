export function numberToWords(amount: number): string {
    if (isNaN(amount) || amount === 0) return "ZERO QAR ONLY";

    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

    function convertUnderHundred(num: number): string {
        if (num < 20) return ones[num];
        const digit = num % 10;
        if (digit === 0) return tens[Math.floor(num / 10)];
        return tens[Math.floor(num / 10)] + " " + ones[digit];
    }

    function convertHundreds(num: number): string {
        if (num >= 100) {
            const h = Math.floor(num / 100);
            const remainder = num % 100;
            return ones[h] + " HUNDRED" + (remainder > 0 ? " AND " + convertUnderHundred(remainder) : "");
        } else {
            return convertUnderHundred(num);
        }
    }

    function convertWhole(num: number): string {
        let n = Math.floor(num);
        if (n === 0) return "ZERO";

        const scales = [
            { value: 1000000000000, name: "TRILLION" },
            { value: 1000000000, name: "BILLION" },
            { value: 1000000, name: "MILLION" },
            { value: 1000, name: "THOUSAND" }
        ];

        let result = "";
        for (const scale of scales) {
            if (n >= scale.value) {
                const chunk = Math.floor(n / scale.value);
                result += convertHundreds(chunk) + " " + scale.name + " ";
                n %= scale.value;
            }
        }

        if (n > 0) {
            result += convertHundreds(n);
        }

        return result.trim().replace(/\s+/g, ' ');
    }

    const wholePart = Math.floor(Math.abs(amount));
    const decimalPart = Math.round((Math.abs(amount) - wholePart) * 100);

    let finalWords = wholePart > 0 ? convertWhole(wholePart) : "ZERO";
    finalWords += " QAR";

    if (decimalPart > 0) {
        finalWords += " AND " + convertWhole(decimalPart) + " DIRHAMS";
    }

    return finalWords.trim().replace(/\s+/g, ' ') + " ONLY";
}
