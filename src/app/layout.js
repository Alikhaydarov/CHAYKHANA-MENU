import { Inter } from "next/font/google";
import "./globals.css";
import "./auth.css";
import "./admin-desktop.css";
import "./menu-fixes.css";
import "./menu-hero.css";
import "./language-menu.css";
import "./language-menu-fix.css";
import "./category-compact.css";
import "./header-align.css";
import "./admin-category-clean.css";
import "./floating-cart.css";
const inter=Inter({subsets:["latin"],variable:"--font-inter"});
export const metadata={title:"CHAYKAHANA",description:"O‘zbek taomlari menyusi"};
export default function RootLayout({children}){return <html lang="uz"><body className={inter.variable}>{children}</body></html>}
