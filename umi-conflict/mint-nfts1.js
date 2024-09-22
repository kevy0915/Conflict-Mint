import "dotenv/config";
import path from "path";
import fs from "fs";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  addConfigLines,
} from "@metaplex-foundation/mpl-candy-machine";
import { keypairIdentity, createGenericFile } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import {
  transactionBuilder,
  generateSigner,
  percentAmount,
  some,
} from "@metaplex-foundation/umi";
import { mintV2 } from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { sol } from "@metaplex-foundation/umi";
import { Web3Storage } from "web3.storage"; // Import Web3.Storage

const TOTAL_NFTS = 100;
const METADATA_DIR = path.join(process.cwd(), "build1/json");
const IMAGES_DIR = path.join(process.cwd(), "build1/images");

async function main() {
  const umi = createUmi(process.env.RPC_URL)
    .use(mplCandyMachine())
    .use(irysUploader());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(JSON.parse(process.env.PRIVATE_KEY))
  );

  umi.use(keypairIdentity(keypair));

  console.log("Public key of your account: ", keypair.publicKey);
  const nfts = [];

  const metadataPath = path.join(METADATA_DIR, "meta.json");
  let meta = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN }); // Initialize Web3.Storage client

  for (let i = 1; i <= TOTAL_NFTS; i++) {
    // Upload image
    const imagePath = path.join(IMAGES_DIR, `${i}.png`);
    const imageBuffer = fs.readFileSync(imagePath);
    const imageFile = new File([imageBuffer], `${i}.png`, {
      type: "image/png",
    });

    const cid = await client.put([imageFile]); // Upload to IPFS
    const imageUri = `https://ipfs.io/ipfs/${cid}`; // Generate URI for IPFS

    console.log("Image uploaded to IPFS. URI:", imageUri);

    // Upload metadata
    let metadata = meta[i - 1];
    console.log(metadata);
    metadata.image = imageUri;
    const metadataUri = await umi.uploader.uploadJson(metadata); // Assuming this uploads the metadata elsewhere

    nfts.push({
      name: metadata.name,
      uri: metadataUri,
    });
    console.log(`Prepared NFT ${i}/${TOTAL_NFTS}`);
    console.log(`NFT ${i}:`, nfts[i - 1]);
  }

  // Create the Collection NFT.
  const collectionMint = generateSigner(umi);
  await createNft(umi, {
    mint: collectionMint,
    authority: umi.identity,
    name: "Conflict NFT",
    uri: metadataUri, // Use the last metadata URI
    sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
    isCollection: true,
  }).sendAndConfirm(umi);

  // Create the Candy Machine.
  const candyMachine = generateSigner(umi);
  try {
    const transaction = await create(umi, {
      candyMachine,
      collectionMint: collectionMint.publicKey,
      collectionUpdateAuthority: umi.identity,
      tokenStandard: TokenStandard.NonFungible,
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
      itemsAvailable: TOTAL_NFTS,
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          percentageShare: 100,
        },
      ],
      configLineSettings: some({
        prefixName: "",
        nameLength: 32,
        prefixUri: "",
        uriLength: 200,
        isSequential: false,
      }),
      guards: {
        solPayment: some({
          lamports: sol(0.1),
          destination: umi.identity.publicKey,
        }),
      },
    });

    // Send and confirm the transaction
    const result = await transaction.sendAndConfirm(umi);
    console.log(
      "Candy Machine created. Transaction signature:",
      result.signature
    );
  } catch (error) {
    console.error("Error creating Candy Machine:", error);
  }

  const BATCH_SIZE = 1; // Adjust as needed

  for (let i = 0; i < TOTAL_NFTS; i += BATCH_SIZE) {
    const batch = nfts.slice(i, i + BATCH_SIZE);
    await addConfigLines(umi, {
      candyMachine: candyMachine.publicKey,
      index: i,
      configLines: batch,
    }).sendAndConfirm(umi);
  }

  console.log("Candy Machine public key:", candyMachine.publicKey);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
