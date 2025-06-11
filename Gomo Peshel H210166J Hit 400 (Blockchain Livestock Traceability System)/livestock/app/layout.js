import { Inter } from "next/font/google";        
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
// import 'antd/dist/antd.css';
import 'antd/dist/antd'
import { ConfigProvider } from "antd";
 // Ant Design CSS

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "National Livestock Management System",
  description: "Get the best livestock management system in the country",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: '#00b96b',
            algorithm: true, // Enable algorithm
          },
          Input: {
            colorPrimary: '#2DAC62FF',
            algorithm: true, // Enable algorithm
          },
        },
      }}
    >
      <AntdRegistry>{children}</AntdRegistry>
      </ConfigProvider>
              </body>
    </html>
  );
}
