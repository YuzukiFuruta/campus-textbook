"use client";

import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const email = result.user.email;

    if (!email.endsWith("@hgu.jp")) {
      alert("@hgu.jp のメールアドレスのみ利用できます");
      await signOut(auth);
      return;
    }

    router.push("/books");
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>ログイン</h1>
      <button onClick={login}>Googleでログイン</button>
    </div>
  );
}
