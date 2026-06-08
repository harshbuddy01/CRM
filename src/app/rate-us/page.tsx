import { redirect } from "next/navigation";

export default function Page() {
  // Dynamically uses your Google Review URL from the environment variables,
  // falling back to a default reviews link.
  const reviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://www.google.com/search?client=ms-android-realme-terr1-rso2&sca_esv=1ebdc27bd3b18e70&hl=en-IN&cs=0&sxsrf=ANbL-n78MtFX5ryeAz4NQpXRBUO30w4lsA:1780880424336&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOZRNIDvmsWyVF2_Z6dqMqiSoyjkPnUm9UdaOefUOjDCu6BkSQt0nf54RKw-4zTsd-40Lo0Kn7vzubjsYaGjIgvUi6DYcmv6XPrCEMyIqjXMABv4H3Q%3D%3D&q=IMAGICA+HOLIDAYS+Reviews&sa=X&ved=2ahUKEwjC1NHIuPaUAxVjX2wGHVepLqkQ0bkNegQIIRAH&biw=1470&bih=803&dpr=2#lrd=0x39f89b820fef46dd:0x6e16a6d555f5fb16,3,,,,";
  
  redirect(reviewUrl);
}
