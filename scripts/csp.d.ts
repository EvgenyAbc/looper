export function buildCspPolicy(
  menuJson: string,
  options?: { enforce?: boolean; extraOrigins?: string[] },
): { headerName: string; policy: string; headerLine: string };

export function buildCspPolicyFromFile(
  menuPath: string,
  options?: { enforce?: boolean; extraOrigins?: string[] },
): { headerName: string; policy: string; headerLine: string };
