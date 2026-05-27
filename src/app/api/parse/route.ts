import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    let text = '';

    if (name.endsWith('.csv') || name.endsWith('.tsv')) {
      text = await file.text();
    } else if (name.endsWith('.txt') || name.endsWith('.eml')) {
      text = await file.text();
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheets: string[] = [];
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        sheets.push(`--- Sheet: ${sheetName} ---\n${csv}`);
      });
      text = sheets.join('\n\n');
    } else if (name.endsWith('.pdf')) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        text = data.text;
      } catch {
        text = '[PDF parsing failed. Please paste the text content manually.]';
      }
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${name.split('.').pop()}. Supported: PDF, CSV, Excel, TXT` },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'File appears to be empty or could not be read.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim(), fileName: file.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'File parsing error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
