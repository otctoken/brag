export const PACKAGE = '0x93a36744eff6ee002ef32948866098eae032f277e7e702133dd35dc7cbfe1681';
export const MODULE = `${PACKAGE}::brag`;
export const NFT_TYPE = '0xc8544a17c09eb59aff99596bf3e1c9c766b0b13eb7e7c71b613cf0f77c090f6e::cyber___city_citizen::Nft';
export const DEFAULT_KIOSK = '0x637ca98303882f75fea8136a75e8a53a666c1c18a88e0b15a4fbda0d6e9e784f';
export const DEFAULT_NFT = '0x5da7936cf1ec55beecb3102b27ce0842920bddf97742ad0423313cbc50613a3b';
export const TOKENS = {
  sui: { symbol: 'SUI', scale: 1e9, type: '0x2::sui::SUI', game: '0xe526821cc9f7d744d5dc4702a0a6c5e47cf1bc88dfa91e156ed1e76fa5f4b587' },
  usdc: { symbol: 'USDC', scale: 1e6, type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', game: '0xc0aa5056c6765f2e473a512ff0283bbc102486c7da4c8597c9ce9d43aebf0e62' },
} as const;
export type Token = keyof typeof TOKENS;
export interface TableRef { token: Token; number: string }
