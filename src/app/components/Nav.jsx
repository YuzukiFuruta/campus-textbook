"use client";

import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function Nav() {
const router = useRouter();

const logout = async () => {
await signOut(auth);
router.push("/login");
};

return (
<nav style={{ padding: 12, borderBottom: "1px solid #ccc" }}>
<button onClick={() => router.push("/books")}>一覧</button>
<button onClick={() => router.push("/sell")}>出品</button>
<button onClick={logout}>ログアウト</button>
</nav>
);
}