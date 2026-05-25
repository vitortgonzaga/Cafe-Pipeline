import { describe, it, expect } from "vitest";
import * as InputOtpModule from "./input-otp";

describe("InputOtp", () => {
  it("exporta componentes de OTP", () => {
    expect(InputOtpModule.InputOTP).toBeDefined();
    expect(InputOtpModule.InputOTPGroup).toBeDefined();
    expect(InputOtpModule.InputOTPSlot).toBeDefined();
  });
});
