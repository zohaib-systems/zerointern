"use client";
import { useState } from "react";
export default function ShareCertificateButton({code}: {code:string}) {
 const [message,setMessage]=useState("");
 async function share() { const url=new URL(`/certificate/verify/${encodeURIComponent(code)}`,window.location.origin).href;
 try {await navigator.clipboard.writeText(url);setMessage("Verification link copied.");} catch {setMessage("Could not copy. Open Verify credential and copy the address.");} }
 return <div><button onClick={share} className="zi-btn zi-btn-secondary">Copy share link</button><p role="status" className="zi-caption">{message}</p></div>;
}
