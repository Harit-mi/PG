const fs = require('fs');

let content = fs.readFileSync('src/components/MarketingNavbar.js', 'utf8');

const handleGoogleLoginStr = `
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`
      }
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  };
`;

content = content.replace(
  /const handleLogin = async \(e\) => {/,
  handleGoogleLoginStr + '\n  const handleLogin = async (e) => {'
);

const googleBtnUI = `
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className={styles.googleBtn}
                disabled={authLoading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} />
                Continue with Google
              </button>

              <div className={styles.divider}>
                <span>or</span>
              </div>
`;

content = content.replace(
  /\{authMode === "login" \? \(\n\s*<form onSubmit=\{handleLogin\}>/,
  googleBtnUI + '\n              {authMode === "login" ? (\n                <form onSubmit={handleLogin}>'
);

content = content.replace(
  /\) : \(\n\s*<form onSubmit=\{handleRegister\}>/,
  ') : (\n                <form onSubmit={handleRegister}>'
);

// wait, the googleBtnUI should be ABOVE `{authMode === "login" ? (` so it shows for both login and register!
content = content.replace(
  googleBtnUI + '\n              {authMode === "login" ? (\n                <form onSubmit={handleLogin}>',
  googleBtnUI + '\n              {authMode === "login" ? (\n                <form onSubmit={handleLogin}>'
);

fs.writeFileSync('src/components/MarketingNavbar.js', content);
