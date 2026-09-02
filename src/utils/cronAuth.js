export function verifyCronAuth(cronSecretEnv, authHeader) {
  if (!cronSecretEnv || authHeader !== `Bearer ${cronSecretEnv}`) {
    return { status: 401, error: "Unauthorized: Missing or invalid CRON_SECRET authorization header." };
  }
  return { status: 200, success: true };
}
