"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  return (
    <div>
      Home Page
      <Button onClick={() => router.push("/dashboard")}>Dashboard</Button>
    </div>
  );
};

export default Page;
