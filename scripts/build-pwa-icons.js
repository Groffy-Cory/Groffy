const sharp = require("sharp");

async function main() {
  const src = "public/rof-logo.png";
  const meta = await sharp(src).metadata();
  console.log("logo", meta.width, meta.height, meta.format);

  await sharp(src)
    .resize(192, 192, { fit: "cover" })
    .png()
    .toFile("public/icons/icon-192.png");

  await sharp(src)
    .resize(512, 512, { fit: "cover" })
    .png()
    .toFile("public/icons/icon-512.png");

  await sharp(src)
    .resize(180, 180, { fit: "cover" })
    .png()
    .toFile("public/icons/apple-touch-icon.png");

  const logoPad = await sharp(src)
    .resize(360, 360, { fit: "cover" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 243, g: 230, b: 200, alpha: 1 },
    },
  })
    .composite([{ input: logoPad, gravity: "center" }])
    .png()
    .toFile("public/icons/icon-maskable-512.png");

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
