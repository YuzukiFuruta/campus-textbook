"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../../lib/firebase";
import RequireLogin from "../components/RequireLogin";
import Nav from "../components/Nav";

export default function Page() {
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 管理者判定（admins/{uid} が存在したら管理者）
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const adminRef = doc(db, "admins", user.uid);
        const snap = await getDoc(adminRef);
        setIsAdmin(snap.exists());
      } catch (e) {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // books をリアルタイム取得
  useEffect(() => {
    const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setBooks(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("削除しますか？")) return;
    await deleteDoc(doc(db, "books", id));
  };

  return (
    <RequireLogin>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Nav />

        <h1 style={{ fontSize: 44, margin: "24px 0" }}>教科書一覧</h1>

        {loading && <p>読み込み中...</p>}

        {!loading && books.length === 0 && <p>まだ出品がありません</p>}

        {!loading && books.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {books.map((b) => (
              <li
                key={b.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {/* 👇 ここクリックで詳細へ */}
                <button
                  type="button"
                  onClick={() => router.push(`/books/${b.id}`)}
                  style={{
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {b.title || "（タイトルなし）"}
                  </div>

                  <div style={{ marginTop: 4 }}>
                    {typeof b.price === "number"
                      ? `${b.price}円`
                      : b.price
                      ? `${b.price}円`
                      : "価格未設定"}
                  </div>
                </button>

                {/* 管理者だけ「削除」ボタン表示 */}
                {isAdmin && (
                  <button
                    onClick={() => onDelete(b.id)}
                    style={{
                      padding: "6px 10px",
                      border: "1px solid #999",
                      borderRadius: 6,
                      background: "white",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
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