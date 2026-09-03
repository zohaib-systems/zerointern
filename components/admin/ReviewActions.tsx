"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ApprovalModal from "./ApprovalModal";
import RejectionModal from "./RejectionModal";
interface ReviewActionsProps { submissionId: string; status: string; }
export default function ReviewActions({ submissionId, status }: ReviewActionsProps) { const router = useRouter(); const [modal, setModal] = useState<"approve" | "reject" | null>(null); const complete = () => { setModal(null); router.push("/admin/submissions"); router.refresh(); }; if (status !== "PENDING") return <p className="text-zinc-400">This submission has already been reviewed.</p>; return <div className="flex flex-wrap gap-3"><button onClick={() => setModal("approve")} className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950">Approve</button><button onClick={() => setModal("reject")} className="rounded-lg bg-rose-500 px-4 py-2 font-medium">Reject</button>{modal === "approve" && <ApprovalModal submissionId={submissionId} onApprove={complete} onCancel={() => setModal(null)} />}{modal === "reject" && <RejectionModal submissionId={submissionId} onReject={complete} onCancel={() => setModal(null)} />}</div>; }
