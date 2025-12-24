"use client";

import RequireLogin from "../components/RequireLogin";
import Nav from "../components/Nav";

import { auth, db } from "../../lib/firebase";
import {
collection,
onSnapshot,
orderBy,
query,
deleteDoc,
doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Page() {
const [books, setBooks] = useState([]);

useEffect(() => {
const q = query(collection(db, "textbooks"), orderBy("createdAt", "desc"));
const unsub = onSnapshot(q, (snap) => {
setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});
return () => unsub();
}, []);

const remove = async (id) => {
const ok = confirm("この出品を削除しますか？");
if (!ok) return;
await deleteDoc(doc(db, "textbooks", id));
};

return (
<RequireLogin>
<Nav />
<div style={{ padding: 24 }}>
<h1>教科書一覧</h1>

{books.length === 0 ? (
<p>まだ出品がありません</p>
) : (
<ul style={{ listStyle: "none", padding: 0 }}>
{books.map((b) => (
<li
key={b.id}
style={{
padding: 12,
border: "1px solid #ddd",
marginBottom: 12,
borderRadius: 8,
}}
>
<div style={{ fontWeight: "bold" }}>
{b.title} / {b.price}円
</div>

{b.sellerEmail ? (
<div style={{ fontSize: 12, marginTop: 4 }}>
出品者: {b.sellerEmail}
</div>
) : null}

{b.imageUrl && (
<img
src={b.imageUrl}
alt="教科書"
style={{ width: 160, marginTop: 8, display: "block" }}
/>
)}

{auth.currentUser?.uid === b.sellerUid && (
<button style={{ marginTop: 8 }} onClick={() => remove(b.id)}>
削除
</button>
)}
</li>
))}
</ul>
)}
</div>
</RequireLogin>
);
}