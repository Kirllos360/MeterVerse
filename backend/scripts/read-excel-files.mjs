import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const files = [
  'C:/Users/EPower/Downloads/23-07-2026/Golf Invoices Tracking Sheet (21-26).xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/October Smart Water (22-26).xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/Palm Central Smart Water BTU (24-26).xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/Solar Tracking Sheet Golf (21-26).xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/The Crown Smart Invoices Tracking Sheet Electricity (21-26).xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/The Crown Smart Invoices Tracking Sheet Water (21-26).xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/Water Collection.xlsx',
  'C:/Users/EPower/Downloads/23-07-2026/Electricity Collection.xlsx',
];

let output = '# Business Domain Analysis — Excel Files\n\n';
output += '**Date:** 2026-07-23\n\n';
output += 'These 8 Excel files contain real business data that define the MeterVerse domain requirements.\n\n';

for (const f of files) {
  const name = path.basename(f);
  output += '---\n\n';
  output += '## ' + name + '\n\n';
  
  try {
    const wb = XLSX.readFile(f);
    const sheetNames = wb.SheetNames;
    output += '**Sheets:** ' + sheetNames.length + '\n\n';
    
    for (const sName of sheetNames) {
      const ws = wb.Sheets[sName];
      const ref = ws['!ref'];
      if (!ref) { output += '### Sheet: ' + sName + ' (empty)\n\n'; continue; }
      
      const range = XLSX.utils.decode_range(ref);
      const rowCount = range.e.r + 1;
      const colCount = range.e.c + 1;
      output += '### Sheet: ' + sName + '\n';
      output += '- Rows: ' + rowCount + '\n';
      output += '- Columns: ' + colCount + '\n\n';
      
      output += '| Column | Header | Sample Value |\n';
      output += '|--------|--------|-------------|\n';
      for (let c = 0; c < Math.min(colCount, 40); c++) {
        const headerCell = ws[XLSX.utils.encode_cell({r: 0, c})];
        const sampleCell = ws[XLSX.utils.encode_cell({r: Math.min(1, range.e.r), c})];
        const header = headerCell ? String(headerCell.v).trim().substring(0, 50) : '';
        const sample = sampleCell ? String(sampleCell.v).trim().substring(0, 40) : '';
        if (header) output += '| ' + c + ' | ' + header + ' | ' + sample + ' |\n';
      }
      output += '\n';
    }
  } catch(e) {
    output += '**Error reading file:** ' + e.message + '\n\n';
  }
}

output += '---\n\n';
output += '*Analysis generated from 8 Excel files capturing real business data.*\n';

fs.writeFileSync('D:/meter/docs/EXCEL_BUSINESS_ANALYSIS.md', output);
console.log('Analysis written to docs/EXCEL_BUSINESS_ANALYSIS.md');
