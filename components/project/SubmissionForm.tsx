"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
const schema = z.object({ repoUrl: z.string().url("Enter a valid URL").startsWith("https://", "URL must use HTTPS"), liveUrl: z.string().url("Enter a valid URL").startsWith("https://", "URL must use HTTPS") });
type FormValues = z.infer<typeof schema>;
export default function SubmissionForm({ projectId, initialRepoUrl = "", initialLiveUrl = "" }: { projectId: string; initialRepoUrl?: string; initialLiveUrl?: string }) {
 const router=useRouter(); const [serverError,setServerError]=useState("");
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormValues>({resolver:zodResolver(schema),defaultValues:{repoUrl:initialRepoUrl,liveUrl:initialLiveUrl}});
 async function submit(values:FormValues) {
  setServerError("");
  try { const response=await fetch("/api/submissions/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId,...values})}); const result=await response.json(); if(!response.ok) {setServerError(result.error??"Unable to submit");return;} router.refresh(); }
  catch {setServerError("Unable to connect. Your links are still here; please try again.");}
 }
 return <form onSubmit={handleSubmit(submit)} className="zi-panel zi-form"><fieldset disabled={isSubmitting}><legend>Project links</legend><div className="zi-field"><label htmlFor="repoUrl">Repository URL *</label><input type="url" required id="repoUrl" {...register("repoUrl")} aria-invalid={!!errors.repoUrl} aria-describedby="repo-hint repo-error" placeholder="https://github.com/username/project" /><p id="repo-hint">Your source code and README with setup instructions.</p><p id="repo-error" className="zi-error">{errors.repoUrl?.message}</p></div><div className="zi-field"><label htmlFor="liveUrl">Live project URL *</label><input type="url" required id="liveUrl" {...register("liveUrl")} aria-invalid={!!errors.liveUrl} aria-describedby="live-hint live-error" placeholder="https://your-project.com" /><p id="live-hint">A deployed application reviewers can open and test.</p><p id="live-error" className="zi-error">{errors.liveUrl?.message}</p></div><h3>Completion checklist</h3>{["All required features are implemented","The code is documented and includes setup instructions","The live project is deployed and accessible"].map((label,index)=><label className="zi-checkbox" key={label}><input type="checkbox" required name={`ready-${index}`} />{label}</label>)}<p className="zi-caption">Include implementation notes and tradeoffs in your repository README.</p>{serverError && <p role="alert" className="zi-error">{serverError}</p>}<div className="zi-form-actions"><button type="submit" className="zi-btn zi-btn-primary">{isSubmitting ? "Submitting..." : "Submit for review"}</button></div></fieldset></form>;
}
