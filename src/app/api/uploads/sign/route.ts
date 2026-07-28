import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSessionUser } from "@/lib/security/currentUser";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST /api/uploads/sign — returns a signature so the browser can upload straight to
// Cloudinary without the file ever passing through our server (faster, cheaper).
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);

  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can upload listing photos" }, { status: 403 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "strent/listings";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  });
}
