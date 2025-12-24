"use client";

import RequireLogin from "../components/RequireLogin";
import Nav from "../components/Nav";

import { auth, db } from "../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

const CONDITION_RATE = {
A: 70, // %
B: 55, // %
C: 60, // %（書き込み充実は価値あり）
};

// 100円単位に丸め
function roundTo100(yen) {
return Math.round(yen / 100) * 100;
}

function toNum(v) {
const n = Number(v);
return Number.isFinite(n) ? n : 0;
}

export default function Page() {
const [title, setTitle] = useState("");

// 価格系
const [listPrice, setListPrice] = useState(""); // 定価
const [condition, setCondition] = useState("A"); // A/B/C
const [price, setPrice] = useState(""); // 販売価格（自動→手動OK）
const [autoPriceEnabled, setAutoPriceEnabled] = useState(true);

// 詳細状態（1〜5）
const [writing, setWriting] = useState("3"); // 書き込み量
const [wear, setWear] = useState("3"); // 使用感・汚れ
const [damage, setDamage] = useState("1"); // 濡れ・破損

const [note, setNote] = useState("");

// A/B/C と定価からおすすめ価格を自動計算
useEffect(() => {
if (!autoPriceEnabled) return;
const lp = toNum(listPrice);
if (lp <= 0) return;

const rate = CONDITION_RATE[condition] ?? 55;
const recommended = roundTo100((lp * rate) / 100);

setPrice(String(recommended));
}, [listPrice, condition, autoPriceEnabled]);

const submit = async () => {
if (!auth.currentUser) {
alert("ログインしてください");
return;
}
if (!title.trim()) {
alert("教科書名を入力してください");
return;
}

const lp = toNum(listPrice);
const p = toNum(price);

if (lp <= 0) {
alert("定価を正しく入力してください");
return;
}
if (p <= 0) {
alert("販売価格を正しく入力してください");
return;
}

await addDoc(collection(db, "books"), {
title: title.trim(),

// 価格
listPrice: lp,
price: p,
condition, // A/B/C

// 詳細状態（1〜5）
writing: toNum(writing),
wear: toNum(wear),
damage: toNum(damage),

note: note.trim(),

// 出品者情報
sellerUid: auth.currentUser.uid,
sellerEmail: auth.currentUser.email,

createdAt: serverTimestamp(),
});

alert("出品しました！");

// リセット（好みで）
setTitle("");
setListPrice("");
setCondition("A");
setAutoPriceEnabled(true);
setPrice("");
setWriting("3");
setWear("3");
setDamage("1");
setNote("");
};

return (
<RequireLogin>
<Nav />
<div style={{ padding: 24, maxWidth: 560 }}>
<h1>教科書を出品</h1>

<div style={{ marginTop: 16 }}>
<label>教科書名</label>
<input
value={title}
onChange={(e) => setTitle(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
placeholder="例：ミクロ経済学入門"
/>
</div>

<div style={{ marginTop: 16 }}>
<label>定価（円）</label>
<input
type="number"
value={listPrice}
onChange={(e) => setListPrice(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
placeholder="例：3000"
/>
</div>

<div style={{ marginTop: 16 }}>
<label>状態（価格の基準）</label>
<select
value={condition}
onChange={(e) => setCondition(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
>
<option value="A">A：きれい・未使用（おすすめ 70%）</option>
<option value="B">B：通常使用（おすすめ 55%）</option>
<option value="C">C：書き込み充実（おすすめ 60%）</option>
</select>
</div>

<div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc" }}>
<label style={{ display: "block", marginBottom: 8 }}>
おすすめ価格（自動計算）
</label>

<label style={{ display: "flex", gap: 8, alignItems: "center" }}>
<input
type="checkbox"
checked={autoPriceEnabled}
onChange={(e) => setAutoPriceEnabled(e.target.checked)}
/>
自動計算を使う
</label>

<div style={{ marginTop: 10 }}>
<label>販売価格（円）</label>
<input
type="number"
value={price}
onChange={(e) => {
setPrice(e.target.value);
setAutoPriceEnabled(false); // 手で触ったら自動OFF
}}
style={{ width: "100%", padding: 8, marginTop: 6 }}
placeholder="例：1800"
/>
<p style={{ marginTop: 8, color: "#666" }}>
※ 価格は手動で調整できます（手で入力すると自動計算はOFFになります）
</p>
</div>
</div>

<h2 style={{ marginTop: 22 }}>詳細状態（1〜5）</h2>
<p style={{ color: "#666", marginTop: 6 }}>
※ 価格はA/B/Cが基準。詳細は説明用です。
</p>

<div style={{ marginTop: 12 }}>
<label>書き込み量</label>
<select
value={writing}
onChange={(e) => setWriting(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
>
<option value="1">1：ほぼなし</option>
<option value="2">2：少し</option>
<option value="3">3：普通</option>
<option value="4">4：やや多い</option>
<option value="5">5：多い</option>
</select>
</div>

<div style={{ marginTop: 12 }}>
<label>使用感・汚れ</label>
<select
value={wear}
onChange={(e) => setWear(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
>
<option value="1">1：きれい</option>
<option value="2">2：少し</option>
<option value="3">3：普通</option>
<option value="4">4：やや目立つ</option>
<option value="5">5：目立つ</option>
</select>
</div>

<div style={{ marginTop: 12 }}>
<label>濡れ・破損</label>
<select
value={damage}
onChange={(e) => setDamage(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6 }}
>
<option value="1">1：なし</option>
<option value="2">2：少し</option>
<option value="3">3：普通</option>
<option value="4">4：やや強い</option>
<option value="5">5：強い</option>
</select>
</div>

<div style={{ marginTop: 16 }}>
<label>備考（任意）</label>
<textarea
value={note}
onChange={(e) => setNote(e.target.value)}
style={{ width: "100%", padding: 8, marginTop: 6, minHeight: 90 }}
placeholder="例：期末対策の要点メモあり / 角に少し折れあり など"
/>
</div>

<button onClick={submit} style={{ marginTop: 18 }}>
出品する
</button>
</div>
</RequireLogin>
);
}