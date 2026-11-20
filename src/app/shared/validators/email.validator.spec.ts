import { isValidEmail, normalizeEmail } from './email.validator';

describe('email validator', () => {
  const invalid = ['test@@test.de', 'test @test.de', 'test@.de', 'test@test..de', 'test@.test.de', 'test@test', 'test@test.d', '@test.de'];
  const valid = ['test@test.de', '  test@test.de  ', 'Max.Muster+1@mail.example.com', 'a_b-c@sub-domain.co'];

  invalid.forEach((email) => it(`rejects "${email}"`, () => expect(isValidEmail(email)).toBeFalse()));
  valid.forEach((email) => it(`accepts "${email}"`, () => expect(isValidEmail(email)).toBeTrue()));

  it('trims and lowercases before saving', () => {
    expect(normalizeEmail('  Test@Test.DE ')).toBe('test@test.de');
  });
});
