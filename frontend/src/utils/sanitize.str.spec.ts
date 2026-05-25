import { sanitizeStr } from "./sanitize.str";

describe("sanitizeStr", () => {
  test("should return an empty string for null input", () => {
    //@ts-expect-error testando a função sem parametro;
    expect(sanitizeStr()).toBe("");
  });

  test("should return an empty string when the input is not a string", () => {
    //@ts-expect-error testando a função com uma tipagem incorreta;
    expect(sanitizeStr(123)).toBe("");
  });

  test("should ensure the trim of the sent string", () => {
    expect(sanitizeStr("  hello  ")).toBe("hello");
  });

  test("should ensure the normalize string with NFC", () => {
    const original = "e\u0301"; // 'e' + combining acute accent
    const expected = "é";
    expect(sanitizeStr(original)).toBe(expected);
  });
});
