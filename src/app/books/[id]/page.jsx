"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import RequireLogin from "../../components/RequireLogin";
import Nav from "../../components/Nav";

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "books", id));
        setBook(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <RequireLogin>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Nav />

        <button onClick={() => router.push("/books")} style={{ marginTop: 12 }}>
          ← 一覧へ戻る
        </button>

        {loading && <p>読み込み中...</p>}
        {!loading && !book && <p>見つかりませんでした</p>}

        {!loading && book && (
          <div style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 36, margin: "0 0 12px" }}>
              {book.title || "（タイトルなし）"}
            </h1>
            <p style={{ fontSize: 18 }}>
              価格：{book.price ? `${book.price}円` : "未設定"}
            </p>
          </div>
        )}
      </div>
    </RequireLogin>
  );
}