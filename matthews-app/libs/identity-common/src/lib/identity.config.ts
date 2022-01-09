export interface IdentityConfig {
  issuer: string;
  client: string;
  scope: string;
  debug: boolean;
  requireHttps: boolean;
}
