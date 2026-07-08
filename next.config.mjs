/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exportación estática: la app es 100% cliente (Firebase en el navegador),
  // así que puede servirse desde cualquier hosting estático (GitHub Pages,
  // Vercel, Netlify…).
  output: "export",
  trailingSlash: true,
  // En GitHub Pages la web vive bajo /<repo>/ — se inyecta al compilar.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

export default nextConfig;
