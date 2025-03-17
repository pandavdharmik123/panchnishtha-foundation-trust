import {SignJWT, jwtVerify, type JWTPayload} from 'jose';

export async function sign(payload: any, secret: string): Promise<string> {
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

export const documentOptions = [
  { value: "income_certificate", label: "આવક (Income Certificate)", amount: 100 },
  { value: "obc_certificate", label: "બક્ષીપંચ (OBC Certificate)", amount: 100 },
  { value: "non_creamy_layer", label: "નોન ક્રીમી લેયર (Non Creamy Layer)", amount: 300 },
  { value: "ews_certificate", label: "EWS Certificate", amount: 300 },
  { value: "other", label: "Other", amount: 0 }, // Amount can be dynamic for "Other"
];

