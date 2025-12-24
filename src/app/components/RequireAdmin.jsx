"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function RequireAdmin({ children }) {
const [checking, setChecking] = useState(true);
const router = useRouter();

useEffect(() => {
const unsub = onAuthStateChanged(auth, async (user) => {
if (!user) {
router.push("/login");
return;
}

// admins/{uid} が存在するかチェック
const adminRef = doc(db, "admins", user.uid);
const adminSnap = await getDoc(adminRef);

if (!adminSnap.exists()) {
router.push("/books"); // 管理者でなければ一覧へ
return;
}

setChecking(false);
});

return () => unsub();
}, [router]);

if (checking) return <p style={{ padding: 24 }}>確認中...</p>;
return children;
}