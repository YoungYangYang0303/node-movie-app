import { Inter } from "next/font/google";
import "@/styles/globals.css"; 
import Navbar from "@/components/Navbar"; 
import { AuthProvider } from "@/context/AuthContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "电影推荐平台",
  description: "发现和分享您喜爱的电影",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider> 
          <Navbar /> 
          {/* 如果 Navbar 高度改为 60px，这里也改为 60px */}
          <main style={{ paddingTop: '60px' }}> 
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}