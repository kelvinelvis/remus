import { Header, Payload, Signature } from "@web3auth/sign-in-with-solana";

export type AuthDto = {
  header: Header;
  payload: Payload;
  signature: Signature;
};
