import { redirect } from "next/navigation";

export default function Page() {
  // Dynamically uses your Google Review URL from the environment variables,
  // falling back to a default reviews link.
  const reviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://g.page/r/CbV7G6JpxL4TEAE/review";
  
  redirect(reviewUrl);
}
