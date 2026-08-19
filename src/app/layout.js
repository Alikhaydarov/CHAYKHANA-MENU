import { Inter } from "next/font/google";
import "./globals.css";
import "./auth.css";
const inter=Inter({subsets:["latin"],variable:"--font-inter"});
export const metadata={title:"CHAYKAHANA",description:"O‘zbek taomlari menyusi"};
export default function RootLayout({children}){return <html lang="uz"><body className={inter.variable}>{children}</body></html>}
