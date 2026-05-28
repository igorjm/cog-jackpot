import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const avatarDir = path.join(process.cwd(), "public", "avatar");
  const countries = fs.readdirSync(avatarDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((dir) => {
      const players = fs.readdirSync(path.join(avatarDir, dir.name))
        .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .map((file) => ({
          name: file.replace(/\.[^.]+$/, ""),
          path: `/avatar/${dir.name}/${file}`,
        }));
      return { country: dir.name, players };
    })
    .filter((c) => c.players.length > 0);

  return NextResponse.json(countries);
}
