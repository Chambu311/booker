import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "~/utils/pinata";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    const uploadData = await pinata.upload.file(file);
    // Construct gateway URL directly
    const url = `https://gateway.pinata.cloud/ipfs/${uploadData.IpfsHash}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}