const fs = require('fs');

let content = fs.readFileSync('src/components/MarketingNavbar.js', 'utf8');

const newLogin = `
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setAuthError("Email verification pending. Please verify your email or contact support.");
        } else {
          setAuthError(error.message || "Invalid credentials.");
        }
        setAuthLoading(false);
        return;
      }

      const user = data.user;
      const orgId = user?.user_metadata?.organization_id;

      if (orgId) {
        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .select("status")
          .eq("id", orgId)
          .single();

        if (!orgErr && org && org.status !== "Active") {
          await supabase.auth.signOut();
          setAuthError(\`Your account status is currently "\${org.status}".\`);
          setAuthLoading(false);
          return;
        }
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "An unexpected error occurred.");
      setAuthLoading(false);
    }
  };
`;

const newRegister = `
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await registerOwnerAccount({
        name: regName,
        phone: regPhone,
        pgName: regPgName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      if (!res.success) {
        setAuthError(res.error || "Failed to create account. Please verify details.");
        setAuthLoading(false);
        return;
      }

      setAuthSuccess("Workspace provisioned! Initializing command deck...");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: regEmail.trim(),
        password: regPassword
      });

      if (signInError) {
        setAuthSuccess("Workspace created! Please enter credentials to sign in.");
        setAuthMode("login");
        setLoginEmail(regEmail);
        setAuthLoading(false);
        return;
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "An unexpected error occurred.");
      setAuthLoading(false);
    }
  };
`;

content = content.replace(/const handleLogin = async \(e\) => \{[\s\S]*?const handleRegister/m, newLogin.trim() + '\n\n  const handleRegister');
content = content.replace(/const handleRegister = async \(e\) => \{[\s\S]*?return \(/m, newRegister.trim() + '\n\n  return (');

fs.writeFileSync('src/components/MarketingNavbar.js', content);
