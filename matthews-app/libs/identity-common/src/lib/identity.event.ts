export interface IdentityEvent<T> {
  from: 'web' | 'mobile';
  event: T;
}
