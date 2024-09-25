"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState, useRef } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  fetchCandyMachine,
  mintV2,
  CandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  publicKey,
  generateSigner,
  transactionBuilder,
  some,
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const treasury = publicKey("H7vsJzJWPyfsgYnxpe7FyNADPpB9MM3pM5PwFudguuUk");

const Home: React.FC = () => {
  const wallet = useWallet();
  const [minting, setMinting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null);
  const umi = createUmi("https://api.devnet.solana.com")
    .use(walletAdapterIdentity(wallet))
    .use(mplCandyMachine());

  const candyMachinePubKey = new PublicKey(
    "3P5FnLfmvCxaswj68jNqZtKRZckk4H3YHpojfnhMe78W"
  );
  const connection = new Connection(clusterApiUrl("devnet"));
  useEffect(() => {
    setIsReady(true);
    fetchCandyMachineData();

    const subscriptionId = connection.onAccountChange(
      candyMachinePubKey,
      async (accountInfo, context) => {
        console.log("Candy Machine account changed");
        await fetchCandyMachineData();
      }
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, []);

  const fetchCandyMachineData = async () => {
    try {
      const fetchedCandyMachine = await fetchCandyMachine(
        umi,
        publicKey("3P5FnLfmvCxaswj68jNqZtKRZckk4H3YHpojfnhMe78W")
      );
      setCandyMachine(fetchedCandyMachine);

      const available = Number(fetchedCandyMachine.data.itemsAvailable);
      const redeemed = Number(fetchedCandyMachine.itemsRedeemed);
      setRemaining(available - redeemed);

      console.log("Items Available:", available);
      console.log("Items Redeemed:", redeemed);
      console.log("Remaining NFTs:", available - redeemed);
    } catch (error) {
      console.error("Error fetching candy machine state:", error);
    }
  };

  const mintRandomNFT = async () => {
    if (!wallet.publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    setMinting(true);

    try {
      const nftMint = generateSigner(umi);
      console.log("Candy Machine Public Key:", candyMachine?.publicKey);
      console.log("NFT Mint Public Key:", nftMint.publicKey);
      console.log("Identity Public Key:", umi.identity.publicKey);

      if (
        !candyMachine ||
        !candyMachine.publicKey ||
        !nftMint.publicKey ||
        !umi.identity.publicKey
      ) {
        alert("One or more required public keys are missing.");
        setMinting(false);
        return;
      }

      await transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 1_300_000 }))
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: candyMachine.tokenStandard,
            mintArgs: {
              solPayment: some({ destination: treasury }),
            },
          })
        )
        .sendAndConfirm(umi);

      console.log("Minting successful!");
      alert("NFT Minted Successfully!");

      await fetchCandyMachineData();
    } catch (error) {
      console.error("Minting error:", error);
      alert("Minting failed. Please try again.");
    }

    setMinting(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        paddingTop: "170px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      >
        {isReady && <WalletMultiButton />}
      </div>
      {/* <div> */}
      {wallet.publicKey && isReady && (
        <>
          <div
            style={{
              paddingTop: "100px",
              marginTop: "20px",
              fontSize: "5rem",
              color: "rgb(57 29 20)",
              textShadow: "-0.03em -0.03em 0.03em #fff",
            }}
          >
            {remaining !== null ? `Remaining NFTs: ${remaining}` : "Loading..."}
          </div>

          <button
            className="button-82-pushable"
            role="button"
            onClick={mintRandomNFT}
            disabled={minting || remaining === 0}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
            }}
          >
            <span className="button-82-shadow"></span>
            <span className="button-82-edge"></span>
            <span
              className="button-82-front text"
              style={{
                fontSize: "2rem",
              }}
            >
              {minting ? "Minting..." : "Mint Random NFT"}
            </span>
          </button>
        </>
      )}
    </div>
    // </div>
  );
};

export default Home;
