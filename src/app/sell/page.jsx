"use client";

import RequireLogin from "../components/RequireLogin";
import Nav from "../components/Nav";

import { auth, db } from "../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import {
getStorage,
ref,
uploadBytes,
getDownloadURL,
} from "firebase/storage";
import { useState } from "react";

export default function Page() {
const [title, setTitle] = useState("");
const [price, setPrice] = useState("");
const [image, setImage] = useState(null);
const [loading, setLoading] = useState(false);

const submit = async () => {
if (!auth.currentUser) return;

if (!title || !price) {
alert("教科書名と価格を入力してください");
return;
}

setLoading(true);

let imageUrl = "";

// ① 画像アップロード
if (image) {
const storage = getStorage();
const imageRef = ref(
storage,
`textbooks/${auth.currentUser.uid}/${Date.now()}`
);
await uploadBytes(imageRef, image);
imageUrl = await getDownloadURL(imageRef);
}

// ② Firestoreに保存
await addDoc(collection(db, "textbooks"), {
title,
price: Number(price),
imageUrl,
sellerUid: auth.currentUser.uid,
sellerEmail: auth.currentUser.email,
createdAt: new Date(),
});

setLoading(false);
setTitle("");
setPrice("");
setImage(null);
alert("出品しました！");
};

return (
<RequireLogin>
<Nav />
<div style={{ padding: 24 }}>
<h1>教科書を出品</h1>

<input
placeholder="教科書名"
value={title}
onChange={(e) => setTitle(e.target.value)}
/>
<br /><br />

<input
type="number"
placeholder="価格"
value={price}
onChange={(e) => setPrice(e.target.value)}
/>
<br /><br />

<input
type="file"
accept="image/*"
onChange={(e) => setImage(e.target.files[0])}
/>
<br /><br />

<button onClick={submit} disabled={loading}>
{loading ? "アップロード中..." : "出品する"}
</button>
</div>
</RequireLogin>
);
}