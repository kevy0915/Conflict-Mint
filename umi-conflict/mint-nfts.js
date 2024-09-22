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
const TOTAL_NFTS = 100;
const METADATA_DIR = path.join(process.cwd(), "build1/json");
const IMAGES_DIR = path.join(process.cwd(), "build1/images");

import { Connection, clusterApiUrl } from "@solana/web3.js";

async function main() {
  // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  // try {
  //   const { blockhash } = await connection.getRecentBlockhash();
  //   console.log("Recent blockhash:", blockhash);
  // } catch (error) {
  //   console.error("Failed to get recent blockhash:", error);
  // }

  const umi = createUmi(process.env.RPC_URL)
    .use(mplCandyMachine())
    .use(irysUploader());
  // .use(nftStorageUploader());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(JSON.parse(process.env.PRIVATE_KEY))
  );

  umi.use(keypairIdentity(keypair));

  console.log("Publickey of your account: ", keypair.publicKey);
  const nfts = [];

  const metadataPath = path.join(METADATA_DIR, "meta.json");
  let meta = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  for (let i = 1; i <= TOTAL_NFTS; i++) {
    // Upload image
    const imagePath = path.join(IMAGES_DIR, `${i}.png`);
    const imageBuffer = fs.readFileSync(imagePath);
    const imageFile = createGenericFile(imageBuffer, `${i}.png`, {
      contentType: "image/png",
    });

    // console.log("-------", imagePath, imageFile);
    // let imageUri;
    // try {
    //   console.log("df");
    //   imageUri = await umi.uploader.upload([imageFile]);
    //   console.log("Image uploaded to Arweave. URI:", imageUri);
    // } catch (error) {
    //   console.error("Error uploading image:", error);
    // }

    const [imageUri] = await umi.uploader.upload([imageFile]);
    console.log("Image uploaded to Arweave. URI:", imageUri);

    // Upload metadata
    let metadata = meta[i - 1];
    console.log(metadata);
    metadata.image = imageUri;
    const metadataUri = await umi.uploader.uploadJson(metadata);

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
    uri: "https://arweave.net/d8_MWvW5cekbrMZby1bgdDldvAr84wX7GpAP_MiisGI",
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

  // const nftMint = generateSigner(umi);
  // await transactionBuilder()
  //   .add(setComputeUnitLimit(umi, { units: 800_000 }))
  //   .add(
  //     mintV2(umi, {
  //       candyMachine: candyMachine.publicKey,
  //       nftMint,
  //       collectionMint: collectionMint.publicKey,
  //       collectionUpdateAuthority: umi.identity.publicKey,
  //       tokenStandard: candyMachine.tokenStandard,
  //       mintArgs: {
  //         price: 0.1 * LAMPORTS_PER_SOL,
  //       },
  //     })
  //   )
  //   .sendAndConfirm(umi);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
