"use client";

import { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import RequireAdmin from "../../components/RequireAdmin";

import { auth, db } from "../../../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Page() {
const [rateA, setRateA] = useState(70);
const [rateB, setRateB] = useState(55);
const [rateC, setRateC] = useState(60);
const [loading, setLoading] = useState(true);
const [msg, setMsg] = useState("");

useEffect(() => {
const load = async () => {
try {
const ref = doc(db, "settings", "pricing");
const snap = await getDoc(ref);

if (snap.exists()) {
const data = snap.data();
if (typeof data.rateA === "number") setRateA(data.rateA);
if (typeof data.rateB === "number") setRateB(data.rateB);
if (typeof data.rateC === "number") setRateC(data.rateC);
}
} finally {
setLoading(false);
}
};
load();
}, []);

const save = async () => {
setMsg("");

// 簡単バリデーション
const a = Number(rateA);
const b = Number(rateB);
const c = Number(rateC);

if ([a, b, c].some((x) => Number.isNaN(x))) {
setMsg("数字を入力してください");
return;
}
if ([a, b, c].some((x) => x < 1 || x > 100)) {
setMsg("1〜100の範囲で入力してください");
return;
}

const ref = doc(db, "settings", "pricing");
await setDoc(
ref,
{
rateA: a,
rateB: b,
rateC: c,
updatedAt: serverTimestamp(),
updatedBy: auth.currentUser?.email ?? null,
},
{ merge: true }
);

setMsg("保存しました（即反映されます）");
};

if (loading) {
return (
<RequireAdmin>
<Nav />
<p style={{ padding: 24 }}>読み込み中...</p>
</RequireAdmin>
);
}

return (
<RequireAdmin>
<Nav />
<div style={{ padding: 24, maxWidth: 520 }}>
<h1>価格設定（管理者）</h1>

<div style={{ marginTop: 16 }}>
<label>A：きれい・未使用（%）</label>
<input
type="number"
value={rateA}
onChange={(e) => setRateA(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
/>
</div>

<div style={{ marginTop: 16 }}>
<label>B：通常使用（%）</label>
<input
type="number"
value={rateB}
onChange={(e) => setRateB(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
/>
</div>

<div style={{ marginTop: 16 }}>
<label>C：書き込み充実（%）</label>
<input
type="number"
value={rateC}
onChange={(e) => setRateC(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
/>
</div>

<button onClick={save} style={{ marginTop: 18 }}>
保存
</button>

{msg && <p style={{ marginTop: 12 }}>{msg}</p>}

<p style={{ marginTop: 18, color: "#666" }}>
※ 保存すると、出品画面のおすすめ価格の計算に即反映されます。
</p>
</div>
</RequireAdmin>
);
}