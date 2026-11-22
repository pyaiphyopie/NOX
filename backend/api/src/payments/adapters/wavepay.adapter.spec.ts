import { signWave } from './wavepay.adapter';

describe('WavePay hash', () => {
  it('is stable for a known payload', () => {
    const hex = signWave('secret', 'M1', 'ORD1', '15000', 'REF1');
    expect(hex).toMatch(/^[a-f0-9]{64}$/);
    expect(signWave('secret', 'M1', 'ORD1', '15000', 'REF1')).toBe(hex);
    expect(signWave('secret', 'M1', 'ORD1', '15000', 'REF2')).not.toBe(hex);
  });
});
