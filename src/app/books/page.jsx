"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  // ★ 星表示
  const stars = (n) => {
    const x = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(x) + "☆".repeat(5 - x);
  };

  return (
    <RequireLogin>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Nav />

        <h1 style={{ fontSize: 44, margin: "24px 0" }}>教科書一覧</h1>

        {loading && <p>読み込み中...</p>}
        {!loading && books.length === 0 && <p>まだ出品がありません</p>}

        {!loading && books.length > 0 && (
          <>
            <p style={{ color: "#666" }}>件数：{books.length}</p>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {books.map((b) => (
                <li key={b.id} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 12,
                      padding: 16,
                      position: "relative",
                    }}
                  >
                    {/* カード全体クリックで詳細へ */}
                    <Link
                      href={`/books/${b.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                      }}
                    >
                      <div style={{ fontSize: 24, fontWeight: 800 }}>
                        {b.title || "（タイトルなし）"}
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <b>{b.price ?? "価格未設定"}円</b>
                        {b.listPrice != null && (
                          <span style={{ color: "#666" }}> / 定価 {b.listPrice}円</span>
                        )}
                      </div>

                      {b.condition && (
                        <div style={{ marginTop: 8, color: "#666" }}>
                          状態：{b.condition}
                        </div>
                      )}

                      {/* 3つの星（フィールド名が違うなら教えて！） */}
                      {(b.writing != null || b.usage != null || b.damage != null) && (
                        <div style={{ marginTop: 10, color: "#666", lineHeight: 1.9 }}>
                          {b.writing != null && <div>書き込み：{stars(b.writing)}</div>}
                          {b.usage != null && <div>使用感：{stars(b.usage)}</div>}
                          {b.damage != null && <div>濡れ/破損：{stars(b.damage)}</div>}
                        </div>
                      )}

                      
                    </Link>

                    {/* 管理者だけ削除（クリックで詳細へ飛ばないように stopPropagation） */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); // Link遷移を止める
                          e.stopPropagation();
                          onDelete(b.id);
                        }}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 12,
                          padding: "6px 10px",
                          border: "1px solid #999",
                          borderRadius: 6,
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        削除
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p style={{ marginTop: 16, color: "#999" }}>
              ※ 削除は管理者のみ表示されます
            </p>
          </>
        )}
      </div>
    </RequireLogin>
  );
}