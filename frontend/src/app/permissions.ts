export const FINANCIAL_USERS = [
    'franco.alves@eximia.co',
    'gustavo.azevedo@eximia.co',
    'gustavo@eximia.co',
    'me@elemarjr.com',
    'fernando.paiva@eximia.co',
    'guilherme.lemos@eximia.co',
    'maicon@eximia.co'
  ] as const;
  
  export type Permission = 'financial' | 'admin' | 'basic';
  
  export function hasPermission(email: string | null | undefined, permission: Permission): boolean {
    if (!email) return false;
  
    switch (permission) {
      case 'financial':
        return FINANCIAL_USERS.includes(email as any);
      case 'admin':
        return email.endsWith('@eximia.co') || email.endsWith('@elemarjr.com');
      case 'basic':
        return true;
      default:
        return false;
    }
  }