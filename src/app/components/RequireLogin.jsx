"use client";

import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireLogin({ children }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email.endsWith("@hgu.jp")) {
        router.push("/login");
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) return <p style={{ padding: 24 }}>確認中...</p>;
  return children;
}
