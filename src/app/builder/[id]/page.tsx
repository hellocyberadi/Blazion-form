"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BuilderRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/forms/${id}/edit`);
  }, [id, router]);

  return null;
}
