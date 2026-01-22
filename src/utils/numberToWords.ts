const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const scales = ['', 'Thousand', 'Lakh', 'Crore'];

function convertToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  let words = '';
  
  // Handle crores
  if (num >= 10000000) {
    words += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  
  // Handle lakhs
  if (num >= 100000) {
    words += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  // Handle thousands
  if (num >= 1000) {
    words += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  // Handle hundreds
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  // Handle tens and ones
  if (num > 0) {
    if (num < 20) {
      words += ones[num];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10];
      }
    }
  }
  
  return words.trim();
}

export function numberToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = convertToWords(rupees) + ' Only';
  
  if (paise > 0) {
    result = convertToWords(rupees) + ' Rupees and ' + convertToWords(paise) + ' Paise Only';
  }
  
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
