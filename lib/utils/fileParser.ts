import * as XLSX from 'xlsx';

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('File kosong atau tidak valid'));
          return;
        }
        
        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Simple CSV parsing (doesn't handle quoted commas perfectly)
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            // Try to parse as number
            const numValue = Number(value);
            row[header] = (!isNaN(numValue) && value !== '') ? numValue : value;
          });
          
          data.push(row);
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}

export async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        if (jsonData.length === 0) {
          reject(new Error('File Excel kosong'));
          return;
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Format file tidak didukung. Gunakan CSV atau XLSX');
  }
}