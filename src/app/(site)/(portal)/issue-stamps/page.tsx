import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { Breadcrumb, PageTitle } from "@/components/Breadcrumb";
import { IssueForm } from "./components/IssueForm";

export default async function IssueStampsPage() {
  await requireUser();
  const purposes = await db.select().from(schema.purposes).orderBy(asc(schema.purposes.id));

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Issue Stamps to Citizen" }]} />
      <PageTitle>Issue Stamps to Citizen</PageTitle>
      <IssueForm purposes={purposes} />
    </>
  );
}
