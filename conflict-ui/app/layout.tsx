import "./globals.css";
import { ReactNode } from "react";
import WalletContextProvider from "./WalletProvider";

export const metadata = {
  title: "NFT Minting App",
  description:
    "A simple NFT minting application with Phantom wallet integration",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100vh",
          width: "100%",
        }}
      >
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
