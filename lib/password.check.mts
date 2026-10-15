import assert from "node:assert/strict";
import { firstFailedPasswordRule } from "./password.ts";

assert.equal(firstFailedPasswordRule("password1"), undefined);
assert.equal(firstFailedPasswordRule("pass1")?.label, "At least 8 characters");
assert.equal(firstFailedPasswordRule("12345678")?.label, "Contains a letter");
assert.equal(firstFailedPasswordRule("passwordonly")?.label, "Contains a number");

console.log("password checks passed");
