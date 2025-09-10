import { parse as losslessJsonParse, isInteger } from "lossless-json";

function customNumberParser(value) {
  return isInteger(value) ? BigInt(value) : parseFloat(value);
}

export function parse(value: string): any {
  return losslessJsonParse(value, null, customNumberParser);
}
