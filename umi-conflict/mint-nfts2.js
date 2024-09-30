import "dotenv/config";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  addConfigLines,
} from "@metaplex-foundation/mpl-candy-machine";
import { keypairIdentity, createGenericFile } from "@metaplex-foundation/umi";
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

import { sol } from "@metaplex-foundation/umi";
const TOTAL_NFTS = 100;
const METADATA_DIR = path.join(process.cwd(), "build1/json");
const IMAGES_DIR = path.join(process.cwd(), "build1/images");

const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;
console.log(apiKey, apiSecret);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadJsonToPinata(metadata) {
  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
          "Content-Type": "application/json", // Set content type to JSON
        },
      }
    );

    console.log(
      "JSON uploaded successfully! IPFS Hash:",
      response.data.IpfsHash
    );
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`; // Return the IPFS hash
  } catch (error) {
    console.error(
      "Error uploading JSON to Pinata:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function uploadToPinata(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const response = await axios.post(url, formData, {
      maxContentLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
}

async function main() {
  const umi = createUmi(process.env.RPC_URL).use(mplCandyMachine());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(JSON.parse(process.env.PRIVATE_KEY))
  );

  umi.use(keypairIdentity(keypair));

  console.log("Public key of your account: ", keypair.publicKey);
  const nfts = [];

  const metadataPath = path.join(METADATA_DIR, "meta.json");
  let meta = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  for (let i = 1; i <= TOTAL_NFTS; i++) {
    // Upload image
    const imagePath = path.join(IMAGES_DIR, `${i}.png`);
    const imageUri = await uploadToPinata(imagePath);
    await delay(500);
    console.log("Image uploaded to Pinata. URI:", imageUri);

    // Upload metadata
    let metadata = meta[i - 1];
    metadata.image = imageUri;
    console.log(metadata);
    const metadataUri = await uploadJsonToPinata(metadata);
    await delay(500);

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
    name: "Sergeant Major",
    uri: "https://gateway.pinata.cloud/ipfs/QmQfwUDH4P64ZLdSPNjLihrfkzKxfh4zpz6zpAhjk5GjxX", // Use the first NFT's URI or create a specific collection metadata
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
