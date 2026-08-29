/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{remotePatterns:[{protocol:"https",hostname:"*.supabase.co",pathname:"/storage/v1/object/public/**"}]},
  async rewrites(){
    return {
      beforeFiles:[
        {source:"/assets/pdf-menu/food/:slug.svg",destination:"/api/menu-image/:slug"},
        {source:"/assets/pdf-menu/dish-placeholder.svg",destination:"/assets/pdf-menu/garnish-placeholder.svg"}
      ]
    };
  }
};

export default nextConfig;
