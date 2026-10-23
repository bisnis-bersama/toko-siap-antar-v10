// Utilitas bersama untuk halaman administrasi lama.
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

export function esc(value) {
  return String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",\"":"&quot;", "'":"&#39;"}[c]));
}
export function notice(message, type="info") {
  const el=document.querySelector("#notice");
  if(!el) return;
  el.hidden=false; el.textContent=String(message ?? "");
  el.className="notice " + type;
}
export function requireRole(roles, callback) {
  let started=false;
  onAuthStateChanged(auth, async user => {
    if(started) return;
    if(!user) { location.replace("login.html"); return; }
    try {
      const snap=await getDoc(doc(db,"users",user.uid));
      const data=snap.exists()?snap.data():{};
      const role=String(data.role||"").toLowerCase();
      const active=data.status==="aktif" && data.aktif!==false;
      if(!roles.map(x=>String(x).toLowerCase()).includes(role) || !active) {
        notice("Akses ditolak. Akun harus aktif dan memiliki role yang sesuai.","error");
        return;
      }
      started=true; await callback(user,data);
    } catch(e) { notice("Gagal memeriksa akses: "+(e?.message||e),"error"); }
  });
}
