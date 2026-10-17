import test from "node:test";
import assert from "node:assert/strict";
import { birthdayError, formatBirthdayInput, profileInitials } from "../src/services/profile.js";

test("profile initials use the actual name and handle missing names", () => {
  assert.equal(profileInitials("  Harsh  Sharma "), "HS");
  assert.equal(profileInitials("Harsh"), "H");
  assert.equal(profileInitials("Harsh Kumar Sharma"), "HK");
  assert.equal(profileInitials(null), "");
});

test("birthday entry inserts date separators and limits the input length", () => {
  assert.equal(formatBirthdayInput("1"), "1");
  assert.equal(formatBirthdayInput("2902"), "29/02");
  assert.equal(formatBirthdayInput("29022000"), "29/02/2000");
  assert.equal(formatBirthdayInput("29/02/2000123"), "29/02/2000");
});

test("birthday validation accepts real calendar dates and rejects invalid ones", () => {
  const today = new Date(2026, 9, 17);
  assert.equal(birthdayError("29/02/2000", today), "");
  assert.equal(birthdayError("17/10/2026", today), "");
  for (const value of ["29/02/2023", "31/04/2020", "00/12/2000", "12/00/2000", "12/12/0000", "", "1/1/2000"]) assert.notEqual(birthdayError(value, today), "");
});

test("birthday validation rejects dates after today", () => {
  const today = new Date(2026, 9, 17);
  assert.equal(birthdayError("18/10/2026", today), "Your birthday cannot be in the future.");
  assert.equal(birthdayError("01/01/2027", today), "Your birthday cannot be in the future.");
});
