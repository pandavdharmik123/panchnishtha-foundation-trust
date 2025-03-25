import {SignJWT, jwtVerify} from 'jose';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// import { startCase } from 'lodash-es';

interface User {
  id: string;
  role: string
}

interface excelTokenRequest {
  [key: string]: string | number; 
}

export async function sign(payload: User, secret: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60* 60; // one hour

  return new SignJWT({...payload})
      .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
      .setExpirationTime(exp)
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .sign(new TextEncoder().encode(secret));
}

export async function verify(token: string, secret: string) {
  const {payload} = await jwtVerify(token, new TextEncoder().encode(secret));
  // run some checks on the returned payload, perhaps you expect some specific values

 // if its all good, return it, or perhaps just return a boolean
  return payload;
}

interface DocType {
  value: string;
  label: string;
  amount: number
}

export const documentOptions: DocType[] = [
  { value: "income_certificate", label: "આવક નો દાખલો (Income Certificate)", amount: 100 },
  { value: "obc_certificate", label: "બક્ષીપંચ નો દાખલો (OBC Certificate)", amount: 100 },
  { value: "non_creamy_layer", label: "નોન ક્રીમી લેયર (Non Creamy Layer)", amount: 300 },
  { value: "ews_certificate", label: "EWS Certificate", amount: 300 },
  { value: "other", label: "Other", amount: 0 }, // Amount can be dynamic for "Other"
];

export const getDocumentName = (documentType: string) => {
  return documentOptions.find(docType => docType.value === documentType)?.label || documentType;
}

export const formatDate = (date: Date) => new Date(date).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function camelCaseToWords(str: string) {
  // Insert a space before all uppercase letters and trim any leading spaces
  const spaced = str.replace(/([A-Z])/g, ' $1').trim();
  // Capitalize the first letter of each word
  return spaced.replace(/\b\w/g, char => char.toUpperCase());
}

export const exportToExcel = (data: excelTokenRequest[], fileName: string) => {
  if (!data || data.length === 0) return;

  // Format headers: convert camelCase to "Start Case"
  const formattedData = data.map((row: excelTokenRequest) => {
    const newRow: Record<string, string | number> = {};
    Object.keys(row).forEach((key: string) => {
      const formattedKey = camelCaseToWords(key);
      newRow[formattedKey] = row[key];
    });
    return newRow;
  });

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Write and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, `${fileName}.xlsx`);
};


