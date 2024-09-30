import "dotenv/config";
import path from "path";
import fs from "fs";
import axios from "axios";

const METADATA_DIR = path.join(process.cwd(), "build1/json");
const metadataPath = path.join(METADATA_DIR, "collection_meta.json");
let meta = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

const apiKey = process.env.PINATA_API_KEY;
const apiSecret = process.env.PINATA_API_SECRET;

const metadata = meta;
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

console.log("JSON uploaded successfully! IPFS Hash:", response.data.IpfsHash);
console.log(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
