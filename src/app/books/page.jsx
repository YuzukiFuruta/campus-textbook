"use client";

import Nav from "../components/Nav";
import RequireLogin from "../components/RequireLogin";

import { auth, db } from "../../lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";

function stars(n) {
  const v = Math.max(1, Math.min(5, Number(n || 1)));
  return "★".repeat(v) + "☆".repeat(5 - v);
}

function yen(n) {
  const v = Number(n || 0);
  return `${v.toLocaleString("ja-JP")}円`;
}

export default function Page() {
  const [books, setBooks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理者判定（admins/{uid} があるか）
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const ref = doc(db, "admins", user.uid);
      const snap = await getDoc(ref);
      setIsAdmin(snap.exists());
    });
    return () => unsub();
  }, []);

  // books 一覧を購読
  useEffect(() => {
    // ここ重要：Firestoreのコレクション名は "books"
    const q = query(collection(db, "books"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBooks(arr);
    });

    return () => unsub();
  }, []);

  const totalCount = useMemo(() => books.length, [books.length]);

  const remove = async (id) => {
    if (!isAdmin) {
      alert("管理者のみ削除できます");
      return;
    }
    if (!confirm("削除しますか？")) return;
    await deleteDoc(doc(db, "books", id));
  };

  return (
    <RequireLogin>
      <Nav />

      <div style={{ padding: 24, maxWidth: 720 }}>
        <h1>教科書一覧</h1>
        <p style={{ color: "#666" }}>件数：{totalCount}</p>

        {books.length === 0 && <p>まだ出品がありません</p>}

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {books.map((b) => (
            <div
              key={b.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {b.title || "(タイトルなし)"}
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontWeight: 700 }}>{yen(b.price)}</span>
                    {b.listPrice ? (
                      <span style={{ color: "#666" }}>
                        {" "}
                        / 定価 {yen(b.listPrice)}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 6, color: "#666" }}>
                    状態：{b.condition || "-"}
                  </div>

                  <div style={{ marginTop: 10, lineHeight: 1.7 }}>
                    <div>書き込み：{stars(b.writing)}</div>
                    <div>使用感：{stars(b.wear)}</div>
                    <div>濡れ/破損：{stars(b.damage)}</div>
                  </div>

                  {b.note ? (
                    <div style={{ marginTop: 10, color: "#333" }}>
                      備考：{b.note}
                    </div>
                  ) : null}

                  {b.sellerEmail ? (
                    <div style={{ marginTop: 10, color: "#888" }}>
                      出品者：{b.sellerEmail}
                    </div>
                  ) : null}
                </div>

                {isAdmin && (
                  <div>
                    <button onClick={() => remove(b.id)}>削除</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isAdmin && (
          <p style={{ marginTop: 18, color: "#888" }}>
            ※ 削除は管理者のみ表示されます
          </p>
        )}
      </div>
    </RequireLogin>
  );
}